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
 *
 * Dos cosas que este archivo tiene que garantizar, porque el texto es fijo y la conversación no:
 * no repetir un mensaje que ella ya leyó, y no volver a preguntar algo que ella ya contestó.
 * Lo primero se resuelve mirando los mensajes previos del sistema; lo segundo, mirando los
 * hallazgos que el agente acaba de extraer de su relato.
 */
import type { Hallazgos, NivelRiesgo, Sospecha } from "../types.ts";

/**
 * Cómo abre la respuesta, según lo que corresponde hacer hoy (§1.1). Corto a propósito y sin abrir
 * siempre con "gracias". Son dos aperturas por nivel: la segunda existe solo para no mandar el
 * mismo mensaje exacto dos veces seguidas (ver respuestaParaElla).
 */
const APERTURA: Record<NivelRiesgo, [string, string]> = {
  bajo: [
    "Te leo. No veo señales de alarma; seguimos con el control habitual.",
    "Anotado. Por lo que me cuentas no hay señales de alarma; seguimos como vamos.",
  ],
  medio: [
    "Esto lo tiene que mirar tu matrona hoy: ya se lo dejé marcado.",
    "Hay algo acá para tu matrona; quedó marcado y lo revisa hoy.",
  ],
  alto: [
    "Esto no puede esperar: anda a urgencias ahora. Tu matrona ya quedó alertada.",
    "Necesito que vayas a urgencias de inmediato. Tu matrona ya quedó alertada.",
  ],
};

/**
 * Una pregunta y los hallazgos que resuelve. Si el relato de hoy ya los trae todos, la pregunta
 * no se hace: volver a pedirle la temperatura a alguien que acaba de escribir "37,5" es la forma
 * más rápida de que deje de contestar, y el dato ya está en la evaluación que ve la matrona.
 */
interface Pregunta {
  /** Campos de `Hallazgos` que esta pregunta viene a llenar. Sin esto, siempre se pregunta. */
  resuelve?: (keyof Hallazgos)[];
  texto: string;
}

/**
 * Las preguntas de cuantificación de cada cuadro, en las palabras de ella. Salen del protocolo:
 * §4 trae las suyas literales y en orden; el resto son los criterios que esa sección usa para
 * separar señal de alarma de signo de emergencia, convertidos en pregunta.
 *
 * Cada una se redacta para poder salir sola: se filtran de a una y no siempre salen todas.
 */
const CUANTIFICAR: Record<Exclude<Sospecha, "sin_hallazgos">, Pregunta[]> = {
  // §4 — las cuatro preguntas del protocolo, en su orden. Ninguna tiene campo en el contrato
  // (el volumen y el tamaño del coágulo no son hallazgos), así que van siempre mientras el
  // sangrado siga siendo la sospecha principal.
  hemorragia_tardia: [
    {
      texto:
        "Necesito que me lo cuantifiques para que tu matrona sepa de cuánto estamos hablando: " +
        "¿cuántas toallas has usado en la última hora? ¿Se te llenan completas o quedan a medias?",
    },
    {
      texto:
        "¿El sangrado está aumentando, sigue igual, o había bajado y volvió a subir? Y los " +
        "coágulos, ¿son como una moneda o más grandes?",
    },
  ],
  // §2 — la mayoría no tiene esfigmomanómetro; se pregunta la cifra y, si no hay, los signos.
  preeclampsia_postparto: [
    {
      texto:
        "¿Tienes cómo tomarte la presión, en la casa o en el consultorio? Si te la tomaste, dime " +
        "los números.",
    },
    {
      resuelve: ["cefalea_intensa", "alteracion_visual", "dolor_epigastrico"],
      texto:
        "Cuéntame también si el dolor de cabeza cede con algo, si ves lucecitas o borroso, si te " +
        "zumban los oídos, o si te duele la boca del estómago.",
    },
  ],
  // §3.1 — "sostenida" son dos mediciones separadas por 6 horas: por eso se pregunta la hora.
  endometritis: [
    {
      resuelve: ["temperatura_c"],
      texto:
        "¿Tienes termómetro? Si te tomaste la temperatura, dime cuánto marcó y a qué hora, y si " +
        "te la habías tomado antes hoy.",
    },
    {
      resuelve: ["dolor_abdominal", "loquios_mal_olor"],
      // Sale sola cuando ella ya dio la temperatura, así que no puede depender de la anterior:
      // el original abría con "Si no tienes, cuéntame igual" y descolgado no se entendía.
      texto: "Cuéntame igual cómo andas: ¿te duele el bajo vientre, sientes mal olor, andas con el cuerpo malo?",
    },
  ],
  // §3.2 — la fiebre es lo que separa la curación de la evaluación médica.
  infeccion_herida_operatoria: [
    {
      resuelve: ["dolor_herida", "secrecion_herida"],
      texto:
        "¿Cómo se ve la herida: está colorada, hinchada, te duele al tocarla? ¿Le sale líquido o " +
        "pus, tiene mal olor? ¿Se te abrió en alguna parte?",
    },
    {
      resuelve: ["fiebre_referida", "temperatura_c"],
      texto: "¿Has tenido fiebre?",
    },
  ],
  // §5.1 — el mal olor de la secreción es el umbral que escala.
  mastitis: [
    {
      resuelve: ["mastalgia_unilateral", "eritema_mamario"],
      texto: "¿Es un pecho o los dos? ¿Está colorado y caliente al tacto?",
    },
    {
      resuelve: ["fiebre_referida", "temperatura_c"],
      texto: "¿Has tenido fiebre o el cuerpo malo?",
    },
    { texto: "¿Sale alguna secreción con mal olor?" },
  ],
  // §6 — cualquiera de estas, sola, ya es emergencia; se preguntan las demás igual.
  tromboembolismo: [
    {
      resuelve: ["disnea"],
      texto:
        "Cuéntame si te falta el aire, si te duele el pecho al respirar, o si sientes que te vas " +
        "a desmayar.",
    },
    {
      resuelve: ["dolor_pantorrilla_unilateral"],
      texto:
        "¿Tienes una pierna más hinchada que la otra, caliente o colorada, que te duela al caminar?",
    },
  ],
  // §7 — el agente no aplica ni puntúa la EPDS: solo registra lo que ella cuenta.
  depresion_postparto: [
    {
      texto:
        "¿Desde cuándo te sientes así? ¿Hay alguien en la casa acompañándote estos días? Cuéntame " +
        "lo que necesites, acá te leo sin apuro y sin juzgarte.",
    },
  ],
  // §5.2 — los cuatro criterios que la convierten en señal de alarma.
  dificultad_lactancia: [
    {
      resuelve: ["dificultad_lactancia"],
      texto:
        "¿Te duele cuando le das pecho? ¿Tienes grietas en el pezón? ¿Se prende bien o te cuesta " +
        "acomodarla? ¿Sientes que está quedando con hambre?",
    },
  ],
};

/**
 * Signos de shock en las palabras que ella puede reportar (§4). Van cada vez que hay sangrado en
 * juego: son lo que separa una señal de alarma de una emergencia y ella no los va a mencionar
 * sola, porque no sabe que se preguntan. No se filtra por repetición: en un sangrado activo el
 * estado de hoy no es el de ayer y esta es la pregunta que decide si va a urgencias.
 */
const SHOCK =
  "Dime también si has sentido mareo al pararte, sudor frío, que se te va la vista, que andas " +
  "muy pálida o el corazón acelerado.";

/** Cuando la pregunta ya salió y ella no la contestó, sale una segunda vez y solo una. */
const REITERA =
  "Te insisto con una sola cosa, porque es lo que le falta a tu matrona para priorizar:";

/** Cuando no queda nada que preguntar: cerrar sin volver a pedir lo mismo. */
const ACUSE: Record<Exclude<NivelRiesgo, "alto">, string> = {
  bajo: "Con lo que me contaste tengo suficiente por hoy.",
  medio: "Con eso tu matrona ya tiene lo que necesita para revisarlo hoy.",
};

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

/** Dos cierres por nivel, por el mismo motivo que hay dos aperturas: variar el mensaje completo. */
const INVITACION: Record<NivelRiesgo, [string, string]> = {
  bajo: [
    "Cualquier cosa que te preocupe, escríbeme.",
    "Si algo te preocupa, escríbeme cuando quieras.",
  ],
  medio: [
    "Cuéntame si algo cambia o aparece algo nuevo.",
    "Si cambia algo o aparece algo nuevo, avísame.",
  ],
  alto: [
    "Si puedes, respóndeme en camino; te sigo leyendo.",
    "Escríbeme en el camino si puedes; te sigo leyendo.",
  ],
};

export interface SalidaParaElla {
  nivel_riesgo: NivelRiesgo;
  sospechas: Sospecha[];
  hallazgos: Hallazgos;
}

/**
 * Una pregunta queda pendiente solo mientras ningún campo suyo tenga respuesta. Basta que ella
 * conteste una parte del bloque para dejar de hacerlo: si dijo "37,5", ya contestó la pregunta
 * del termómetro aunque no haya dicho la hora, y repetírsela es lo que la hace dejar de escribir.
 * Lo que falte para priorizar lo pregunta la matrona en la telellamada, no el chat.
 */
function pendiente(pregunta: Pregunta, hallazgos: Hallazgos): boolean {
  if (!pregunta.resuelve) return true;
  return pregunta.resuelve.every((campo) => hallazgos[campo] === null || hallazgos[campo] === undefined);
}

/**
 * Lo que el sistema escribe en el chat después de evaluar un mensaje.
 *
 * `previas` son los últimos mensajes del sistema, del más reciente al más antiguo. Sirven para
 * dos cosas: no volver a hacer una pregunta que ya está en pantalla, y garantizar que el mensaje
 * completo nunca salga idéntico a uno anterior.
 *
 * El orden de la cola es siempre el mismo: preguntas nuevas → si no hay, una única reiteración
 * → si eso también salió ya, un acuse de recibo. Una pregunta se hace dos veces como máximo.
 */
export function respuestaParaElla(
  salida: SalidaParaElla,
  dia: number,
  previas: string[] = []
): string {
  const principal = salida.sospechas.find((s) => s !== "sin_hallazgos");
  const yaDicho = (texto: string) => previas.some((m) => m.includes(texto));

  const cola: string[] = [];

  // En alto ella va en camino a urgencias: la cuantificación se la toma la matrona en la
  // telellamada, no se la abruma con el cuestionario mientras se está moviendo.
  if (salida.nivel_riesgo !== "alto") {
    const abiertas = principal
      ? CUANTIFICAR[principal].filter((p) => pendiente(p, salida.hallazgos)).map((p) => p.texto)
      : [preguntaDelDia(dia)];

    const nuevas = abiertas.filter((t) => !yaDicho(t));
    const reiteracion = abiertas.length ? `${REITERA} ${abiertas[0]}` : "";

    if (nuevas.length) cola.push(...nuevas);
    else if (reiteracion && !yaDicho(reiteracion)) cola.push(reiteracion);
    else cola.push(ACUSE[salida.nivel_riesgo]);
  }

  // El shock es la excepción que sí va en alto: un sangrado aumentado puede cambiar lo que la
  // matrona hace primero, y ella no lo menciona sola porque no sabe que se pregunta.
  if (principal === "hemorragia_tardia" || salida.hallazgos.sangrado_aumentado === true) {
    cola.push(SHOCK);
  }

  // Último cierre: se arman las cuatro combinaciones de apertura y despedida y sale la primera
  // que ella no haya leído todavía. Comparar solo contra el mensaje anterior no alcanzaba —las
  // dos aperturas se alternaban y el texto volvía idéntico cada dos turnos—; por eso se compara
  // contra toda la ventana de previas que entrega la base.
  const variantes = APERTURA[salida.nivel_riesgo].flatMap((apertura) =>
    INVITACION[salida.nivel_riesgo].map((invitacion) => [apertura, ...cola, invitacion].join(" "))
  );

  // Si las cuatro salieron ya, la conversación lleva rato sin nada nuevo: se recicla la más
  // antigua de la ventana, que es la que ella tiene más lejos en pantalla.
  return variantes.find((v) => !previas.includes(v)) ?? variantes[previas.length % variantes.length];
}
