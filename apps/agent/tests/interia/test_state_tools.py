"""Tests for build_room_state, generate_grid, apply_patch_tool."""
from __future__ import annotations

from src.interia.schemas import RoomState
from src.interia.tools.state import (
    apply_patch_tool,
    build_room_state,
    generate_grid,
)


def _vision_facts() -> dict:
    return {
        "roomType": "bedroom",
        "cameraAngle": "corner-left",
        "objects": [
            {"type": "window", "label": "W", "bbox": {"x": 0.05, "y": 0.10, "w": 0.18, "h": 0.50}, "confidence": 0.93},
            {"type": "bed", "label": "B", "bbox": {"x": 0.30, "y": 0.40, "w": 0.45, "h": 0.50}, "confidence": 0.95},
        ],
    }


def test_build_room_state_v1() -> None:
    state = build_room_state.invoke({
        "vision_facts": _vision_facts(),
        "source": {"imageUrl": "/x.jpg", "sampleId": "bedroom", "uploadedAt": "2026-05-09T10:00:00Z"},
    })
    rs = RoomState.model_validate(state)
    assert rs.version == 1
    assert rs.shell.roomType == "bedroom"
    assert len(rs.objects) == 2
    assert rs.editContract  # populated for every object


def test_generate_grid_assigns_cells() -> None:
    state = build_room_state.invoke({
        "vision_facts": _vision_facts(),
        "source": {"imageUrl": "/x.jpg", "sampleId": "bedroom", "uploadedAt": "2026-05-09T10:00:00Z"},
    })
    state = generate_grid.invoke({"state": state})
    rs = RoomState.model_validate(state)
    cells = [o.gridPosition.root for o in rs.objects]
    # window centered around (0.14, 0.35) → col A, row 2 → A2
    # bed centered around (0.525, 0.65) → col C, row 3 → C3
    assert "A2" in cells
    assert "C3" in cells


def test_apply_patch_tool_wraps_reducer() -> None:
    state = build_room_state.invoke({
        "vision_facts": _vision_facts(),
        "source": {"imageUrl": "/x.jpg", "sampleId": "bedroom", "uploadedAt": "2026-05-09T10:00:00Z"},
    })
    state2 = apply_patch_tool.invoke({
        "state": state,
        "patches": [{"op": "preserve", "id": list(state["editContract"].keys())[0], "reason": "demo"}],
    })
    assert state2["version"] == state["version"] + 1
