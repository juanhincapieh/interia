"use client";

import {
  Plus,
  Folder,
  Sparkles,
  LayoutGrid,
  SlidersHorizontal,
  Settings,
} from "lucide-react";
import Link from "next/link";

const NAV = [
  { href: "/", label: "New Project", icon: Plus, active: true },
  { href: "/projects", label: "Projects", icon: Folder },
  { href: "/inspiration", label: "Inspiration", icon: Sparkles },
  { href: "/catalog", label: "Catalog", icon: LayoutGrid },
  { href: "/preferences", label: "Preferences", icon: SlidersHorizontal },
] as const;

export function Sidebar() {
  return (
    <aside
      className="flex h-screen w-[248px] flex-col"
      style={{
        backgroundColor: "var(--soft-cream)",
        borderRight: "1px solid var(--sand-border)",
        padding: "26px 18px 22px 18px",
      }}
    >
      <Logo />
      <nav className="mt-6 flex flex-col gap-1">
        {NAV.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>
      <div className="flex-1" />
      <NavItem href="/settings" label="Settings" icon={Settings} />
      <WorkspaceCard />
    </aside>
  );
}

function Logo() {
  return (
    <div
      className="flex items-center justify-between border-b border-dashed pb-[22px]"
      style={{ borderColor: "var(--sand-border)" }}
    >
      <div className="flex items-center gap-2">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          style={{ flexShrink: 0 }}
        >
          <path
            d="M12 2 L20 12 L12 22 L4 12 Z"
            fill="var(--sage)"
            stroke="var(--deep-sage)"
            strokeWidth="1.5"
          />
        </svg>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: "19px",
            letterSpacing: "-0.02em",
            color: "var(--charcoal)",
            whiteSpace: "nowrap",
          }}
        >
          interia
        </span>
      </div>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          letterSpacing: "0.1em",
          color: "var(--dust-gray)",
          textTransform: "uppercase",
          flexShrink: 0,
        }}
      >
        PLACEHOLDER
      </span>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group relative flex items-center gap-2.5 px-3 transition-all duration-150 ease-out"
      style={{
        height: "44px",
        borderRadius: "12px",
        fontSize: "14.5px",
        fontWeight: active ? 600 : 500,
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        backgroundColor: active ? "var(--mist-sage)" : "transparent",
        color: active ? "var(--deep-sage)" : "var(--warm-gray)",
        border: active
          ? "1px solid rgba(95, 127, 99, 0.18)"
          : "1px solid transparent",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = "var(--soft-cream)";
          e.currentTarget.style.border = "1px solid rgba(95, 127, 99, 0.12)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.border = "1px solid transparent";
        }
      }}
    >
      <Icon size={18} strokeWidth={1.6} />
      <span className="flex-1" style={{ fontSize: "14.5px" }}>
        {label}
      </span>
      {active && (
        <span
          aria-hidden
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "999px",
            backgroundColor: "var(--sage)",
            flexShrink: 0,
          }}
        />
      )}
    </Link>
  );
}

function WorkspaceCard() {
  return (
    <div
      className="mt-3"
      style={{
        backgroundColor: "var(--porcelain)",
        border: "1px solid var(--sand-border)",
        borderRadius: "14px",
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          letterSpacing: "0.1em",
          color: "var(--dust-gray)",
          textTransform: "uppercase",
          marginBottom: "4px",
        }}
      >
        WORKSPACE
      </div>
      <div
        style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "var(--charcoal)",
        }}
      >
        Laura&apos;s Studio
      </div>
      <div className="mt-1 flex items-center gap-1.5">
        <span
          aria-hidden
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "999px",
            backgroundColor: "var(--terracotta)",
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: "12px", color: "var(--warm-gray)" }}>
          3 active projects
        </span>
      </div>
    </div>
  );
}
