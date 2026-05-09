"""state.py — deterministic Room State construction tools."""
from __future__ import annotations

from typing import Any
from uuid import uuid4

from langchain_core.tools import tool

from ..reducer import apply_patch
from ..schemas import (
    DesignPatch,
    Grid,
    GridCell,
    LockSet,
    RoomObject,
    RoomShell,
    RoomSource,
    RoomState,
)


_SIZE_FROM_AREA = [
    (0.05, "small"),
    (0.20, "medium"),
    (1.00, "large"),
]


def _grid_cell(bbox: dict) -> str:
    cx = bbox["x"] + bbox["w"] / 2
    cy = bbox["y"] + bbox["h"] / 2
    col = "ABCD"[min(3, int(cx * 4))]
    row = str(min(4, int(cy * 4) + 1))
    return f"{col}{row}"


def _size(bbox: dict) -> str:
    area = bbox["w"] * bbox["h"]
    for cap, label in _SIZE_FROM_AREA:
        if area <= cap:
            return label
    return "large"


def _default_locks(obj_type: str) -> LockSet:
    if obj_type in {"window"}:
        return LockSet(identity="locked", position="locked", appearance="locked")
    if obj_type in {"bed", "desk"}:
        return LockSet(identity="locked", position="locked", appearance="soft")
    return LockSet(identity="soft", position="soft", appearance="editable")


@tool
def build_room_state(vision_facts: dict, source: dict) -> dict:
    """Normalize raw analyze_room output into a RoomState v1."""
    objects: list[RoomObject] = []
    contract: dict[str, dict] = {}
    for f in vision_facts.get("objects", []):
        oid = f"obj_{f['type']}_{uuid4().hex[:6]}"
        bbox = f["bbox"]
        obj = RoomObject(
            id=oid,
            type=f["type"],
            label=f["label"],
            description=f.get("description", f["label"]),
            gridPosition=_grid_cell(bbox),
            approximateSize=_size(bbox),
            confidence=f["confidence"],
            detectedBy="vision",
            confirmedByUser=False,
            bbox=bbox,
        )
        objects.append(obj)
        contract[oid] = _default_locks(f["type"]).model_dump()

    state = RoomState(
        version=1,
        source=RoomSource.model_validate(source),
        shell=RoomShell(
            roomType=vision_facts.get("roomType", "other"),
            cameraAngle=vision_facts.get("cameraAngle", "corner-left"),
        ),
        grid=Grid(),
        objects=objects,
        relations=[],
        editContract=contract,
    )
    return state.model_dump(mode="json")


@tool
def generate_grid(state: dict) -> dict:
    """Re-derive grid positions from bboxes (idempotent)."""
    rs = RoomState.model_validate(state)
    new_objects = []
    for o in rs.objects:
        if o.bbox is None:
            new_objects.append(o)
            continue
        bbox_d = o.bbox.model_dump()
        new_objects.append(o.model_copy(update={"gridPosition": GridCell(_grid_cell(bbox_d))}))
    return rs.model_copy(update={"objects": new_objects}).model_dump(mode="json")


@tool
def apply_patch_tool(state: dict, patches: list[dict]) -> dict:
    """Apply DesignPatch[] and return the new RoomState dict."""
    rs = RoomState.model_validate(state)
    wrapped = [DesignPatch.model_validate(p) for p in patches]
    return apply_patch(rs, wrapped).model_dump(mode="json")
