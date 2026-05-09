export function BottomHint() {
  return (
    <div
      style={{
        position: "absolute",
        left: 56,
        bottom: 24,
        display: "flex",
        alignItems: "center",
        gap: 8,
        backgroundColor: "var(--soft-cream)",
        border: "1px solid var(--sand-border)",
        borderRadius: 999,
        padding: "6px 12px 6px 8px",
      }}
    >
      {/* left mark */}
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          backgroundColor: "var(--mist-sage)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
            fill="var(--sage)"
          />
        </svg>
      </div>
      <span style={{ fontSize: 12, color: "var(--warm-gray)" }}>
        Generated workspace starts after upload
      </span>
      {/* keycap */}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--dust-gray)",
          backgroundColor: "var(--porcelain)",
          border: "1px solid var(--sand-border)",
          borderRadius: 4,
          padding: "2px 6px",
        }}
      >
        ↵
      </span>
    </div>
  );
}
