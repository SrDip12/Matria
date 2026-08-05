/**
 * Lo que el sistema le responde a la puérpera, y con qué la deja hablando.
 *
 * Texto determinístico, no generado. Es el "loop de seguimiento" de CLAUDE.md §9B en su versión
 * de reglas: qué se pregunta después de un hallazgo no es una decisión creativa, el protocolo ya
 * lo tiene escrito. Nada de esto es la `accion_sugerida` de la evaluación, que está redactada
 * para la matrona y no para ella.
 *
 * La regla que ordena todo esto: **la alerta no espera a la respuesta**. Si el relato ya alcanza
 * para escalar, la alerta se crea en el mismo momento y estas preguntas salen junto con ella,
 * nunca antes. §1.1 no admite diferir una señal ni bajar de categoría por falta de datos, y §4
 * y §3.1 dicen explícitamente qué hacer cuando ella no tiene con qué medir: se escala igual. Lo
 * que las preguntas agregan es la cuantificación que la matrona necesita para priorizar y para
 * llegar a la telellamada sabiendo cuánto es "harto".
 */
import type { Hallazgos, NivelRiesgo, Sospecha } from "../types.ts";

/** Cómo abre la respuesta, según lo que corresponde hacer hoy (§1.1). */
const RECONOCIMIENTO: Record<NivelRiesgo, string> = {
  bajo:
    "Gracias por contarme cómo estás, me deja tranquila saberlo. En lo que me escribiste no " +
    "aparecen señales de alarma, así que seguimos con el control habitual.",
  medio:
    "Gracias por contarme, hiciste bien en avisarme. Acá hay algo que tu matrona tiene que " +
    "revisar hoy: ya se lo dejé marcado y ella te va a contactar.",
  alto:
    "Gracias por contarme. Lo que me describes es una señal que no puede esperar: tu matrona ya " +
    "quedó alertada y te va a llamar. Acude a urgencias de inmediato, no lo dejes para más rato.",
};

/**
 * Las preguntas de cuantificación de cada cuadro, en las palabras de ella. Salen del protocolo:
 * §4 trae las suyas literales y en orden; el resto son los criterios que esa sección usa para
 * separar señal de alarma de signo de emergencia, convertidos en pregunta.
 */
const CUANTIFICAR: Record<Exclude<Sospecha, "sin_hallazgos">, string> = {
  // §4 — las cuatro preguntas del protocolo, en su orden.
  hemorragia_tardia:
    "Necesito que me lo cuantifiques para que tu matrona sepa de cuánto estamos hablando: " +
    "¿cuántas toallas has usado en la última hora? ¿Se te llenan completas o quedan a medias? " +
    "¿El sangrado está aumentando, sigue igual, o había bajado y volvió a subir? Y los coágulos, " +
    "¿son como una moneda o más grandes?",
  // §2 — la mayoría no tiene esfigmomanómetro; se pregunta la cifra y, si no hay, los signos.
  preeclampsia_postparto:
    "¿Tienes cómo tomarte la presión, en la casa o en el consultorio? Si te la tomaste, dime los " +
    "números. Cuéntame también si el dolor de cabeza cede con algo, si ves lucecitas o borroso, " +
    "si te zumban los oídos, o si te duele la boca del estómago.",
  // §3.1 — "sostenida" son dos mediciones separadas por 6 horas: por eso se pregunta la hora.
  endometritis:
    "¿Tienes termómetro? Si te tomaste la temperatura, dime cuánto marcó y a qué hora, y si te la " +
    "habías tomado antes hoy. Si no tienes, cuéntame igual: ¿te duele el bajo vientre, sientes " +
    "mal olor, andas con el cuerpo malo?",
  // §3.2 — la fiebre es lo que separa la curación de la evaluación médica.
  infeccion_herida_operatoria:
    "¿Cómo se ve la herida: está colorada, hinchada, te duele al tocarla? ¿Le sale líquido o pus, " +
    "tiene mal olor? ¿Se te abrió en alguna parte? ¿Has tenido fiebre?",
  // §5.1 — el mal olor de la secreción es el umbral que escala.
  mastitis:
    "¿Es un pecho o los dos? ¿Está colorado y caliente al tacto? ¿Has tenido fiebre o el cuerpo " +
    "malo? ¿Sale alguna secreción con mal olor?",
  // §6 — cualquiera de estas, sola, ya es emergencia; se preguntan las demás igual.
  tromboembolismo:
    "Cuéntame si te falta el aire, si te duele el pecho al respirar, o si sientes que te vas a " +
    "desmayar. ¿Tienes una pierna más hinchada que la otra, caliente o colorada, que te duela al " +
    "caminar?",
  // §7 — el agente no aplica ni puntúa la EPDS: solo registra lo que ella cuenta.
  depresion_postparto:
    "¿Desde cuándo te sientes así? ¿Hay alguien en la casa acompañándote estos días? Cuéntame lo " +
    "que necesites, acá te leo sin apuro y sin juzgarte.",
  // §5.2 — los cuatro criterios que la convierten en señal de alarma.
  dificultad_lactancia:
    "¿Te duele cuando le das pecho? ¿Tienes grietas en el pezón? ¿Se prende bien o te cuesta " +
    "acomodarla? ¿Sientes que está quedando con hambre?",
};

/**
 * Signos de shock en las palabras que ella puede reportar (§4). Van cada vez que hay sangrado en
 * juego: son lo que separa una señal de alarma de una emergencia y ella no los va a mencionar
 * sola, porque no sabe que se preguntan.
 */
const SHOCK =
  "Dime también si has sentido mareo al pararte, sudor frío, que se te va la vista, que andas " +
  "muy pálida o el corazón acelerado.";

/** Contacto programado del día cuando no hay nada que cuantificar (§9). */
function preguntaDelDia(dia: number): string {
  if (dia <= 7)
    return (
      "¿Cómo va el sangrado estos días, y cómo te ha ido con la lactancia? Cuéntame también si " +
      "notas mal olor o si has andado afiebrada."
    );
  if (dia <= 14)
    return "¿Alcanzaste a ir al control de díada? ¿Y cómo va el sangrado y la lactancia?";
  if (dia <= 28)
    return "¿Cómo va la lactancia? ¿Has notado las piernas hinchadas o que volvió el sangrado?";
  return "¿Y cómo has andado de ánimo estos días? Cuéntame con confianza, aunque no sea nada físico.";
}

const INVITACION: Record<NivelRiesgo, string> = {
  bajo: "Cualquier cosa que te preocupe, aunque te parezca chica, escríbeme.",
  medio: "Quédate conmigo: cuéntame si algo cambia o si aparece algo nuevo.",
  alto: "Respóndeme mientras vas en camino si puedes, te sigo leyendo.",
};

export interface SalidaParaElla {
  nivel_riesgo: NivelRiesgo;
  sospechas: Sospecha[];
  hallazgos: Hallazgos;
}

/** Lo que el sistema escribe en el chat después de evaluar un mensaje. */
export function respuestaParaElla(salida: SalidaParaElla, dia: number): string {
  const principal = salida.sospechas.find((s) => s !== "sin_hallazgos");

  const preguntas: string[] = [];
  if (principal) preguntas.push(CUANTIFICAR[principal]);
  else preguntas.push(preguntaDelDia(dia));

  // El shock no cuelga solo de la sospecha: un sangrado aumentado sin categoría todavía también
  // lo necesita, y es la pregunta que puede subir el caso de señal de alarma a emergencia.
  if (principal === "hemorragia_tardia" || salida.hallazgos.sangrado_aumentado === true)
    preguntas.push(SHOCK);

  return [RECONOCIMIENTO[salida.nivel_riesgo], ...preguntas, INVITACION[salida.nivel_riesgo]].join(
    " "
  );
}
