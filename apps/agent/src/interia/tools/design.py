"""design.py — catalog and design-plan tools."""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from langchain_core.tools import tool

from ..schemas import DesignPlan


_CATALOG_PATH = Path(__file__).resolve().parents[1] / "data" / "catalog.json"


def _load() -> list[dict[str, Any]]:
    return json.loads(_CATALOG_PATH.read_text())


@tool
def get_catalog_options(category: str, style: str, budget: str) -> list[dict[str, Any]]:
    """Return generic catalog items filtered by category, compatible style,
    and price tier (low, medium, high).
    """
    return [
        item
        for item in _load()
        if item["category"] == category
        and style in item["compatibleStyles"]
        and item["priceTier"] == budget
    ]


@tool
def generate_design_plan(state: dict, preferences: dict) -> dict:
    """Produce a DesignPlan from the current Room State + user preferences."""
    if os.getenv("INTERIA_MOCK") == "1":
        return _mock_plan(preferences["style"])

    from langchain_google_genai import ChatGoogleGenerativeAI

    llm = ChatGoogleGenerativeAI(
        model="gemini-3.1-flash-lite",
        temperature=0.3,
        api_key=os.environ["GEMINI_API_KEY"],
    )
    structured = llm.with_structured_output(DesignPlan)
    return structured.invoke([
        {"role": "system", "content": _PLAN_SYSTEM},
        {"role": "user", "content": json.dumps({"state": state, "preferences": preferences})},
    ]).model_dump(mode="json")


_PLAN_SYSTEM = (
    "You are a senior interior designer. Given the Room State and user "
    "preferences, propose a palette (3-5 hex colors), a lighting plan, "
    "decor suggestions selected ONLY from the provided catalog, layout "
    "suggestions, and a step-by-step action plan. Return DesignPlan JSON. "
    "Do not invent real products."
)


def _mock_plan(style: str) -> dict:
    palettes = {
        "japandi": ["#E7DED1", "#5F7F63", "#C97855", "#1F1F1C", "#FBF8F2"],
        "minimal": ["#FFFFFF", "#F4F4F4", "#1F1F1C", "#9A9489", "#C97855"],
        "warm-modern": ["#F7F3EC", "#C97855", "#5F7F63", "#1F1F1C", "#E9C7B3"],
        "bohemian": ["#C97855", "#E9C7B3", "#5F7F63", "#1F1F1C", "#FBF8F2"],
        "industrial": ["#1F1F1C", "#9A9489", "#E7DED1", "#C97855", "#FFFFFF"],
    }
    swatches = palettes.get(style, palettes["japandi"])
    return {
        "palette": {"name": style.title(), "swatches": swatches},
        "lightingPlan": "Floor lamp on the desk-side corner; warm 2700K bulb.",
        "decorSuggestions": _load()[:3],
        "layoutSuggestions": ["Rug under the bed front 2/3", "Plant by the window"],
        "actionPlan": ["Add floor lamp", "Lay rug", "Add wall art above bed"],
        "rationale": f"{style.title()} palette emphasizes warmth and texture; locks preserve architecture.",
        "proposedPatches": [],
    }
