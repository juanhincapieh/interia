"""Pure reducer applying DesignPatch[] to a RoomState.

Side-effect free; safe to call from any tool. The caller is responsible
for persisting the returned state back into the agent's shared state.
"""
from __future__ import annotations

from typing import List

from .schemas import DesignPatch, LockSet, RoomObject, RoomState


def apply_patch(state: RoomState, patches: List[DesignPatch]) -> RoomState:
    """Return a new RoomState with each patch applied in order.

    - Bumps `version` once per call (not once per patch).
    - Appends the input patches to `state.patches` as the audit log.
    - Raises `KeyError` if a patch references an unknown object id.
    """
    if not patches:
        return state

    objects: list[RoomObject] = list(state.objects)
    edit_contract: dict = dict(state.editContract)

    def _index(oid: str) -> int:
        for i, o in enumerate(objects):
            if o.id == oid:
                return i
        raise KeyError(f"object id not found: {oid}")

    for wrapper in patches:
        p = wrapper.root
        if p.op == "add_object":
            obj = RoomObject.model_validate(p.target)
            objects.append(obj)
            edit_contract.setdefault(obj.id, LockSet().model_dump())
        elif p.op == "modify_object":
            i = _index(p.id)
            current = objects[i].model_dump()
            current.update(p.patch)
            objects[i] = RoomObject.model_validate(current)
        elif p.op == "remove_object":
            i = _index(p.id)
            objects.pop(i)
            edit_contract.pop(p.id, None)
        elif p.op == "set_lock":
            current = LockSet.model_validate(edit_contract.get(p.id, LockSet().model_dump()))
            merged = current.model_dump()
            merged.update(p.locks)
            edit_contract[p.id] = LockSet.model_validate(merged).model_dump()
        elif p.op == "preserve":
            _index(p.id)   # raise if unknown
        else:  # pragma: no cover - exhaustive
            raise ValueError(f"unknown patch op: {p.op!r}")

    return state.model_copy(
        update={
            "version": state.version + 1,
            "objects": objects,
            "editContract": edit_contract,
            "patches": list(state.patches) + list(patches),
        }
    )
