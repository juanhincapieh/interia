import type { RoomState } from "@/lib/interia/types";

/** Hard-coded RoomState for canvas / overlay previews until the agent wires live state. */
export const SAMPLE_CANVAS_ROOM_STATE: RoomState = {
  version: 1,
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
  patches: [],
  trace: [],
};
