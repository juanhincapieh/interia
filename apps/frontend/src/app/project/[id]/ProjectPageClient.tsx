"use client";

import { CopilotChatConfigurationProvider } from "@copilotkit/react-core/v2";

import { InteriaProjectShell } from "@/components/interia/InteriaProjectShell";

export function ProjectPageClient({ projectId }: { projectId: string }) {
  return (
    <CopilotChatConfigurationProvider agentId="default" threadId={projectId}>
      <InteriaProjectShell projectId={projectId} />
    </CopilotChatConfigurationProvider>
  );
}
