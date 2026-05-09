"use client";

import type { CSSProperties } from "react";
import Image from "next/image";

import { CopilotSidebar, useDefaultRenderTool } from "@copilotkit/react-core/v2";

import { AgentTracePanel } from "@/components/interia/AgentTracePanel";
import { CanvasLayout } from "@/components/interia/CanvasLayout";
import { DesignBoard } from "@/components/interia/DesignBoard";
import { DetectedObjectsConfirmation } from "@/components/interia/DetectedObjectsConfirmation";
import { EditContractPanel } from "@/components/interia/EditContractPanel";
import { FidelityReportCard } from "@/components/interia/FidelityReportCard";
import { PreviewPanel } from "@/components/interia/PreviewPanel";
import { PreferencesCard } from "@/components/interia/PreferencesCard";
import { RoomGridOverlay } from "@/components/interia/RoomGridOverlay";
import { ToolFallbackCard } from "@/components/copilot/ToolFallbackCard";
import { SAMPLES } from "@/lib/interia/samples";
import type { DesignPreference } from "@/lib/interia/types";
import { useInteriaProject } from "@/lib/interia/use-interia-project";

function formatConstraints(c: DesignPreference["constraints"] | undefined): string {
  if (c === undefined) return "";
  if (Array.isArray(c)) return c.join(",");
  return String(c);
}

function ring(active: boolean): CSSProperties {
  return active ? { boxShadow: "0 0 0 2px var(--sage)", borderRadius: "var(--r-card-lg)" } : {};
}

export function InteriaProjectShell({ projectId }: { projectId: string }) {
  const { roomState, updateRoomState, highlights, injectPrompt } = useInteriaProject(projectId);

  const sampleId = roomState.source.sampleId ?? "bedroom";
  const hero = SAMPLES.find((s) => s.id === sampleId) ?? SAMPLES[0];

  useDefaultRenderTool({
    render: ({ name, status, result, parameters }) => (
      <ToolFallbackCard name={name} status={status} result={result} parameters={parameters} />
    ),
  });

  return (
    <div className="flex h-screen min-h-0 w-full overflow-hidden">
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <CanvasLayout
          source={
            <div
              className="overflow-hidden"
              style={{
                borderRadius: "var(--r-frame)",
                border: "1px solid var(--sand-border)",
                backgroundColor: "var(--porcelain)",
                boxShadow: "0 18px 48px rgba(31,31,28,0.08)",
                ...ring(highlights.preview),
              }}
            >
              <div className="relative aspect-4/5 w-full">
                <Image
                  src={hero.heroUrl}
                  alt="Room source"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1200px) 45vw, 520px"
                  priority
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(31,31,28,0.02) 0%, rgba(31,31,28,0.06) 100%)",
                  }}
                />
                <RoomGridOverlay state={roomState} />
              </div>
              <div
                className="border-t px-4 py-3"
                style={{
                  borderColor: "var(--sand-border)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--dust-gray)",
                }}
              >
                project / {projectId}
              </div>
            </div>
          }
          cards={
            <>
              <div style={ring(highlights.confirmation)}>
                <DetectedObjectsConfirmation
                  objects={roomState.objects ?? []}
                  onConfirm={(objectId, confirmed) => {
                    updateRoomState((cur) => ({
                      ...cur,
                      objects: (cur.objects ?? []).map((o) =>
                        o.id === objectId ? { ...o, confirmedByUser: confirmed } : o,
                      ),
                    }));
                  }}
                />
              </div>
              <EditContractPanel
                contract={roomState.editContract ?? {}}
                objects={roomState.objects ?? []}
                onChange={(objectId, locks) => {
                  updateRoomState((cur) => ({
                    ...cur,
                    editContract: { ...cur.editContract, [objectId]: locks },
                  }));
                }}
              />
              <PreferencesCard
                preferences={roomState.preferences}
                onSubmit={(prefs) => {
                  updateRoomState((cur) => ({ ...cur, preferences: prefs }));
                  injectPrompt(
                    `User saved preferences: style=${prefs.style}, budget=${prefs.budget}, goal=${prefs.goal}, constraints=${formatConstraints(prefs.constraints)}.`,
                  );
                }}
              />
              <div style={ring(highlights.design)}>
                <DesignBoard plan={roomState.designPlan} />
              </div>
              <div style={ring(highlights.preview)}>
                <PreviewPanel
                  preview={roomState.preview}
                  onRequest={() => {
                    injectPrompt(
                      "The user clicked Generate preview. Call generate_preview with the current RoomState, then validate_fidelity.",
                    );
                  }}
                />
              </div>
              <div style={ring(highlights.fidelity)}>
                <FidelityReportCard
                  report={roomState.fidelity}
                  onDecision={(status) => {
                    updateRoomState((cur) => ({
                      ...cur,
                      preview: cur.preview ? { ...cur.preview, userFidelityStatus: status } : cur.preview,
                    }));
                    if (status === "faithful" || status === "mostly") {
                      injectPrompt(
                        "The user accepted the fidelity result. Call checkpoint with the current RoomState.",
                      );
                    } else if (status === "regenerate") {
                      injectPrompt(
                        "The user wants to regenerate. Tighten locks as needed, then call generate_preview again when ready.",
                      );
                    }
                  }}
                />
              </div>
              <AgentTracePanel trace={roomState.trace} />
            </>
          }
        />
      </div>
      <CopilotSidebar defaultOpen width={400} input={{ disclaimer: () => null, className: "pb-6" }} />
    </div>
  );
}
