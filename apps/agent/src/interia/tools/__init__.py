"""Interia tool registry."""
from __future__ import annotations

from .design import generate_design_plan, get_catalog_options
from .state import apply_patch_tool, build_room_state, generate_grid
from .vision import analyze_room


def all_tools() -> list:
    return [analyze_room, build_room_state, generate_grid, apply_patch_tool, get_catalog_options, generate_design_plan]
