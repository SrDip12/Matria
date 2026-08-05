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
      className="flex shrink-0 items-center gap-4 px-5 py-3"
      style={{ background: "var(--marca-900)" }}
    >
      <div className="flex items-center gap-2.5">
        <LogoMatria fill="var(--marca-300)" size={24} />
        <span className="text-[17px] font-medium tracking-tight" style={{ color: "#ffffff" }}>
          Matria
        </span>
      </div>

      <span
        className="hidden h-4 w-px sm:block"
        style={{ background: "color-mix(in srgb, #ffffff 22%, transparent)" }}
        aria-hidden
      />

      <span
        className="etiqueta"
        style={{ color: "color-mix(in srgb, var(--marca-100) 85%, transparent)" }}
      >
        {ETIQUETA[demo]}
      </span>

      <button
        type="button"
        onClick={onVolver}
        className="btn ml-auto text-[13px]"
        style={{
          color: "#ffffff",
          background: "color-mix(in srgb, #ffffff 12%, transparent)",
          border: "1px solid color-mix(in srgb, #ffffff 18%, transparent)",
        }}
      >
        Cambiar de vista
      </button>
    </header>
  );
}
