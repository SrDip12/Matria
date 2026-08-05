/**
 * La frontera del agente. Rodo llama a esto y nada más:
 *
 *   const salida = await evaluar(puerpera_id, texto);
 *   await registrarEvaluacion(puerpera_id, texto, salida);
 *
 * Entra texto libre, sale un objeto validado con la forma de src/lib/types.ts.
 * Acá no hay base de datos, ni rutas, ni ids, ni fechas: eso lo pone Rodo al persistir.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { Evaluacion, Hallazgos, NivelRiesgo, Sospecha, TipoParto } from "../types.ts";
import { HERRAMIENTA } from "./herramienta.ts";
import { SECCIONES, SYSTEM } from "./prompt.ts";
import { aplicarReglasDuras } from "./riesgo.ts";

/** Cambiado a Haiku por pedido del equipo (CLAUDE.md §3 dice Sonnet 4.6: avisar en el canal). */
const MODELO = "claude-haiku-4-5";

/**
 * Lo que el agente produce. Misma forma que `SalidaAgente` de src/lib/db:
 * la evaluación sin los campos que solo existen una vez persistida.
 */
export type SalidaAgente = Pick<
  Evaluacion,
  "hallazgos" | "nivel_riesgo" | "sospechas" | "cita_protocolo" | "razonamiento"
> & { accion_sugerida: string };

/**
 * Lo que el agente usa de una evaluación anterior. Sin ids ni fechas: acá no hay base de datos.
 * Es un subconjunto de `Evaluacion`, así que lo que devuelve `contextoPuerpera()` de src/lib/db
 * calza directo sin mapear.
 */
export type EvaluacionPrevia = Pick<
  Evaluacion,
  "dia_puerperio" | "nivel_riesgo" | "sospechas" | "cita_protocolo" | "razonamiento"
>;

/** Más que esto no aporta y sí encarece cada llamada. Se toman las más recientes. */
const MAX_HISTORIAL = 8;

/**
 * Antecedentes de la ficha, opcionales. Son los factores que modifican el riesgo basal
 * (protocolo §8): la misma señal pesa distinto en una cesárea que en un parto vaginal.
 * Si Rodo los pasa, entran al contexto del modelo; si no, el agente evalúa solo el relato.
 */
export interface ContextoPuerpera {
  dia_puerperio?: number;
  tipo_parto?: TipoParto;
  edad?: number;
  comorbilidades?: string[];
  /**
   * Evaluaciones anteriores de la misma puérpera, de la más antigua a la más reciente.
   * Es lo que convierte esto en seguimiento longitudinal y no en una sucesión de mensajes
   * sueltos: una señal que ya venía apareciendo pesa distinto que la misma señal aislada.
   */
  evaluaciones_previas?: EvaluacionPrevia[];
  /** Factores de §8 ya resueltos. Los arma `factoresRiesgo()` a partir de la ficha. */
  factores_riesgo?: string[];
  /** Antecedentes que no son §8 pero que cambian cómo se lee el relato de hoy. */
  antecedentes?: string[];
  /**
   * Antecedente de trastorno hipertensivo del embarazo. Lo arma `antecedenteTrastornoHipertensivo()`
   * de src/lib/factores.ts. Dispara la excepción única de §8 (junto a cualquier señal de §2,
   * escala a alto sin cifra de presión) como regla dura en riesgo.ts, no solo en el prompt.
   */
  antecedenteTrastornoHipertensivo?: boolean;
}

// El SDK reintenta solo (maxRetries: 2) pero por defecto espera hasta 10 minutos antes de
// fallar. Diez minutos colgado en vivo frente al jurado es peor que fallar rápido: se acota
// a 30 s, de sobra para una salida de 1500 tokens.
let cliente: Anthropic | null = null;
const anthropic = () => (cliente ??= new Anthropic({ timeout: 30_000 }));

// ── Validación ────────────────────────────────────────────────────────────────
// Los tipos permitidos de cada hallazgo se leen del esquema de la herramienta, que es
// el contrato congelado. Así no hay una segunda lista que se pueda desincronizar.

const ESQUEMA_HALLAZGOS: Record<string, { type: string[] }> =
  HERRAMIENTA.input_schema.properties.hallazgos.properties;

const CLAVES_HALLAZGOS = Object.keys(ESQUEMA_HALLAZGOS) as (keyof Hallazgos)[];

const NIVELES = new Set<string>(HERRAMIENTA.input_schema.properties.nivel_riesgo.enum);
const SOSPECHAS = new Set<string>(HERRAMIENTA.input_schema.properties.sospechas.items.enum);

function tipoJson(valor: unknown): string {
  if (valor === null) return "null";
  if (typeof valor === "boolean") return "boolean";
  if (typeof valor === "number") return "number";
  if (typeof valor === "string") return "string";
  return typeof valor;
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

/** Falla ruidosamente. Una evaluación clínica a medias es peor que ninguna. */
function fallar(puerperaId: string, motivo: string): never {
  throw new Error(`[agente] evaluación inválida para ${puerperaId}: ${motivo}`);
}

function validar(bruto: unknown, puerperaId: string): SalidaAgente {
  if (!esObjeto(bruto)) fallar(puerperaId, "la herramienta no devolvió un objeto");

  if (!esObjeto(bruto.hallazgos)) fallar(puerperaId, "falta el objeto hallazgos");
  const crudos = bruto.hallazgos;

  // Un hallazgo ausente en la respuesta es null, nunca false: el esquema solo exige
  // texto_relevante, así que el modelo puede omitir campos y esa omisión significa
  // "no se sabe". Nada de rellenar con false acá.
  const hallazgos: Record<string, unknown> = {};
  for (const clave of CLAVES_HALLAZGOS) {
    const valor = crudos[clave] === undefined ? null : crudos[clave];
    const permitidos = ESQUEMA_HALLAZGOS[clave].type;
    if (!permitidos.includes(tipoJson(valor)))
      fallar(
        puerperaId,
        `hallazgos.${clave} es ${tipoJson(valor)}, se esperaba ${permitidos.join(" o ")}`
      );
    hallazgos[clave] = valor;
  }

  if (typeof bruto.nivel_riesgo !== "string" || !NIVELES.has(bruto.nivel_riesgo))
    fallar(puerperaId, `nivel_riesgo inválido: ${JSON.stringify(bruto.nivel_riesgo)}`);

  if (!Array.isArray(bruto.sospechas) || bruto.sospechas.length === 0)
    fallar(puerperaId, "sospechas tiene que ser un arreglo no vacío");
  for (const sospecha of bruto.sospechas)
    if (typeof sospecha !== "string" || !SOSPECHAS.has(sospecha))
      fallar(puerperaId, `sospecha desconocida: ${JSON.stringify(sospecha)}`);

  // Cita inventada = evaluación rechazada. Es lo que separa esto de un chatbot.
  if (typeof bruto.cita_protocolo !== "string" || !SECCIONES.has(bruto.cita_protocolo))
    fallar(
      puerperaId,
      `cita_protocolo ${JSON.stringify(bruto.cita_protocolo)} no existe en el protocolo. ` +
        `Secciones válidas: ${[...SECCIONES].join(", ")}`
    );

  for (const campo of ["razonamiento", "accion_sugerida"] as const)
    if (typeof bruto[campo] !== "string" || bruto[campo].trim() === "")
      fallar(puerperaId, `${campo} vacío`);

  return {
    hallazgos: hallazgos as unknown as Hallazgos,
    nivel_riesgo: bruto.nivel_riesgo as NivelRiesgo,
    sospechas: bruto.sospechas as Sospecha[],
    cita_protocolo: bruto.cita_protocolo,
    razonamiento: (bruto.razonamiento as string).trim(),
    accion_sugerida: (bruto.accion_sugerida as string).trim(),
  };
}

// ── Llamada ───────────────────────────────────────────────────────────────────

/**
 * El historial va en el mensaje de usuario, igual que la ficha, y no en el system: el system
 * es el prefijo cacheado y esto cambia en cada llamada.
 *
 * El encuadre importa tanto como los datos. Sin él el modelo tiende a dos errores: arrastrar la
 * sospecha anterior aunque el relato de hoy no la sostenga, y volver a levantar una alerta que
 * la matrona ya atendió. Se le dice explícitamente que esto pondera, no que reemplaza.
 */
function historial(evs: EvaluacionPrevia[]): string {
  const lineas = evs
    .slice(-MAX_HISTORIAL)
    .map(
      (e) =>
        `- Día ${e.dia_puerperio} · ${e.nivel_riesgo} · ${e.sospechas.join(", ")} · ${e.cita_protocolo}\n` +
        `  ${e.razonamiento}`
    );

  return (
    `Evaluaciones anteriores de esta misma puérpera, de la más antigua a la más reciente:\n` +
    `${lineas.join("\n")}\n\n` +
    `Ese historial es para ponderar el relato de hoy, no para volver a alertar por lo de antes. ` +
    `Una señal que ya venía apareciendo, o que empeora respecto de la anterior, pesa más que la ` +
    `misma señal aislada. Una que no se repite hoy, no se arrastra: evalúa el relato de hoy y no ` +
    `mantengas una sospecha anterior si el texto de hoy no la sostiene.`
  );
}

function mensajeUsuario(texto: string, ctx?: ContextoPuerpera): string {
  const ficha: string[] = [];
  if (ctx?.dia_puerperio !== undefined) ficha.push(`Día de puerperio: ${ctx.dia_puerperio}`);
  if (ctx?.tipo_parto) ficha.push(`Tipo de parto: ${ctx.tipo_parto}`);
  if (ctx?.edad !== undefined) ficha.push(`Edad: ${ctx.edad}`);
  if (ctx?.comorbilidades?.length) ficha.push(`Antecedentes: ${ctx.comorbilidades.join(", ")}`);

  const cabecera = ficha.length
    ? `Ficha de la puérpera:\n${ficha.join("\n")}`
    : "Ficha de la puérpera: no disponible. Evalúa solo el relato y no supongas el día de puerperio.";

  const bloques = [cabecera];

  // §8: no cambian la categoría, priorizan dentro de ella. Se lo decimos explícito porque el
  // modelo tiende a subir de nivel cuando ve una lista de factores, y §8 dice justo lo
  // contrario salvo su excepción única.
  if (ctx?.factores_riesgo?.length)
    bloques.push(
      `Factores que modifican el riesgo basal (§8):\n` +
        ctx.factores_riesgo.map((f) => `- ${f}`).join("\n") +
        `\n\nEstos factores no cambian por sí solos la categoría del hallazgo: priorizan dentro ` +
        `de la misma categoría. La única excepción es la que el propio §8 define.`
    );

  if (ctx?.antecedentes?.length)
    bloques.push(
      `Otros antecedentes de la ficha:\n` + ctx.antecedentes.map((a) => `- ${a}`).join("\n")
    );

  const previas = ctx?.evaluaciones_previas ?? [];
  if (previas.length) bloques.push(historial(previas));
  bloques.push(`Relato de la puérpera:\n"""\n${texto}\n"""`);

  return bloques.join("\n\n");
}

/**
 * Evalúa un mensaje de la puérpera y devuelve las variables clínicas y el riesgo.
 * Lanza si el modelo no llama a la herramienta, si la salida no calza con el contrato
 * o si cita una sección del protocolo que no existe.
 */
export async function evaluar(
  puerperaId: string,
  texto: string,
  contexto?: ContextoPuerpera
): Promise<SalidaAgente> {
  if (!texto.trim()) fallar(puerperaId, "texto vacío");

  const respuesta = await anthropic().messages.create({
    model: MODELO,
    max_tokens: 1500,
    system: SYSTEM,
    tools: [HERRAMIENTA],
    // Forzado: la salida nunca es texto parseado.
    tool_choice: { type: "tool", name: HERRAMIENTA.name },
    // Haiku 4.5 no piensa salvo que se le pida: no va parámetro `thinking`.
    messages: [{ role: "user", content: mensajeUsuario(texto.trim(), contexto) }],
  });

  const bloque = respuesta.content.find((b) => b.type === "tool_use");
  if (!bloque)
    fallar(
      puerperaId,
      `el modelo no llamó a la herramienta (stop_reason: ${respuesta.stop_reason})`
    );
  if (bloque.name !== HERRAMIENTA.name)
    fallar(puerperaId, `el modelo llamó a otra herramienta: ${bloque.name}`);

  // Las reglas duras corren después del modelo, siempre.
  return aplicarReglasDuras(validar(bloque.input, puerperaId), contexto);
}
