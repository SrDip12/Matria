/**
 * CONTRATO CONGELADO — hora 1.
 *
 * Este archivo es la única fuente de verdad de las formas de datos del proyecto.
 * Panel y Agente trabajan en paralelo contra esto sin esperarse.
 *
 * NO se modifica en silencio. Cualquier cambio se avisa en voz alta al equipo antes
 * de tocarlo, porque rompe el trabajo de la otra persona en curso.
 */

export type TipoParto = "vaginal" | "cesarea";

export type NivelRiesgo = "bajo" | "medio" | "alto";

export type EstadoAlerta = "pendiente" | "vista" | "resuelta";

export type AutorMensaje = "puerpera" | "sistema";

export type Prevision = "fonasa_a" | "fonasa_b" | "fonasa_c" | "fonasa_d" | "isapre";

/** Categorías de señal de alarma. Vienen del protocolo, no se inventan acá. */
export type Sospecha =
  | "preeclampsia_postparto"
  | "hemorragia_tardia"
  | "endometritis"
  | "mastitis"
  | "infeccion_herida_operatoria"
  | "tromboembolismo"
  | "depresion_postparto"
  | "dificultad_lactancia"
  | "sin_hallazgos";

export interface Puerpera {
  id: string;
  nombre: string;
  edad: number;
  tipo_parto: TipoParto;
  fecha_parto: string; // ISO date
  prevision: Prevision;
  region: string;
  establecimiento: string;
  comorbilidades: string[];
  /** Día actual del puerperio, 1 a 42. Derivado de fecha_parto. */
  dia_puerperio: number;
}

export interface Mensaje {
  id: string;
  puerpera_id: string;
  autor: AutorMensaje;
  texto: string;
  dia_puerperio: number;
  created_at: string;
}

/**
 * Variables clínicas estructuradas que Claude extrae del texto libre.
 * Todo campo desconocido va en null, nunca en false. Un dato ausente no es un dato negativo.
 */
export interface Hallazgos {
  fiebre_referida: boolean | null;
  temperatura_c: number | null;
  dolor_abdominal: boolean | null;
  sangrado_aumentado: boolean | null;
  loquios_mal_olor: boolean | null;
  cefalea_intensa: boolean | null;
  alteracion_visual: boolean | null;
  dolor_epigastrico: boolean | null;
  mastalgia: boolean | null;
  mastalgia_unilateral: boolean | null;
  eritema_mamario: boolean | null;
  dolor_herida: boolean | null;
  secrecion_herida: boolean | null;
  dolor_pantorrilla_unilateral: boolean | null;
  disnea: boolean | null;
  animo_bajo: boolean | null;
  anhedonia: boolean | null;
  ideacion_autolitica: boolean | null;
  dificultad_lactancia: boolean | null;
  texto_relevante: string | null;
}

export interface Evaluacion {
  id: string;
  puerpera_id: string;
  mensaje_id: string;
  dia_puerperio: number;
  hallazgos: Hallazgos;
  nivel_riesgo: NivelRiesgo;
  sospechas: Sospecha[];
  /** Sección del protocolo que justifica la clasificación. Ej: "§3.2" */
  cita_protocolo: string;
  /** Explicación breve para la matrona, no para la puérpera. Máximo 2 frases. */
  razonamiento: string;
  created_at: string;
}

export interface Alerta {
  id: string;
  puerpera_id: string;
  evaluacion_id: string;
  nivel: NivelRiesgo;
  /** Titular corto para la fila del panel. Ej: "Sospecha de endometritis, día 9" */
  titulo: string;
  /** Qué debería hacer la matrona. Nunca una indicación de tratamiento. */
  accion_sugerida: string;
  cita_protocolo: string;
  estado: EstadoAlerta;
  created_at: string;
  resuelta_at: string | null;
}

/** Fila del panel de la matrona: puérpera + su estado actual. */
export interface FilaPanel {
  puerpera: Puerpera;
  ultima_evaluacion: Evaluacion | null;
  alertas_pendientes: Alerta[];
  nivel_riesgo: NivelRiesgo;
  /** 42 posiciones. null = sin contacto ese día. Alimenta la franja de 42 días. */
  franja: (NivelRiesgo | null)[];
}

export interface PreguntaProgramada {
  id: string;
  puerpera_id: string;
  dia_puerperio: number;
  texto: string;
  enviada: boolean;
}

/** Constantes del dominio. */
export const DIAS_PUERPERIO = 42;

export const ETIQUETA_RIESGO: Record<NivelRiesgo, string> = {
  alto: "Riesgo alto",
  medio: "Riesgo medio",
  bajo: "Sin señales de alarma",
};

export const ETIQUETA_SOSPECHA: Record<Sospecha, string> = {
  preeclampsia_postparto: "Preeclampsia postparto",
  hemorragia_tardia: "Hemorragia tardía",
  endometritis: "Endometritis puerperal",
  mastitis: "Mastitis puerperal",
  infeccion_herida_operatoria: "Infección de herida operatoria",
  tromboembolismo: "Evento tromboembólico",
  depresion_postparto: "Sintomatología depresiva",
  dificultad_lactancia: "Dificultad en lactancia",
  sin_hallazgos: "Sin hallazgos",
};
