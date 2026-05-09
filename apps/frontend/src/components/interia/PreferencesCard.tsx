"use client";

import { useEffect, useState } from "react";

import type { DesignPreference } from "@/lib/interia/types";

const STYLES = ["minimal", "japandi", "industrial", "bohemian", "warm-modern"] as const;
const BUDGETS = ["low", "medium", "high"] as const;
const GOALS = ["cozy", "productive", "elegant", "spacious"] as const;
const CONSTRAINTS = ["keep-furniture", "rental-friendly", "no-drilling", "pet-safe"] as const;
type Constraint = (typeof CONSTRAINTS)[number];

export function PreferencesCard({
  preferences,
  onSubmit,
}: {
  preferences?: DesignPreference | null;
  onSubmit: (prefs: DesignPreference) => void;
}) {
  const [style, setStyle] = useState<DesignPreference["style"]>(preferences?.style ?? "japandi");
  const [budget, setBudget] = useState<DesignPreference["budget"]>(preferences?.budget ?? "medium");
  const [goal, setGoal] = useState<DesignPreference["goal"]>(preferences?.goal ?? "cozy");
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [notes, setNotes] = useState(preferences?.freeformNotes ?? "");

  useEffect(() => {
    const raw = preferences?.constraints;
    setConstraints(Array.isArray(raw) ? (raw as Constraint[]) : []);
  }, [preferences]);

  function toggle(c: Constraint) {
    setConstraints((prev) => {
      const list = prev ?? [];
      return list.includes(c) ? list.filter((x: Constraint) => x !== c) : [...list, c];
    });
  }

  return (
    <form
      style={{
        backgroundColor: "var(--porcelain)",
        border: "1px solid var(--sand-border)",
        borderRadius: "var(--r-card-lg)",
        padding: "18px 20px",
      }}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          style,
          budget,
          goal,
          constraints: constraints as DesignPreference["constraints"],
          freeformNotes: notes || null,
        });
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--charcoal)" }}>Preferences</div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span style={{ fontSize: 12, color: "var(--warm-gray)" }}>Style</span>
          <select
            className="rounded-lg border px-2 py-2 text-sm"
            style={{ borderColor: "var(--sand-border-strong)", backgroundColor: "var(--porcelain)" }}
            value={style}
            onChange={(e) => setStyle(e.target.value as DesignPreference["style"])}
          >
            {STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span style={{ fontSize: 12, color: "var(--warm-gray)" }}>Budget</span>
          <select
            className="rounded-lg border px-2 py-2 text-sm"
            style={{ borderColor: "var(--sand-border-strong)", backgroundColor: "var(--porcelain)" }}
            value={budget}
            onChange={(e) => setBudget(e.target.value as DesignPreference["budget"])}
          >
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span style={{ fontSize: 12, color: "var(--warm-gray)" }}>Goal</span>
          <select
            className="rounded-lg border px-2 py-2 text-sm"
            style={{ borderColor: "var(--sand-border-strong)", backgroundColor: "var(--porcelain)" }}
            value={goal}
            onChange={(e) => setGoal(e.target.value as DesignPreference["goal"])}
          >
            {GOALS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4">
        <div style={{ fontSize: 12, color: "var(--warm-gray)", marginBottom: 8 }}>Constraints</div>
        <div className="flex flex-wrap gap-2">
          {CONSTRAINTS.map((c) => {
            const on = (constraints ?? []).includes(c);
            return (
              <button
                key={c}
                type="button"
                className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: on ? "var(--mist-sage)" : "var(--soft-cream)",
                  color: on ? "var(--deep-sage)" : "var(--warm-gray)",
                  border: `1px solid ${on ? "rgba(95,127,99,0.35)" : "var(--sand-border)"}`,
                }}
                onClick={() => toggle(c)}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>
      <label className="mt-4 block">
        <span style={{ fontSize: 12, color: "var(--warm-gray)" }}>Notes</span>
        <textarea
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: "var(--sand-border-strong)", minHeight: 72 }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional context for the planner…"
        />
      </label>
      <button
        type="submit"
        className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold"
        style={{ backgroundColor: "var(--sage)", color: "var(--porcelain)" }}
      >
        Save preferences
      </button>
    </form>
  );
}
