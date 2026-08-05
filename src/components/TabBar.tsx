"use client";

import { LogoMatria } from "@/components/LogoMatria";

export type Tab = "dashboard" | "chatbot";

interface TabBarProps {
  tab: Tab;
  onCambiar: (tab: Tab) => void;
}

const TABS: { id: Tab; etiqueta: string }[] = [
  { id: "dashboard", etiqueta: "Dashboard" },
  { id: "chatbot", etiqueta: "Chatbot" },
];

export function TabBar({ tab, onCambiar }: TabBarProps) {
  return (
    <header className="flex items-center gap-4 px-5 py-3" style={{ background: "var(--marca-900)" }}>
      <div className="flex items-center gap-2.5">
        <LogoMatria fill="#FF6B82" size={26} />
        <span className="text-lg font-medium" style={{ color: "#ffffff" }}>
          Matria
        </span>
      </div>
      <nav className="ml-4 flex items-center gap-1">
        {TABS.map(({ id, etiqueta }) => (
          <button
            key={id}
            onClick={() => onCambiar(id)}
            className="rounded-[var(--radius-md)] px-3 py-1.5 text-sm font-medium"
            style={{
              color: tab === id ? "#ffffff" : "#E8B3BA",
              background: tab === id ? "color-mix(in srgb, #ffffff 15%, transparent)" : "transparent",
            }}
          >
            {etiqueta}
          </button>
        ))}
      </nav>
    </header>
  );
}
