import { NIVEL_COLOR } from "@/lib/riesgo";
import { DIAS_PUERPERIO, type NivelRiesgo } from "@/lib/types";

interface Franja42Props {
  franja: (NivelRiesgo | null)[];
  diaActual: number;
}

/**
 * Elemento firma: los 42 días del puerperio en una sola línea.
 *
 * Tres estados que antes se veían iguales y no lo son:
 *   - celda en color: hubo contacto y esa fue la señal más grave del día;
 *   - celda gris: el día pasó y ella no escribió — una ausencia, no un "todo bien";
 *   - celda casi en blanco: el día todavía no llega.
 *
 * El corte de semana se marca con un espacio, no con una línea: la matrona razona en semanas
 * ("la primera es la de la hemorragia") y sin el corte hay que contar celdas con el dedo.
 */
export function Franja42({ franja, diaActual }: Franja42Props) {
  const contactos = franja.filter(Boolean).length;

  return (
    <div
      className="flex items-end gap-px"
      role="img"
      aria-label={`Franja del puerperio: día ${diaActual} de ${DIAS_PUERPERIO}, con ${contactos} días de contacto registrados.`}
    >
      {franja.map((nivel, indice) => {
        const dia = indice + 1;
        const esActual = dia === diaActual;
        const futuro = dia > diaActual;
        return (
          <div
            key={dia}
            title={
              nivel
                ? `Día ${dia} — riesgo ${nivel}`
                : futuro
                  ? `Día ${dia} — aún no llega`
                  : `Día ${dia} — sin contacto`
            }
            className={`min-w-0 flex-1 rounded-[1.5px] ${esActual ? "h-4 outline-1 outline-offset-1 outline-[var(--marca-500)]" : "h-3"} ${dia % 7 === 0 && dia !== DIAS_PUERPERIO ? "mr-1.5" : ""}`}
            style={{
              background: nivel
                ? NIVEL_COLOR[nivel]
                : futuro
                  ? "color-mix(in srgb, var(--color-linea) 55%, transparent)"
                  : "var(--color-linea)",
            }}
          />
        );
      })}
    </div>
  );
}
