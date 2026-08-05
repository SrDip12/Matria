import type { NivelRiesgo } from "@/lib/types";

interface TonoRiesgo {
  punto: string;
  texto: string;
  fondo: string;
  borde: string;
}

export const TONO_RIESGO: Record<NivelRiesgo, TonoRiesgo> = {
  alto: { punto: "#C1121F", texto: "#8A0A17", fondo: "#FDECEE", borde: "#F5C2C9" },
  medio: { punto: "#C97A05", texto: "#8A5403", fondo: "#FDF4E3", borde: "#F0DCB4" },
  bajo: { punto: "#1F8A5B", texto: "#145C3D", fondo: "#EDF7F1", borde: "#C7E3D4" },
};

export const NIVEL_COLOR: Record<NivelRiesgo, string> = {
  alto: TONO_RIESGO.alto.punto,
  medio: TONO_RIESGO.medio.punto,
  bajo: TONO_RIESGO.bajo.punto,
};

/** Píldora de riesgo del design system. Las variantes viven en globals.css. */
export const CLASE_TAG: Record<NivelRiesgo, string> = {
  alto: "tag tag-alto",
  medio: "tag tag-medio",
  bajo: "tag tag-bajo",
};

/**
 * Qué hace la matrona con esta fila, en una palabra. Es la etiqueta que el design system usa
 * en la columna de riesgo del panel priorizado: dice la acción, no el nombre de la categoría.
 */
export const ACCION_RIESGO: Record<NivelRiesgo, string> = {
  alto: "Escalar",
  medio: "Revisar",
  bajo: "Normal",
};
