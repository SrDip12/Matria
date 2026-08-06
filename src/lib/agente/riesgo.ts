/**
 * Reglas duras. Corren DESPUÉS del modelo y sobre su salida ya validada.
 *
 * Están en código y no solo en el prompt porque un modelo puede tener un mal día y estas
 * tres no admiten un mal día. El prompt también las dice; esto es el respaldo determinístico.
 *
 * Si Vale define más reglas absolutas, van acá.
 */
import type { ContextoPuerpera, SalidaAgente } from "./evaluar.ts";
import type { Sospecha } from "../types.ts";
import { SECCIONES } from "./prompt.ts";

/** Protocolo §7.2 — cualquier señal de ideación escala a alto, en cualquier día. */
const SECCION_IDEACION = "§7.2";
/** Protocolo §6 — cualquier señal de evento tromboembólico escala directo a alto. */
const SECCION_TROMBOEMBOLISMO = "§6";
/** Protocolo §8 — excepción única: antecedente hipertensivo + cualquier señal de §2. */
const SECCION_EXCEPCION_8 = "§8";
/** Protocolo §2 — dos o más signos de emergencia escalan aunque no haya cifra de presión. */
const SECCION_PREECLAMPSIA = "§2";

// Estas citas las pone el código, así que también tienen que existir. Si alguien renumera
// el protocolo, esto cae al arrancar en vez de mostrarle a la matrona una cita fantasma.
for (const seccion of [
  SECCION_IDEACION,
  SECCION_TROMBOEMBOLISMO,
  SECCION_EXCEPCION_8,
  SECCION_PREECLAMPSIA,
])
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

export function aplicarReglasDuras(
  salida: SalidaAgente,
  contexto?: Pick<ContextoPuerpera, "antecedenteTrastornoHipertensivo">
): SalidaAgente {
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

  // Signos de emergencia de §2 que el contrato representa como hallazgo. El protocolo lista
  // además tinitus, alteración de conciencia y convulsión, que no tienen campo y por lo tanto
  // no se pueden contar: la cuenta queda corta, nunca larga. Por eso solo se usa para escalar
  // —el modelo sí los ve en el relato y puede clasificar alto por su cuenta.
  const signosDe2 = [
    resultado.hallazgos.cefalea_intensa,
    resultado.hallazgos.alteracion_visual,
    resultado.hallazgos.dolor_epigastrico,
  ].filter((h) => h === true).length;

  // §2 — la mayoría de las puérperas no tiene esfigmomanómetro en la casa. El protocolo es
  // explícito: dos o más signos de emergencia escalan aunque no exista ninguna medición de
  // presión. Estaba solo en el prompt; acá queda determinístico, porque es justo el caso que
  // el sistema existe para no perder.
  if (signosDe2 >= 2)
    resultado = escalar(
      resultado,
      SECCION_PREECLAMPSIA,
      "preeclampsia_postparto",
      "dos o más signos de emergencia de §2 sin cifra de presión"
    );

  // §8, excepción única: antecedente de trastorno hipertensivo del embarazo + cualquier señal
  // de §2, aislada y sin cifra de presión, también escala directo a alto. Antes solo vivía en
  // el prompt (factores.ts se lo nombra al modelo); acá queda con el mismo respaldo que las
  // otras dos reglas absolutas.
  if (contexto?.antecedenteTrastornoHipertensivo && signosDe2 >= 1)
    resultado = escalar(
      resultado,
      SECCION_EXCEPCION_8,
      "preeclampsia_postparto",
      "antecedente de trastorno hipertensivo del embarazo + señal de §2 (excepción única de §8)"
    );

  return resultado;
}
