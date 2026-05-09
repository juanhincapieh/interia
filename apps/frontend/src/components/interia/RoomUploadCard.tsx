"use client";
import { useRef, useState } from "react";
import { UploadCloud, ArrowRight } from "lucide-react";

export function RoomUploadCard({ onSelect }: { onSelect: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!["image/jpeg", "image/png"].includes(file.type)) return;
    if (file.size > 20 * 1024 * 1024) return;
    onSelect(file);
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: "var(--porcelain)",
    border: isDragging
      ? "1.5px solid rgba(95,127,99,0.45)"
      : "1px solid var(--sand-border)",
    borderRadius: 24,
    padding: 10,
    cursor: "pointer",
    transition: "all .2s ease",
    boxShadow: isDragging
      ? "0 18px 50px rgba(95,127,99,0.14), 0 0 0 4px rgba(231,239,228,0.6)"
      : "0 12px 40px rgba(31,31,28,0.06)",
  };

  return (
    <div
      style={cardStyle}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div
        style={{
          border: "1.5px dashed var(--sand-border-strong)",
          borderRadius: 18,
          padding: "28px 28px 24px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
        }}
      >
        {/* icon chip */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: "var(--soft-cream)",
            border: "1px solid var(--sand-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
          }}
        >
          <UploadCloud size={26} color="var(--charcoal)" strokeWidth={1.6} />
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, color: "var(--charcoal)" }}>
          Upload a room photo
        </div>
        <div style={{ fontSize: 14, color: "var(--warm-gray)", marginTop: 4, marginBottom: 18 }}>
          or drag and drop
        </div>
        {/* button */}
        <button
          type="button"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            height: 42,
            padding: "0 18px",
            backgroundColor: "var(--sage)",
            color: "white",
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(73,99,77,0.25)",
          }}
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        >
          Choose image
          <ArrowRight size={16} strokeWidth={1.6} />
        </button>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--dust-gray)",
            marginTop: 12,
          }}
        >
          JPG, PNG up to 20MB
        </div>
      </div>
    </div>
  );
}
