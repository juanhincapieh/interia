import { ProjectCanvas } from "@/components/interia/ProjectCanvas";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectCanvas projectId={id} />;
}
