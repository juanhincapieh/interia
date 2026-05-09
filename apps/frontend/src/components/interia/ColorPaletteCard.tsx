"use client";

import type { Palette } from "@/lib/interia/types";

export function ColorPaletteCard({ palette }: { palette: Palette }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: "var(--soft-cream)", border: "1px solid var(--sand-border)" }}
    >
      <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--dust-gray)" }}>PALETTE</div>
      <div style={{ marginTop: 6, fontSize: 15, fontWeight: 600, color: "var(--charcoal)" }}>{palette.name}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {palette.swatches.map((hex) => (
          <div key={hex} className="flex flex-col items-center gap-1">
            <span
              className="block h-10 w-10 rounded-lg border"
              style={{
                backgroundColor: hex,
                borderColor: "var(--sand-border-strong)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.35)",
              }}
            />
            <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--warm-gray)" }}>{hex}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
