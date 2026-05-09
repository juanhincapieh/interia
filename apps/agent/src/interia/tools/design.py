"""design.py — catalog and design-plan tools."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from langchain_core.tools import tool


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
