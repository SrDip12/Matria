import { NextResponse } from "next/server";
import { contextoPuerpera, registrarEvaluacion, type ContextoPuerpera, type SalidaAgente } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Stub mientras `evaluar(puerperaId, texto)` de src/lib/agente/ no existe (es de Pip).
 * Devuelve una salida válida según el esquema de docs/CONTRATOS.md §4. No interpreta el
 * relato: solo deja a la vista que la ficha real de la puérpera llega hasta acá.
 * Al conectar el agente: borrar esto y reemplazar la llamada por `await evaluar(puerpera_id, texto)`.
 */
async function evaluarStub(contexto: ContextoPuerpera, texto: string): Promise<SalidaAgente> {
  const { puerpera, evaluaciones_previas, alertas_abiertas } = contexto;
  return {
    hallazgos: {
      fiebre_referida: null,
      temperatura_c: null,
      dolor_abdominal: null,
      sangrado_aumentado: null,
      loquios_mal_olor: null,
      cefalea_intensa: null,
      alteracion_visual: null,
      dolor_epigastrico: null,
      mastalgia: null,
      mastalgia_unilateral: null,
      eritema_mamario: null,
      dolor_herida: null,
      secrecion_herida: null,
      dolor_pantorrilla_unilateral: null,
      disnea: null,
      animo_bajo: null,
      anhedonia: null,
      ideacion_autolitica: null,
      dificultad_lactancia: null,
      texto_relevante: texto,
    },
    nivel_riesgo: "medio",
    sospechas: ["sin_hallazgos"],
    cita_protocolo: "§1.1",
    razonamiento:
      `Agente no conectado: el relato no fue interpretado. Contexto disponible: día ` +
      `${puerpera.dia_puerperio} de puerperio, parto ${puerpera.tipo_parto}, ${puerpera.edad} años` +
      `${puerpera.comorbilidades.length ? `, antecedentes: ${puerpera.comorbilidades.join(", ")}` : ""}` +
      `, ${evaluaciones_previas.length} evaluaciones previas y ${alertas_abiertas.length} alertas abiertas.`,
    accion_sugerida: "Revisar el mensaje manualmente mientras el agente no está conectado.",
  };
}

export async function POST(req: Request) {
  const { puerpera_id, texto } = (await req.json()) as { puerpera_id?: string; texto?: string };

  if (!puerpera_id || typeof texto !== "string" || texto.trim() === "")
    return NextResponse.json({ error: "puerpera_id y texto son obligatorios" }, { status: 400 });

  const contexto = await contextoPuerpera(puerpera_id);
  const salida = await evaluarStub(contexto, texto.trim());
  const { evaluacion, alerta } = await registrarEvaluacion(
    puerpera_id,
    contexto.puerpera.dia_puerperio,
    texto.trim(),
    salida
  );

  return NextResponse.json({ evaluacion, alerta });
}
