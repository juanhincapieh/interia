import type { ReactNode } from "react";

function LShapeTick({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const size = 16;
  const stroke = 2;
  const color = "rgba(255,255,255,0.65)";
  const paths: Record<string, string> = {
    tl: `M${size} 0 H0 V${size}`,
    tr: `M0 0 H${size} V${size}`,
    bl: `M${size} ${size} H0 V0`,
    br: `M0 ${size} H${size} V0`,
  };
  const positions: Record<string, React.CSSProperties> = {
    tl: { top: 14, left: 14 },
    tr: { top: 14, right: 14 },
    bl: { bottom: 14, left: 14 },
    br: { bottom: 14, right: 14 },
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ position: "absolute", ...positions[corner] }}
      aria-hidden
    >
      <path d={paths[corner]} stroke={color} strokeWidth={stroke} fill="none" />
    </svg>
  );
}

export function HeroRoomPreview({
  imageUrl,
  children,
}: {
  imageUrl: string;
  children?: ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      <div
        style={{
          position: "relative",
          aspectRatio: "0.92 / 1",
          maxHeight: 720,
          width: "100%",
          borderRadius: 30,
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(31,31,28,0.10), inset 0 0 0 1px rgba(255,255,255,0.4)",
          backgroundColor: "var(--clay)",
        }}
      >
        <img
          src={imageUrl}
          alt="Source room"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {/* L-shaped tick marks */}
        <LShapeTick corner="tl" />
        <LShapeTick corner="tr" />
        <LShapeTick corner="bl" />
        <LShapeTick corner="br" />
        {/* step badge */}
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 34,
            height: 34,
            borderRadius: 999,
            backgroundColor: "var(--charcoal)",
            border: "2px solid rgba(255,255,255,0.85)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          1
        </div>
        {/* source label */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            backgroundColor: "rgba(31,31,28,0.55)",
            backdropFilter: "blur(8px)",
            borderRadius: 999,
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: "#4ade80", flexShrink: 0 }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "white",
            }}
          >
            Source room · sample
          </span>
        </div>
        {/* agent welcome card — absolute at bottom */}
        {children && (
          <div style={{ position: "absolute", left: 26, right: 26, bottom: 26 }}>
            {children}
          </div>
        )}
      </div>
      {/* caption below frame */}
      <div
        className="flex items-center gap-2 mt-3"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11.5,
          color: "var(--dust-gray)",
          letterSpacing: "0.04em",
        }}
      >
        <span
          style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: "var(--terracotta)", flexShrink: 0 }}
        />
        The next interface will be generated from your room state
      </div>
    </div>
  );
}
