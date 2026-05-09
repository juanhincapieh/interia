"""remix_room_from_photo — analyze, plan, preview, and fidelity in one tool."""
from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any, Optional
from uuid import uuid4

from langchain_core.tools import tool

from ..schemas import AgentTraceEvent, DesignPreference, RoomState, TraceType
from .design import generate_design_plan
from .fidelity import validate_fidelity
from .preview import generate_preview
from .state import apply_patch_tool, build_room_state, generate_grid
from .vision import analyze_room

_DEFAULT_PREFS: dict[str, Any] = {
    "style": "warm-modern",
    "budget": "medium",
    "goal": "cozy",
    "constraints": ["keep-furniture"],
}


def _trace(etype: TraceType, inp: str, out: str) -> dict[str, Any]:
    return AgentTraceEvent(
        id=f"pipe_{uuid4().hex[:8]}",
        type=etype,
        inputSummary=inp,
        outputSummary=out,
        createdAt=datetime.now(timezone.utc).isoformat(),
    ).model_dump(mode="json")


def _storage_image_url(fetch_url: str, sample_id: Optional[str]) -> str:
    """URL stored in RoomState.source (browser-served paths when possible)."""
    if sample_id:
        return f"/samples/{sample_id}.jpg"
    base = os.getenv("INTERIA_PUBLIC_IMAGE_BASE", "http://127.0.0.1:3000").rstrip("/")
    u = fetch_url.strip()
    if u.startswith(base):
        path = u[len(base) :]
        return path if path.startswith("/") else f"/{path}"
    if u.startswith("/"):
        return u
    return u


@tool
def remix_room_from_photo(image_url: str, sample_id: Optional[str] = None) -> dict[str, Any]:
    """Run the full first-pass remix: vision → room state → design plan → preview → fidelity.

    Use when starting a project from a photo (upload or sample). After this returns,
    call ``setRoomState`` with the ``roomState`` object so the canvas matches.

    Args:
        image_url: Absolute URL the agent can fetch (e.g. ``http://127.0.0.1:3000/samples/bedroom.jpg``)
            or a site-relative path (e.g. ``/samples/bedroom.jpg``).
        sample_id: Optional ``bedroom`` / ``studio`` / ``living`` / ``workspace`` for mock analysis.
    """
    traces: list[dict[str, Any]] = [_trace("plan", "remix_room_from_photo", "start pipeline")]
    stored_url = _storage_image_url(image_url, sample_id)
    now = datetime.now(timezone.utc).isoformat()
    source = {
        "imageUrl": stored_url,
        "sampleId": sample_id,
        "uploadedAt": now,
    }

    vision = analyze_room.invoke({"image_url": image_url, "sample_id": sample_id})
    traces.append(_trace("tool_result", "analyze_room", f"{len(vision.get('objects', []))} objects"))

    state = build_room_state.invoke({"vision_facts": vision, "source": source})
    state = generate_grid.invoke({"state": state})
    traces.append(_trace("tool_result", "build_room_state", f"v{state.get('version', 1)}"))

    prefs = dict(_DEFAULT_PREFS)
    pref_model = DesignPreference.model_validate(prefs)
    state = {**state, "preferences": pref_model.model_dump(mode="json")}

    plan = generate_design_plan.invoke({"state": state, "preferences": prefs})
    state = {**state, "designPlan": plan}
    traces.append(_trace("tool_result", "generate_design_plan", plan.get("rationale", "")[:120]))

    raw_patches = plan.get("proposedPatches") or []
    if raw_patches:
        state = apply_patch_tool.invoke({"state": state, "patches": raw_patches})
        traces.append(_trace("patch_applied", "apply_patch_tool", f"{len(raw_patches)} patch(es)"))

    preview = generate_preview.invoke({"state": state})
    state = {**state, "preview": preview}
    traces.append(_trace("tool_result", "generate_preview", preview.get("id", "")))

    fidelity = validate_fidelity.invoke({"state": state, "preview": preview})
    state = {**state, "fidelity": fidelity}
    traces.append(_trace("validation", "validate_fidelity", f"score {fidelity.get('systemScore')}"))

    prior = list(state.get("trace") or [])
    state["trace"] = prior + traces

    headline_parts = [
        plan.get("rationale", "").strip(),
    ]
    if fidelity.get("recommendedAction"):
        headline_parts.append(f"Validator: {fidelity.get('recommendedAction')}.")
    headline = " ".join(p for p in headline_parts if p).strip() or "Remix complete."

    rs = RoomState.model_validate(state)
    return {
        "roomState": rs.model_dump(mode="json"),
        "headline": headline,
        "suggestionSummary": plan.get("rationale", ""),
        "preview": preview,
        "fidelity": fidelity,
    }
