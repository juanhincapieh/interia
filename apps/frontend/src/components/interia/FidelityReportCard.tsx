"use client";

import type { ReactNode } from "react";
import { Check, RefreshCw, ShieldAlert, Sparkles } from "lucide-react";

import type { FidelityReport, Preview } from "@/lib/interia/types";

type Decision = NonNullable<Preview["userFidelityStatus"]>;

export function FidelityReportCard({
  report,
  onDecision,
}: {
  report?: FidelityReport | null;
  onDecision: (status: Decision) => void;
}) {
  if (!report) {
    return (
      <div
        style={{
          backgroundColor: "var(--porcelain)",
          border: "1px dashed var(--sand-border-strong)",
          borderRadius: "var(--r-card-lg)",
          padding: "20px",
        }}
      >
        <p style={{ margin: 0, fontSize: 14, color: "var(--warm-gray)" }}>
          Fidelity results appear after a preview is generated and validated.
        </p>
      </div>
    );
  }

  const pct = Math.min(100, Math.max(0, report.systemScore));

  return (
    <div
      style={{
        backgroundColor: "var(--porcelain)",
        border: "1px solid var(--sand-border)",
        borderRadius: "var(--r-card-lg)",
        padding: "18px 20px",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--charcoal)" }}>Fidelity</div>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: "var(--mist-sage)",
            color: "var(--deep-sage)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {report.recommendedAction.replace(/_/g, " ")}
        </span>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs" style={{ color: "var(--warm-gray)" }}>
          <span>System score</span>
          <span style={{ fontFamily: "var(--font-mono)" }}>{pct}</span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--sand-border)" }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "var(--sage)" }} />
        </div>
      </div>
      <div className="mt-2 text-xs" style={{ color: "var(--dust-gray)" }}>
        Camera angle preserved: {report.cameraAnglePreserved ? "yes" : "review"}
      </div>
      <ul className="mt-4 flex flex-col gap-2" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {report.perObject.map((row) => (
          <li
            key={row.objectId}
            className="flex items-start justify-between gap-2 rounded-lg px-3 py-2"
            style={{ backgroundColor: "var(--soft-cream)", border: "1px solid var(--sand-border)" }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--charcoal)" }}>{row.label}</div>
              {row.note ? (
                <div style={{ fontSize: 12, color: "var(--warm-gray)", marginTop: 2 }}>{row.note}</div>
              ) : null}
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: row.preserved ? "var(--sage)" : "var(--terracotta)" }}>
              {row.preserved ? "ok" : "check"}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <DecisionButton icon={<Check size={14} />} label="Faithful" onClick={() => onDecision("faithful")} />
        <DecisionButton icon={<Sparkles size={14} />} label="Mostly" onClick={() => onDecision("mostly")} />
        <DecisionButton icon={<RefreshCw size={14} />} label="Regenerate" onClick={() => onDecision("regenerate")} />
        <DecisionButton icon={<ShieldAlert size={14} />} label="Manual" onClick={() => onDecision("manual-mark")} />
      </div>
    </div>
  );
}

function DecisionButton({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-semibold"
      style={{
        borderColor: "var(--sand-border-strong)",
        backgroundColor: "var(--porcelain)",
        color: "var(--charcoal)",
      }}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}
