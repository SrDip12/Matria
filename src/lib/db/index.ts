/**
 * Consultas contra Supabase. Cliente directo, sin ORM.
 * Las formas de salida son las de src/lib/types.ts, que manda.
 */
import { createClient } from "@supabase/supabase-js";
import { respuestaParaElla } from "@/lib/agente/seguimiento";
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

  // La respuesta sale con la alerta, nunca antes: las preguntas de cuantificación acompañan al
  // escalamiento, no lo condicionan (§1.1 no permite diferir una señal por falta de datos).
  await responder(puerperaId, dia_puerperio, salida);

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
 * El texto lo arma `respuestaParaElla` (src/lib/agente/seguimiento.ts), que es donde vive lo que
 * el protocolo manda preguntar después de cada hallazgo. Acá solo se persiste.
 */
async function responder(puerperaId: string, dia_puerperio: number, salida: SalidaAgente) {
  // Los últimos mensajes del sistema, del más reciente al más antiguo. Con uno solo no alcanza:
  // las dos aperturas se alternaban y el mensaje volvía idéntico cada dos turnos, y una pregunta
  // ya hecha hace tres mensajes se volvía a hacer igual.
  const { data: previos } = await supabase
    .from("mensajes")
    .select("texto")
    .eq("puerpera_id", puerperaId)
    .eq("autor", "sistema")
    .order("created_at", { ascending: false })
    .limit(6);

  const { error } = await supabase.from("mensajes").insert({
    puerpera_id: puerperaId,
    autor: "sistema",
    texto: respuestaParaElla(
      salida,
      dia_puerperio,
      ((previos ?? []) as { texto: string }[]).map((m) => m.texto)
    ),
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
