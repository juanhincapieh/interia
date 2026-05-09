export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="p-12">
      <div style={{ fontFamily: "var(--font-mono)", color: "var(--dust-gray)" }}>
        project / {id}
      </div>
      <h1 style={{ fontSize: 32, color: "var(--charcoal)" }}>Canvas coming in Phase 4.</h1>
    </div>
  );
}
