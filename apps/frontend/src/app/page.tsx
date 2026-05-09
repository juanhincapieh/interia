"use client";

import { useEffect, useRef, useState } from "react";
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
  const objectUrlRef = useRef<string | null>(null);

  // Revoke any outstanding object URL on unmount
  useEffect(() => () => { if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current); }, []);

  const heroSample = SAMPLES.find((s) => s.id === selectedSampleId) ?? SAMPLES[0];

  function startProject(payload: { sampleId: SampleId } | { file: File }) {
    const id = `proj_${crypto.randomUUID().slice(0, 8)}`;
    if ("sampleId" in payload) {
      sessionStorage.setItem(`interia:${id}`, JSON.stringify({ sampleId: payload.sampleId }));
    } else {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(payload.file);
      objectUrlRef.current = url;
      sessionStorage.setItem(`interia:${id}`, JSON.stringify({ uploadedUrl: url }));
    }
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
