"use client";

import { LogoMatria } from "@/components/LogoMatria";
import type { Demo } from "@/components/Inicio";

interface TabBarProps {
  demo: Demo;
  onVolver: () => void;
}

const ETIQUETA: Record<Demo, string> = {
  matrona: "Panel de la matrona",
  paciente: "Seguimiento de la puérpera",
};

export function TabBar({ demo, onVolver }: TabBarProps) {
  return (
    <header
      className="flex items-center gap-4 px-5 py-3"
      style={{ background: "var(--marca-900)" }}
    >
      <div className="flex items-center gap-2.5">
        <LogoMatria fill="#FF6B82" size={26} />
        <span className="text-lg font-medium" style={{ color: "#ffffff" }}>
          Matria
        </span>
      </div>
      <span className="text-sm" style={{ color: "#E8B3BA" }}>
        {ETIQUETA[demo]}
      </span>
      <button
        type="button"
        onClick={onVolver}
        className="ml-auto rounded-[var(--radius-md)] px-3 py-1.5 text-sm font-medium"
        style={{
          color: "#E8B3BA",
          background: "color-mix(in srgb, #ffffff 12%, transparent)",
        }}
      >
        Cambiar de vista
      </button>
    </header>
  );
}
