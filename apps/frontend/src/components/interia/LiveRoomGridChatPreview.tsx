"use client";

import { useAgent } from "@copilotkit/react-core/v2";

import { RoomGridOverlay } from "@/components/interia/RoomGridOverlay";
import { SAMPLE_CANVAS_ROOM_STATE } from "@/lib/interia/sample-canvas-room-state";
import type { RoomState } from "@/lib/interia/types";

function pick(rs: unknown): RoomState {
  if (!rs || typeof rs !== "object") return SAMPLE_CANVAS_ROOM_STATE;
  const v = (rs as { roomState?: RoomState }).roomState;
  return v ?? SAMPLE_CANVAS_ROOM_STATE;
}

/** Subscribes to agent state so chat-embedded grid stays fresh (CopilotKit v2 pattern). */
export function LiveRoomGridChatPreview() {
  const { agent } = useAgent();
  return (
    <div
      className="my-2 max-w-sm overflow-hidden rounded-xl border"
      style={{ borderColor: "var(--sand-border)", backgroundColor: "var(--warm-canvas)" }}
    >
      <div className="relative aspect-square w-full">
        <RoomGridOverlay state={pick(agent?.state)} />
      </div>
    </div>
  );
}
