"use client";

import { AlertCircle, Check, Pencil } from "lucide-react";

import type { RoomObject } from "@/lib/interia/types";

const THRESHOLD = 0.85;

export function DetectedObjectsConfirmation({
  objects,
  onConfirm,
}: {
  objects: RoomObject[];
  onConfirm: (objectId: string, confirmed: boolean) => void;
}) {
  const low = objects.filter((o) => o.confidence < THRESHOLD);
  if (low.length === 0) {
    return (
      <div
        style={{
          backgroundColor: "var(--porcelain)",
          border: "1px solid var(--sand-border)",
          borderRadius: "var(--r-card-lg)",
          padding: "18px 20px",
        }}
      >
        <p style={{ fontSize: 14, color: "var(--warm-gray)", margin: 0 }}>
          All detected objects are above {Math.round(THRESHOLD * 100)}% confidence.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "var(--porcelain)",
        border: "1px solid var(--sand-border)",
        borderRadius: "var(--r-card-lg)",
        padding: "18px 20px",
      }}
    >
      <div className="flex items-start gap-2">
        <AlertCircle size={18} color="var(--terracotta)" className="mt-0.5 shrink-0" />
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--charcoal)" }}>
            Confirm detections
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--warm-gray)", lineHeight: 1.45 }}>
            These reads are below {Math.round(THRESHOLD * 100)}% confidence — tap confirm or correct.
          </p>
        </div>
      </div>
      <ul className="mt-4 flex flex-col gap-3" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {low.map((o) => (
          <li
            key={o.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2.5"
            style={{ backgroundColor: "var(--soft-cream)", border: "1px solid var(--sand-border)" }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--charcoal)" }}>{o.label}</div>
              <div style={{ fontSize: 12, color: "var(--dust-gray)", fontFamily: "var(--font-mono)" }}>
                {o.type} · {(o.confidence * 100).toFixed(0)}% · {String(o.gridPosition)}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: "var(--mist-sage)",
                  color: "var(--deep-sage)",
                  border: "1px solid rgba(95,127,99,0.25)",
                }}
                onClick={() => onConfirm(o.id, true)}
              >
                <Check size={14} /> Confirm
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium"
                style={{
                  borderColor: "var(--sand-border-strong)",
                  color: "var(--warm-gray)",
                  backgroundColor: "var(--porcelain)",
                }}
                onClick={() => onConfirm(o.id, false)}
              >
                <Pencil size={14} /> Correct
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
