"use client";

import { Franja42 } from "@/components/Franja42";
import { ETIQUETA_PARTO } from "@/lib/formato";
import { NIVEL_COLOR, TONO_RIESGO } from "@/lib/riesgo";
import { ETIQUETA_RIESGO, type FilaPanel } from "@/lib/types";

interface FilaPuerperaProps {
  fila: FilaPanel;
  seleccionada: boolean;
  onSeleccionar: () => void;
  onResolverAlerta: (alertaId: string) => void;
}

export function FilaPuerpera({ fila, seleccionada, onSeleccionar, onResolverAlerta }: FilaPuerperaProps) {
  const { puerpera, ultima_evaluacion, alertas_pendientes, nivel_riesgo, franja } = fila;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSeleccionar}
      onKeyDown={(evento) => {
        if (evento.key === "Enter") onSeleccionar();
      }}
      className="card flex cursor-pointer flex-col gap-2 p-3"
      style={{ borderColor: seleccionada ? "var(--marca-600)" : "var(--color-border)" }}
    >
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: NIVEL_COLOR[nivel_riesgo] }}
          aria-hidden
        />
        <span className="font-medium">{puerpera.nombre}</span>
        <span className="tabular text-sm" style={{ color: "var(--color-text-suave)" }}>
          {puerpera.edad}a · {ETIQUETA_PARTO[puerpera.tipo_parto]} · d.{puerpera.dia_puerperio}
        </span>
      </div>

      {nivel_riesgo !== "bajo" && ultima_evaluacion ? (
        <p className="text-sm">
          {ultima_evaluacion.razonamiento}{" "}
          <span style={{ color: "var(--color-text-suave)" }}>{ultima_evaluacion.cita_protocolo}</span>
        </p>
      ) : (
        <p className="text-sm" style={{ color: "var(--color-text-suave)" }}>
          {ETIQUETA_RIESGO.bajo}
        </p>
      )}

      <Franja42 franja={franja} diaActual={puerpera.dia_puerperio} />

      {alertas_pendientes.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {alertas_pendientes.map((alerta) => {
            const tono = TONO_RIESGO[alerta.nivel];
            return (
              <span
                key={alerta.id}
                className="tag"
                style={{ background: tono.fondo, color: tono.texto, border: `1px solid ${tono.borde}` }}
              >
                {alerta.titulo}
                <button
                  onClick={(evento) => {
                    evento.stopPropagation();
                    onResolverAlerta(alerta.id);
                  }}
                  className="underline"
                >
                  Marcar como resuelta
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
