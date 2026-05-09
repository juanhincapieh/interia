"use client";

import Image from "next/image";

import { CanvasLayout } from "@/components/interia/CanvasLayout";
import { RoomGridOverlay } from "@/components/interia/RoomGridOverlay";
import { SAMPLE_CANVAS_ROOM_STATE } from "@/lib/interia/sample-canvas-room-state";
import { SAMPLES } from "@/lib/interia/samples";

const PLACEHOLDER_PANELS = [
  "DetectedObjectsConfirmation",
  "EditContractPanel",
  "PreferencesCard",
  "DesignBoard",
  "ColorPaletteCard",
  "LightingPlanCard",
  "PreviewPanel",
  "FidelityReportCard",
  "AgentTracePanel",
] as const;

export function ProjectCanvas({ projectId }: { projectId: string }) {
  const hero = SAMPLES.find((s) => s.id === "bedroom") ?? SAMPLES[0];

  return (
    <CanvasLayout
      source={
        <div
          className="overflow-hidden"
          style={{
            borderRadius: "var(--r-frame)",
            border: "1px solid var(--sand-border)",
            backgroundColor: "var(--porcelain)",
            boxShadow: "0 18px 48px rgba(31,31,28,0.08)",
          }}
        >
          <div className="relative aspect-4/5 w-full">
            <Image
              src={hero.heroUrl}
              alt="Room source preview"
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
            <RoomGridOverlay state={SAMPLE_CANVAS_ROOM_STATE} />
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
          {PLACEHOLDER_PANELS.map((name) => (
            <div
              key={name}
              style={{
                backgroundColor: "var(--porcelain)",
                border: "1px solid var(--sand-border)",
                borderRadius: "var(--r-card-lg)",
                padding: "20px 22px",
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
                {name}
              </div>
              <div style={{ marginTop: 8, fontSize: 15, fontWeight: 600, color: "var(--charcoal)" }}>
                Coming soon
              </div>
              <p style={{ marginTop: 6, fontSize: 13, color: "var(--warm-gray)", lineHeight: 1.5 }}>
                Wired in upcoming tasks (4.3–4.11).
              </p>
            </div>
          ))}
        </>
      }
    />
  );
}
