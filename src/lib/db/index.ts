/**
 * Consultas contra Supabase. Cliente directo, sin ORM.
 * Las formas de salida son las de src/lib/types.ts, que manda.
 */
import { createClient } from "@supabase/supabase-js";
import {
  DIAS_PUERPERIO,
  ETIQUETA_SOSPECHA,
  type Alerta,
  type Evaluacion,
  type EstadoAlerta,
  type FichaExtendida,
  type FilaPanel,
  type Mensaje,
  type NivelRiesgo,
  type Puerpera,
  type Sospecha,
} from "@/lib/types";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ORDEN_RIESGO: Record<NivelRiesgo, number> = { alto: 3, medio: 2, bajo: 1 };

const masGrave = (a: NivelRiesgo, b: NivelRiesgo) => (ORDEN_RIESGO[a] >= ORDEN_RIESGO[b] ? a : b);

function fallar(contexto: string, error: { message: string } | null) {
  if (error) throw new Error(`${contexto}: ${error.message}`);
}

/**
 * Supabase corta las respuestas en 1.000 filas por defecto (db-max-rows). La cohorte ya
 * tiene más evaluaciones que eso, así que se pagina o la franja se trunca en silencio.
 */
async function todasLasEvaluaciones(): Promise<Evaluacion[]> {
  const pagina = 1000;
  const filas: Evaluacion[] = [];
  for (let desde = 0; ; desde += pagina) {
    const { data, error } = await supabase
      .from("evaluaciones")
      .select("*")
      .order("created_at", { ascending: true })
      .range(desde, desde + pagina - 1);
    fallar("evaluaciones", error);
    filas.push(...((data ?? []) as Evaluacion[]));
    if (!data || data.length < pagina) return filas;
  }
}

/**
 * Panel de la matrona: una fila por puérpera dentro de los 42 días.
 * Orden: nivel de riesgo descendente y, dentro del nivel, alerta pendiente más antigua primero.
 *
 * ponytail: arma las franjas en memoria trayendo todas las evaluaciones en cada poll. Con
 * ~200 puérperas alcanza de sobra; si la cohorte crece, mover el agregado por día a una vista
 * en Postgres.
 */
export async function filasPanel(): Promise<FilaPanel[]> {
  const [{ data: puerperas, error: e1 }, evaluaciones, { data: alertas, error: e3 }] = await Promise.all([
    supabase.from("puerperas_activas").select("*"),
    todasLasEvaluaciones(),
    supabase.from("alertas").select("*").eq("estado", "pendiente").order("created_at", { ascending: true }),
  ]);
  fallar("puerperas", e1);
  fallar("alertas", e3);

  const porPuerpera = new Map<string, Evaluacion[]>();
  for (const ev of evaluaciones) {
    const xs = porPuerpera.get(ev.puerpera_id);
    if (xs) xs.push(ev);
    else porPuerpera.set(ev.puerpera_id, [ev]);
  }

  const alertasPorPuerpera = new Map<string, Alerta[]>();
  for (const al of (alertas ?? []) as Alerta[]) {
    const xs = alertasPorPuerpera.get(al.puerpera_id);
    if (xs) xs.push(al);
    else alertasPorPuerpera.set(al.puerpera_id, [al]);
  }

  const filas: FilaPanel[] = ((puerperas ?? []) as Puerpera[]).map((puerpera) => {
    const evs = porPuerpera.get(puerpera.id) ?? [];
    const pendientes = alertasPorPuerpera.get(puerpera.id) ?? [];

    const franja: (NivelRiesgo | null)[] = Array(DIAS_PUERPERIO).fill(null);
    for (const ev of evs) {
      const i = ev.dia_puerperio - 1;
      if (i < 0 || i >= DIAS_PUERPERIO) continue;
      franja[i] = franja[i] ? masGrave(franja[i]!, ev.nivel_riesgo) : ev.nivel_riesgo;
    }

    const ultima_evaluacion = evs.length > 0 ? evs[evs.length - 1] : null;
    const nivel_riesgo = pendientes.length
      ? pendientes.map((a) => a.nivel).reduce(masGrave)
      : (ultima_evaluacion?.nivel_riesgo ?? "bajo");

    return { puerpera, ultima_evaluacion, alertas_pendientes: pendientes, nivel_riesgo, franja };
  });

  // Primero lo grave; dentro de lo grave, lo que lleva más rato esperando.
  return filas.sort((a, b) => {
    const porNivel = ORDEN_RIESGO[b.nivel_riesgo] - ORDEN_RIESGO[a.nivel_riesgo];
    if (porNivel !== 0) return porNivel;
    const espera = (f: FilaPanel) => f.alertas_pendientes[0]?.created_at ?? "9999";
    return espera(a).localeCompare(espera(b));
  });
}

/**
 * Todo lo que el agente necesita saber de una puérpera para evaluar un mensaje: su ficha, el
 * día de puerperio en que está, lo que ya se le detectó y lo que sigue abierto.
 *
 * Pip: llama esto desde `evaluar(puerperaId, texto)`. La firma del contrato no cambia.
 * El protocolo §8 pesa distinto una misma señal según cesárea, edad y comorbilidades, y el
 * riesgo acumulado sale de las evaluaciones previas, no del mensaje suelto.
 */
export interface ContextoPuerpera {
  puerpera: Puerpera;
  evaluaciones_previas: Evaluacion[];
  alertas_abiertas: Alerta[];
}

export async function contextoPuerpera(puerperaId: string): Promise<ContextoPuerpera> {
  const [{ data: puerpera, error: e1 }, { data: evaluaciones, error: e2 }, { data: alertas, error: e3 }] =
    await Promise.all([
      supabase.from("puerperas_activas").select("*").eq("id", puerperaId).single(),
      supabase
        .from("evaluaciones")
        .select("*")
        .eq("puerpera_id", puerperaId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("alertas")
        .select("*")
        .eq("puerpera_id", puerperaId)
        .in("estado", ["pendiente", "vista"])
        .order("created_at", { ascending: false }),
    ]);
  fallar("puerpera", e1);
  fallar("evaluaciones previas", e2);
  fallar("alertas abiertas", e3);

  return {
    puerpera: puerpera as Puerpera,
    evaluaciones_previas: ((evaluaciones ?? []) as Evaluacion[]).reverse(),
    alertas_abiertas: (alertas ?? []) as Alerta[],
  };
}

/**
 * Alta de una puérpera desde el onboarding. Devuelve la fila ya con `dia_puerperio` derivado,
 * leyéndola de `puerperas_activas` igual que el resto del sistema.
 *
 * Si la fecha de parto queda fuera de los 42 días, la vista no la devuelve: en ese caso se
 * avisa en vez de entregar una puérpera a medias que el panel nunca va a mostrar.
 */
export async function crearPuerpera(
  base: Omit<Puerpera, "id" | "dia_puerperio">
): Promise<Puerpera> {
  const { data, error } = await supabase.from("puerperas").insert(base).select("id").single();
  fallar("crear puérpera", error);

  const id = (data as { id: string }).id;
  const { data: activa, error: e2 } = await supabase
    .from("puerperas_activas")
    .select("*")
    .eq("id", id)
    .single();

  if (e2 || !activa)
    throw new Error(
      `La puérpera se creó pero queda fuera de la ventana de seguimiento: el puerperio cubre ` +
        `los 42 días posteriores al parto y la fecha indicada (${base.fecha_parto}) no cae ahí.`
    );

  return activa as Puerpera;
}

/** Guarda o reemplaza la ficha del onboarding de una puérpera que ya existe. */
export async function guardarFichaExtendida(
  puerperaId: string,
  ficha: FichaExtendida
): Promise<Puerpera> {
  const { error } = await supabase
    .from("puerperas")
    .update({ ficha_extendida: ficha })
    .eq("id", puerperaId);
  fallar("guardar ficha extendida", error);

  const { data, error: e2 } = await supabase
    .from("puerperas_activas")
    .select("*")
    .eq("id", puerperaId)
    .single();
  fallar("releer puérpera", e2);
  return data as Puerpera;
}

export async function conversacion(puerperaId: string): Promise<Mensaje[]> {
  const { data, error } = await supabase
    .from("mensajes")
    .select("*")
    .eq("puerpera_id", puerperaId)
    .order("created_at", { ascending: true });
  fallar("conversacion", error);
  return (data ?? []) as Mensaje[];
}

export async function cambiarEstadoAlerta(id: string, estado: EstadoAlerta): Promise<Alerta> {
  const { data, error } = await supabase
    .from("alertas")
    .update({ estado, resuelta_at: estado === "resuelta" ? new Date().toISOString() : null })
    .eq("id", id)
    .select()
    .single();
  fallar("alerta", error);
  return data as Alerta;
}

/** Salida del agente: el esquema de tool_use de docs/CONTRATOS.md §4, sin los campos de base. */
export type SalidaAgente = Pick<
  Evaluacion,
  "hallazgos" | "nivel_riesgo" | "sospechas" | "cita_protocolo" | "razonamiento"
> & { accion_sugerida: string };

/**
 * Guarda el mensaje de la puérpera, persiste la evaluación y crea la alerta si corresponde.
 * Todo en una llamada: el demo tiene que sentirse instantáneo.
 */
export async function registrarEvaluacion(
  puerperaId: string,
  dia_puerperio: number,
  texto: string,
  salida: SalidaAgente
): Promise<{ evaluacion: Evaluacion; alerta: Alerta | null }> {
  const { data: mensaje, error: e2 } = await supabase
    .from("mensajes")
    .insert({ puerpera_id: puerperaId, autor: "puerpera", texto, dia_puerperio })
    .select()
    .single();
  fallar("mensaje", e2);

  const { data: evaluacion, error: e3 } = await supabase
    .from("evaluaciones")
    .insert({
      puerpera_id: puerperaId,
      mensaje_id: (mensaje as Mensaje).id,
      dia_puerperio,
      hallazgos: salida.hallazgos,
      nivel_riesgo: salida.nivel_riesgo,
      sospechas: salida.sospechas,
      cita_protocolo: salida.cita_protocolo,
      razonamiento: salida.razonamiento,
    })
    .select()
    .single();
  fallar("evaluacion", e3);

  await responder(puerperaId, dia_puerperio, salida.nivel_riesgo);

  if (salida.nivel_riesgo === "bajo") return { evaluacion: evaluacion as Evaluacion, alerta: null };

  const { data: alerta, error: e4 } = await supabase
    .from("alertas")
    .insert({
      puerpera_id: puerperaId,
      evaluacion_id: (evaluacion as Evaluacion).id,
      nivel: salida.nivel_riesgo,
      titulo: titulo(salida.sospechas, dia_puerperio),
      accion_sugerida: salida.accion_sugerida,
      cita_protocolo: salida.cita_protocolo,
    })
    .select()
    .single();
  fallar("alerta", e4);

  return { evaluacion: evaluacion as Evaluacion, alerta: alerta as Alerta };
}

/**
 * Respuesta que ella ve en el chat. Sin esto un mensaje sin hallazgos no produce nada visible
 * y la puérpera queda escribiendo contra una pared.
 *
 * Texto fijo por nivel, no generado: la respuesta a la puérpera no es la `accion_sugerida`, que
 * está escrita para la matrona. No afirma un diagnóstico y no indica tratamiento. Para `alto` el
 * mensaje de acudir a urgencias es el que el propio protocolo §1.1 define para esa categoría.
 */
const RESPUESTA: Record<NivelRiesgo, string> = {
  bajo:
    "Gracias por contarme cómo estás, me deja tranquila saberlo. En lo que me escribiste no " +
    "aparecen señales de alarma, así que seguimos con el control habitual.",
  medio:
    "Gracias por contarme, hiciste bien en avisarme. Acá hay algo que tu matrona tiene que " +
    "revisar hoy: ya se lo dejé marcado y ella te va a contactar. No estás sola en esto.",
  alto:
    "Gracias por contarme. Lo que me describes es una señal que no puede esperar: tu matrona ya " +
    "quedó alertada y te va a llamar. Acude a urgencias de inmediato, no lo dejes para más rato.",
};

/**
 * Con qué queda abierta la conversación. Una respuesta que cierra deja a la puérpera sin saber
 * si puede seguir contando, y lo que no cuenta no se evalúa.
 *
 * El foco de la pregunta lo define el protocolo §9 según el día de puerperio, así que esto no es
 * relleno conversacional: es el contacto programado que corresponde a esta semana.
 */
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
  medio: "Mientras tanto quédate conmigo: cuéntame si algo cambia o si aparece algo nuevo.",
  alto: "Cuéntame cómo te sientes mientras vas en camino, te sigo leyendo.",
};

async function responder(puerperaId: string, dia_puerperio: number, nivel: NivelRiesgo) {
  // A la que va a urgencias no se le hace la pregunta de seguimiento del día: ahí lo que
  // corresponde es que se mueva, no que conteste una encuesta.
  const cierre =
    nivel === "alto" ? INVITACION.alto : `${preguntaDelDia(dia_puerperio)} ${INVITACION[nivel]}`;

  const { error } = await supabase.from("mensajes").insert({
    puerpera_id: puerperaId,
    autor: "sistema",
    texto: `${RESPUESTA[nivel]} ${cierre}`,
    dia_puerperio,
  });
  fallar("respuesta", error);
}

/** Titular de la fila del panel. Es una sospecha, nunca un diagnóstico. */
function titulo(sospechas: Sospecha[], dia: number): string {
  const principal = sospechas.find((s) => s !== "sin_hallazgos");
  return principal
    ? `Sospecha de ${ETIQUETA_SOSPECHA[principal].toLowerCase()}, día ${dia}`
    : `Señal de alarma sin categoría, día ${dia}`;
}
