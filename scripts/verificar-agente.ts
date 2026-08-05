/**
 * Verifica que el agente pueda consumir la cohorte sembrada.
 *
 * `probar.ts` de Pip corre el agente contra relatos escritos a mano. Esto es lo otro:
 * toma filas reales de la base, arma el contexto tal como lo haría la ruta de API, y
 * compara lo que dice el agente con lo que el seed dejó escrito para ese mismo mensaje.
 *
 *   node --env-file=.env.local scripts/verificar-agente.ts        # 8 casos
 *   node --env-file=.env.local scripts/verificar-agente.ts 20     # 20 casos
 *
 * Cada caso es una llamada a la API de Anthropic: no lo dejes corriendo en loop.
 */
import { createClient } from "@supabase/supabase-js";
import { evaluar, type ContextoPuerpera } from "../src/lib/agente/evaluar.ts";
import type { Sospecha } from "../src/lib/types.ts";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type FilaPuerpera = {
  id: string;
  nombre: string;
  edad: number;
  tipo_parto: "vaginal" | "cesarea";
  comorbilidades: string[];
};

type FilaEvaluacion = {
  puerpera_id: string;
  mensaje_id: string;
  dia_puerperio: number;
  nivel_riesgo: "bajo" | "medio" | "alto";
  sospechas: Sospecha[];
  cita_protocolo: string;
  razonamiento: string;
};

/**
 * Misma traducción que hace src/app/api/evaluar/route.ts. Si las dos se separan, esto deja de
 * verificar lo que corre en producción.
 */
const contextoParaAgente = (
  p: FilaPuerpera,
  dia: number,
  previas: FilaEvaluacion[]
): ContextoPuerpera => ({
  dia_puerperio: dia,
  tipo_parto: p.tipo_parto,
  edad: p.edad,
  comorbilidades: p.comorbilidades,
  evaluaciones_previas: previas,
});

/**
 * Historial de esa puérpera **antes** del día que se está evaluando. El corte importa: si se
 * pasan todas sus evaluaciones, entra la que el seed escribió para este mismo mensaje y el
 * agente estaría leyendo la respuesta en vez de deducirla.
 */
async function previasDe(puerperaId: string, dia: number): Promise<FilaEvaluacion[]> {
  const { data, error } = await db
    .from("evaluaciones")
    .select("puerpera_id,mensaje_id,dia_puerperio,nivel_riesgo,sospechas,cita_protocolo,razonamiento")
    .eq("puerpera_id", puerperaId)
    .lt("dia_puerperio", dia)
    .order("dia_puerperio", { ascending: true });
  if (error) throw new Error(`previas: ${error.message}`);
  return (data ?? []) as FilaEvaluacion[];
}

async function main() {
  const n = Number(process.argv[2] ?? 8);

  const { data: evs, error: e1 } = await db
    .from("evaluaciones")
    .select("puerpera_id,mensaje_id,dia_puerperio,nivel_riesgo,sospechas,cita_protocolo")
    .neq("nivel_riesgo", "bajo")
    .limit(500);
  if (e1) throw new Error(`evaluaciones: ${e1.message}`);

  const { data: benignas, error: e2 } = await db
    .from("evaluaciones")
    .select("puerpera_id,mensaje_id,dia_puerperio,nivel_riesgo,sospechas,cita_protocolo")
    .eq("nivel_riesgo", "bajo")
    .limit(200);
  if (e2) throw new Error(`evaluaciones benignas: ${e2.message}`);

  /**
   * Uno por cita del protocolo antes de repetir. Muestrear los primeros que devuelva la base
   * deja fuera las citas raras (§7.2 sale en 6 de cada 1.000) y la verificación pasa sin haber
   * probado justo la regla que más importa.
   */
  const porCita = new Map<string, FilaEvaluacion[]>();
  for (const ev of evs as FilaEvaluacion[]) {
    const xs = porCita.get(ev.cita_protocolo);
    if (xs) xs.push(ev);
    else porCita.set(ev.cita_protocolo, [ev]);
  }
  const conEvento: FilaEvaluacion[] = [];
  for (let vuelta = 0; conEvento.length < Math.ceil((n * 3) / 4); vuelta++) {
    const antes = conEvento.length;
    for (const xs of porCita.values())
      if (xs[vuelta] && conEvento.length < Math.ceil((n * 3) / 4)) conEvento.push(xs[vuelta]);
    if (conEvento.length === antes) break; // se acabaron las evaluaciones con evento
  }

  // Benignas también: el falso positivo hunde el panel tanto como el falso negativo.
  const sinEvento = (benignas as FilaEvaluacion[]).slice(0, Math.max(0, n - conEvento.length));
  const muestra = [...conEvento, ...sinEvento];

  const ids = [...new Set(muestra.map((e) => e.puerpera_id))];
  const { data: ps, error: e3 } = await db
    .from("puerperas")
    .select("id,nombre,edad,tipo_parto,comorbilidades")
    .in("id", ids);
  if (e3) throw new Error(`puerperas: ${e3.message}`);
  const porId = new Map((ps as FilaPuerpera[]).map((p) => [p.id, p]));

  const { data: ms, error: e4 } = await db
    .from("mensajes")
    .select("id,texto")
    .in(
      "id",
      muestra.map((e) => e.mensaje_id)
    );
  if (e4) throw new Error(`mensajes: ${e4.message}`);
  const textoDe = new Map((ms as { id: string; texto: string }[]).map((m) => [m.id, m.texto]));

  let coincideSospecha = 0;
  let coincideCita = 0;
  let noBaja = 0;
  const fallas: string[] = [];

  const ORDEN: Record<string, number> = { bajo: 1, medio: 2, alto: 3 };

  for (const [i, ev] of muestra.entries()) {
    const p = porId.get(ev.puerpera_id);
    const texto = textoDe.get(ev.mensaje_id);
    if (!p || !texto) {
      fallas.push(`caso ${i + 1}: falta la puérpera o el mensaje en la base`);
      continue;
    }

    const esperada = ev.sospechas.find((s) => s !== "sin_hallazgos") ?? "sin_hallazgos";
    const previas = await previasDe(p.id, ev.dia_puerperio);
    const salida = await evaluar(p.id, texto, contextoParaAgente(p, ev.dia_puerperio, previas));
    const obtenida = salida.sospechas.find((s) => s !== "sin_hallazgos") ?? "sin_hallazgos";

    const okSospecha = obtenida === esperada;
    const okCita = salida.cita_protocolo === ev.cita_protocolo;
    // El agente puede escalar por sobre el seed; bajar el riesgo es la falla que importa.
    const okNivel = ORDEN[salida.nivel_riesgo] >= ORDEN[ev.nivel_riesgo];

    if (okSospecha) coincideSospecha++;
    if (okCita) coincideCita++;
    if (okNivel) noBaja++;
    else fallas.push(`caso ${i + 1}: el agente bajó ${ev.nivel_riesgo} → ${salida.nivel_riesgo}`);

    console.log(
      `${String(i + 1).padStart(2)}. día ${String(ev.dia_puerperio).padStart(2)} ${p.tipo_parto.padEnd(8)}` +
        ` seed: ${ev.nivel_riesgo.padEnd(5)} ${esperada.padEnd(28)} ${ev.cita_protocolo.padEnd(5)}`
    );
    console.log(
      `    ${okNivel ? "ok" : "BAJA"}  agente: ${salida.nivel_riesgo.padEnd(5)} ` +
        `${obtenida.padEnd(28)} ${salida.cita_protocolo.padEnd(5)} ` +
        `${okSospecha ? "" : "≠sospecha "}${okCita ? "" : "≠cita"}`
    );
  }

  const total = muestra.length;
  console.log(
    `\n${total} casos · sospecha igual ${coincideSospecha}/${total} · ` +
      `cita igual ${coincideCita}/${total} · nunca bajó el riesgo ${noBaja}/${total}`
  );
  if (fallas.length) {
    console.log("\nFallas:");
    for (const f of fallas) console.log(`  · ${f}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
