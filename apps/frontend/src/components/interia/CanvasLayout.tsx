"use client";

import type { ReactNode } from "react";

import { Sidebar } from "@/components/interia/Sidebar";
import { TopUserMenu } from "@/components/interia/TopUserMenu";

export function CanvasLayout({
  source,
  cards,
}: {
  source: ReactNode;
  cards: ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main
        className="relative flex-1 grid"
        style={{
          gridTemplateColumns: "minmax(420px, 520px) 1fr",
          gap: 32,
          padding: "56px 40px 40px 40px",
        }}
      >
        <TopUserMenu userName="Laura" agentStatus="analyzing" />
        <section style={{ position: "sticky", top: 56, alignSelf: "start" }}>{source}</section>
        <section className="flex flex-col gap-6">{cards}</section>
      </main>
    </div>
  );
}
