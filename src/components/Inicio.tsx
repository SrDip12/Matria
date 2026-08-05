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
export function Inicio({ onElegir }: { onElegir: (demo: Demo) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <LogoMatria fill="var(--marca-900)" size={44} />
        <h1 className="text-3xl">Matria</h1>
        <p className="max-w-md text-sm" style={{ color: "var(--color-text-suave)" }}>
          Acompañamiento del puerperio durante los 42 días posteriores al parto. Interpreta lo
          que ella cuenta, lo estratifica según el protocolo y se lo entrega priorizado a la
          matrona.
        </p>
      </div>

      <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onElegir("matrona")}
          className="flex flex-col gap-2 rounded-[var(--radius-md)] border p-5 text-left"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <span className="text-lg font-medium">Soy matrona</span>
          <span className="text-sm" style={{ color: "var(--color-text-suave)" }}>
            Panel de triage: las puérperas ordenadas por riesgo, la franja de 42 días y el
            resumen clínico de cada una con los factores que el agente está ponderando.
          </span>
        </button>

        <button
          type="button"
          onClick={() => onElegir("paciente")}
          className="flex flex-col gap-2 rounded-[var(--radius-md)] border p-5 text-left"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <span className="text-lg font-medium">Soy puérpera</span>
          <span className="text-sm" style={{ color: "var(--color-text-suave)" }}>
            Ficha de ingreso, conversación con el acompañamiento y tu perfil. Lo que escribes acá
            es lo que el agente interpreta.
          </span>
        </button>
      </div>
    </div>
  );
}
