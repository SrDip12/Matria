"use client";

import { IconoFicha, IconoLazo } from "@/components/Iconos";
import { LogoMatria } from "@/components/LogoMatria";

export type Demo = "matrona" | "paciente";

/**
 * Primera pantalla: elige desde qué lado se mira el mismo caso.
 *
 * Es una puerta, no una etapa del recorrido. La rúbrica premia que el jurado vea el mensaje
 * entrar y la alerta salir en la misma pantalla, así que desde acá se entra directo a la
 * pantalla dividida y esta vista no vuelve a aparecer sola.
 *
 * Columna alineada a la izquierda y no centrada: el design system no centra texto largo, y la
 * frase con la que el producto se presenta tiene que leerse como titular, no como eslogan.
 */

interface Puerta {
  id: Demo;
  zona: string;
  titulo: string;
  descripcion: string;
  detalle: string[];
  Icono: typeof IconoLazo;
}

const PUERTAS: Puerta[] = [
  {
    id: "paciente",
    Icono: IconoLazo,
    zona: "Seguimiento de la puérpera",
    titulo: "Soy la puérpera",
    descripcion:
      "Completas tu ficha de ingreso en tres pasos, empiezas a contarle al acompañamiento cómo estás y ves qué pasó con lo que contaste.",
    detalle: [
      "Ficha de ingreso en tres pasos",
      "Chat con el acompañamiento",
      "Mis avisos y cómo he estado",
    ],
  },
  {
    id: "matrona",
    Icono: IconoFicha,
    zona: "Panel de la matrona",
    titulo: "Soy la matrona",
    descripcion:
      "Partes en el resumen de tu cohorte y desde ahí entras a la ficha de cada puérpera, con su conversación al lado.",
    detalle: [
      "Resumen de la cohorte en la ventana de 42 días",
      "Lista priorizada por gravedad",
      "Ficha del caso con su conversación",
    ],
  },
];

function TarjetaVista({ puerta, onEntrar }: { puerta: Puerta; onEntrar: () => void }) {
  return (
    <div className="card flex flex-col gap-2.5 p-5 transition-colors hover:border-[var(--marca-200)]">
      <p className="etiqueta flex items-center gap-2">
        <puerta.Icono size={15} />
        {puerta.zona}
      </p>
      <h2 className="subtitulo">{puerta.titulo}</h2>
      <p className="flex-1 text-[13.5px] leading-relaxed text-pretty suave">{puerta.descripcion}</p>
      <ul className="flex flex-col gap-1.5">
        {puerta.detalle.map((linea) => (
          <li
            key={linea}
            className="border-l-2 pl-2.5 text-[12.5px] leading-normal text-pretty tenue"
            style={{ borderColor: "var(--color-border)" }}
          >
            {linea}
          </li>
        ))}
      </ul>
      <div className="pt-1">
        <button type="button" onClick={onEntrar} className="btn btn-primary">
          Entrar →
        </button>
      </div>
    </div>
  );
}

export function Inicio({ onElegir }: { onElegir: (demo: Demo) => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="vista-entra mx-auto flex w-full max-w-[860px] flex-col gap-7 px-6 pt-14 pb-10">
        <div className="flex flex-col gap-3">
          <LogoMatria fill="var(--marca-500)" size={44} />
          <h1 className="display">Acompañamiento longitudinal del puerperio</h1>
          <p className="max-w-[560px] text-[15px] leading-relaxed text-pretty suave">
            Los 42 días que el sistema de salud no mira. Matria sigue a la puérpera desde su
            teléfono, interpreta lo que ella cuenta y entrega al equipo clínico una cola
            priorizada.
          </p>
        </div>

        <div>
          <p className="etiqueta mb-3">Elige desde dónde mirar</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {PUERTAS.map((puerta) => (
              <TarjetaVista
                key={puerta.id}
                puerta={puerta}
                onEntrar={() => onElegir(puerta.id)}
              />
            ))}
          </div>
        </div>

        <p className="text-xs leading-relaxed text-pretty tenue">
          Demo con cohorte sintética: ninguna puérpera de estas pantallas es real. El sistema no
          diagnostica: detecta, prioriza y escala al profesional.
        </p>
      </div>
    </div>
  );
}
