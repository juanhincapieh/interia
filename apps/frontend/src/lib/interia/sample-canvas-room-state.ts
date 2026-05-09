import type {
  AgentTraceEvent,
  CatalogItem,
  DesignPlan,
  FidelityReport,
  Preview,
  RoomState,
} from "@/lib/interia/types";

const SAMPLE_DECOR: CatalogItem[] = [
  {
    id: "lamp_paper_floor",
    name: "Paper floor lamp",
    category: "lamps",
    compatibleStyles: ["japandi", "minimal"],
    priceTier: "low",
    materials: ["paper", "rattan"],
    visualEffect: "Warm diffuse light",
    placementSuggestions: ["corner", "next-to-bed"],
    constraintsCompatibility: ["rental-friendly", "pet-safe"],
  },
  {
    id: "rug_jute_1",
    name: "Natural jute rug",
    category: "rugs",
    compatibleStyles: ["japandi", "bohemian"],
    priceTier: "medium",
    materials: ["jute"],
    visualEffect: "Texture underfoot",
    placementSuggestions: ["under-bed-front"],
    constraintsCompatibility: ["pet-safe"],
  },
];

export const SAMPLE_DESIGN_PLAN: DesignPlan = {
  palette: {
    name: "Japandi calm",
    swatches: ["#E7DED1", "#5F7F63", "#C97855", "#1F1F1C", "#FBF8F2"],
  },
  lightingPlan:
    "2700K floor lamp in the reading corner; keep window daylight as primary.",
  decorSuggestions: SAMPLE_DECOR,
  layoutSuggestions: [
    "Rug under the front two-thirds of the bed",
    "Tall plant softens the window corner",
  ],
  actionPlan: ["Add floor lamp", "Layer rug", "Introduce linen textiles"],
  rationale: "Warm neutrals and sage accents respect existing architecture.",
  proposedPatches: [],
};

export const SAMPLE_PREVIEW: Preview = {
  id: "prev_sample",
  imageUrl: "/mock_previews/bedroom.png",
  promptSummary: "Japandi refresh — preserve locked shell and window.",
  generationProvider: "mock",
  fromVersion: 2,
  createdAt: "2026-05-09T12:00:00Z",
};

export const SAMPLE_FIDELITY: FidelityReport = {
  previewId: "prev_sample",
  systemScore: 87,
  cameraAnglePreserved: true,
  perObject: [
    {
      objectId: "obj_window_1",
      label: "Tall single window",
      preserved: true,
      confidence: 0.91,
      note: "Mullions and frame consistent with source.",
    },
  ],
  styleApplied: {
    selected: "japandi",
    applied: "japandi",
    match: "strong",
  },
  unexpectedChanges: [],
  recommendedAction: "accept",
};

export const SAMPLE_TRACE: AgentTraceEvent[] = [
  {
    id: "t1",
    type: "plan",
    inputSummary: "user: bedroom sample",
    outputSummary: "Run analyze_room → build_room_state → generate_grid",
    createdAt: "2026-05-09T11:58:00Z",
  },
  {
    id: "t2",
    type: "tool_result",
    inputSummary: "analyze_room(sample=bedroom)",
    outputSummary: "5 objects, bedroom / corner-left",
    createdAt: "2026-05-09T11:58:02Z",
  },
  {
    id: "t3",
    type: "patch_applied",
    inputSummary: "generate_grid",
    outputSummary: "Grid cells assigned from bbox centers",
    createdAt: "2026-05-09T11:58:03Z",
  },
];

/** Rich demo RoomState for canvas cards + overlay (until live agent replaces it). */
export const SAMPLE_CANVAS_ROOM_STATE: RoomState = {
  version: 2,
  source: {
    imageUrl: "/samples/bedroom.jpg",
    sampleId: "bedroom",
    uploadedAt: "2026-05-09T10:00:00Z",
  },
  shell: { roomType: "bedroom", cameraAngle: "corner-left" },
  grid: { rows: 4, cols: 4 },
  objects: [
    {
      id: "obj_window_1",
      type: "window",
      label: "Tall single window",
      description: "Left wall window",
      gridPosition: "A2",
      approximateSize: "medium",
      confidence: 0.92,
      detectedBy: "vision",
      confirmedByUser: false,
    },
    {
      id: "obj_bed_1",
      type: "bed",
      label: "Queen bed",
      description: "Center bed with linen",
      gridPosition: "C3",
      approximateSize: "large",
      confidence: 0.95,
      detectedBy: "vision",
      confirmedByUser: false,
    },
    {
      id: "obj_desk_1",
      type: "desk",
      label: "Wooden desk",
      description: "By the right wall",
      gridPosition: "D2",
      approximateSize: "medium",
      confidence: 0.78,
      detectedBy: "vision",
      confirmedByUser: false,
    },
  ],
  relations: [],
  editContract: {
    obj_window_1: { identity: "locked", position: "locked", appearance: "locked" },
    obj_bed_1: { identity: "locked", position: "locked", appearance: "soft" },
    obj_desk_1: { identity: "soft", position: "soft", appearance: "editable" },
  },
  preferences: {
    style: "japandi",
    budget: "medium",
    goal: "cozy",
    constraints: ["pet-safe"],
  },
  designPlan: SAMPLE_DESIGN_PLAN,
  patches: [],
  preview: SAMPLE_PREVIEW,
  fidelity: SAMPLE_FIDELITY,
  trace: SAMPLE_TRACE,
};
