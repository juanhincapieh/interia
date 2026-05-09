"""generate_preview: produce a constrained image preview from the Room State."""
from __future__ import annotations

import os
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from langchain_core.tools import tool

from ..schemas import Preview, RoomState
from .image_resolve import resolve_image_for_gemini


_MOCK_DIR = Path(__file__).resolve().parents[4] / "data" / "mock_previews"


def _identity_locked(rs: RoomState, oid: str) -> bool:
    lock = rs.editContract.get(oid)
    if lock is None:
        return False
    if hasattr(lock, "identity"):
        return lock.identity == "locked"
    return lock.get("identity") == "locked"


def _build_prompt(rs: RoomState) -> str:
    locked = [
        f"- {o.label} ({o.type}, grid {o.gridPosition.root}): identity+position+appearance LOCKED"
        for o in rs.objects
        if _identity_locked(rs, o.id)
    ]
    style = rs.preferences.style if rs.preferences else "warm-modern"
    return (
        f"Re-render the room photo. Style: {style}. Camera angle: {rs.shell.cameraAngle}. "
        "Preserve the room shell and every locked object exactly:\n"
        + "\n".join(locked or ["(no locked objects)"])
        + "\nDo not change the window, do not move the bed, do not invent architectural elements."
    )


@tool
def generate_preview(state: dict) -> dict:
    """Generate a preview image; mock fallback when INTERIA_MOCK=1."""
    rs = RoomState.model_validate(state)
    prompt = _build_prompt(rs)
    pid = f"prev_{uuid4().hex[:8]}"
    now = datetime.now(timezone.utc).isoformat()

    if os.getenv("INTERIA_MOCK") == "1":
        sample = rs.source.sampleId or "bedroom"
        return Preview(
            id=pid,
            imageUrl=f"/mock_previews/{sample}.png",
            promptSummary=prompt,
            generationProvider="mock",
            fromVersion=rs.version,
            createdAt=now,
        ).model_dump(mode="json")

    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.messages import HumanMessage

    llm = ChatGoogleGenerativeAI(
        model="gemini-3-image-preview",
        api_key=os.environ["GEMINI_API_KEY"],
    )
    resolved = resolve_image_for_gemini(rs.source.imageUrl)
    msg = HumanMessage(content=[
        {"type": "text", "text": prompt},
        {"type": "image_url", "image_url": resolved},
    ])
    response = llm.invoke([msg])
    image_url = _extract_image_url(response)
    return Preview(
        id=pid,
        imageUrl=image_url,
        promptSummary=prompt,
        generationProvider="gemini-3-image-preview",
        fromVersion=rs.version,
        createdAt=now,
    ).model_dump(mode="json")


def _extract_image_url(response) -> str:
    parts = response.content if isinstance(response.content, list) else [response.content]
    out_dir = Path(__file__).resolve().parents[4] / "data" / "generated"
    out_dir.mkdir(exist_ok=True)
    for part in parts:
        if isinstance(part, dict) and part.get("type") == "image_url":
            return part["image_url"]
        if isinstance(part, dict) and part.get("type") == "image" and part.get("data"):
            import base64
            fname = f"{uuid4().hex[:8]}.png"
            (out_dir / fname).write_bytes(base64.b64decode(part["data"]))
            return f"/generated/{fname}"
    raise RuntimeError("no image in Gemini response")
