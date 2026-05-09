"""analyze_room: extract structured visual facts from a room photo."""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Optional

from langchain_core.tools import tool

_DATA_DIR = Path(__file__).resolve().parents[3] / "data" / "sample_rooms"


def _load_sample(sample_id: Optional[str]) -> dict[str, Any]:
    candidate = (sample_id or "bedroom") + ".json"
    path = _DATA_DIR / candidate
    if not path.exists():
        path = _DATA_DIR / "bedroom.json"
    return json.loads(path.read_text())


@tool
def analyze_room(image_url: str, sample_id: Optional[str] = None) -> dict[str, Any]:
    """Analyze a room photo and return structured visual facts.

    Args:
        image_url: URL or path to the source image.
        sample_id: Optional sample id (bedroom/studio/living/workspace).
    """
    if os.getenv("INTERIA_MOCK") == "1":
        return _load_sample(sample_id)

    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.messages import HumanMessage

    llm = ChatGoogleGenerativeAI(
        model="gemini-3-pro",
        temperature=0,
        api_key=os.environ["GEMINI_API_KEY"],
    )
    msg = HumanMessage(
        content=[
            {"type": "text", "text": (
                "Analyze this room. Return STRICT JSON with keys: "
                "roomType (bedroom|studio|living|workspace|other), "
                "cameraAngle (front|corner-left|corner-right), "
                "objects: array of {type, label, bbox:{x,y,w,h normalized 0..1}, confidence 0..1}. "
                "Only emit objects you are >0.6 confident about."
            )},
            {"type": "image_url", "image_url": image_url},
        ]
    )
    raw = llm.invoke([msg]).content
    return json.loads(raw if isinstance(raw, str) else raw[0]["text"])
