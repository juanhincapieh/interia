"use client";
import { ChevronDown } from "lucide-react";

export function TopUserMenu({
  userName,
  agentStatus,
}: {
  userName: string;
  agentStatus: "idle" | "preparing" | "analyzing";
}) {
  return (
    <div
      className="absolute flex items-center gap-2"
      style={{ top: 24, right: 32 }}
    >
      <div
        className="flex items-center gap-2"
        style={{
          backgroundColor: "var(--soft-cream)",
          border: "1px solid var(--sand-border)",
          borderRadius: 999,
          padding: "8px 14px",
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: 999,
            backgroundColor: "var(--sage)",
            boxShadow: "0 0 0 4px rgba(95,127,99,0.15)",
            display: "block",
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--warm-gray)" }}>
          Agent online
        </span>
      </div>
      <div
        className="flex items-center gap-2"
        style={{
          backgroundColor: "var(--porcelain)",
          border: "1px solid var(--sand-border)",
          borderRadius: 999,
          padding: "6px 14px 6px 6px",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            background: "linear-gradient(135deg,#E9C7B3,#C97855)",
            border: "2px solid white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {userName[0].toUpperCase()}
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--charcoal)" }}>
          Hi, {userName}
        </span>
        <ChevronDown size={16} color="var(--warm-gray)" />
      </div>
    </div>
  );
}
