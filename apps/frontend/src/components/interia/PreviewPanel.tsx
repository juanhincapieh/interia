"use client";

import Image from "next/image";

import type { Preview } from "@/lib/interia/types";

export function PreviewPanel({
  preview,
  onRequest,
}: {
  preview?: Preview | null;
  onRequest: () => void;
}) {
  return (
    <div
      style={{
        backgroundColor: "var(--porcelain)",
        border: "1px solid var(--sand-border)",
        borderRadius: "var(--r-card-lg)",
        padding: "18px 20px",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--charcoal)" }}>Preview</div>
      {!preview ? (
        <div className="mt-4">
          <p style={{ fontSize: 13, color: "var(--warm-gray)", lineHeight: 1.5 }}>
            Previews run only on request — the agent will call <span style={{ fontFamily: "var(--font-mono)" }}>generate_preview</span> after you ask.
          </p>
          <button
            type="button"
            className="mt-3 w-full rounded-xl py-2.5 text-sm font-semibold"
            style={{ backgroundColor: "var(--terracotta)", color: "var(--porcelain)" }}
            onClick={onRequest}
          >
            Generate preview
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-xl" style={{ border: "1px solid var(--sand-border)" }}>
            <Image src={preview.imageUrl} alt="Design preview" fill className="object-cover" sizes="400px" />
          </div>
          <p style={{ marginTop: 10, fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--dust-gray)" }}>
            {preview.generationProvider} · v{preview.fromVersion}
          </p>
          <p style={{ marginTop: 6, fontSize: 13, color: "var(--warm-gray)", lineHeight: 1.45 }}>{preview.promptSummary}</p>
        </div>
      )}
    </div>
  );
}
