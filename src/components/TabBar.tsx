"use client";

import { IconoCambiar, IconoFicha, IconoInicio, IconoLazo } from "@/components/Iconos";
import { LogoMatria } from "@/components/LogoMatria";
import type { Demo } from "@/components/Inicio";

interface TabBarProps {
  /** null en la pantalla de entrada: la barra está, pero todavía no hay vista que nombrar. */
  demo: Demo | null;
  onVolver: () => void;
}

const VISTA: Record<Demo, { etiqueta: string; Icono: typeof IconoFicha }> = {
  matrona: { etiqueta: "Panel de la matrona", Icono: IconoFicha },
  paciente: { etiqueta: "Seguimiento de la puérpera", Icono: IconoLazo },
};

/** La puerta también se nombra: sin esto la barra de entrada quedaba muda y más baja que las otras. */
const ENTRADA = { etiqueta: "Inicio", Icono: IconoInicio };

/**
 * Barra superior del producto: la marca sobre rojo 900 y el nombre de la vista en versalitas.
 *
 * El remate de abajo es rojo 500 a 1 px y no una sombra: el sistema no tiene sombras y una franja
 * de marca separa la barra del contenido sin inventar profundidad.
 *
 * El alto es fijo: el botón de cambiar de vista solo existe en dos de las tres pantallas, y sin
 * un alto propio la barra encogía en la entrada y el chrome saltaba al elegir una vista.
 */
export function TabBar({ demo, onVolver }: TabBarProps) {
  const vista = demo ? VISTA[demo] : ENTRADA;

  return (
    <header
      className="flex min-h-[61px] shrink-0 items-center gap-4 border-b px-5 py-3"
      style={{ background: "var(--marca-900)", borderColor: "var(--marca-700)" }}
    >
      <div className="flex items-center gap-2.5">
        <LogoMatria fill="var(--marca-300)" size={26} punto="var(--marca-900)" />
        <span className="flex flex-col leading-none">
          <span className="text-[17px] font-medium tracking-tight" style={{ color: "#ffffff" }}>
            Matria
          </span>
          <span
            className="mt-0.5 text-[9px] font-semibold tracking-[0.16em] uppercase"
            style={{ color: "color-mix(in srgb, var(--marca-200) 70%, transparent)" }}
          >
            Puerperio
          </span>
        </span>
      </div>

      <span
        className="h-6 w-px"
        style={{ background: "color-mix(in srgb, #ffffff 22%, transparent)" }}
        aria-hidden
      />
      <span
        className="etiqueta flex items-center gap-2"
        style={{ color: "color-mix(in srgb, var(--marca-100) 85%, transparent)" }}
      >
        <vista.Icono size={15} />
        {vista.etiqueta}
      </span>

      {demo && (
        <button type="button" onClick={onVolver} className="btn btn-sobre-marca ml-auto">
          <IconoCambiar size={15} />
          Cambiar de vista
        </button>
      )}
    </header>
  );
}
