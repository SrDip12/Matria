/**
 * Verifica las dos garantías del loop de seguimiento, sin llamar a la API.
 *
 *   node scripts/verificar-seguimiento.ts
 *
 * 1. El sistema nunca manda dos veces el mismo texto exacto.
 * 2. Una pregunta cuyo hallazgo ella ya contestó no se vuelve a hacer.
 */
import assert from "node:assert/strict";
import { respuestaParaElla, type SalidaParaElla } from "../src/lib/agente/seguimiento.ts";
import type { Hallazgos } from "../src/lib/types.ts";

const VACIOS = Object.fromEntries(
  (
    [
      "fiebre_referida",
      "temperatura_c",
      "dolor_abdominal",
      "sangrado_aumentado",
      "loquios_mal_olor",
      "cefalea_intensa",
      "alteracion_visual",
      "dolor_epigastrico",
      "mastalgia",
      "mastalgia_unilateral",
      "eritema_mamario",
      "dolor_herida",
      "secrecion_herida",
      "dolor_pantorrilla_unilateral",
      "disnea",
      "animo_bajo",
      "anhedonia",
      "ideacion_autolitica",
      "dificultad_lactancia",
      "texto_relevante",
    ] as (keyof Hallazgos)[]
  ).map((k) => [k, null])
) as unknown as Hallazgos;

const caso = (h: Partial<Hallazgos>): SalidaParaElla => ({
  nivel_riesgo: "medio",
  sospechas: ["endometritis"],
  hallazgos: { ...VACIOS, ...h },
});

/** Simula una conversación: cada turno recibe los mensajes previos, del más reciente al más antiguo. */
function conversar(turnos: SalidaParaElla[], dia = 4): string[] {
  const previas: string[] = [];
  for (const turno of turnos) previas.unshift(respuestaParaElla(turno, dia, previas));
  return previas.reverse();
}

// El caso que reportó Rodo: fiebre + dolor, después "37,5 y no fiebre". El segundo mensaje trae
// la temperatura, así que la pregunta del termómetro no puede volver a salir.
const [primero, segundo] = conversar([
  caso({ fiebre_referida: true, dolor_abdominal: true }),
  caso({ fiebre_referida: false, temperatura_c: 37.5, dolor_abdominal: true }),
]);

assert.match(primero, /termómetro/, "el primer mensaje tiene que pedir la temperatura");
assert.doesNotMatch(segundo, /termómetro/, "no puede volver a pedir una temperatura que ya dio");
assert.notEqual(segundo, primero, "dos mensajes seguidos no pueden ser idénticos");

// Cinco turnos idénticos, el peor caso: antes alternaba A, B, A, B y repetía cada dos.
const seguidos = conversar(Array.from({ length: 5 }, () => caso({ dolor_abdominal: true })));
assert.equal(new Set(seguidos).size, seguidos.length, `mensaje repetido:\n${seguidos.join("\n")}`);

// Riesgo alto: la cola es fija (no hay preguntas), así que el único que puede variar es la apertura.
const altos = conversar(
  Array.from({ length: 2 }, () => ({
    nivel_riesgo: "alto" as const,
    sospechas: ["hemorragia_tardia" as const],
    hallazgos: { ...VACIOS, sangrado_aumentado: true },
  }))
);
assert.equal(new Set(altos).size, 2, "en alto tampoco puede repetirse el mensaje");
assert.ok(
  altos.every((m) => m.includes("mareo al pararte")),
  "los signos de shock van siempre que haya sangrado"
);

console.log("seguimiento: sin repeticiones y sin repreguntar lo ya contestado.");
