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
