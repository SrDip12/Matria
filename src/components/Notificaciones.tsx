"use client";

import { TarjetaAlerta } from "@/components/TarjetaAlerta";
import { fecha, fechaHora, haceCuanto } from "@/lib/formato";
import type { FilaPanel, NivelRiesgo } from "@/lib/types";

/**
 * Avisos de la puérpera: lo que el sistema hizo con lo que ella contó.
 *
 * Acá nunca aparece el nombre de una sospecha ni un nivel de riesgo. Lo que ella necesita
 * saber es qué pasó después de escribir —que alguien lo leyó y quién viene en camino—, y eso
 * es exactamente lo que la columna "Acción" de §1.1 del protocolo define para cada categoría.
 * El nombre clínico es para la matrona; a ella se le dice qué hacer, no qué tiene.
 */

interface NotificacionesProps {
  fila: FilaPanel | null;
}

interface Aviso {
  id: string;
  at: string;
  encabezado: string;
  titulo: string;
  detalle: string;
  cita?: string;
  nivel?: NivelRiesgo;
}

/**
 * §2 y §3.1: lo que el protocolo pide no dejar pasar. En sus palabras, no en las del protocolo:
 * el protocolo dice "loquios" y ella dice sangrado, así que acá dice sangrado. El nombre clínico
 * vive en el prompt del agente y en la ficha de la matrona, que es donde sirve.
 */
const SENALES = [
  "Dolor de cabeza que no se te pasa, ver borroso o zumbido en los oídos",
  "Fiebre, o sentir que tienes fiebre aunque no la puedas medir",
  "Sangrado que aumenta en vez de ir bajando",
  "Sangrado con mal olor",
  "Dolor fuerte en la guata o en la herida, o que la herida se ponga roja o supure",
  "Hinchazón o dolor en una sola pierna, o que te falte el aire",
  "Ganas de no seguir, o pensamientos de hacerte daño",
];

function avisos(fila: FilaPanel): Aviso[] {
  const lista: Aviso[] = [];

  for (const alerta of fila.alertas_pendientes) {
    const esAlto = alerta.nivel === "alto";
    lista.push({
      id: alerta.id,
      at: alerta.created_at,
      encabezado: esAlto ? "Atención inmediata" : "Tu matrona ya sabe",
      titulo: esAlto ? "Anda a urgencias ahora" : "Te va a contactar hoy",
      detalle: esAlto
        ? "Por lo que contaste, esto no puede esperar. Tu matrona ya fue avisada y te va a llamar mientras tanto."
        : "Le llegó lo que escribiste y va a revisar tu caso durante el día. Si algo cambia antes, escríbelo acá.",
      cita: alerta.cita_protocolo,
      nivel: alerta.nivel,
    });
  }

  const completada = fila.puerpera.ficha_extendida?.completada_at;
  if (completada) {
    lista.push({
      id: "ficha",
      at: completada,
      encabezado: "Ficha de ingreso",
      titulo: "Tu matrona ya tiene tus antecedentes",
      detalle:
        "Con eso el acompañamiento sabe qué mirar con más cuidado en tu caso durante estas semanas.",
    });
  }

  lista.push({
    id: "inicio",
    at: fila.puerpera.fecha_parto,
    encabezado: "Seguimiento",
    titulo: `Vas en el día ${fila.puerpera.dia_puerperio} de 42`,
    detalle: `Te vamos a acompañar los 42 días posteriores al parto del ${fecha(fila.puerpera.fecha_parto)}.`,
  });

  return lista.sort((a, b) => b.at.localeCompare(a.at));
}

export function Notificaciones({ fila }: NotificacionesProps) {
  if (!fila) {
    return (
      <p className="sin-datos leading-relaxed text-pretty">
        Todavía no hay avisos. Cuando escribas algo, acá te vamos a contar qué pasó con eso.
      </p>
    );
  }

  const lista = avisos(fila);

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-2" aria-live="polite">
        {lista.map((aviso) =>
          aviso.nivel ? (
            <li key={aviso.id}>
              <TarjetaAlerta nivel={aviso.nivel} encabezado={aviso.encabezado} at={aviso.at}>
                <p className="subtitulo">{aviso.titulo}</p>
                <p className="text-[13.5px] leading-relaxed text-pretty">{aviso.detalle}</p>
                {aviso.cita && (
                  <p className="tabular text-[11px] tenue">Protocolo {aviso.cita}</p>
                )}
              </TarjetaAlerta>
            </li>
          ) : (
            <li key={aviso.id} className="card flex flex-col gap-1.5 p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="etiqueta">{aviso.encabezado}</h3>
                <span className="tabular shrink-0 text-[11px] tenue" title={fechaHora(aviso.at)}>
                  hace {haceCuanto(aviso.at)}
                </span>
              </div>
              <p className="text-[14px] font-medium" style={{ color: "var(--color-titulo)" }}>
                {aviso.titulo}
              </p>
              <p className="text-[13.5px] leading-relaxed text-pretty suave">{aviso.detalle}</p>
            </li>
          )
        )}
      </ol>

      <section className="card p-4">
        <h3 className="etiqueta">Escríbelo apenas lo notes</h3>
        <p className="mt-1.5 mb-3 text-xs leading-relaxed text-pretty tenue">
          No esperes a que te toque la pregunta del día. Si te pasa algo de esto, cuéntalo en el
          chat: tu matrona lo ve al momento.
        </p>
        <ul className="flex flex-col gap-1.5">
          {SENALES.map((senal) => (
            <li
              key={senal}
              className="border-l-2 pl-2.5 text-[13px] leading-relaxed text-pretty"
              style={{ borderColor: "var(--marca-200)" }}
            >
              {senal}
            </li>
          ))}
        </ul>
        <p className="tabular mt-3 text-[11px] tenue">Protocolo §2 y §3</p>
      </section>
    </div>
  );
}
