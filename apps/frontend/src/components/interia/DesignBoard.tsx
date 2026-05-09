"use client";

import type { CatalogItem, DesignPlan } from "@/lib/interia/types";

import { ColorPaletteCard } from "@/components/interia/ColorPaletteCard";
import { LightingPlanCard } from "@/components/interia/LightingPlanCard";

function DecorRow({ item }: { item: CatalogItem }) {
  return (
    <li
      className="rounded-lg px-3 py-2"
      style={{ backgroundColor: "var(--porcelain)", border: "1px solid var(--sand-border)" }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--charcoal)" }}>{item.name}</div>
      <div style={{ fontSize: 12, color: "var(--warm-gray)" }}>{item.visualEffect}</div>
    </li>
  );
}

export function DesignBoard({ plan }: { plan: DesignPlan | null | undefined }) {
  if (!plan) {
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
          No design plan yet. Ask the agent to run <span style={{ fontFamily: "var(--font-mono)" }}>generate_design_plan</span>.
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
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--charcoal)" }}>Design board</div>
      <p style={{ margin: "6px 0 14px", fontSize: 13, color: "var(--warm-gray)", lineHeight: 1.45 }}>{plan.rationale}</p>
      <div className="flex flex-col gap-4">
        <ColorPaletteCard palette={plan.palette} />
        <LightingPlanCard plan={plan.lightingPlan} />
        <div>
          <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--dust-gray)", marginBottom: 8 }}>
            DECOR (CATALOG)
          </div>
          <ul className="flex flex-col gap-2" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {plan.decorSuggestions.map((d) => (
              <DecorRow key={d.id} item={d} />
            ))}
          </ul>
        </div>
        <div>
          <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--dust-gray)", marginBottom: 8 }}>
            LAYOUT
          </div>
          <ul className="list-disc space-y-1 pl-5" style={{ color: "var(--charcoal)", fontSize: 14 }}>
            {plan.layoutSuggestions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <div>
          <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--dust-gray)", marginBottom: 8 }}>
            ACTION PLAN
          </div>
          <ol className="list-decimal space-y-1 pl-5" style={{ color: "var(--charcoal)", fontSize: 14 }}>
            {plan.actionPlan.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
