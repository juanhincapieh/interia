"use client";

import type { LockSet, RoomObject } from "@/lib/interia/types";

type LockKey = keyof LockSet;
type LockVal = NonNullable<LockSet[LockKey]>;

const LEVELS: LockVal[] = ["locked", "soft", "editable"];

const LABELS: Record<LockKey, string> = {
  identity: "Identity",
  position: "Position",
  appearance: "Appearance",
};

export function EditContractPanel({
  contract,
  objects,
  onChange,
}: {
  contract: Record<string, LockSet>;
  objects: RoomObject[];
  onChange: (objectId: string, locks: LockSet) => void;
}) {
  return (
    <div
      style={{
        backgroundColor: "var(--porcelain)",
        border: "1px solid var(--sand-border)",
        borderRadius: "var(--r-card-lg)",
        padding: "18px 20px",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--charcoal)" }}>Edit contract</div>
      <p style={{ margin: "6px 0 14px", fontSize: 13, color: "var(--warm-gray)", lineHeight: 1.45 }}>
        Locked fields stay faithful across previews; editable ones can follow the plan.
      </p>
      <div className="flex flex-col gap-4">
        {objects.map((o) => {
          const locks: LockSet = {
            identity: contract[o.id]?.identity ?? "soft",
            position: contract[o.id]?.position ?? "soft",
            appearance: contract[o.id]?.appearance ?? "editable",
          };
          return (
            <div
              key={o.id}
              className="rounded-xl px-3 py-3"
              style={{ backgroundColor: "var(--soft-cream)", border: "1px solid var(--sand-border)" }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--charcoal)" }}>{o.label}</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {(Object.keys(LABELS) as LockKey[]).map((key) => (
                  <label key={key} className="flex flex-col gap-1">
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--dust-gray)" }}>
                      {LABELS[key]}
                    </span>
                    <select
                      className="rounded-lg border px-2 py-1.5 text-sm"
                      style={{
                        borderColor: "var(--sand-border-strong)",
                        backgroundColor: "var(--porcelain)",
                        color: "var(--charcoal)",
                      }}
                      value={locks[key] ?? "soft"}
                      onChange={(e) => {
                        const v = e.target.value as LockVal;
                        onChange(o.id, { ...locks, [key]: v });
                      }}
                    >
                      {LEVELS.map((lv) => (
                        <option key={lv} value={lv}>
                          {lv}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
