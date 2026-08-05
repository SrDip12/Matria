import { NIVEL_COLOR } from "@/lib/riesgo";
import type { NivelRiesgo } from "@/lib/types";

interface Franja42Props {
  franja: (NivelRiesgo | null)[];
  diaActual: number;
}

export function Franja42({ franja, diaActual }: Franja42Props) {
  return (
    <div className="flex gap-px" role="img" aria-label={`Día ${diaActual} de 42 del puerperio`}>
      {franja.map((nivel, indice) => {
        const dia = indice + 1;
        const esActual = dia === diaActual;
        return (
          <div
            key={dia}
            title={nivel ? `Día ${dia} — riesgo ${nivel}` : `Día ${dia} — sin contacto`}
            className={esActual ? "h-3 flex-1 ring-1 ring-[var(--color-accent)]" : "h-3 flex-1"}
            style={{ background: nivel ? NIVEL_COLOR[nivel] : "var(--color-divider)" }}
          />
        );
      })}
    </div>
  );
}
