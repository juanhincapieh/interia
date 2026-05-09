"use client";

import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { useAgent, useCopilotKit, useFrontendTool } from "@copilotkit/react-core/v2";

import { ColorPaletteCard } from "@/components/interia/ColorPaletteCard";
import { LiveRoomGridChatPreview } from "@/components/interia/LiveRoomGridChatPreview";
import type { AgentTraceEvent, DesignPatch, DesignPreference, RoomState } from "@/lib/interia/types";
import { SAMPLE_CANVAS_ROOM_STATE } from "@/lib/interia/sample-canvas-room-state";

type AgentSlice = { roomState?: RoomState };

function pickRoomState(raw: unknown): RoomState {
  if (!raw || typeof raw !== "object") return SAMPLE_CANVAS_ROOM_STATE;
  const rs = (raw as AgentSlice).roomState;
  return rs ?? SAMPLE_CANVAS_ROOM_STATE;
}

function traceEvent(
  type: AgentTraceEvent["type"],
  inputSummary: string,
  outputSummary: string,
): AgentTraceEvent {
  return {
    id: `fe_${crypto.randomUUID().slice(0, 8)}`,
    type,
    inputSummary,
    outputSummary,
    createdAt: new Date().toISOString(),
  };
}

const lockSchema = z.object({
  identity: z.enum(["locked", "soft", "editable"]).optional(),
  position: z.enum(["locked", "soft", "editable"]).optional(),
  appearance: z.enum(["locked", "soft", "editable"]).optional(),
});

export function useInteriaProject(projectId: string) {
  const { agent } = useAgent();
  const { copilotkit } = useCopilotKit();
  const [highlights, setHighlights] = useState({
    confirmation: false,
    design: false,
    preview: false,
    fidelity: false,
  });
  const roomState = pickRoomState(agent?.state);

  const updateRoomState = useCallback(
    (fn: (prev: RoomState) => RoomState) => {
      if (!agent) return;
      const shell = ((agent.state as Record<string, unknown> | undefined) ?? {}) as Record<string, unknown>;
      const next = fn(pickRoomState(agent.state));
      agent.setState({ ...shell, roomState: next });
    },
    [agent],
  );

  const injectPrompt = useCallback(
    (prompt: string) => {
      if (!agent) return;
      const id = crypto.randomUUID();
      agent.addMessage({ id, role: "user", content: prompt });
      void copilotkit.runAgent({ agent }).catch((e: unknown) => console.error("runAgent", e));
    },
    [agent, copilotkit],
  );

  useEffect(() => {
    if (!agent) return;
    const sentKey = `interia-sent:${projectId}`;
    if (sessionStorage.getItem(sentKey)) return;
    const raw = sessionStorage.getItem(`interia:${projectId}`);
    if (!raw) return;
    let seed: { sampleId?: string; imageUrl?: string; uploadedUrl?: string };
    try {
      seed = JSON.parse(raw) as { sampleId?: string; imageUrl?: string; uploadedUrl?: string };
    } catch {
      return;
    }
    sessionStorage.setItem(sentKey, "1");
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    let msg: string;
    if (seed.sampleId) {
      const imageUrl = `${origin}/samples/${seed.sampleId}.jpg`;
      msg =
        `Start a new room remix project.\n` +
        `Source photo URL (use exactly as remix_room_from_photo.image_url): ${imageUrl}\n` +
        `Call remix_room_from_photo with image_url="${imageUrl}" and sample_id="${seed.sampleId}". ` +
        `Then call setRoomState with the returned roomState. Summarize the design suggestion and fidelity for the user.`;
    } else if (seed.imageUrl) {
      const imageUrl = `${origin}${seed.imageUrl}`;
      msg =
        `Start a new room remix project.\n` +
        `Source photo URL (use exactly as remix_room_from_photo.image_url): ${imageUrl}\n` +
        `Call remix_room_from_photo with image_url="${imageUrl}" and sample_id null. ` +
        `Then call setRoomState with the returned roomState. Summarize the design suggestion and fidelity for the user.`;
    } else if (seed.uploadedUrl) {
      msg =
        "Start a new room remix project. The session only has a browser blob URL for the upload, which the agent cannot load. " +
        "Ask the user to return to the home page and upload the photo again (it will be stored on the server), or pick a sample room.";
    } else {
      return;
    }
    agent.addMessage({ id: crypto.randomUUID(), role: "user", content: msg });
    void copilotkit.runAgent({ agent }).catch((e: unknown) => console.error("bootstrap runAgent", e));
  }, [agent, copilotkit, projectId]);

  useFrontendTool({
    name: "setRoomState",
    description: "Replace or merge the shared Interia RoomState (rare).",
    parameters: z.object({ state: z.record(z.string(), z.unknown()) }),
    handler: async ({ state }) => {
      updateRoomState((cur) => ({ ...cur, ...(state as unknown as Partial<RoomState>) } as RoomState));
      return "room state updated";
    },
  });

  useFrontendTool({
    name: "applyDesignPatches",
    description: "Append design patches to the audit log (server reducer applies on next agent turn).",
    parameters: z.object({ patches: z.array(z.record(z.string(), z.unknown())) }),
    handler: async ({ patches }) => {
      updateRoomState((cur) => ({
        ...cur,
        patches: [...(cur.patches ?? []), ...(patches as unknown as DesignPatch[])],
        trace: [...(cur.trace ?? []), traceEvent("patch_applied", "applyDesignPatches", `${patches.length} patch(es) queued`)],
      }));
      return "patches recorded";
    },
  });

  useFrontendTool({
    name: "setLockState",
    description: "Update edit contract locks for one object.",
    parameters: z.object({ objectId: z.string(), lockSet: lockSchema }),
    handler: async ({ objectId, lockSet }) => {
      updateRoomState((cur) => ({
        ...cur,
        editContract: { ...cur.editContract, [objectId]: { ...cur.editContract?.[objectId], ...lockSet } },
        trace: [...(cur.trace ?? []), traceEvent("tool_result", `setLockState(${objectId})`, "locks updated")],
      }));
      return "locks updated";
    },
  });

  useFrontendTool({
    name: "confirmObject",
    description: "Mark a detected object as confirmed or needing correction.",
    parameters: z.object({ objectId: z.string(), confirmed: z.boolean() }),
    handler: async ({ objectId, confirmed }) => {
      updateRoomState((cur) => ({
        ...cur,
        objects: (cur.objects ?? []).map((o) =>
          o.id === objectId ? { ...o, confirmedByUser: confirmed } : o,
        ),
        trace: [...(cur.trace ?? []), traceEvent("user_decision", `confirmObject(${objectId})`, confirmed ? "confirmed" : "correct")],
      }));
      return "object updated";
    },
  });

  useFrontendTool({
    name: "setPreferences",
    description: "Save user design preferences on RoomState.",
    parameters: z.object({
      style: z.enum(["minimal", "japandi", "industrial", "bohemian", "warm-modern"]),
      budget: z.enum(["low", "medium", "high"]),
      goal: z.enum(["cozy", "productive", "elegant", "spacious"]),
      constraints: z
        .array(z.enum(["keep-furniture", "rental-friendly", "no-drilling", "pet-safe"]))
        .optional(),
      freeformNotes: z.string().nullable().optional(),
    }),
    handler: async (prefs) => {
      const p = prefs as DesignPreference;
      updateRoomState((cur) => ({
        ...cur,
        preferences: p,
        trace: [...(cur.trace ?? []), traceEvent("tool_result", "setPreferences", `${p.style} / ${p.budget}`)],
      }));
      return "preferences saved";
    },
  });

  useFrontendTool({
    name: "requestPreview",
    description: "User explicitly requested an image preview.",
    parameters: z.object({}),
    handler: async () => {
      injectPrompt("The user requests a preview image. Call generate_preview, then validate_fidelity.");
      updateRoomState((cur) => ({
        ...cur,
        trace: [...(cur.trace ?? []), traceEvent("plan", "requestPreview()", "user asked for preview")],
      }));
      return "preview requested";
    },
  });

  useFrontendTool({
    name: "submitFidelityDecision",
    description: "Record the user's fidelity verdict on the latest preview.",
    parameters: z.object({
      status: z.enum(["faithful", "mostly", "regenerate", "manual-mark"]),
    }),
    handler: async ({ status }) => {
      updateRoomState((cur) => ({
        ...cur,
        preview: cur.preview ? { ...cur.preview, userFidelityStatus: status } : cur.preview,
        trace: [...(cur.trace ?? []), traceEvent("user_decision", "submitFidelityDecision", status)],
      }));
      return `fidelity: ${status}`;
    },
  });

  useFrontendTool({
    name: "markChangedObject",
    description: "Flag manual review for an object after a fidelity pass.",
    parameters: z.object({ objectId: z.string() }),
    handler: async ({ objectId }) => {
      updateRoomState((cur) => ({
        ...cur,
        trace: [
          ...(cur.trace ?? []),
          traceEvent("user_decision", `markChangedObject(${objectId})`, "manual mark requested"),
        ],
      }));
      return "marked";
    },
  });

  useFrontendTool({
    name: "openConfirmationCard",
    description: "Focus the object confirmation panel in the canvas.",
    parameters: z.object({}),
    handler: async () => {
      setHighlights((h) => ({ ...h, confirmation: true }));
      return "opened confirmation";
    },
  });

  useFrontendTool({
    name: "openDesignBoard",
    description: "Focus the design board panel.",
    parameters: z.object({}),
    handler: async () => {
      setHighlights((h) => ({ ...h, design: true }));
      return "opened design board";
    },
  });

  useFrontendTool({
    name: "openPreviewPanel",
    description: "Focus the preview panel.",
    parameters: z.object({}),
    handler: async () => {
      setHighlights((h) => ({ ...h, preview: true }));
      return "opened preview";
    },
  });

  useFrontendTool({
    name: "openFidelityCard",
    description: "Focus the fidelity report panel.",
    parameters: z.object({}),
    handler: async () => {
      setHighlights((h) => ({ ...h, fidelity: true }));
      return "opened fidelity";
    },
  });

  useFrontendTool({
    name: "renderRoomGridOverlay",
    description: "Render a compact read-only grid snapshot in chat.",
    parameters: z.object({}),
    render: () => <LiveRoomGridChatPreview />,
  });

  useFrontendTool({
    name: "renderColorPalette",
    description: "Render palette swatches inline in chat.",
    parameters: z.object({
      name: z.string(),
      swatches: z.array(z.string()),
    }),
    render: ({ args }) => (
      <ColorPaletteCard
        palette={{ name: args.name ?? "Palette", swatches: args.swatches ?? [] }}
      />
    ),
  });

  useFrontendTool({
    name: "renderDecorSuggestion",
    description: "Render one catalog decor suggestion inline.",
    parameters: z.object({
      name: z.string(),
      category: z.string(),
      visualEffect: z.string(),
    }),
    render: ({ args }) => (
      <div
        className="my-2 rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: "var(--sand-border)", backgroundColor: "var(--porcelain)" }}
      >
        <div style={{ fontWeight: 600 }}>{args.name}</div>
        <div style={{ color: "var(--warm-gray)" }}>
          {args.category} — {args.visualEffect}
        </div>
      </div>
    ),
  });

  return {
    roomState,
    updateRoomState,
    highlights,
    injectPrompt,
  };
}
