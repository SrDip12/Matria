"use client";

import { LogoMatria } from "@/components/LogoMatria";
import type { Demo } from "@/components/Inicio";

interface TabBarProps {
  /** null en la pantalla de entrada: la barra está, pero todavía no hay vista que nombrar. */
  demo: Demo | null;
  onVolver: () => void;
}

const ETIQUETA: Record<Demo, string> = {
  matrona: "Panel de la matrona",
  paciente: "Seguimiento de la puérpera",
};

/** Barra superior del producto: la marca sobre rojo 900 y el nombre de la vista en versalitas. */
export function TabBar({ demo, onVolver }: TabBarProps) {
  return (
    <header
      className="flex shrink-0 items-center gap-4 px-5 py-3"
      style={{ background: "var(--marca-900)" }}
    >
      <div className="flex items-center gap-2.5">
        <LogoMatria fill="var(--marca-300)" size={24} punto={null} />
        <span className="text-[17px] font-medium tracking-tight" style={{ color: "#ffffff" }}>
          Matria
        </span>
      </div>

      {demo && (
        <>
          <span
            className="h-4 w-px"
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
            className="btn ml-auto"
            style={{
              color: "#ffffff",
              background: "color-mix(in srgb, #ffffff 12%, transparent)",
              border: "1px solid color-mix(in srgb, #ffffff 18%, transparent)",
            }}
          >
            Cambiar de vista
          </button>
        </>
      )}
    </header>
  );
}
