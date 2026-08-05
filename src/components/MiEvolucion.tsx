"use client";

import { Franja42 } from "@/components/Franja42";
import { TONO_RIESGO } from "@/lib/riesgo";
import { DIAS_PUERPERIO, type FilaPanel, type Mensaje, type NivelRiesgo } from "@/lib/types";

/**
 * Cómo ha estado ella, día por día. Es el mismo dato que la matrona ve en el panel —la franja de
 * 42 días— leído desde el otro lado, así que reusa `Franja42` y no inventa otra visualización.
 *
 * No muestra el `razonamiento` de la evaluación: ese texto está escrito para la matrona. Lo que
 * ella ve es qué día escribió, qué dijo, y si eso quedó como señal para su matrona.
 */

/** Las etiquetas del panel son para la matrona. Estas son para ella. */
const ETIQUETA: Record<NivelRiesgo, string> = {
  bajo: "Sin señales de alarma",
  medio: "Señal para tu matrona",
  alto: "Señal urgente, avisada",
};

export function MiEvolucion({ fila, mensajes }: { fila: FilaPanel | null; mensajes: Mensaje[] }) {
  if (!fila) return null;

  const { franja, puerpera } = fila;
  const conContacto = franja.filter(Boolean).length;
  const conSenal = franja.filter((n) => n === "medio" || n === "alto").length;

  // De lo más reciente a lo más antiguo: lo de hoy es lo que le importa.
  const dias = franja
    .map((nivel, i) => ({ dia: i + 1, nivel }))
    .filter((d): d is { dia: number; nivel: NivelRiesgo } => d.nivel !== null)
    .reverse();

  const suyos = mensajes.filter((m) => m.autor === "puerpera");

  return (
    <div className="flex flex-col gap-4">
      <section className="card flex flex-col gap-3 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium">Cómo has estado</h2>
          <span className="tabular text-xs" style={{ color: "var(--color-text-suave)" }}>
            Día {puerpera.dia_puerperio} de {DIAS_PUERPERIO}
          </span>
        </div>

        <Franja42 franja={franja} diaActual={puerpera.dia_puerperio} />

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: "var(--color-text-suave)" }}>
          <span className="tabular">{conContacto} días en que me escribiste</span>
          <span className="tabular">{conSenal} con alguna señal para tu matrona</span>
        </div>
      </section>

      {dias.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-text-suave)" }}>
          Todavía no hay días registrados. Cuéntame en el chat cómo estás y acá vas a ir viendo tu
          recorrido de estas semanas.
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {dias.map(({ dia, nivel }) => {
            const tono = TONO_RIESGO[nivel];
            const dicho = suyos.filter((m) => m.dia_puerperio === dia).at(-1);
            return (
              <li key={dia} className="card flex flex-col gap-1.5 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="tabular text-sm font-medium">Día {dia}</span>
                  <span
                    className="tag"
                    style={{ background: tono.fondo, color: tono.texto, border: `1px solid ${tono.borde}` }}
                  >
                    {ETIQUETA[nivel]}
                  </span>
                </div>
                {dicho && (
                  <p className="text-sm" style={{ color: "var(--color-text-suave)" }}>
                    “{dicho.texto}”
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
