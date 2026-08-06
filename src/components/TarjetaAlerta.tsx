"use client";

import { fechaHora, haceCuanto } from "@/lib/formato";
import { TONO_RIESGO } from "@/lib/riesgo";
import type { NivelRiesgo } from "@/lib/types";

/**
 * Tarjeta de alerta del design system: cabecera en el color del riesgo con la acción en
 * versalitas y el tiempo de espera, y el cuerpo sobre superficie blanca.
 *
 * La cabecera usa el tono `-cabecera`, que es el del nivel desaturado hacia la tinta cálida:
 * en una cola de veinte alertas el rojo pleno se vuelve ruido y deja de señalar nada. El texto
 * blanco encima se mantiene sobre 5:1 para que se lea a un metro de distancia.
 */

interface TarjetaAlertaProps {
  nivel: NivelRiesgo;
  encabezado: string;
  at: string;
  children: React.ReactNode;
}

export function TarjetaAlerta({ nivel, encabezado, at, children }: TarjetaAlertaProps) {
  const tono = TONO_RIESGO[nivel];

  return (
    <div className="card-alta overflow-hidden" style={{ borderColor: tono.borde }}>
      <div
        className="flex items-center justify-between gap-3 px-3 py-1.5"
        style={{ background: `var(--riesgo-${nivel}-cabecera)` }}
      >
        <span
          className="etiqueta truncate"
          style={{ color: "#ffffff", letterSpacing: "0.14em" }}
        >
          {encabezado}
        </span>
        <span
          className="tabular shrink-0 text-[11px]"
          style={{ color: "color-mix(in srgb, #ffffff 78%, transparent)" }}
          title={fechaHora(at)}
        >
          hace {haceCuanto(at)}
        </span>
      </div>
      <div className="flex flex-col gap-2 p-3">{children}</div>
    </div>
  );
}
