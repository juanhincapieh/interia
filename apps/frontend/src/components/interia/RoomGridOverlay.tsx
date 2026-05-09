"use client";

import { Lock } from "lucide-react";

import type { RoomObject, RoomState } from "@/lib/interia/types";

const COLS = ["A", "B", "C", "D"] as const;
const ROWS = [1, 2, 3, 4] as const;

function cellCenterPercent(gridPosition: string): { left: number; top: number } | null {
  const m = /^([A-D])([1-4])$/.exec(gridPosition.trim());
  if (!m) return null;
  const col = COLS.indexOf(m[1] as (typeof COLS)[number]);
  const rowNum = Number(m[2]);
  if (col < 0 || rowNum < 1 || rowNum > 4) return null;
  const rowIndex = rowNum - 1;
  return {
    left: ((col + 0.5) / 4) * 100,
    top: ((rowIndex + 0.5) / 4) * 100,
  };
}

export function RoomGridOverlay({ state }: { state: RoomState }) {
  const objects = state.objects ?? [];
  const contract = state.editContract ?? {};

  return (
    <div className="absolute inset-0 z-10">
      <div
        className="pointer-events-none grid h-full w-full grid-cols-4 grid-rows-4"
        style={{
          border: "1px solid rgba(255,255,255,0.35)",
          boxSizing: "border-box",
        }}
      >
        {ROWS.map((row) =>
          COLS.map((col) => {
            const id = `${col}${row}`;
            return (
              <div
                key={id}
                className="relative border border-white/25"
                style={{ boxSizing: "border-box" }}
              >
                <span
                  className="absolute left-1 bottom-0.5 select-none"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    letterSpacing: "0.04em",
                    color: "rgba(255,255,255,0.85)",
                    textShadow: "0 1px 2px rgba(31,31,28,0.65)",
                  }}
                >
                  {id}
                </span>
              </div>
            );
          }),
        )}
      </div>

      {objects.map((obj) => (
        <ObjectPin key={obj.id} obj={obj} locks={contract[obj.id]} />
      ))}
    </div>
  );
}

function ObjectPin({ obj, locks }: { obj: RoomObject; locks?: { identity?: string } }) {
  const pos = cellCenterPercent(String(obj.gridPosition));
  if (!pos) return null;

  const identityLocked = locks?.identity === "locked";

  return (
    <div
      className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
      aria-label={`${obj.label} at ${obj.gridPosition}`}
    >
      <div className="relative flex items-center justify-center">
        {identityLocked && (
          <span
            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full"
            style={{
              backgroundColor: "var(--porcelain)",
              border: "1px solid var(--sand-border-strong)",
              boxShadow: "0 2px 6px rgba(31,31,28,0.12)",
            }}
            aria-hidden
          >
            <Lock size={9} strokeWidth={2} color="var(--deep-sage)" />
          </span>
        )}
        <span
          className="block h-3 w-3 rounded-full ring-2 ring-white/90"
          style={{
            backgroundColor: "var(--sage)",
            boxShadow: "0 2px 8px rgba(31,31,28,0.35)",
          }}
          aria-hidden
        />
      </div>
      <div
        className="pointer-events-none mt-1 max-w-[140px] rounded px-2 py-1 text-center opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        style={{
          backgroundColor: "rgba(31,31,28,0.88)",
          color: "var(--porcelain)",
          fontSize: 11,
          fontWeight: 500,
          lineHeight: 1.35,
        }}
        role="tooltip"
      >
        {obj.label}
      </div>
    </div>
  );
}
