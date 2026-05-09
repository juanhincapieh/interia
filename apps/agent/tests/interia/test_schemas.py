"""Schema round-trip tests for the Room State data model."""
from __future__ import annotations

import json

import pytest
from pydantic import ValidationError

from src.interia.schemas import (
    DesignPatch,
    DesignPlan,
    DesignPreference,
    EditContract,
    FidelityReport,
    GridCell,
    LockSet,
    Preview,
    RoomObject,
    RoomRelation,
    RoomShell,
    RoomState,
)


def _minimal_room_state() -> RoomState:
    return RoomState(
        version=1,
        source={"imageUrl": "/samples/bedroom.jpg", "uploadedAt": "2026-05-09T10:00:00Z"},
        shell=RoomShell(roomType="bedroom", cameraAngle="corner-left"),
        grid={"rows": 4, "cols": 4},
        objects=[
            RoomObject(
                id="obj_window_1",
                type="window",
                label="Left wall window",
                description="Tall single window on the left wall",
                gridPosition="A1",
                approximateSize="medium",
                confidence=0.92,
                detectedBy="vision",
                confirmedByUser=False,
            )
        ],
        relations=[],
        editContract={
            "obj_window_1": LockSet(identity="locked", position="locked", appearance="locked")
        },
        patches=[],
        trace=[],
    )


def test_minimal_room_state_round_trips() -> None:
    state = _minimal_room_state()
    raw = state.model_dump(mode="json")
    restored = RoomState.model_validate(raw)
    assert restored == state


def test_grid_cell_validates() -> None:
    GridCell.model_validate("A1")
    GridCell.model_validate("D4")
    with pytest.raises(ValidationError):
        GridCell.model_validate("E1")
    with pytest.raises(ValidationError):
        GridCell.model_validate("A5")


def test_design_patch_discriminated_union() -> None:
    add = DesignPatch.model_validate(
        {
            "op": "add_object",
            "target": {"id": "obj_lamp_1", "type": "lamp", "gridPosition": "D3"},
            "reason": "warmth",
        }
    )
    assert add.root.op == "add_object"
    preserve = DesignPatch.model_validate({"op": "preserve", "id": "obj_window_1", "reason": "user lock"})
    assert preserve.root.op == "preserve"


def test_fidelity_report_required_fields() -> None:
    report = FidelityReport(
        previewId="prev_1",
        systemScore=87,
        cameraAnglePreserved=True,
        perObject=[],
        styleApplied={"selected": "japandi", "applied": "japandi", "match": "strong"},
        unexpectedChanges=[],
        recommendedAction="accept",
    )
    assert report.systemScore == 87
