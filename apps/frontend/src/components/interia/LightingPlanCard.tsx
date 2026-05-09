"use client";

import { Lamp, Lightbulb, Sun } from "lucide-react";

export function LightingPlanCard({ plan }: { plan: string }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: "var(--soft-cream)", border: "1px solid var(--sand-border)" }}
    >
      <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--dust-gray)" }}>LIGHTING</div>
      <div className="mt-2 flex gap-2" style={{ color: "var(--sage)" }}>
        <Sun size={18} strokeWidth={1.5} />
        <Lamp size={18} strokeWidth={1.5} />
        <Lightbulb size={18} strokeWidth={1.5} />
      </div>
      <p style={{ marginTop: 10, fontSize: 14, color: "var(--charcoal)", lineHeight: 1.5 }}>{plan}</p>
    </div>
  );
}
