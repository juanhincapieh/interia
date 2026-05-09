export function HeroIntro({
  title = {
    line1: "Design your space,",
    line2: "interactively.",
  },
}: {
  title?: { line1: string; line2: string };
}) {
  return (
    <div style={{ maxWidth: 480 }}>
      {/* pill */}
      <div
        className="mb-[22px] inline-flex items-center gap-2"
        style={{
          padding: "6px 12px",
          backgroundColor: "var(--soft-cream)",
          border: "1px solid var(--sand-border)",
          borderRadius: 999,
          fontSize: 12.5,
          fontWeight: 500,
          color: "var(--warm-gray)",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
            fill="var(--sage)"
          />
        </svg>
        Agent-generated design workspace
      </div>
      {/* title */}
      <h1
        style={{
          fontSize: 60,
          fontWeight: 650,
          lineHeight: 1.04,
          letterSpacing: "-0.035em",
          color: "var(--charcoal)",
          margin: 0,
        }}
      >
        {title.line1}
        <br />
        <span style={{ color: "var(--sage)" }}>{title.line2}</span>
      </h1>
      {/* subtitle */}
      <p
        style={{
          fontSize: 17,
          fontWeight: 400,
          lineHeight: 1.55,
          color: "var(--warm-gray)",
          maxWidth: 420,
          marginTop: 16,
          marginBottom: 0,
        }}
      >
        Upload a photo of your room and let Interia turn it into an editable design state.
      </p>
    </div>
  );
}
