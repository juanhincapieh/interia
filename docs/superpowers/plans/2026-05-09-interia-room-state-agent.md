# Interia — Room State Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Interia — a verifiable Room State Agent — on top of the hackathon starter kit, replacing the Notion Leads demo with a typed Room State, four-step vision-to-preview pipeline, generative UI canvas, fidelity validation, and a deployable MCP App.

**Architecture:** LangGraph Deep Agent (Python, Gemini Flash-Lite default) orchestrates a single planning loop with backend Pydantic-typed tools. CopilotKit shared state + frontend tools wire the agent to a Next.js canvas. A specialized sub-agent dispatched from `validate_fidelity` does multimodal verification. Three GenUI tiers map to Controlled (structural views), A2UI (DesignBoard sub-cards), and MCP App (`interia-mcp`).

**Tech Stack:** Python 3.11+, LangGraph + deepagents + langchain-google-genai, Pydantic v2, pytest. Next.js 15 + React 19 + TypeScript + Tailwind v4 + Radix/shadcn. CopilotKit v2 + AG-UI. mcp-use for the MCP App. Gemini 3.1 Flash-Lite for chat/planning, Gemini 3 Pro multimodal for vision + fidelity, Gemini 3 Image Preview for generation (with mock fallback).

**Reference:** Design spec at [docs/superpowers/specs/2026-05-09-interia-room-state-agent-design.md](../specs/2026-05-09-interia-room-state-agent-design.md). Design handoff (upload view) at [design_handoff_interia_upload_view/](../../../design_handoff_interia_upload_view/).

---

## Phase 0 — Repo prep and shared types

### Task 0.1: Create a feature branch and add pytest

**Files:**
- Modify: `apps/agent/pyproject.toml`

- [ ] **Step 1: Create branch**

```bash
git checkout -b feat/interia
```

- [ ] **Step 2: Add pytest as dev dependency in `apps/agent/pyproject.toml`**

After the existing `[project]` block, add:

```toml
[project.optional-dependencies]
dev = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.23.0",
]

[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"
pythonpath = ["."]
```

- [ ] **Step 3: Install dev deps**

Run from `apps/agent/`:
```bash
uv sync --extra dev
```
Expected: `pytest`, `pytest-asyncio` installed.

- [ ] **Step 4: Sanity check**

```bash
cd apps/agent && uv run pytest --version
```
Expected: `pytest 8.x.x`.

- [ ] **Step 5: Commit**

```bash
git add apps/agent/pyproject.toml apps/agent/uv.lock
git commit -m "chore(agent): add pytest dev deps"
```

---

### Task 0.2: Pydantic schemas for Room State

**Files:**
- Create: `apps/agent/src/interia/__init__.py`
- Create: `apps/agent/src/interia/schemas.py`
- Create: `apps/agent/tests/__init__.py`
- Create: `apps/agent/tests/interia/__init__.py`
- Create: `apps/agent/tests/interia/test_schemas.py`

- [ ] **Step 1: Write the failing test**

Create `apps/agent/tests/interia/test_schemas.py`:

```python
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/agent && uv run pytest tests/interia/test_schemas.py -v
```
Expected: FAIL — `ModuleNotFoundError: No module named 'src.interia'`.

- [ ] **Step 3: Implement the schema module**

Create `apps/agent/src/interia/__init__.py` empty.

Create `apps/agent/src/interia/schemas.py`:

```python
"""Pydantic schemas for Room State and related types.

Single source of truth. The TypeScript types in
`apps/frontend/src/lib/interia/types.ts` are generated from these models —
do not hand-edit the TS file.
"""
from __future__ import annotations

from typing import Annotated, List, Literal, Optional, Union

from pydantic import BaseModel, Field, RootModel
from pydantic import StringConstraints

# --- primitives ----------------------------------------------------------

GridCell = RootModel[
    Annotated[str, StringConstraints(pattern=r"^[A-D][1-4]$")]
]

HexColor = Annotated[str, StringConstraints(pattern=r"^#[0-9A-Fa-f]{6}$")]

Confidence = Annotated[float, Field(ge=0.0, le=1.0)]


# --- object + relation ---------------------------------------------------

ObjectType = Literal[
    "window", "bed", "desk", "chair", "lamp", "rug", "plant", "decor", "textile", "other"
]


class Bbox(BaseModel):
    x: float = Field(ge=0.0, le=1.0)
    y: float = Field(ge=0.0, le=1.0)
    w: float = Field(ge=0.0, le=1.0)
    h: float = Field(ge=0.0, le=1.0)


class RoomObject(BaseModel):
    id: str
    type: ObjectType
    label: str
    description: str
    gridPosition: GridCell
    approximateSize: Literal["small", "medium", "large"]
    color: Optional[str] = None
    material: Optional[str] = None
    confidence: Confidence
    detectedBy: Literal["vision", "user"]
    confirmedByUser: bool = False
    evidenceCropUrl: Optional[str] = None
    bbox: Optional[Bbox] = None


RelationType = Literal[
    "left_of", "right_of", "in_front_of", "behind",
    "above", "under", "attached_to_wall", "centered_under", "adjacent_to",
]


class RoomRelation(BaseModel):
    subjectId: str
    relation: RelationType
    targetId: str
    confidence: Confidence


# --- locks + edit contract ----------------------------------------------

LockLevel = Literal["locked", "soft", "editable"]


class LockSet(BaseModel):
    identity: LockLevel = "soft"
    position: LockLevel = "soft"
    appearance: LockLevel = "editable"


EditContract = dict  # alias only; runtime type is dict[str, LockSet]


# --- shell, source, preferences -----------------------------------------

class RoomShell(BaseModel):
    roomType: Literal["bedroom", "studio", "living", "workspace", "other"]
    dimensionsHint: Optional[Literal["compact", "medium", "large"]] = None
    cameraAngle: Literal["front", "corner-left", "corner-right"]


class RoomSource(BaseModel):
    imageUrl: str
    sampleId: Optional[Literal["bedroom", "studio", "living", "workspace"]] = None
    uploadedAt: str


class Grid(BaseModel):
    rows: Literal[4] = 4
    cols: Literal[4] = 4


class DesignPreference(BaseModel):
    style: Literal["minimal", "japandi", "industrial", "bohemian", "warm-modern"]
    budget: Literal["low", "medium", "high"]
    goal: Literal["cozy", "productive", "elegant", "spacious"]
    constraints: List[
        Literal["keep-furniture", "rental-friendly", "no-drilling", "pet-safe"]
    ] = []
    freeformNotes: Optional[str] = None


# --- catalog ------------------------------------------------------------

CatalogCategory = Literal["lamps", "rugs", "wall_decor", "plants", "textiles"]


class CatalogItem(BaseModel):
    id: str
    name: str
    category: CatalogCategory
    compatibleStyles: List[str]
    priceTier: Literal["low", "medium", "high"]
    materials: List[str]
    visualEffect: str
    placementSuggestions: List[str]
    constraintsCompatibility: List[str]


# --- design plan + patches ---------------------------------------------

class Palette(BaseModel):
    name: str
    swatches: List[HexColor]


class DesignPlan(BaseModel):
    palette: Palette
    lightingPlan: str
    decorSuggestions: List[CatalogItem]
    layoutSuggestions: List[str]
    actionPlan: List[str]
    rationale: str
    proposedPatches: List["DesignPatchUnion"] = []


class _AddObjectPatch(BaseModel):
    op: Literal["add_object"]
    target: dict   # partial RoomObject + required gridPosition
    reason: str


class _ModifyObjectPatch(BaseModel):
    op: Literal["modify_object"]
    id: str
    patch: dict   # partial RoomObject
    reason: str


class _RemoveObjectPatch(BaseModel):
    op: Literal["remove_object"]
    id: str
    reason: str


class _SetLockPatch(BaseModel):
    op: Literal["set_lock"]
    id: str
    locks: dict   # partial LockSet
    reason: str


class _PreservePatch(BaseModel):
    op: Literal["preserve"]
    id: str
    reason: str


DesignPatchUnion = Annotated[
    Union[
        _AddObjectPatch,
        _ModifyObjectPatch,
        _RemoveObjectPatch,
        _SetLockPatch,
        _PreservePatch,
    ],
    Field(discriminator="op"),
]


class DesignPatch(RootModel[DesignPatchUnion]):
    """Discriminated-union wrapper so callers can validate any patch shape."""


# --- preview + fidelity --------------------------------------------------

class Preview(BaseModel):
    id: str
    imageUrl: str
    promptSummary: str
    generationProvider: Literal["gemini-3-image-preview", "mock"]
    fromVersion: int
    createdAt: str
    userFidelityStatus: Optional[
        Literal["faithful", "mostly", "regenerate", "manual-mark"]
    ] = None


class _FidelityPerObject(BaseModel):
    objectId: str
    label: str
    preserved: bool
    confidence: Confidence
    note: Optional[str] = None


class _StyleApplied(BaseModel):
    selected: str
    applied: str
    match: Literal["strong", "partial", "weak"]


class _EvidenceCrop(BaseModel):
    objectId: str
    beforeUrl: str
    afterUrl: str


class FidelityReport(BaseModel):
    previewId: str
    systemScore: int = Field(ge=0, le=100)
    cameraAnglePreserved: bool
    perObject: List[_FidelityPerObject]
    styleApplied: _StyleApplied
    unexpectedChanges: List[str] = []
    recommendedAction: Literal[
        "accept", "regenerate_with_stronger_locks", "ask_user_to_unlock"
    ]
    evidenceCrops: Optional[List[_EvidenceCrop]] = None


# --- trace --------------------------------------------------------------

TraceType = Literal[
    "plan", "tool_call", "tool_result", "patch_applied", "validation", "user_decision"
]


class AgentTraceEvent(BaseModel):
    id: str
    type: TraceType
    inputSummary: str
    outputSummary: str
    createdAt: str


# --- Room State ---------------------------------------------------------

class RoomState(BaseModel):
    version: int = Field(ge=1)
    source: RoomSource
    shell: RoomShell
    grid: Grid = Grid()
    objects: List[RoomObject] = []
    relations: List[RoomRelation] = []
    editContract: dict = {}                 # str → LockSet (validated by reducer)
    preferences: Optional[DesignPreference] = None
    designPlan: Optional[DesignPlan] = None
    patches: List[DesignPatch] = []
    preview: Optional[Preview] = None
    fidelity: Optional[FidelityReport] = None
    trace: List[AgentTraceEvent] = []


DesignPlan.model_rebuild()
```

- [ ] **Step 4: Run tests, confirm they pass**

```bash
cd apps/agent && uv run pytest tests/interia/test_schemas.py -v
```
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add apps/agent/src/interia apps/agent/tests
git commit -m "feat(agent): add Pydantic Room State schemas with round-trip tests"
```

---

### Task 0.3: Type codegen script (Pydantic → TypeScript)

**Files:**
- Create: `scripts/codegen-types.mjs`
- Create: `apps/agent/src/interia/export_schema.py`
- Create: `apps/frontend/src/lib/interia/types.ts` (generated)

- [ ] **Step 1: Add JSON-schema export script in Python**

Create `apps/agent/src/interia/export_schema.py`:

```python
"""Emit a single JSON file with the JSON Schema of every public model.

Used by `scripts/codegen-types.mjs` to generate the TS mirror.
"""
from __future__ import annotations

import json
import sys

from src.interia import schemas as s


def main() -> None:
    payload = {
        "RoomState": s.RoomState.model_json_schema(),
        "RoomObject": s.RoomObject.model_json_schema(),
        "RoomRelation": s.RoomRelation.model_json_schema(),
        "LockSet": s.LockSet.model_json_schema(),
        "DesignPreference": s.DesignPreference.model_json_schema(),
        "DesignPlan": s.DesignPlan.model_json_schema(),
        "DesignPatch": s.DesignPatch.model_json_schema(),
        "Preview": s.Preview.model_json_schema(),
        "FidelityReport": s.FidelityReport.model_json_schema(),
        "AgentTraceEvent": s.AgentTraceEvent.model_json_schema(),
        "CatalogItem": s.CatalogItem.model_json_schema(),
    }
    json.dump(payload, sys.stdout, indent=2)


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Verify the export works**

```bash
cd apps/agent && uv run python -m src.interia.export_schema | head -20
```
Expected: prints valid JSON starting with `{ "RoomState": { ... } }`.

- [ ] **Step 3: Add the codegen Node script**

Create `scripts/codegen-types.mjs` at the repo root:

```js
#!/usr/bin/env node
/**
 * Generate apps/frontend/src/lib/interia/types.ts from the Pydantic models
 * exported by `apps/agent/src/interia/export_schema.py`.
 *
 * Usage: node scripts/codegen-types.mjs
 *
 * We intentionally use a small hand-rolled converter (not json-schema-to-ts)
 * so the output stays readable and we can tune naming without a dep.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const agentDir = join(repoRoot, "apps", "agent");
const out = join(repoRoot, "apps", "frontend", "src", "lib", "interia", "types.ts");

const json = execFileSync(
  "uv",
  ["run", "python", "-m", "src.interia.export_schema"],
  { cwd: agentDir }
).toString();

const schemas = JSON.parse(json);

const banner = `// AUTO-GENERATED by scripts/codegen-types.mjs — DO NOT EDIT BY HAND.
// Source: apps/agent/src/interia/schemas.py

`;

function refName(ref) {
  return ref.split("/").pop();
}

function tsType(node, defs) {
  if (!node) return "unknown";
  if (node.$ref) return refName(node.$ref);
  if (node.enum) return node.enum.map((v) => JSON.stringify(v)).join(" | ");
  if (node.const !== undefined) return JSON.stringify(node.const);
  if (node.anyOf) return node.anyOf.map((n) => tsType(n, defs)).join(" | ");
  if (node.oneOf) return node.oneOf.map((n) => tsType(n, defs)).join(" | ");
  if (node.allOf && node.allOf.length === 1) return tsType(node.allOf[0], defs);
  if (node.type === "array") return `${tsType(node.items, defs)}[]`;
  if (node.type === "object") {
    if (node.properties) {
      const required = new Set(node.required || []);
      const fields = Object.entries(node.properties).map(([k, v]) => {
        const opt = required.has(k) ? "" : "?";
        return `  ${k}${opt}: ${tsType(v, defs)};`;
      });
      return `{\n${fields.join("\n")}\n}`;
    }
    if (node.additionalProperties)
      return `Record<string, ${tsType(node.additionalProperties, defs)}>`;
    return "Record<string, unknown>";
  }
  if (node.type === "string") return "string";
  if (node.type === "integer" || node.type === "number") return "number";
  if (node.type === "boolean") return "boolean";
  if (node.type === "null") return "null";
  return "unknown";
}

function renderRoot(name, root) {
  const defs = root.$defs || {};
  const parts = [];
  for (const [defName, defNode] of Object.entries(defs)) {
    parts.push(`export type ${defName} = ${tsType(defNode, defs)};`);
  }
  parts.push(`export type ${name} = ${tsType(root, defs)};`);
  return parts.join("\n\n");
}

const seen = new Set();
const chunks = [];
for (const [name, root] of Object.entries(schemas)) {
  // Per-root rendering may emit duplicate $defs; skip duplicates by name.
  const block = renderRoot(name, root)
    .split("\n\n")
    .filter((stmt) => {
      const m = stmt.match(/^export type (\w+) =/);
      if (!m) return true;
      if (seen.has(m[1])) return false;
      seen.add(m[1]);
      return true;
    })
    .join("\n\n");
  chunks.push(`// ---- ${name} ----\n\n${block}`);
}

writeFileSync(out, banner + chunks.join("\n\n") + "\n");
console.log(`wrote ${out}`);
```

- [ ] **Step 4: Add npm script to repo `package.json`**

In `package.json` at the repo root, under `scripts`, add:

```json
"codegen": "node scripts/codegen-types.mjs"
```

- [ ] **Step 5: Run codegen**

```bash
mkdir -p apps/frontend/src/lib/interia
npm run codegen
```
Expected: writes `apps/frontend/src/lib/interia/types.ts` with `export type RoomState = { ... }` etc.

- [ ] **Step 6: Verify TS types compile**

```bash
cd apps/frontend && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add scripts/codegen-types.mjs apps/agent/src/interia/export_schema.py apps/frontend/src/lib/interia/types.ts package.json
git commit -m "feat: add Pydantic→TS codegen for Room State types"
```

---

### Task 0.4: Pure reducer for `apply_patch`

**Files:**
- Create: `apps/agent/src/interia/reducer.py`
- Create: `apps/agent/tests/interia/test_reducer.py`

- [ ] **Step 1: Write failing tests**

Create `apps/agent/tests/interia/test_reducer.py`:

```python
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
```

- [ ] **Step 2: Run, confirm fail**

```bash
cd apps/agent && uv run pytest tests/interia/test_reducer.py -v
```
Expected: FAIL — `ModuleNotFoundError: No module named 'src.interia.reducer'`.

- [ ] **Step 3: Implement the reducer**

Create `apps/agent/src/interia/reducer.py`:

```python
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
            # No-op semantically, but recorded in patches log so the trace
            # shows the agent's intent to keep something locked.
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
```

- [ ] **Step 4: Run tests**

```bash
cd apps/agent && uv run pytest tests/interia/test_reducer.py -v
```
Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add apps/agent/src/interia/reducer.py apps/agent/tests/interia/test_reducer.py
git commit -m "feat(agent): add pure apply_patch reducer with TDD coverage"
```

---

## Phase 1 — Upload view (shippable on its own)

### Task 1.1: Swap fonts to Inter + JetBrains Mono

The design handoff specifies Inter + JetBrains Mono. The starter currently uses Plus Jakarta + Spline Mono.

**Files:**
- Modify: `apps/frontend/src/app/layout.tsx`
- Modify: `apps/frontend/src/app/globals.css`

- [ ] **Step 1: Update font imports in `layout.tsx`**

Replace the Plus Jakarta / Spline imports with:

```tsx
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});
```

Replace the `<html>` className references to use `${inter.variable} ${jetbrains.variable}`.

Update metadata:
```ts
export const metadata: Metadata = {
  title: "Interia — Interactive Interior AI",
  description: "Upload a photo of your room and let Interia turn it into an editable design state.",
};
```

- [ ] **Step 2: Update Tailwind/CSS variable references in `globals.css`**

Find any `font-family` rules using `--font-jakarta` and replace with `--font-sans`. Same for the mono variant.

- [ ] **Step 3: Run dev server, eyeball**

```bash
npm run dev
```
Expected: app loads at http://localhost:3010 with Inter font visible.

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/app/layout.tsx apps/frontend/src/app/globals.css
git commit -m "chore(frontend): swap to Inter + JetBrains Mono per design handoff"
```

---

### Task 1.2: Japandi design tokens

**Files:**
- Modify: `apps/frontend/src/app/globals.css`
- Create: `apps/frontend/src/lib/interia/design-tokens.ts`

- [ ] **Step 1: Add CSS custom properties to `globals.css`**

In the `:root { ... }` block, add:

```css
  /* Interia Japandi tokens (per design_handoff_interia_upload_view) */
  --warm-canvas: #F7F3EC;
  --soft-cream: #FBF8F2;
  --porcelain: #FFFFFF;
  --sand-border: #E7DED1;
  --sand-border-strong: #DAD0C0;
  --charcoal: #1F1F1C;
  --warm-gray: #6F6A61;
  --dust-gray: #9A9489;
  --sage: #5F7F63;
  --deep-sage: #49634D;
  --mist-sage: #E7EFE4;
  --terracotta: #C97855;
  --clay: #E9C7B3;
  --muted-gold: #C9A96A;

  /* radii */
  --r-pill: 999px;
  --r-card-sm: 12px;
  --r-card: 14px;
  --r-card-lg: 18px;
  --r-card-xl: 22px;
  --r-card-2xl: 24px;
  --r-frame: 30px;
```

After `:root`, add a `body` overlay matching the handoff's two faint radial tints:

```css
body {
  background-color: var(--warm-canvas);
  color: var(--charcoal);
  font-family: var(--font-sans), system-ui, sans-serif;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 100% 0%, rgba(201,120,85,0.05), transparent 40%),
    radial-gradient(circle at 0% 100%, rgba(95,127,99,0.05), transparent 40%);
  z-index: -1;
}
```

- [ ] **Step 2: Mirror tokens in TS for component access**

Create `apps/frontend/src/lib/interia/design-tokens.ts`:

```ts
export const tokens = {
  warmCanvas: "#F7F3EC",
  softCream: "#FBF8F2",
  porcelain: "#FFFFFF",
  sandBorder: "#E7DED1",
  sandBorderStrong: "#DAD0C0",
  charcoal: "#1F1F1C",
  warmGray: "#6F6A61",
  dustGray: "#9A9489",
  sage: "#5F7F63",
  deepSage: "#49634D",
  mistSage: "#E7EFE4",
  terracotta: "#C97855",
  clay: "#E9C7B3",
  mutedGold: "#C9A96A",
} as const;

export type DesignToken = keyof typeof tokens;
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/app/globals.css apps/frontend/src/lib/interia/design-tokens.ts
git commit -m "feat(frontend): add Japandi design tokens"
```

---

### Task 1.3: Sample room images and metadata

**Files:**
- Create: `apps/frontend/public/samples/bedroom.jpg`, `studio.jpg`, `living.jpg`, `workspace.jpg`
- Create: `apps/frontend/src/lib/interia/samples.ts`

- [ ] **Step 1: Download sample images from Unsplash**

The design handoff specifies these Unsplash URLs. Save them locally so the demo doesn't depend on a CDN at run time.

```bash
cd apps/frontend/public
mkdir -p samples
curl -L "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=85" -o samples/bedroom.jpg
curl -L "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1200&q=85" -o samples/studio.jpg
curl -L "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=85" -o samples/living.jpg
curl -L "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200&q=85" -o samples/workspace.jpg
curl -L "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1600&q=85" -o samples/bedroom-hero.jpg
```

Expected: 5 JPGs under 1MB each.

- [ ] **Step 2: Add metadata module**

Create `apps/frontend/src/lib/interia/samples.ts`:

```ts
export type SampleId = "bedroom" | "studio" | "living" | "workspace";

export type Sample = {
  id: SampleId;
  label: string;
  thumbUrl: string;
  heroUrl: string;
};

export const SAMPLES: readonly Sample[] = [
  {
    id: "bedroom",
    label: "Bedroom",
    thumbUrl: "/samples/bedroom.jpg",
    heroUrl: "/samples/bedroom-hero.jpg",
  },
  {
    id: "studio",
    label: "Studio",
    thumbUrl: "/samples/studio.jpg",
    heroUrl: "/samples/studio.jpg",
  },
  {
    id: "living",
    label: "Living room",
    thumbUrl: "/samples/living.jpg",
    heroUrl: "/samples/living.jpg",
  },
  {
    id: "workspace",
    label: "Workspace",
    thumbUrl: "/samples/workspace.jpg",
    heroUrl: "/samples/workspace.jpg",
  },
] as const;

export const DEFAULT_SAMPLE_ID: SampleId = "bedroom";
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/public/samples apps/frontend/src/lib/interia/samples.ts
git commit -m "feat(frontend): add bundled sample room images and metadata"
```

---

### Task 1.4: Sidebar component

**Files:**
- Create: `apps/frontend/src/components/interia/Sidebar.tsx`

- [ ] **Step 1: Build the sidebar**

Create `apps/frontend/src/components/interia/Sidebar.tsx`:

```tsx
"use client";

import {
  Plus,
  Folder,
  Sparkles,
  LayoutGrid,
  SlidersHorizontal,
  Settings,
} from "lucide-react";
import Link from "next/link";

const NAV = [
  { href: "/", label: "New Project", icon: Plus, active: true },
  { href: "/projects", label: "Projects", icon: Folder },
  { href: "/inspiration", label: "Inspiration", icon: Sparkles },
  { href: "/catalog", label: "Catalog", icon: LayoutGrid },
  { href: "/preferences", label: "Preferences", icon: SlidersHorizontal },
] as const;

export function Sidebar() {
  return (
    <aside
      className="flex h-screen w-[248px] flex-col border-r"
      style={{
        backgroundColor: "var(--soft-cream)",
        borderColor: "var(--sand-border)",
        padding: "26px 18px 22px 18px",
      }}
    >
      <Logo />
      <nav className="mt-6 flex flex-col gap-1">
        {NAV.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>
      <div className="flex-1" />
      <NavItem href="/settings" label="Settings" icon={Settings} />
      <WorkspaceCard />
    </aside>
  );
}

function Logo() {
  return (
    <div className="flex items-center justify-between border-b border-dashed pb-[22px]"
         style={{ borderColor: "var(--sand-border)" }}>
      <div className="flex items-center gap-2">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2 L20 12 L12 22 L4 12 Z"
            fill="var(--sage)"
            stroke="var(--deep-sage)"
            strokeWidth="1.5"
          />
        </svg>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: 19,
            letterSpacing: "-0.02em",
            color: "var(--charcoal)",
          }}
        >
          interia
        </span>
      </div>
      <span
        className="rounded px-1.5 py-0.5"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "0.1em",
          color: "var(--dust-gray)",
        }}
      >
        PLACEHOLDER
      </span>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Plus;
  active?: boolean;
}) {
  const base = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    height: 44,
    borderRadius: 12,
    padding: "0 12px",
    fontSize: 14.5,
    fontWeight: active ? 600 : 500,
    transition: "all .15s ease",
  } as const;
  const activeStyle = active
    ? {
        backgroundColor: "var(--mist-sage)",
        color: "var(--deep-sage)",
        border: "1px solid rgba(95,127,99,0.18)",
      }
    : { color: "var(--warm-gray)" };
  return (
    <Link href={href} style={{ ...base, ...activeStyle }}>
      <Icon size={18} strokeWidth={1.6} />
      <span className="flex-1">{label}</span>
      {active && (
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            backgroundColor: "var(--sage)",
          }}
        />
      )}
    </Link>
  );
}

function WorkspaceCard() {
  return (
    <div
      className="mt-3"
      style={{
        backgroundColor: "var(--porcelain)",
        border: "1px solid var(--sand-border)",
        borderRadius: 14,
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.1em",
          color: "var(--dust-gray)",
          textTransform: "uppercase",
        }}
      >
        WORKSPACE
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--charcoal)" }}>
        Laura&apos;s Studio
      </div>
      <div className="mt-1 flex items-center gap-1.5">
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            backgroundColor: "var(--terracotta)",
          }}
        />
        <span style={{ fontSize: 12, color: "var(--warm-gray)" }}>3 active projects</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/components/interia/Sidebar.tsx
git commit -m "feat(frontend): add Interia sidebar component"
```

---

### Task 1.5: TopUserMenu, HeroIntro, RoomUploadCard, SampleRoomSelector, HeroRoomPreview, AgentWelcomeCard, BottomHint

**Files:**
- Create: `apps/frontend/src/components/interia/TopUserMenu.tsx`
- Create: `apps/frontend/src/components/interia/HeroIntro.tsx`
- Create: `apps/frontend/src/components/interia/RoomUploadCard.tsx`
- Create: `apps/frontend/src/components/interia/SampleRoomSelector.tsx`
- Create: `apps/frontend/src/components/interia/HeroRoomPreview.tsx`
- Create: `apps/frontend/src/components/interia/AgentWelcomeCard.tsx`
- Create: `apps/frontend/src/components/interia/BottomHint.tsx`

For each component, use the spec from `design_handoff_interia_upload_view/README.md` (sections 2–8 of "Components"). Each component gets its own file. Use the design tokens from Task 1.2 and the lucide icons named in the handoff.

- [ ] **Step 1: TopUserMenu** — implement per handoff §2 (status pill + user pill, absolute positioned). Props: `userName: string`, `agentStatus: "idle" | "preparing" | "analyzing"`.

- [ ] **Step 2: HeroIntro** — per handoff §3 (pill + 60px two-line title, second line in `--sage`). Props: `title?: { line1: string; line2: string }` (default per handoff).

- [ ] **Step 3: RoomUploadCard** — per handoff §4. Props: `onSelect: (file: File) => void`. Whole card is a click target; supports drag-and-drop for `image/jpeg` and `image/png`. State: `isDragging: boolean`. The hover state changes the border to `rgba(95,127,99,0.45)` and adds the sage-tinted shadow.

- [ ] **Step 4: SampleRoomSelector** — per handoff §5. Props: `samples: Sample[]`, `selectedId: SampleId | null`, `onSelect: (id: SampleId) => void`. 4-column grid, square aspect-ratio thumbs.

- [ ] **Step 5: HeroRoomPreview** — per handoff §6. Props: `imageUrl: string`, `caption?: string`. Includes the step badge (white "1" on charcoal), the source label pill, the L-shaped tick marks, and renders `AgentWelcomeCard` as a child positioned absolutely at the bottom.

- [ ] **Step 6: AgentWelcomeCard** — per handoff §7. Props: `name="Interia"`, `agentStatus`, `body: string`. Three sage typing dots animate via `@keyframes interiaTyping` defined inline or in `globals.css`.

- [ ] **Step 7: BottomHint** — per handoff §8. Static.

- [ ] **Step 8: Add the typing animation to `globals.css`**

```css
@keyframes interiaTyping {
  0%, 60%, 100% { opacity: 0.3; }
  30% { opacity: 1; }
}
```

- [ ] **Step 9: Commit**

```bash
git add apps/frontend/src/components/interia apps/frontend/src/app/globals.css
git commit -m "feat(frontend): add Upload view components per design handoff"
```

---

### Task 1.6: Wire upload page

**Files:**
- Modify: `apps/frontend/src/app/page.tsx` (REWRITE — current content is the kit landing page)

- [ ] **Step 1: Rewrite the page**

Replace the entire contents of `apps/frontend/src/app/page.tsx` with:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Sidebar } from "@/components/interia/Sidebar";
import { TopUserMenu } from "@/components/interia/TopUserMenu";
import { HeroIntro } from "@/components/interia/HeroIntro";
import { RoomUploadCard } from "@/components/interia/RoomUploadCard";
import { SampleRoomSelector } from "@/components/interia/SampleRoomSelector";
import { HeroRoomPreview } from "@/components/interia/HeroRoomPreview";
import { AgentWelcomeCard } from "@/components/interia/AgentWelcomeCard";
import { BottomHint } from "@/components/interia/BottomHint";
import { SAMPLES, DEFAULT_SAMPLE_ID, type SampleId } from "@/lib/interia/samples";

export default function UploadPage() {
  const router = useRouter();
  const [selectedSampleId, setSelectedSampleId] = useState<SampleId | null>(DEFAULT_SAMPLE_ID);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const heroSample = SAMPLES.find((s) => s.id === selectedSampleId) ?? SAMPLES[0];

  function startProject(payload: { sampleId: SampleId } | { file: File }) {
    // Per spec §3: project = thread; create one and route. We use a
    // client-generated id for the URL; the agent backs it with thread state.
    const id = `proj_${crypto.randomUUID().slice(0, 8)}`;
    if ("sampleId" in payload) {
      sessionStorage.setItem(`interia:${id}`, JSON.stringify({ sampleId: payload.sampleId }));
    } else {
      // file: store as object URL for the next view; the agent will fetch via the URL.
      const url = URL.createObjectURL(payload.file);
      sessionStorage.setItem(`interia:${id}`, JSON.stringify({ uploadedUrl: url }));
    }
    router.push(`/project/${id}`);
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main
        className="relative flex-1"
        style={{ padding: "72px 40px 40px 56px" }}
      >
        <TopUserMenu userName="Laura" agentStatus="preparing" />
        <div
          className="grid"
          style={{
            gridTemplateColumns: "minmax(460px, 520px) 1fr",
            gap: 56,
          }}
        >
          <section style={{ maxWidth: 520 }}>
            <HeroIntro />
            <div style={{ marginTop: 36 }}>
              <RoomUploadCard
                onSelect={(file) => {
                  setUploadedFile(file);
                  startProject({ file });
                }}
              />
            </div>
            <div style={{ marginTop: 28 }}>
              <SampleRoomSelector
                samples={SAMPLES as unknown as typeof SAMPLES[number][]}
                selectedId={selectedSampleId}
                onSelect={(id) => {
                  setSelectedSampleId(id);
                  startProject({ sampleId: id });
                }}
              />
            </div>
          </section>
          <section style={{ maxWidth: 720, justifySelf: "end" }}>
            <HeroRoomPreview imageUrl={heroSample.heroUrl}>
              <AgentWelcomeCard
                agentStatus="preparing"
                body="I'll analyze your room, build a design state, and generate controls you can use to refine it visually."
              />
            </HeroRoomPreview>
          </section>
        </div>
        <BottomHint />
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Run dev server, manually verify the upload view matches the handoff**

```bash
npm run dev
```
Open http://localhost:3010. Check:
- Sidebar matches mockup (logo + nav + workspace card).
- Hero text reads "Design your space, interactively." with the second line in sage.
- Bedroom thumbnail is selected by default; clicking another sample updates the hero preview AND immediately routes to `/project/<id>`.
- Hovering the upload card sage-tints the border + lifts the shadow.

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/app/page.tsx
git commit -m "feat(frontend): wire Upload view at /"
```

---

### Task 1.7: Stub `/project/[id]` route

**Files:**
- Create: `apps/frontend/src/app/project/[id]/page.tsx`

- [ ] **Step 1: Add a stub page so the redirect from upload works**

```tsx
export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="p-12">
      <div style={{ fontFamily: "var(--font-mono)", color: "var(--dust-gray)" }}>
        project / {id}
      </div>
      <h1 style={{ fontSize: 32, color: "var(--charcoal)" }}>Canvas coming in Phase 4.</h1>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/app/project
git commit -m "feat(frontend): stub project canvas route"
```

---

## Phase 2 — Agent rewire (Notion → Interia)

### Task 2.1: Delete Notion modules

**Files:**
- Delete: `apps/agent/src/notion_integration.py`
- Delete: `apps/agent/src/notion_mcp.py`
- Delete: `apps/agent/src/notion_tools.py`
- Delete: `apps/agent/src/lead_state.py`
- Delete: `apps/agent/src/lead_store.py`
- Delete: `apps/agent/src/canvas.py` (will be replaced in 2.4)
- Delete: `apps/agent/src/prompts.py` (will be replaced in 2.3)

- [ ] **Step 1: Remove the files**

```bash
cd apps/agent
git rm src/notion_integration.py src/notion_mcp.py src/notion_tools.py \
       src/lead_state.py src/lead_store.py src/canvas.py src/prompts.py
```

- [ ] **Step 2: Commit (intentionally broken state — fixed in 2.2)**

```bash
git commit -m "chore(agent): remove Notion + Lead modules"
```

---

### Task 2.2: New `RoomStateMiddleware`

**Files:**
- Create: `apps/agent/src/interia/middleware.py`
- Create: `apps/agent/tests/interia/test_middleware.py`

The starter kit's `LeadStateMiddleware` contributed canvas state via a TypedDict. We replace it with a Room State equivalent.

- [ ] **Step 1: Write failing test**

```python
"""Smoke test for the RoomStateMiddleware."""
from src.interia.middleware import RoomStateMiddleware


def test_middleware_advertises_room_state_key() -> None:
    mw = RoomStateMiddleware()
    schema = mw.state_schema_extras()
    assert "roomState" in schema
```

- [ ] **Step 2: Implement middleware**

```python
"""Middleware that advertises the `roomState` key on the agent's shared state.

Mirrors the kit's previous LeadStateMiddleware. The actual values flow
through CopilotKit's shared-state mechanism — this middleware just declares
the schema so LangGraph knows how to merge updates.
"""
from __future__ import annotations

from typing import Any

from langgraph.types import Command


class RoomStateMiddleware:
    def state_schema_extras(self) -> dict[str, Any]:
        # Permissive at the middleware boundary; the Pydantic models in
        # schemas.py validate at every tool entry point.
        return {"roomState": dict}

    def __call__(self, state: dict, *, config: Any | None = None) -> Command | None:
        # No-op pass-through; presence of the middleware is what matters.
        return None
```

- [ ] **Step 3: Run test**

```bash
cd apps/agent && uv run pytest tests/interia/test_middleware.py -v
```
Expected: 1 passed.

- [ ] **Step 4: Commit**

```bash
git add apps/agent/src/interia/middleware.py apps/agent/tests/interia/test_middleware.py
git commit -m "feat(agent): add RoomStateMiddleware"
```

---

### Task 2.3: System prompt for Interia

**Files:**
- Create: `apps/agent/src/interia/prompts.py`
- Create: `apps/agent/tests/interia/test_prompts.py`

- [ ] **Step 1: Test that prompt contains the 11-step contract**

```python
from src.interia.prompts import build_system_prompt


def test_prompt_includes_workflow_contract() -> None:
    prompt = build_system_prompt(integration_status="ok")
    for marker in [
        "1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.", "10.", "11.",
        "Room State",
        "Edit Contract",
        "DO NOT generate previews",
        "fidelity",
    ]:
        assert marker in prompt, f"missing marker: {marker}"
```

- [ ] **Step 2: Implement the prompt**

```python
"""System prompt for the Interia Room State Agent."""
from __future__ import annotations


_PROMPT_TEMPLATE = """\
You are Interia, an interactive interior-design agent.

PRINCIPLES
- The original room photo is the visual source of truth.
- Room State is the canonical structured memory. Never invent state outside it.
- For changes, emit DesignPatch[] and call apply_patch — never regenerate from scratch.
- Use the in-house catalog only. Never invent real product names or prices.
- Generate previews ONLY when the user explicitly requests one.
- After every preview, immediately call validate_fidelity and surface the report to the user.

11-STEP WORKFLOW
1. Capture: receive uploaded image / sample id; acknowledge.
2. Analyze: call analyze_room.
3. Build state: call build_room_state.
4. Grid: call generate_grid.
5. Confirm: call openConfirmationCard for objects with confidence < 0.85.
6. Preferences: drive the PreferencesCard; receive setPreferences.
7. Design plan: call generate_design_plan.
8. Preview (on request only): call generate_preview.
9. Validate: call validate_fidelity (a dispatched sub-agent).
10. User decision: receive submitFidelityDecision.
11. Iterate: on regenerate, tighten the Edit Contract and re-run 8–10. On accept, call checkpoint.

EDIT CONTRACT RULES
- identity locked → object identity must persist across previews.
- position locked → grid position must persist.
- appearance locked → color, material, decoration unchanged.
- soft → preserve unless user explicitly overrides.
- editable → free to change consistent with the design plan.

INTEGRATION STATUS
{integration_status}

Be terse. Plan in short steps. Cite the tool name you intend to call before
calling it. Stream progress to the canvas via the frontend tools.
"""


def build_system_prompt(integration_status: str) -> str:
    return _PROMPT_TEMPLATE.format(integration_status=integration_status)
```

- [ ] **Step 3: Run test**

```bash
cd apps/agent && uv run pytest tests/interia/test_prompts.py -v
```
Expected: 1 passed.

- [ ] **Step 4: Commit**

```bash
git add apps/agent/src/interia/prompts.py apps/agent/tests/interia/test_prompts.py
git commit -m "feat(agent): add Interia system prompt with 11-step contract"
```

---

### Task 2.4: Update `runtime.py` and `main.py`

**Files:**
- Modify: `apps/agent/src/runtime.py`
- Modify: `apps/agent/main.py`

- [ ] **Step 1: Edit `runtime.py`**

Replace `from .lead_state import LeadStateMiddleware` with `from .interia.middleware import RoomStateMiddleware`. Replace every `LeadStateMiddleware()` with `RoomStateMiddleware()`. Update the module docstring to reference Interia.

- [ ] **Step 2: Edit `main.py`**

Replace the entire file:

```python
"""LangGraph entry point for `langgraph dev --port 8133`.

Wires the Interia agent: switchable runtime (Gemini Flash-Lite by default,
Gemini-react and Claude-react alternatives), Room State middleware, and
the Interia tool list. Frontend tools come through the React side via
useFrontendTool — they MUST NOT be passed in here.
"""
from __future__ import annotations

import os

from dotenv import load_dotenv

from src.intelligence_cleanup import wipe_orphan_threads
from src.interia.prompts import build_system_prompt
from src.interia.tools import all_tools
from src.runtime import build_graph


load_dotenv()
wipe_orphan_threads()

_AGENT_RUNTIME = os.getenv("AGENT_RUNTIME", "gemini-flash-deep")
print(f"[runtime] AGENT_RUNTIME={_AGENT_RUNTIME}", flush=True)

_gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
if _AGENT_RUNTIME.startswith("gemini-") and (
    not _gemini_key or _gemini_key.startswith("stub")
):
    print(
        "\n  GEMINI_API_KEY is unset or a stub.\n"
        "   The agent will boot but chat will fail on the first turn.\n"
        "   Set GEMINI_API_KEY in agent/.env (and/or .env at repo root).\n",
        flush=True,
    )


_use_noop = (
    _AGENT_RUNTIME.startswith("gemini-")
    and (not _gemini_key or _gemini_key.startswith("stub"))
)
if _use_noop:
    print(
        "\n[runtime] GEMINI_API_KEY missing or stub — using noop fallback graph.\n",
        flush=True,
    )

_integration_status = (
    "mock mode active (INTERIA_MOCK=1)"
    if os.getenv("INTERIA_MOCK") == "1"
    else "live tools active"
)

graph = build_graph(
    "noop" if _use_noop else _AGENT_RUNTIME,
    tools=all_tools(),
    system_prompt=build_system_prompt(_integration_status),
)


def main() -> None:
    import subprocess

    subprocess.run(["langgraph", "dev", "--port", "8133"], check=True)


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Add a stub `tools` package so the import resolves before Phase 3**

Create `apps/agent/src/interia/tools/__init__.py`:

```python
"""Interia tool registry. Tools are added in Phase 3."""
from __future__ import annotations


def all_tools() -> list:
    return []
```

- [ ] **Step 4: Verify the agent boots**

```bash
cd apps/agent && AGENT_RUNTIME=gemini-flash-deep INTERIA_MOCK=1 GEMINI_API_KEY=stub uv run python -c "import main; print('ok', main.graph)"
```
Expected: prints `ok` and a graph object (will use the noop runtime since GEMINI key is stub).

- [ ] **Step 5: Commit**

```bash
git add apps/agent/src/runtime.py apps/agent/main.py apps/agent/src/interia/tools/__init__.py
git commit -m "feat(agent): rewire entry point to Interia (no Notion plumbing)"
```

---

### Task 2.5: Strip Notion env from `scripts/check-env.sh` and `.env.example`

**Files:**
- Modify: `scripts/check-env.sh`
- Modify: `.env.example`

- [ ] **Step 1: Inspect**

```bash
grep -n -i "notion" scripts/check-env.sh .env.example
```

- [ ] **Step 2: Remove every Notion-related check from `check-env.sh`** — token check, database id check, MCP probe.

- [ ] **Step 3: Remove `NOTION_TOKEN` and `NOTION_LEADS_DATABASE_ID` from `.env.example`** and add:

```bash
# Set INTERIA_MOCK=1 to force every tool to its mock fallback (offline demo).
INTERIA_MOCK=1
```

- [ ] **Step 4: Run the check**

```bash
./scripts/check-env.sh
```
Expected: passes without mentioning Notion.

- [ ] **Step 5: Commit**

```bash
git add scripts/check-env.sh .env.example
git commit -m "chore: remove Notion checks; add INTERIA_MOCK env flag"
```

---

## Phase 3 — Backend tools (mock-first)

Each tool follows the same pattern: Pydantic in/out, an `INTERIA_MOCK=1` codepath, a real-API codepath. The tools are registered to the Deep Agent via `all_tools()` in `src/interia/tools/__init__.py`.

**Trace discipline:** every tool, before returning, appends one `AgentTraceEvent` to `state.trace` describing the call (type=`tool_result`, `inputSummary` = the tool name + arg digest, `outputSummary` = a one-line result summary). This is what populates the AgentTracePanel. Implement this via a tiny helper in `apps/agent/src/interia/trace.py` (`append_trace(state, event)`) and call it from each tool's mock and real code paths.

### Task 3.1: `analyze_room` (vision)

**Files:**
- Create: `apps/agent/src/interia/tools/vision.py`
- Create: `apps/agent/tests/interia/test_vision.py`
- Create: `apps/agent/data/sample_rooms/bedroom.json` (canned analysis)
- Create: `apps/agent/data/sample_rooms/studio.json`, `living.json`, `workspace.json`

- [ ] **Step 1: Add canned analyses**

`apps/agent/data/sample_rooms/bedroom.json`:

```json
{
  "roomType": "bedroom",
  "cameraAngle": "corner-left",
  "objects": [
    { "type": "window", "label": "Tall single window", "bbox": {"x": 0.05, "y": 0.10, "w": 0.18, "h": 0.50}, "confidence": 0.93 },
    { "type": "bed", "label": "Queen bed with linen bedding", "bbox": {"x": 0.30, "y": 0.40, "w": 0.45, "h": 0.50}, "confidence": 0.95 },
    { "type": "desk", "label": "Wooden desk", "bbox": {"x": 0.78, "y": 0.45, "w": 0.18, "h": 0.30}, "confidence": 0.82 },
    { "type": "chair", "label": "Cream upholstered chair", "bbox": {"x": 0.74, "y": 0.55, "w": 0.10, "h": 0.30}, "confidence": 0.78 },
    { "type": "plant", "label": "Tall floor plant", "bbox": {"x": 0.66, "y": 0.30, "w": 0.10, "h": 0.45}, "confidence": 0.88 }
  ]
}
```

(Repeat similar canned data for studio/living/workspace.)

- [ ] **Step 2: Write failing test**

```python
"""Tests for analyze_room."""
from __future__ import annotations

import os

import pytest

from src.interia.tools.vision import analyze_room


def test_mock_returns_canned_bedroom(monkeypatch) -> None:
    monkeypatch.setenv("INTERIA_MOCK", "1")
    result = analyze_room.invoke({"image_url": "/samples/bedroom.jpg", "sample_id": "bedroom"})
    assert result["roomType"] == "bedroom"
    assert any(o["type"] == "window" for o in result["objects"])


def test_mock_falls_back_to_bedroom_for_unknown(monkeypatch) -> None:
    monkeypatch.setenv("INTERIA_MOCK", "1")
    result = analyze_room.invoke({"image_url": "/uploads/x.jpg"})
    assert result["roomType"] in {"bedroom", "studio", "living", "workspace"}
```

- [ ] **Step 3: Implement**

```python
"""analyze_room: extract structured visual facts from a room photo.

Mock path (INTERIA_MOCK=1): returns a canned analysis from
data/sample_rooms/<id>.json. The real path uses Gemini Pro multimodal.
"""
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
            When set with INTERIA_MOCK=1, returns the matching canned analysis.
    """
    if os.getenv("INTERIA_MOCK") == "1":
        return _load_sample(sample_id)

    # Real path: Gemini Pro multimodal.
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
```

- [ ] **Step 4: Run tests**

```bash
cd apps/agent && uv run pytest tests/interia/test_vision.py -v
```
Expected: 2 passed.

- [ ] **Step 5: Register in `all_tools()`**

In `apps/agent/src/interia/tools/__init__.py`:

```python
from .vision import analyze_room


def all_tools() -> list:
    return [analyze_room]
```

- [ ] **Step 6: Commit**

```bash
git add apps/agent/src/interia/tools apps/agent/tests/interia/test_vision.py apps/agent/data/sample_rooms
git commit -m "feat(agent): add analyze_room tool with mock fallback"
```

---

### Task 3.2: `build_room_state` (deterministic normalizer)

**Files:**
- Create: `apps/agent/src/interia/tools/state.py`
- Create: `apps/agent/tests/interia/test_state_tools.py`

- [ ] **Step 1: Write failing tests**

Test that `build_room_state` accepts the shape returned by `analyze_room` and produces a valid `RoomState v1`. Test that `generate_grid` maps bbox centers into 4×4 cells correctly. Test that `apply_patch_tool` wraps the reducer.

```python
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
```

- [ ] **Step 2: Implement**

```python
"""state.py — deterministic Room State construction tools."""
from __future__ import annotations

from typing import Any
from uuid import uuid4

from langchain_core.tools import tool

from ..reducer import apply_patch
from ..schemas import (
    DesignPatch,
    Grid,
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
    # Architectural / structural objects start fully locked; movables soft.
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
        new_objects.append(o.model_copy(update={"gridPosition": _grid_cell(bbox_d)}))
    return rs.model_copy(update={"objects": new_objects}).model_dump(mode="json")


@tool
def apply_patch_tool(state: dict, patches: list[dict]) -> dict:
    """Apply DesignPatch[] and return the new RoomState dict."""
    rs = RoomState.model_validate(state)
    wrapped = [DesignPatch.model_validate(p) for p in patches]
    return apply_patch(rs, wrapped).model_dump(mode="json")
```

- [ ] **Step 3: Run tests**

```bash
cd apps/agent && uv run pytest tests/interia/test_state_tools.py -v
```
Expected: 3 passed.

- [ ] **Step 4: Register in `all_tools()`**

```python
from .state import apply_patch_tool, build_room_state, generate_grid
from .vision import analyze_room


def all_tools() -> list:
    return [analyze_room, build_room_state, generate_grid, apply_patch_tool]
```

- [ ] **Step 5: Commit**

```bash
git add apps/agent/src/interia/tools/state.py apps/agent/src/interia/tools/__init__.py apps/agent/tests/interia/test_state_tools.py
git commit -m "feat(agent): add build_room_state, generate_grid, apply_patch_tool"
```

---

### Task 3.3: `get_catalog_options` and `catalog.json`

**Files:**
- Create: `apps/agent/src/interia/data/catalog.json`
- Create: `apps/agent/src/interia/tools/design.py` (catalog only for now; plan tool added in 3.4)
- Create: `apps/agent/tests/interia/test_catalog.py`

- [ ] **Step 1: Build the catalog**

`apps/agent/src/interia/data/catalog.json` — at least 4 items per category (lamps, rugs, wall_decor, plants, textiles). Each item:

```json
{
  "id": "lamp_paper_floor",
  "name": "Paper Floor Lamp",
  "category": "lamps",
  "compatibleStyles": ["minimal", "japandi", "warm-modern"],
  "priceTier": "low",
  "materials": ["paper", "rattan"],
  "visualEffect": "warm diffuse light",
  "placementSuggestions": ["corner", "next-to-bed"],
  "constraintsCompatibility": ["rental-friendly", "pet-safe", "no-drilling"]
}
```

(Add 19 more items for the other categories — keep it generic; no real product names.)

- [ ] **Step 2: Test**

```python
from src.interia.tools.design import get_catalog_options


def test_filters_by_style_and_category() -> None:
    items = get_catalog_options.invoke({"category": "lamps", "style": "japandi", "budget": "low"})
    assert items
    assert all("japandi" in i["compatibleStyles"] for i in items)
    assert all(i["priceTier"] == "low" for i in items)
```

- [ ] **Step 3: Implement**

```python
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
    and price tier (`low`, `medium`, `high`).
    """
    return [
        item
        for item in _load()
        if item["category"] == category
        and style in item["compatibleStyles"]
        and item["priceTier"] == budget
    ]
```

- [ ] **Step 4: Run + register + commit**

```bash
cd apps/agent && uv run pytest tests/interia/test_catalog.py -v
```

Add `get_catalog_options` to `all_tools()`. Commit:

```bash
git add apps/agent/src/interia/data apps/agent/src/interia/tools/design.py apps/agent/src/interia/tools/__init__.py apps/agent/tests/interia/test_catalog.py
git commit -m "feat(agent): add design catalog and get_catalog_options"
```

---

### Task 3.4: `generate_design_plan`

**Files:**
- Modify: `apps/agent/src/interia/tools/design.py`
- Create: `apps/agent/tests/interia/test_design_plan.py`

- [ ] **Step 1: Failing test (mock path)**

```python
import pytest

from src.interia.schemas import DesignPlan
from src.interia.tools.design import generate_design_plan


@pytest.fixture
def state_dict() -> dict:
    return {
        "version": 1,
        "source": {"imageUrl": "/x.jpg", "uploadedAt": "2026-05-09T10:00:00Z"},
        "shell": {"roomType": "bedroom", "cameraAngle": "corner-left"},
        "grid": {"rows": 4, "cols": 4},
        "objects": [],
        "relations": [],
        "editContract": {},
        "patches": [],
        "trace": [],
    }


def test_mock_returns_japandi_plan(monkeypatch, state_dict) -> None:
    monkeypatch.setenv("INTERIA_MOCK", "1")
    result = generate_design_plan.invoke({
        "state": state_dict,
        "preferences": {
            "style": "japandi",
            "budget": "medium",
            "goal": "cozy",
            "constraints": ["pet-safe"],
        },
    })
    plan = DesignPlan.model_validate(result)
    assert plan.palette.swatches
    assert plan.actionPlan
```

- [ ] **Step 2: Implement (append to `design.py`)**

```python
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
```

Add `import os` and `import json` at the top of `design.py` if not already present.

- [ ] **Step 3: Run + register + commit**

---

### Task 3.5: `generate_preview`

**Files:**
- Create: `apps/agent/src/interia/tools/preview.py`
- Create: `apps/agent/tests/interia/test_preview.py`
- Create: `apps/agent/data/mock_previews/bedroom.png`, `studio.png`, `living.png`, `workspace.png` (any tinted/overlay placeholder image)

- [ ] **Step 1: Add placeholder PNGs (1024×1024 of the source with a warm tint applied — fine to copy from samples and run a quick PIL tint)**

```bash
cd apps/agent && uv run python - <<'PY'
from PIL import Image, ImageEnhance, ImageDraw
import shutil, pathlib
src = pathlib.Path("data/sample_rooms")
dst = pathlib.Path("data/mock_previews"); dst.mkdir(exist_ok=True)
# We don't have raw images here; use the frontend public samples copied in.
import os
for name in ["bedroom","studio","living","workspace"]:
    p = pathlib.Path(f"../frontend/public/samples/{name}.jpg")
    if not p.exists(): continue
    im = Image.open(p).convert("RGB")
    # warm tint
    r,g,b = im.split()
    r = ImageEnhance.Brightness(r).enhance(1.05)
    b = ImageEnhance.Brightness(b).enhance(0.92)
    im = Image.merge("RGB", (r,g,b))
    d = ImageDraw.Draw(im)
    d.rectangle([0, im.height-60, im.width, im.height], fill=(31,31,28))
    d.text((20, im.height-46), "INTERIA · MOCK PREVIEW", fill=(255,255,255))
    im.save(dst / f"{name}.png")
    print("wrote", dst / f"{name}.png")
PY
```

- [ ] **Step 2: Failing test**

```python
import pytest

from src.interia.schemas import Preview
from src.interia.tools.preview import generate_preview


def test_mock_returns_placeholder(monkeypatch) -> None:
    monkeypatch.setenv("INTERIA_MOCK", "1")
    state = {
        "version": 1,
        "source": {"imageUrl": "/samples/bedroom.jpg", "sampleId": "bedroom", "uploadedAt": "2026-05-09T10:00:00Z"},
        "shell": {"roomType": "bedroom", "cameraAngle": "corner-left"},
        "grid": {"rows": 4, "cols": 4},
        "objects": [],
        "relations": [],
        "editContract": {},
        "patches": [],
        "trace": [],
    }
    out = generate_preview.invoke({"state": state})
    p = Preview.model_validate(out)
    assert p.generationProvider == "mock"
    assert p.imageUrl.endswith("bedroom.png")
```

- [ ] **Step 3: Implement**

```python
"""generate_preview: produce a constrained image preview from the Room State."""
from __future__ import annotations

import os
from pathlib import Path
from datetime import datetime, timezone
from uuid import uuid4

from langchain_core.tools import tool

from ..schemas import Preview, RoomState


_MOCK_DIR = Path(__file__).resolve().parents[3] / "data" / "mock_previews"


def _build_prompt(rs: RoomState) -> str:
    locked = [
        f"- {o.label} ({o.type}, grid {o.gridPosition.root}): identity+position+appearance LOCKED"
        for o in rs.objects
        if rs.editContract.get(o.id, {}).get("identity") == "locked"
    ]
    style = rs.preferences.style if rs.preferences else "warm-modern"
    return (
        f"Re-render the room photo. Style: {style}. Camera angle: {rs.shell.cameraAngle}. "
        "Preserve the room shell (walls, ceiling, floor structure), camera angle, "
        "and every locked object exactly:\n"
        + "\n".join(locked)
        + "\nDo not change the window, do not move the bed, do not invent architectural elements."
    )


@tool
def generate_preview(state: dict) -> dict:
    """Generate a preview image; mock fallback when INTERIA_MOCK=1."""
    rs = RoomState.model_validate(state)
    prompt = _build_prompt(rs)
    pid = f"prev_{uuid4().hex[:8]}"
    now = datetime.now(timezone.utc).isoformat()

    if os.getenv("INTERIA_MOCK") == "1":
        sample = rs.source.sampleId or "bedroom"
        # Frontend serves /mock_previews/<sample>.png from a static route we'll add in Phase 4.
        return Preview(
            id=pid,
            imageUrl=f"/mock_previews/{sample}.png",
            promptSummary=prompt,
            generationProvider="mock",
            fromVersion=rs.version,
            createdAt=now,
        ).model_dump(mode="json")

    # Real path: Gemini 3 Image Preview.
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.messages import HumanMessage

    llm = ChatGoogleGenerativeAI(
        model="gemini-3-image-preview",
        api_key=os.environ["GEMINI_API_KEY"],
    )
    msg = HumanMessage(content=[
        {"type": "text", "text": prompt},
        {"type": "image_url", "image_url": rs.source.imageUrl},
    ])
    response = llm.invoke([msg])
    image_url = _extract_image_url(response)
    return Preview(
        id=pid,
        imageUrl=image_url,
        promptSummary=prompt,
        generationProvider="gemini-3-image-preview",
        fromVersion=rs.version,
        createdAt=now,
    ).model_dump(mode="json")


def _extract_image_url(response) -> str:
    # Gemini returns image data inline; persist to apps/agent/data/generated/<id>.png
    # and return a path the frontend can resolve.
    parts = response.content if isinstance(response.content, list) else [response.content]
    out_dir = Path(__file__).resolve().parents[3] / "data" / "generated"
    out_dir.mkdir(exist_ok=True)
    for part in parts:
        if isinstance(part, dict) and part.get("type") == "image_url":
            return part["image_url"]
        if isinstance(part, dict) and part.get("type") == "image" and part.get("data"):
            import base64
            fname = f"{uuid4().hex[:8]}.png"
            (out_dir / fname).write_bytes(base64.b64decode(part["data"]))
            return f"/generated/{fname}"
    raise RuntimeError("no image in Gemini response")
```

- [ ] **Step 4: Add static routes for `/mock_previews` and `/generated` in Next.js**

In `apps/frontend/next.config.ts`, add a rewrite so `/mock_previews/:slug*` proxies to a same-origin file or copies the previews into `apps/frontend/public/mock_previews/` at dev time.

Simplest: copy `apps/agent/data/mock_previews/*.png` to `apps/frontend/public/mock_previews/` (commit the copies — they're <100KB each).

```bash
mkdir -p apps/frontend/public/mock_previews
cp apps/agent/data/mock_previews/*.png apps/frontend/public/mock_previews/
```

- [ ] **Step 5: Run + register + commit**

```bash
cd apps/agent && uv run pytest tests/interia/test_preview.py -v
```

Add `generate_preview` to `all_tools()`. Commit.

---

### Task 3.6a: `trace.py` helper

**Files:**
- Create: `apps/agent/src/interia/trace.py`
- Create: `apps/agent/tests/interia/test_trace.py`

- [ ] **Step 1: Test**

```python
from src.interia.trace import append_trace


def test_append_trace_returns_new_state() -> None:
    s = {"trace": []}
    s2 = append_trace(s, type="tool_result", input_summary="analyze_room()", output_summary="ok")
    assert len(s2["trace"]) == 1
    assert s2["trace"][0]["type"] == "tool_result"
    assert s["trace"] == []   # original untouched
```

- [ ] **Step 2: Implement**

```python
"""Helper for appending AgentTraceEvent entries onto a Room State dict."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


def append_trace(
    state: dict[str, Any],
    *,
    type: str,
    input_summary: str,
    output_summary: str,
) -> dict[str, Any]:
    event = {
        "id": f"trace_{uuid4().hex[:8]}",
        "type": type,
        "inputSummary": input_summary,
        "outputSummary": output_summary,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    return {**state, "trace": [*state.get("trace", []), event]}
```

- [ ] **Step 3: Wire into existing tools** — go back to `vision.py`, `state.py`, `design.py`, `preview.py` and have each tool's return path call `append_trace` before returning. Update tests to assert one new trace event per call.

- [ ] **Step 4: Commit**

---

### Task 3.6: `validate_fidelity` (sub-agent)

**Files:**
- Create: `apps/agent/src/interia/tools/fidelity.py`
- Create: `apps/agent/tests/interia/test_fidelity.py`

- [ ] **Step 1: Failing test**

```python
import pytest

from src.interia.schemas import FidelityReport
from src.interia.tools.fidelity import validate_fidelity


def _state_with_locks() -> dict:
    return {
        "version": 2,
        "source": {"imageUrl": "/samples/bedroom.jpg", "sampleId": "bedroom", "uploadedAt": "2026-05-09T10:00:00Z"},
        "shell": {"roomType": "bedroom", "cameraAngle": "corner-left"},
        "grid": {"rows": 4, "cols": 4},
        "objects": [
            {"id": "obj_window_1", "type": "window", "label": "W", "description": "x",
             "gridPosition": "A2", "approximateSize": "medium",
             "confidence": 0.95, "detectedBy": "vision", "confirmedByUser": True},
        ],
        "relations": [],
        "editContract": {"obj_window_1": {"identity": "locked", "position": "locked", "appearance": "locked"}},
        "patches": [],
        "trace": [],
    }


def _preview() -> dict:
    return {
        "id": "prev_abc",
        "imageUrl": "/mock_previews/bedroom.png",
        "promptSummary": "x",
        "generationProvider": "mock",
        "fromVersion": 2,
        "createdAt": "2026-05-09T10:01:00Z",
    }


def test_mock_returns_high_score(monkeypatch) -> None:
    monkeypatch.setenv("INTERIA_MOCK", "1")
    out = validate_fidelity.invoke({"state": _state_with_locks(), "preview": _preview()})
    report = FidelityReport.model_validate(out)
    assert report.systemScore >= 80
    assert report.recommendedAction in {"accept", "regenerate_with_stronger_locks", "ask_user_to_unlock"}
```

- [ ] **Step 2: Implement**

```python
"""validate_fidelity: dispatched as a sub-agent to verify preserved elements."""
from __future__ import annotations

import os
from typing import Any

from langchain_core.tools import tool

from ..schemas import FidelityReport, RoomState


@tool
def validate_fidelity(state: dict, preview: dict) -> dict:
    """Compare the preview against the original photo + locked Room State."""
    rs = RoomState.model_validate(state)

    if os.getenv("INTERIA_MOCK") == "1":
        return _mock_report(rs, preview).model_dump(mode="json")

    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.messages import HumanMessage

    locked = [o for o in rs.objects if rs.editContract.get(o.id, {}).get("identity") == "locked"]
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
    msg = HumanMessage(content=[
        {"type": "text", "text": prompt},
        {"type": "image_url", "image_url": rs.source.imageUrl},
        {"type": "image_url", "image_url": preview["imageUrl"]},
    ])
    return structured.invoke([msg]).model_copy(update={"previewId": preview["id"]}).model_dump(mode="json")


def _mock_report(rs: RoomState, preview: dict) -> FidelityReport:
    locked = [o for o in rs.objects if rs.editContract.get(o.id, {}).get("identity") == "locked"]
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
```

- [ ] **Step 3: Register + run + commit**

---

### Task 3.7: `checkpoint` tool

**Files:**
- Create: `apps/agent/src/interia/tools/checkpoint.py`
- Create: `apps/agent/tests/interia/test_checkpoint.py`

The `checkpoint` tool marks the current Room State as accepted. It does not write to a separate database — CopilotKit Intelligence already persists the thread state. The tool's job is to (1) bump a `checkpointVersion` field on the state, and (2) append a trace event so the user can see "checkpoint saved" in the timeline.

- [ ] **Step 1: Failing test**

```python
from src.interia.tools.checkpoint import checkpoint


def test_checkpoint_appends_trace_and_marks_state() -> None:
    state = {
        "version": 3, "trace": [],
        "source": {"imageUrl": "/x.jpg", "uploadedAt": "2026-05-09T10:00:00Z"},
        "shell": {"roomType": "bedroom", "cameraAngle": "corner-left"},
        "grid": {"rows": 4, "cols": 4},
        "objects": [], "relations": [], "editContract": {}, "patches": [],
    }
    out = checkpoint.invoke({"state": state})
    assert out["trace"][-1]["type"] == "user_decision"
    assert out["trace"][-1]["outputSummary"].startswith("checkpoint saved")
```

- [ ] **Step 2: Implement**

```python
"""checkpoint: mark the current Room State as user-accepted."""
from __future__ import annotations

from langchain_core.tools import tool

from ..trace import append_trace


@tool
def checkpoint(state: dict) -> dict:
    """Append a user_decision trace event marking this state as accepted.

    Persistence is handled by CopilotKit Intelligence at the thread level —
    no separate database write needed.
    """
    return append_trace(
        state,
        type="user_decision",
        input_summary=f"version={state['version']}",
        output_summary=f"checkpoint saved at v{state['version']}",
    )
```

- [ ] **Step 3: Register in `all_tools()` and run**

```python
from .checkpoint import checkpoint
# ...
def all_tools() -> list:
    return [analyze_room, build_room_state, generate_grid, apply_patch_tool,
            get_catalog_options, generate_design_plan, generate_preview,
            validate_fidelity, checkpoint]
```

```bash
cd apps/agent && uv run pytest tests/interia/test_checkpoint.py -v
```

- [ ] **Step 4: Commit**

```bash
git add apps/agent/src/interia/tools/checkpoint.py apps/agent/src/interia/tools/__init__.py apps/agent/tests/interia/test_checkpoint.py
git commit -m "feat(agent): add checkpoint tool"
```

---

## Phase 4 — Frontend canvas

### Task 4.1: Project canvas layout

**Files:**
- Replace: `apps/frontend/src/app/project/[id]/page.tsx`
- Create: `apps/frontend/src/components/interia/CanvasLayout.tsx`

- [ ] **Step 1: Implement the three-column layout**

`CanvasLayout.tsx`:

```tsx
"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopUserMenu } from "./TopUserMenu";

export function CanvasLayout({
  source,
  cards,
}: {
  source: ReactNode;
  cards: ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="relative flex-1 grid"
        style={{ gridTemplateColumns: "minmax(420px, 520px) 1fr", gap: 32, padding: "56px 40px 40px 40px" }}>
        <TopUserMenu userName="Laura" agentStatus="analyzing" />
        <section style={{ position: "sticky", top: 56, alignSelf: "start" }}>{source}</section>
        <section className="flex flex-col gap-6">{cards}</section>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Wire `/project/[id]/page.tsx` to use CanvasLayout** with placeholder source (the sample image with a grid overlay) and placeholder cards (one card per upcoming component, rendering "Coming soon" for now).

- [ ] **Step 3: Commit**

---

### Task 4.2: RoomGridOverlay

**Files:**
- Create: `apps/frontend/src/components/interia/RoomGridOverlay.tsx`

A 4×4 grid drawn over the source image with:
- A square per cell (16 cells, A1..D4 labels in the corner)
- A pin per object positioned on its cell
- Hover state: object label in a tooltip
- Lock badges overlaid on each pin (a small lock icon if `editContract[id].identity === 'locked'`)

- [ ] **Step 1: Implement** (see signature below; full code follows the Sidebar pattern — Tailwind-inline styles, lucide `Lock` icon).

```tsx
import type { RoomState } from "@/lib/interia/types";
import { Lock } from "lucide-react";

export function RoomGridOverlay({ state }: { state: RoomState }) { /* ... */ }
```

- [ ] **Step 2: Storybook-style preview** — render in `/project/[id]` with a hard-coded sample state to eyeball the rendering.

- [ ] **Step 3: Commit**

---

### Task 4.3..4.10: Remaining canvas cards

Each task follows the same pattern: create `apps/frontend/src/components/interia/<Name>.tsx`, accept the relevant slice of `RoomState`, render Tailwind-styled markup using the design tokens, commit.

- [ ] **4.3 DetectedObjectsConfirmation** — props: `{ objects: RoomObject[], onConfirm: (objectId, confirmed) => void }`. Renders a list of low-confidence objects with confirm/correct buttons.
- [ ] **4.4 EditContractPanel** — props: `{ contract: Record<string, LockSet>, objects: RoomObject[], onChange: (objectId, locks) => void }`. Toggle UI for identity/position/appearance per object.
- [ ] **4.5 PreferencesCard** — props: `{ preferences?: DesignPreference, onSubmit: (prefs: DesignPreference) => void }`. Form with style/budget/goal/constraints.
- [ ] **4.6 DesignBoard** — container; renders palette + lighting + decor + layout sub-cards from `state.designPlan`.
- [ ] **4.7 ColorPaletteCard** — A2UI-friendly: accepts a `Palette` and renders the swatches with hex labels.
- [ ] **4.8 LightingPlanCard** — A2UI-friendly: accepts the lighting plan string + a small icon row per fixture.
- [ ] **4.9 PreviewPanel** — props: `{ preview?: Preview, onRequest: () => void }`. Shows the generated image or a "Generate preview" button.
- [ ] **4.10 FidelityReportCard** — props: `{ report?: FidelityReport, onDecision: (status) => void }`. Score bar, per-object check rows, four-button decision row.

For each: write the component, render it once in the canvas with sample data, eyeball, commit.

---

### Task 4.11: AgentTracePanel

**Files:**
- Create: `apps/frontend/src/components/interia/AgentTracePanel.tsx`

Renders `state.trace` as a vertical timeline grouped by `type`. Each event shows: type badge, inputSummary, outputSummary, timestamp. Uses the mono font for the type tag.

- [ ] Implement and commit.

---

### Task 4.12: useFrontendTool registrations

**Files:**
- Create: `apps/frontend/src/lib/interia/frontend-tools.ts`
- Modify: `apps/frontend/src/app/project/[id]/page.tsx`

- [ ] **Step 1: Register the frontend tools** matching the spec §6 table

```tsx
"use client";

import { useFrontendTool } from "@copilotkit/react-core";
import { useCoAgent } from "@copilotkit/react-core";
import type { RoomState, DesignPatch, LockSet, DesignPreference } from "@/lib/interia/types";

export function useInteriaFrontendTools() {
  const { state, setState } = useCoAgent<{ roomState: RoomState }>({
    name: "interia",
    initialState: { roomState: undefined as unknown as RoomState },
  });

  useFrontendTool({
    name: "applyDesignPatches",
    parameters: [{ name: "patches", type: "object[]", required: true }],
    handler: ({ patches }: { patches: DesignPatch[] }) => {
      // Reducer is server-side; we send patches back via state update.
      setState({ roomState: { ...state.roomState, patches: [...state.roomState.patches, ...patches] } });
    },
  });

  useFrontendTool({
    name: "setLockState",
    parameters: [
      { name: "objectId", type: "string", required: true },
      { name: "lockSet", type: "object", required: true },
    ],
    handler: ({ objectId, lockSet }: { objectId: string; lockSet: LockSet }) => {
      setState({
        roomState: {
          ...state.roomState,
          editContract: { ...state.roomState.editContract, [objectId]: lockSet },
        },
      });
    },
  });

  // ... confirmObject, setPreferences, requestPreview, submitFidelityDecision,
  //     markChangedObject, openConfirmationCard, openDesignBoard,
  //     openPreviewPanel, openFidelityCard, renderRoomGridOverlay,
  //     renderColorPalette, renderDecorSuggestion

  return { state, setState };
}
```

(Implement each handler explicitly — no shortcuts. Each handler updates the corresponding slice of state.)

- [ ] **Step 2: Wire into the canvas page**

In `apps/frontend/src/app/project/[id]/page.tsx`, call `useInteriaFrontendTools()` at the top and pass `state.roomState` to each card.

- [ ] **Step 3: Commit**

---

## Phase 5 — End-to-end wiring

### Task 5.1: Auto-start the agent loop on canvas mount

**Files:**
- Implemented in: `apps/frontend/src/lib/interia/use-interia-project.tsx` (used by `InteriaProjectShell` → `ProjectPageClient` → `apps/frontend/src/app/project/[id]/page.tsx`)

- [x] **Step 1: On mount, read the `interia:<id>` session key, send the initial message to the agent**

CopilotKit v2: after parsing the seed JSON successfully, set `interia-sent:${projectId}` so bootstrap runs once per tab; call `agent.addMessage` then `copilotkit.runAgent({ agent })`.

- [x] **Step 2: Manual e2e test (mock mode)**

```bash
INTERIA_MOCK=1 npm run dev
```

Click bedroom sample on the upload view → routes to `/project/<id>` → agent runs `analyze_room`, `build_room_state`, `generate_grid` → grid overlay paints with the canned objects → ConfirmationCard appears.

- [x] **Step 3: Commit**

---

### Task 5.2: Real Gemini path smoke test

- [ ] **Step 1: With a real `GEMINI_API_KEY`, run `npm run dev` (no `INTERIA_MOCK`)** — developer machine only
- [ ] **Step 2: Click bedroom sample, watch network for Gemini calls**
- [ ] **Step 3: Confirm `analyze_room` returns a real analysis**
- [ ] **Step 4: Click "Generate preview" → watch Gemini image call → preview renders → fidelity report renders**
- [ ] **Step 5: Note any latency issues; if `analyze_room` is slow, tune caching in `apps/agent/src/interia/tools/vision.py`**

If the API rate-limits or 5xxs, fall back to `INTERIA_MOCK=1`. Failure modes and checklist: [dev-docs/interia.md](../../../dev-docs/interia.md).

- [x] **Step 6: Commit any tweaks** — baseline doc in `dev-docs/interia.md`; commit again after any Gemini-specific tuning

---

## Phase 6 — MCP App (`interia-mcp`)

### Task 6.1: Reskin `apps/mcp/`

**Files:**
- Modify: `apps/mcp/package.json` (rename to `interia-mcp`)
- Replace: `apps/mcp/index.ts` (or `apps/mcp/src/index.ts`)
- Create: `apps/mcp/src/tools/getRoomState.ts`

- [ ] **Step 1: Rename package**

```bash
cd apps/mcp
sed -i.bak 's/"name": ".*"/"name": "interia-mcp"/' package.json && rm package.json.bak
```

- [ ] **Step 2: Implement `getRoomState`**

```ts
import { Tool } from "mcp-use";
import type { RoomState } from "../../frontend/src/lib/interia/types";

export const getRoomState: Tool<{ projectId: string }, { roomState: RoomState }> = {
  name: "getRoomState",
  description: "Read the latest Room State for a project (read-only).",
  parameters: {
    type: "object",
    properties: { projectId: { type: "string" } },
    required: ["projectId"],
  },
  async handler({ projectId }) {
    const res = await fetch(`${process.env.INTERIA_BFF_URL ?? "http://localhost:4010"}/api/state/${projectId}`);
    if (!res.ok) throw new Error(`state fetch failed: ${res.status}`);
    return { roomState: await res.json() };
  },
};
```

- [ ] **Step 3: Wire `getRoomState` into the MCP server entrypoint**

(Match the kit's existing pattern in `apps/mcp/src/index.ts` — replace the demo tool with `getRoomState`.)

- [ ] **Step 4: Add a BFF route that exposes the latest Room State for a thread**

In `apps/bff/src/server.ts`, add an endpoint `/api/state/:threadId` that pulls the thread state from CopilotKit Intelligence and returns the `roomState` field.

- [ ] **Step 5: Smoke test**

```bash
npm run dev:full
```

In the MCP Inspector (started by `dev:mcp`): call `getRoomState` with a real project id → see the JSON of the latest Room State.

- [ ] **Step 6: Commit**

```bash
git add apps/mcp apps/bff
git commit -m "feat(mcp): add interia-mcp with getRoomState tool"
```

---

## Phase 7 — Demo polish and docs

### Task 7.1: Demo prompts

**Files:**
- Modify: `dev-docs/demo-prompts.md`

- [ ] Replace the Notion-flavored demo prompts with Interia ones:
  - "Start a new project for the bedroom sample."
  - "I'd like a Japandi style, medium budget, cozy goal, pet-safe."
  - "Generate a preview."
  - "Mark the desk as fully locked and regenerate."

### Task 7.2: README

- [ ] Replace the kit README with an Interia-specific one explaining the four phases of the architecture and pointing at the spec.

### Task 7.3: Final commit + tag

```bash
git add README.md dev-docs/
git commit -m "docs: Interia README + demo prompts"
git tag interia-mvp-v1
```

---

## Acceptance for the hackathon demo

- [ ] Click bedroom sample → grid overlay paints with detected objects within 5s (mock) or 15s (real).
- [ ] DetectedObjectsConfirmation card surfaces window/bed/desk; user clicks confirm.
- [ ] PreferencesCard accepts Japandi/medium/cozy/pet-safe.
- [ ] DesignBoard renders palette + lighting cards.
- [ ] User clicks "Generate preview" → preview appears.
- [ ] FidelityReportCard renders with score and per-object checks.
- [ ] User clicks "Faithful" → checkpoint records.
- [ ] AgentTracePanel shows the full plan→tool→patch→validation timeline.
- [ ] In Claude Web with `interia-mcp` connector: `getRoomState` returns the saved state.

---

## Notes for the implementer

- **TDD discipline**: Every task in Phases 0 and 3 has a failing test first. Run it, see it fail, then implement. Frontend phases skip TDD (UI scaffolding) but must visually verify against the design handoff.
- **Frequent commits**: Each task = one commit. Don't batch.
- **Mock-first**: Build everything with `INTERIA_MOCK=1` first. Switch real APIs on per tool only after the canvas works end-to-end in mock mode.
- **Type drift check**: Run `npm run codegen` after every change to `apps/agent/src/interia/schemas.py`. Commit the regenerated types.
- **Frontend-design skill**: Invoke before Task 4.1 to spike the canvas layout, before Task 4.10 for the FidelityReportCard.
- **CopilotKit skills**: Invoke `copilotkit-develop` when wiring `useFrontendTool` and `useCoAgent` (Task 4.12, 5.1).
