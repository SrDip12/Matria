"use client";

import { LogoMatria } from "@/components/LogoMatria";

export type Demo = "matrona" | "paciente";

/**
 * Primera pantalla: elige desde qué lado se mira el producto.
 *
 * Es una puerta, no una etapa del recorrido. La rúbrica premia que el jurado vea el mensaje
 * entrar y la alerta salir en la misma pantalla, así que desde acá se entra directo a la
 * pantalla dividida y esta vista no vuelve a aparecer sola.
 */

const PUERTAS: { id: Demo; titulo: string; descripcion: string }[] = [
  {
    id: "matrona",
    titulo: "Soy matrona",
    descripcion:
      "Panel de triage: el resumen de la cohorte, las puérperas ordenadas por riesgo, la franja de 42 días y la ficha de cada una con los factores que el agente pondera.",
  },
  {
    id: "paciente",
    titulo: "Soy puérpera",
    descripcion:
      "Ficha de ingreso, conversación con el acompañamiento, tu ficha y los avisos de lo que pasó con lo que contaste. Lo que escribes acá es lo que el agente interpreta.",
  },
];

export function Inicio({ onElegir }: { onElegir: (demo: Demo) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 p-8">
      <div className="flex max-w-lg flex-col items-center gap-4 text-center">
        <LogoMatria fill="var(--marca-900)" size={44} />
        <div className="flex flex-col gap-1.5">
          <h1 className="display">Matria</h1>
          <p className="etiqueta">Acompañamiento longitudinal del puerperio</p>
        </div>
        <p className="text-[14px] leading-relaxed text-pretty suave">
          Sigue a la puérpera durante los 42 días posteriores al parto, interpreta lo que ella
          cuenta, lo estratifica según el protocolo de la matrona y lo entrega priorizado al
          equipo clínico.
        </p>
      </div>

      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
        {PUERTAS.map(({ id, titulo, descripcion }) => (
          <button
            key={id}
            type="button"
            onClick={() => onElegir(id)}
            className="card group flex flex-col gap-2 p-6 text-left transition-colors hover:border-[var(--marca-200)] hover:bg-[var(--color-surface-alta)]"
          >
            <span className="subtitulo">{titulo}</span>
            <span className="text-[13px] leading-relaxed text-pretty suave">{descripcion}</span>
            <span className="mt-1 text-[13px] font-medium" style={{ color: "var(--marca-600)" }}>
              Entrar →
            </span>
          </button>
        ))}
      </div>

      <p className="max-w-md text-center text-[11px] leading-relaxed text-pretty tenue">
        Demo con cohorte sintética. El sistema detecta, prioriza y escala al profesional: no
        diagnostica ni realiza acciones clínicas.
      </p>
    </div>
  );
}
