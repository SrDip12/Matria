import { NextResponse } from "next/server";
import { contextoPuerpera, registrarEvaluacion } from "@/lib/db";
import { evaluar } from "@/lib/agente/evaluar";
import { antecedentesRelevantes, factoresRiesgo } from "@/lib/factores";

export const dynamic = "force-dynamic";

/**
 * Entra un mensaje de la puérpera, sale la evaluación del agente y la alerta si corresponde.
 * Es el recorrido completo de la demo en una sola llamada.
 *
 * `contextoPuerpera()` devuelve la ficha completa y `evaluar()` espera los factores que
 * modifican el riesgo basal (protocolo §8) más el historial. Son dos formas distintas y la
 * traducción va acá, explícita, que es el único lugar donde la base y el agente se tocan.
 */
export async function POST(req: Request) {
  const { puerpera_id, texto } = (await req.json()) as { puerpera_id?: string; texto?: string };

  if (!puerpera_id || typeof texto !== "string" || texto.trim() === "")
    return NextResponse.json({ error: "puerpera_id y texto son obligatorios" }, { status: 400 });

  const relato = texto.trim();
  const { puerpera, evaluaciones_previas } = await contextoPuerpera(puerpera_id);

  let salida;
  try {
    salida = await evaluar(puerpera_id, relato, {
      dia_puerperio: puerpera.dia_puerperio,
      tipo_parto: puerpera.tipo_parto,
      edad: puerpera.edad,
      comorbilidades: puerpera.comorbilidades,
      evaluaciones_previas,
      // El onboarding entra al motor por acá: la ficha se traduce a los factores de §8 y a los
      // antecedentes que cambian cómo se lee el relato de hoy.
      factores_riesgo: factoresRiesgo(puerpera),
      antecedentes: antecedentesRelevantes(puerpera),
    });
  } catch (e) {
    // El agente falla ruidoso a propósito: rechaza una salida que no calza con el contrato o
    // que cita una sección inexistente. Acá eso no se maquilla ni se persiste a medias — se le
    // dice al panel que este mensaje quedó sin interpretar, que es honesto y es recuperable.
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "el agente no pudo evaluar el mensaje" },
      { status: 502 }
    );
  }

  const { evaluacion, alerta } = await registrarEvaluacion(
    puerpera_id,
    puerpera.dia_puerperio,
    relato,
    salida
  );

  return NextResponse.json({ evaluacion, alerta });
}
