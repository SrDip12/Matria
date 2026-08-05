/**
 * Reglas duras. Corren DESPUÉS del modelo y sobre su salida ya validada.
 *
 * Están en código y no solo en el prompt porque un modelo puede tener un mal día y estas
 * dos no admiten un mal día. El prompt también las dice; esto es el respaldo determinístico.
 *
 * Si Vale define más reglas absolutas, van acá.
 */
import type { SalidaAgente } from "./evaluar.ts";
import type { Sospecha } from "../types.ts";
import { SECCIONES } from "./prompt.ts";

/** Protocolo §7.2 — cualquier señal de ideación escala a alto, en cualquier día. */
const SECCION_IDEACION = "§7.2";
/** Protocolo §6 — cualquier señal de evento tromboembólico escala directo a alto. */
const SECCION_TROMBOEMBOLISMO = "§6";

// Estas citas las pone el código, así que también tienen que existir. Si alguien renumera
// el protocolo, esto cae al arrancar en vez de mostrarle a la matrona una cita fantasma.
for (const seccion of [SECCION_IDEACION, SECCION_TROMBOEMBOLISMO])
  if (!SECCIONES.has(seccion))
    throw new Error(
      `[agente] las reglas duras citan ${seccion} y esa sección no existe en el protocolo. ` +
        `Alguien renumeró docs/PROTOCOLO_CLINICO.md: avisar a Vale antes de seguir.`
    );

function escalar(
  salida: SalidaAgente,
  cita: string,
  sospecha: Sospecha,
  motivo: string
): SalidaAgente {
  // Si ya venía en alto, se respeta la cita y el razonamiento del modelo: probablemente
  // son más específicos. Solo nos aseguramos de que la sospecha quede registrada.
  const yaEstabaAlto = salida.nivel_riesgo === "alto";

  // "sin_hallazgos" y riesgo alto no pueden convivir: dejaría la fila del panel incoherente.
  const sospechas: Sospecha[] = salida.sospechas.filter((s) => s !== "sin_hallazgos");
  if (!sospechas.includes(sospecha)) sospechas.push(sospecha);

  return {
    ...salida,
    nivel_riesgo: "alto",
    cita_protocolo: yaEstabaAlto ? salida.cita_protocolo : cita,
    sospechas,
    // Sin esto la matrona lee una alerta alta con un razonamiento que justifica otra cosa.
    razonamiento: yaEstabaAlto
      ? salida.razonamiento
      : `Escalado a riesgo alto por ${cita} (${motivo}). ${salida.razonamiento}`,
  };
}

export function aplicarReglasDuras(salida: SalidaAgente): SalidaAgente {
  let resultado = salida;

  if (resultado.hallazgos.ideacion_autolitica === true)
    resultado = escalar(
      resultado,
      SECCION_IDEACION,
      "depresion_postparto",
      "ideación autolítica referida"
    );

  // §6 no exige combinación: cualquiera de sus señales, aislada, es signo de emergencia.
  // Por eso no basta con mirar la sospecha que puso el modelo; se miran los hallazgos.
  if (
    resultado.sospechas.includes("tromboembolismo") ||
    resultado.hallazgos.disnea === true ||
    resultado.hallazgos.dolor_pantorrilla_unilateral === true
  )
    resultado = escalar(
      resultado,
      SECCION_TROMBOEMBOLISMO,
      "tromboembolismo",
      "señal compatible con evento tromboembólico"
    );

  return resultado;
}
