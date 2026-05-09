"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Sidebar } from "@/components/interia/Sidebar";
import { TopUserMenu } from "@/components/interia/TopUserMenu";
import { HeroIntro } from "@/components/interia/HeroIntro";
import { RoomUploadCard } from "@/components/interia/RoomUploadCard";
import { SampleRoomSelector } from "@/components/interia/SampleRoomSelector";
import { HeroRoomPreview } from "@/components/interia/HeroRoomPreview";
import { AgentWelcomeCard } from "@/components/interia/AgentWelcomeCard";
import { BottomHint } from "@/components/interia/BottomHint";
import { SAMPLES, DEFAULT_SAMPLE_ID, type SampleId } from "@/lib/interia/samples";

export default function UploadPage() {
  const router = useRouter();
  const [selectedSampleId, setSelectedSampleId] = useState<SampleId | null>(DEFAULT_SAMPLE_ID);

  const heroSample = SAMPLES.find((s) => s.id === selectedSampleId) ?? SAMPLES[0];

  async function startProject(payload: { sampleId: SampleId } | { file: File }) {
    const id = crypto.randomUUID();
    if ("sampleId" in payload) {
      sessionStorage.setItem(`interia:${id}`, JSON.stringify({ sampleId: payload.sampleId }));
      router.push(`/project/${id}`);
      return;
    }
    const fd = new FormData();
    fd.append("file", payload.file);
    const res = await fetch("/api/interia/upload", { method: "POST", body: fd });
    if (!res.ok) {
      console.error("Interia upload failed", res.status, await res.text());
      return;
    }
    const data = (await res.json()) as { url?: string };
    if (!data.url) return;
    sessionStorage.setItem(`interia:${id}`, JSON.stringify({ imageUrl: data.url }));
    router.push(`/project/${id}`);
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main
        className="relative flex-1"
        style={{ padding: "72px 40px 40px 56px" }}
      >
        <TopUserMenu userName="Laura" agentStatus="preparing" />
        <div
          className="grid"
          style={{
            gridTemplateColumns: "minmax(460px, 520px) 1fr",
            gap: 56,
          }}
        >
          <section style={{ maxWidth: 520 }}>
            <HeroIntro />
            <div style={{ marginTop: 36 }}>
              <RoomUploadCard
                onSelect={(file) => startProject({ file })}
              />
            </div>
            <div style={{ marginTop: 28 }}>
              <SampleRoomSelector
                samples={SAMPLES}
                selectedId={selectedSampleId}
                onSelect={(id) => {
                  setSelectedSampleId(id);
                  startProject({ sampleId: id });
                }}
              />
            </div>
          </section>
          <section style={{ maxWidth: 720, justifySelf: "end" }}>
            <HeroRoomPreview imageUrl={heroSample.heroUrl}>
              <AgentWelcomeCard
                agentStatus="preparing"
                body="I'll analyze your room, build a design state, and generate controls you can use to refine it visually."
              />
            </HeroRoomPreview>
          </section>
        </div>
        <BottomHint />
      </main>
    </div>
  );
}
