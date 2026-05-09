export function AgentWelcomeCard({
  agentStatus,
  body,
}: {
  agentStatus: "idle" | "preparing" | "analyzing";
  body: string;
}) {
  return (
    <div
      style={{
        backgroundColor: "var(--porcelain)",
        border: "1px solid var(--sand-border)",
        borderRadius: 22,
        boxShadow: "0 18px 60px rgba(31,31,28,0.12)",
        padding: "18px 20px 16px 20px",
      }}
    >
      {/* header */}
      <div className="flex items-start gap-3 mb-3">
        {/* avatar */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            backgroundColor: "var(--mist-sage)",
            border: "1px solid rgba(95,127,99,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 2 L20 12 L12 22 L4 12 Z" fill="var(--sage)" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--charcoal)" }}>
              Interia
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                backgroundColor: "var(--mist-sage)",
                color: "var(--deep-sage)",
                padding: "2px 6px",
                borderRadius: 4,
              }}
            >
              AGENT
            </span>
          </div>
          {/* typing dots */}
          <div className="flex items-center gap-1 mt-1">
            {[0, 0.2, 0.4].map((delay, i) => (
              <span
                key={i}
                aria-hidden
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 999,
                  backgroundColor: "var(--sage)",
                  display: "block",
                  animation: `interiaTyping 1.4s ease-in-out ${delay}s infinite`,
                }}
              />
            ))}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--dust-gray)",
                marginLeft: 6,
              }}
            >
              preparing workspace
            </span>
          </div>
        </div>
      </div>
      {/* body */}
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--charcoal)", margin: "0 0 4px" }}>
          Hi, I&apos;m Interia.
        </p>
        <p style={{ fontSize: 13.5, color: "var(--warm-gray)", lineHeight: 1.5, margin: 0 }}>
          {body}
        </p>
      </div>
      {/* footer */}
      <div
        style={{
          borderTop: "1px dashed var(--sand-border)",
          marginTop: 14,
          paddingTop: 10,
          display: "flex",
          gap: 12,
        }}
      >
        {["room analysis", "editable zones", "suggestions"].map((tag) => (
          <span
            key={tag}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10.5,
              color: "var(--dust-gray)",
            }}
          >
            · {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
