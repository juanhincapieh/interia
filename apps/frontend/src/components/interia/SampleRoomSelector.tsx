"use client";
import type { Sample, SampleId } from "@/lib/interia/samples";

export function SampleRoomSelector({
  samples,
  selectedId,
  onSelect,
}: {
  samples: readonly Sample[];
  selectedId: SampleId | null;
  onSelect: (id: SampleId) => void;
}) {
  return (
    <div>
      {/* divider row */}
      <div className="flex items-center gap-3 mb-4">
        <div style={{ flex: 1, height: 1, backgroundColor: "var(--sand-border)" }} />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--dust-gray)",
            whiteSpace: "nowrap",
          }}
        >
          or try a sample room
        </span>
        <div style={{ flex: 1, height: 1, backgroundColor: "var(--sand-border)" }} />
      </div>
      {/* grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        {samples.map((sample) => {
          const selected = sample.id === selectedId;
          return (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelect(sample.id)}
              style={{
                position: "relative",
                aspectRatio: "1 / 1",
                borderRadius: 14,
                border: selected
                  ? "1.5px solid var(--sage)"
                  : "1.5px solid var(--sand-border)",
                boxShadow: selected ? "0 0 0 3px rgba(231,239,228,0.9)" : "none",
                overflow: "hidden",
                backgroundColor: "var(--clay)",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <img
                src={sample.thumbUrl}
                alt={sample.label}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              {/* bottom-left label */}
              <span
                style={{
                  position: "absolute",
                  bottom: 6,
                  left: 8,
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: "white",
                  textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                }}
              >
                {sample.label}
              </span>
              {/* selected indicator */}
              {selected && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    backgroundColor: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      backgroundColor: "var(--sage)",
                    }}
                  />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
