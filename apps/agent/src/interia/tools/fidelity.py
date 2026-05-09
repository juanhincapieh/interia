"""validate_fidelity: verify preserved elements after preview generation."""
from __future__ import annotations

import os

from langchain_core.tools import tool

from ..schemas import FidelityReport, RoomState
from .image_resolve import resolve_image_for_gemini


@tool
def validate_fidelity(state: dict, preview: dict) -> dict:
    """Compare the preview against the original photo + locked Room State."""
    rs = RoomState.model_validate(state)

    if os.getenv("INTERIA_MOCK") == "1":
        return _mock_report(rs, preview).model_dump(mode="json")

    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.messages import HumanMessage

    locked = [o for o in rs.objects if _is_locked(rs, o.id)]
    prompt = (
        "You are a strict fidelity validator. Compare the original room and "
        "the generated preview. For each LOCKED object, decide whether it is "
        "preserved (identity AND position). Return STRICT JSON matching the "
        "FidelityReport schema. Be conservative — when in doubt, mark not preserved.\n\n"
        f"Locked objects: {[o.model_dump() for o in locked]}\n"
        f"Selected style: {(rs.preferences.style if rs.preferences else 'unknown')}"
    )
    llm = ChatGoogleGenerativeAI(
        model="gemini-3-pro",
        temperature=0,
        api_key=os.environ["GEMINI_API_KEY"],
    )
    structured = llm.with_structured_output(FidelityReport)
    orig = resolve_image_for_gemini(rs.source.imageUrl)
    prev_img = resolve_image_for_gemini(preview["imageUrl"])
    msg = HumanMessage(content=[
        {"type": "text", "text": prompt},
        {"type": "image_url", "image_url": orig},
        {"type": "image_url", "image_url": prev_img},
    ])
    return structured.invoke([msg]).model_copy(update={"previewId": preview["id"]}).model_dump(mode="json")


def _is_locked(rs: RoomState, obj_id: str) -> bool:
    lock = rs.editContract.get(obj_id)
    if lock is None:
        return False
    identity = lock.identity if hasattr(lock, "identity") else lock.get("identity")
    return identity == "locked"


def _mock_report(rs: RoomState, preview: dict) -> FidelityReport:
    locked = [o for o in rs.objects if _is_locked(rs, o.id)]
    return FidelityReport(
        previewId=preview["id"],
        systemScore=87,
        cameraAnglePreserved=True,
        perObject=[
            {
                "objectId": o.id,
                "label": o.label,
                "preserved": True,
                "confidence": 0.92,
                "note": "Mock validator: locked object preserved.",
            }
            for o in locked
        ],
        styleApplied={
            "selected": (rs.preferences.style if rs.preferences else "unknown"),
            "applied": (rs.preferences.style if rs.preferences else "unknown"),
            "match": "strong",
        },
        unexpectedChanges=[],
        recommendedAction="accept",
    )
