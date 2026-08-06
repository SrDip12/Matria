import type { TipoParto } from "@/lib/types";

export const ETIQUETA_PARTO: Record<TipoParto, string> = {
  vaginal: "vaginal",
  cesarea: "cesárea",
};

/**
 * La cohorte sintética guarda la etiqueta como `Antonia M. · PM-042`: nombre de pila con
 * inicial, más un código de caso que desambigua homónimas en el panel. Acá se separan para
 * mostrar cada parte donde corresponde — el código es dato tabular, no nombre.
 */
export function partirEtiqueta(nombre: string): [string, string] {
  const corte = nombre.indexOf(" · ");
  return corte === -1 ? [nombre, ""] : [nombre.slice(0, corte), nombre.slice(corte + 3)];
}

const FECHA = new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short", year: "numeric" });
const FECHA_HORA = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/** Fecha ISO a texto local. Devuelve null si viene vacía, para que el consumidor decida qué mostrar. */
export function fecha(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : FECHA.format(d);
}

export function fechaHora(iso: string): string {
  return FECHA_HORA.format(new Date(iso));
}

const HORA = new Intl.DateTimeFormat("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false });

/** Solo la hora, para la marca bajo cada burbuja del hilo. */
export function hora(iso: string): string {
  return HORA.format(new Date(iso));
}

/**
 * Cuánto lleva esperando algo, en la unidad más grande que todavía dice algo útil.
 *
 * Solo se llama desde componentes cliente después del primer fetch, así que no hay riesgo de
 * que el servidor y el navegador rendericen relojes distintos.
 */
export function haceCuanto(iso: string): string {
  const minutos = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60_000));
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `${horas} h`;
  return `${Math.floor(horas / 24)} d`;
}
