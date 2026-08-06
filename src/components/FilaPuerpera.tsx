"use client";

import { Franja42 } from "@/components/Franja42";
import { TarjetaAlerta } from "@/components/TarjetaAlerta";
import { ETIQUETA_PARTO, partirEtiqueta } from "@/lib/formato";
import { diasSinContacto, DIAS_SILENCIO } from "@/lib/metricas";
import { ACCION_RIESGO, CLASE_TAG, ENCABEZADO_ALERTA, NIVEL_COLOR } from "@/lib/riesgo";
import { DIAS_PUERPERIO, type FilaPanel } from "@/lib/types";

interface FilaPuerperaProps {
  fila: FilaPanel;
  seleccionada: boolean;
  onAbrirCaso: () => void;
  onResolverAlerta: (alertaId: string) => void;
}

/**
 * Una puérpera en el panel priorizado.
 *
 * Abre con el riel de riesgo de 4px y cierra con la franja de 42 días: el estado de ahora y la
 * historia completa en la misma fila, sin abrir nada.
 *
 * La fila entera abre el caso. Los botones de la alerta viven fuera de ese botón: uno dentro de
 * otro no es HTML válido y el teclado se pierde entre los dos.
 */
export function FilaPuerpera({
  fila,
  seleccionada,
  onAbrirCaso,
  onResolverAlerta,
}: FilaPuerperaProps) {
  const { puerpera, ultima_evaluacion, alertas_pendientes, nivel_riesgo, franja } = fila;
  const [etiqueta, codigo] = partirEtiqueta(puerpera.nombre);
  const silencio = diasSinContacto(fila);
  const mudo = silencio === null || silencio >= DIAS_SILENCIO;

  return (
    <article
      className="fila-lista flex overflow-hidden rounded-[var(--radius-lg)] border transition-colors"
      style={{
        borderColor: seleccionada ? "var(--marca-200)" : "var(--color-border)",
        background: seleccionada ? "var(--color-surface-alta)" : "var(--color-surface)",
      }}
    >
      <span
        className="riel my-3 ml-3 self-stretch"
        style={{ background: NIVEL_COLOR[nivel_riesgo] }}
        aria-hidden
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <button
          type="button"
          onClick={onAbrirCaso}
          aria-label={`Abrir el caso de ${etiqueta}`}
          className="flex cursor-pointer flex-col gap-2.5 px-3 py-3 text-left transition-colors hover:bg-[var(--color-hover)]"
        >
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="subtitulo truncate">{etiqueta}</span>
            {codigo && (
              <span className="tabular text-[11px] tenue" translate="no">
                {codigo}
              </span>
            )}
            <span className="tabular text-xs suave">
              {puerpera.edad} a · {ETIQUETA_PARTO[puerpera.tipo_parto]}
            </span>
            <span className="ml-auto flex shrink-0 items-center gap-2">
              {mudo && (
                <span className="tabular text-[11px] tenue">
                  {silencio === null ? "nunca escribió" : `${silencio} d en silencio`}
                </span>
              )}
              <span className={CLASE_TAG[nivel_riesgo]}>{ACCION_RIESGO[nivel_riesgo]}</span>
            </span>
          </div>

          {nivel_riesgo !== "bajo" && ultima_evaluacion ? (
            <p className="text-[13.5px] leading-relaxed text-pretty">
              {ultima_evaluacion.razonamiento}{" "}
              <span className="tabular tenue">{ultima_evaluacion.cita_protocolo}</span>
            </p>
          ) : (
            // Un vacío se explica, no se deja en blanco: dice qué significa que no haya nada.
            <p className="text-[13.5px] suave">Sin señales de alarma en las últimas 24 horas.</p>
          )}

          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <Franja42 franja={franja} diaActual={puerpera.dia_puerperio} />
            </div>
            <span className="tabular shrink-0 text-[11px] tenue">
              día {puerpera.dia_puerperio} / {DIAS_PUERPERIO}
            </span>
          </div>
        </button>

        {alertas_pendientes.length > 0 && (
          // Varias alertas van en paralelo, no apiladas: cada una toma una fracción igual de la
          // fila y solo se envuelven a otra línea si no caben. Con una sola, flex-1 la deja a lo ancho.
          <div
            className="flex flex-wrap gap-2 border-t px-3 py-3"
            style={{ borderColor: "var(--color-linea)" }}
          >
            {alertas_pendientes.map((alerta) => (
              <TarjetaAlerta
                key={alerta.id}
                className="alerta-entra min-w-0 flex-1 basis-[320px]"
                nivel={alerta.nivel}
                encabezado={ENCABEZADO_ALERTA[alerta.nivel]}
                at={alerta.created_at}
              >
                <p className="text-[13.5px] font-medium text-pretty">{alerta.titulo}</p>
                <p className="text-[13px] leading-relaxed text-pretty suave">
                  {alerta.accion_sugerida}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="tabular text-[11px] tenue">
                    Protocolo {alerta.cita_protocolo}
                  </span>
                  <span className="ml-auto flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => onResolverAlerta(alerta.id)}
                      className="btn btn-ghost"
                      aria-label={`Marcar como resuelta la alerta: ${alerta.titulo}`}
                    >
                      Marcar resuelta
                    </button>
                    <button type="button" onClick={onAbrirCaso} className="btn btn-secondary">
                      Abrir el caso
                    </button>
                  </span>
                </div>
              </TarjetaAlerta>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
