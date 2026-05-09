"""Pydantic schemas for Room State and related types.

Single source of truth. The TypeScript types in
`apps/frontend/src/lib/interia/types.ts` are generated from these models —
do not hand-edit the TS file.
"""
from __future__ import annotations

from typing import Annotated, Dict, List, Literal, Optional, Union

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


EditContract = Dict[str, LockSet]


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
    editContract: Dict[str, LockSet] = {}   # str → LockSet
    preferences: Optional[DesignPreference] = None
    designPlan: Optional[DesignPlan] = None
    patches: List[DesignPatch] = []
    preview: Optional[Preview] = None
    fidelity: Optional[FidelityReport] = None
    trace: List[AgentTraceEvent] = []


DesignPlan.model_rebuild()
