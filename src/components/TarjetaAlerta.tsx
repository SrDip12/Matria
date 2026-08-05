"use client";

import { fechaHora, haceCuanto } from "@/lib/formato";
import { TONO_RIESGO } from "@/lib/riesgo";
import type { NivelRiesgo } from "@/lib/types";

/**
 * Tarjeta de alerta del design system: cabecera en el color del riesgo con la acción en
 * versalitas y el tiempo de espera, y el cuerpo sobre superficie blanca.
 *
 * La cabecera del riesgo medio usa la tinta oscura en vez del punto: el ámbar puro con texto
 * blanco encima queda bajo el contraste mínimo y esto se lee a un metro de distancia.
 */

interface TarjetaAlertaProps {
  nivel: NivelRiesgo;
  encabezado: string;
  at: string;
  children: React.ReactNode;
}

export function TarjetaAlerta({ nivel, encabezado, at, children }: TarjetaAlertaProps) {
  const tono = TONO_RIESGO[nivel];
  const fondoCabecera = nivel === "alto" ? tono.punto : tono.texto;

  return (
    <div className="card-alta overflow-hidden" style={{ borderColor: tono.borde }}>
      <div
        className="flex items-center justify-between gap-3 px-3 py-1.5"
        style={{ background: fondoCabecera }}
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
