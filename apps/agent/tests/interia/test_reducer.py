"""Tests for the pure apply_patch reducer."""
from __future__ import annotations

from src.interia.reducer import apply_patch
from src.interia.schemas import (
    DesignPatch,
    LockSet,
    RoomObject,
    RoomShell,
    RoomState,
    RoomSource,
)


def _state() -> RoomState:
    return RoomState(
        version=1,
        source=RoomSource(imageUrl="/x.jpg", uploadedAt="2026-05-09T10:00:00Z"),
        shell=RoomShell(roomType="bedroom", cameraAngle="corner-left"),
        objects=[
            RoomObject(
                id="bed_1",
                type="bed",
                label="Bed",
                description="Center bed",
                gridPosition="B2",
                approximateSize="large",
                confidence=0.9,
                detectedBy="vision",
            )
        ],
        editContract={"bed_1": LockSet().model_dump()},
    )


def test_add_object_appends_and_bumps_version() -> None:
    s = _state()
    p = DesignPatch.model_validate(
        {
            "op": "add_object",
            "target": {
                "id": "lamp_1",
                "type": "lamp",
                "label": "Floor lamp",
                "description": "warm",
                "gridPosition": "D3",
                "approximateSize": "medium",
                "confidence": 1.0,
                "detectedBy": "user",
                "confirmedByUser": True,
            },
            "reason": "warmth",
        }
    )
    s2 = apply_patch(s, [p])
    assert s2.version == 2
    assert any(o.id == "lamp_1" for o in s2.objects)
    assert len(s2.patches) == 1


def test_modify_object_partial_update() -> None:
    s = _state()
    p = DesignPatch.model_validate(
        {"op": "modify_object", "id": "bed_1", "patch": {"label": "Queen bed"}, "reason": "fix label"}
    )
    s2 = apply_patch(s, [p])
    bed = next(o for o in s2.objects if o.id == "bed_1")
    assert bed.label == "Queen bed"
    assert bed.gridPosition.root == "B2"   # untouched


def test_set_lock_merges_into_edit_contract() -> None:
    s = _state()
    p = DesignPatch.model_validate(
        {
            "op": "set_lock",
            "id": "bed_1",
            "locks": {"appearance": "locked"},
            "reason": "user lock",
        }
    )
    s2 = apply_patch(s, [p])
    locks = LockSet.model_validate(s2.editContract["bed_1"])
    assert locks.appearance == "locked"
    assert locks.identity == "soft"   # default preserved


def test_remove_object_deletes_and_audits() -> None:
    s = _state()
    p = DesignPatch.model_validate({"op": "remove_object", "id": "bed_1", "reason": "demo"})
    s2 = apply_patch(s, [p])
    assert all(o.id != "bed_1" for o in s2.objects)
    assert s2.patches[0].root.op == "remove_object"


def test_unknown_id_raises_keyerror() -> None:
    s = _state()
    p = DesignPatch.model_validate({"op": "modify_object", "id": "ghost", "patch": {}, "reason": "x"})
    try:
        apply_patch(s, [p])
    except KeyError as e:
        assert "ghost" in str(e)
    else:
        raise AssertionError("expected KeyError")
