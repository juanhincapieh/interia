"use client";

import type { AgentTraceEvent } from "@/lib/interia/types";

const TYPE_ORDER: AgentTraceEvent["type"][] = [
  "plan",
  "tool_call",
  "tool_result",
  "patch_applied",
  "validation",
  "user_decision",
];

function badgeColor(t: AgentTraceEvent["type"]): string {
  switch (t) {
    case "plan":
      return "var(--muted-gold)";
    case "tool_call":
      return "var(--clay)";
    case "tool_result":
      return "var(--mist-sage)";
    case "patch_applied":
      return "var(--sage)";
    case "validation":
      return "var(--terracotta)";
    case "user_decision":
      return "var(--deep-sage)";
    default:
      return "var(--sand-border-strong)";
  }
}

export function AgentTracePanel({ trace }: { trace: AgentTraceEvent[] | undefined }) {
  const events = trace ?? [];
  const sorted = [...events].sort((a, b) => {
    const ta = new Date(a.createdAt).getTime();
    const tb = new Date(b.createdAt).getTime();
    return ta - tb;
  });
  const grouped = TYPE_ORDER.map((type) => ({
    type,
    items: sorted.filter((e) => e.type === type),
  })).filter((g) => g.items.length > 0);

  if (sorted.length === 0) {
    return (
      <div
        style={{
          backgroundColor: "var(--porcelain)",
          border: "1px dashed var(--sand-border-strong)",
          borderRadius: "var(--r-card-lg)",
          padding: "20px",
        }}
      >
        <p style={{ margin: 0, fontSize: 14, color: "var(--warm-gray)" }}>No trace events yet.</p>
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
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--charcoal)" }}>Agent trace</div>
      <div className="mt-4 flex flex-col gap-6">
        {grouped.map((g) => (
          <section key={g.type}>
            <div
              className="mb-2 inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{
                fontFamily: "var(--font-mono)",
                backgroundColor: badgeColor(g.type),
                color: g.type === "tool_result" ? "var(--deep-sage)" : "var(--porcelain)",
              }}
            >
              {g.type.replace(/_/g, " ")}
            </div>
            <ul className="flex flex-col gap-3 border-l pl-4" style={{ borderColor: "var(--sand-border)" }}>
              {g.items.map((ev) => (
                <li key={ev.id} className="relative">
                  <span
                    className="absolute -left-[21px] top-1.5 block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: "var(--sage)", boxShadow: "0 0 0 3px var(--porcelain)" }}
                  />
                  <div style={{ fontSize: 12, color: "var(--dust-gray)", fontFamily: "var(--font-mono)" }}>
                    {ev.createdAt}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--charcoal)", marginTop: 2 }}>{ev.inputSummary}</div>
                  <div style={{ fontSize: 13, color: "var(--warm-gray)", marginTop: 2 }}>{ev.outputSummary}</div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
