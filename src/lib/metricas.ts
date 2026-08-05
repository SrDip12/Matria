/**
 * Métricas del panel de la matrona.
 *
 * Todo sale de las filas que `/api/panel` ya devuelve en cada poll: ninguna consulta nueva,
 * ninguna columna nueva. Es la misma respuesta leída de otra manera, así que el dashboard se
 * refresca al mismo ritmo que la lista y nunca muestra un número de hace tres segundos.
 */
import { DIAS_PUERPERIO, type FilaPanel, type NivelRiesgo, type Sospecha } from "@/lib/types";

/**
 * Días sin ningún contacto tras los que la matrona debería ir a buscarla. El silencio en el
 * puerperio no es ausencia de dato: es un dato. Umbral operativo del panel, no del protocolo.
 */
export const DIAS_SILENCIO = 3;

const nivelesEnCero = (): Record<NivelRiesgo, number> => ({ alto: 0, medio: 0, bajo: 0 });

/**
 * Días transcurridos desde el último contacto. `null` = nunca escribió, que no es lo mismo que
 * cero: es la misma regla de los hallazgos, un blanco no se lee como respuesta.
 */
export function diasSinContacto(fila: FilaPanel): number | null {
  const hasta = Math.min(fila.puerpera.dia_puerperio, DIAS_PUERPERIO);
  for (let dia = hasta; dia >= 1; dia--) {
    if (fila.franja[dia - 1]) return hasta - dia;
  }
  return null;
}

export interface Metricas {
  total: number;
  /** Puérperas por nivel de riesgo vigente. */
  porNivel: Record<NivelRiesgo, number>;
  alertasPendientes: number;
  alertasPorNivel: Record<NivelRiesgo, number>;
  /** La alerta pendiente más antigua sin resolver. `null` si no hay ninguna. */
  esperaMasLarga: { creadaAt: string; fila: FilaPanel } | null;
  /** Puérperas con `DIAS_SILENCIO` o más sin escribir, incluidas las que nunca escribieron. */
  sinContacto: number;
  /** Contactaron en el día de puerperio en que están hoy. */
  contactadasHoy: number;
  /** En los días 1 a 7: el tramo donde el protocolo concentra la hemorragia y la infección. */
  primeraSemana: number;
  /** Onboarding terminado. La cohorte sembrada no lo tiene y eso es parte del dato. */
  fichasCompletas: number;
  /** Señales activas, de la más frecuente a la menos. Nunca incluye `sin_hallazgos`. */
  sospechas: { sospecha: Sospecha; total: number }[];
  /** 42 posiciones: cuántas señales de cada nivel cayeron ese día del puerperio, en la cohorte. */
  alertasPorDia: { alto: number; medio: number }[];
  /** 42 posiciones: cuántas puérperas están hoy en ese día. */
  puerperasPorDia: number[];
}

export function metricas(filas: FilaPanel[]): Metricas {
  const porNivel = nivelesEnCero();
  const alertasPorNivel = nivelesEnCero();
  const conteoSospechas = new Map<Sospecha, number>();
  const alertasPorDia = Array.from({ length: DIAS_PUERPERIO }, () => ({ alto: 0, medio: 0 }));
  const puerperasPorDia = Array<number>(DIAS_PUERPERIO).fill(0);

  let alertasPendientes = 0;
  let sinContacto = 0;
  let contactadasHoy = 0;
  let primeraSemana = 0;
  let fichasCompletas = 0;
  let esperaMasLarga: Metricas["esperaMasLarga"] = null;

  for (const fila of filas) {
    porNivel[fila.nivel_riesgo] += 1;

    for (const alerta of fila.alertas_pendientes) {
      alertasPendientes += 1;
      alertasPorNivel[alerta.nivel] += 1;
      if (!esperaMasLarga || alerta.created_at < esperaMasLarga.creadaAt) {
        esperaMasLarga = { creadaAt: alerta.created_at, fila };
      }
    }

    const silencio = diasSinContacto(fila);
    if (silencio === null || silencio >= DIAS_SILENCIO) sinContacto += 1;
    if (silencio === 0) contactadasHoy += 1;

    if (fila.puerpera.ficha_extendida?.completada_at) fichasCompletas += 1;

    if (fila.nivel_riesgo !== "bajo") {
      for (const sospecha of fila.ultima_evaluacion?.sospechas ?? []) {
        if (sospecha === "sin_hallazgos") continue;
        conteoSospechas.set(sospecha, (conteoSospechas.get(sospecha) ?? 0) + 1);
      }
    }

    const dia = fila.puerpera.dia_puerperio;
    if (dia >= 1 && dia <= DIAS_PUERPERIO) puerperasPorDia[dia - 1] += 1;
    if (dia >= 1 && dia <= 7) primeraSemana += 1;

    fila.franja.forEach((nivel, indice) => {
      if (nivel === "alto" || nivel === "medio") alertasPorDia[indice][nivel] += 1;
    });
  }

  return {
    total: filas.length,
    porNivel,
    alertasPendientes,
    alertasPorNivel,
    esperaMasLarga,
    sinContacto,
    contactadasHoy,
    primeraSemana,
    fichasCompletas,
    sospechas: [...conteoSospechas.entries()]
      .map(([sospecha, total]) => ({ sospecha, total }))
      .sort((a, b) => b.total - a.total),
    alertasPorDia,
    puerperasPorDia,
  };
}

/** Porcentaje entero. Sin cohorte no hay porcentaje: `null`, no un cero que se lee como dato. */
export function porcentaje(parte: number, total: number): number | null {
  return total === 0 ? null : Math.round((parte / total) * 100);
}
