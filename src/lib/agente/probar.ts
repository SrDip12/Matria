/**
 * Script de consola: corre los 6 casos del demo (docs/PLAN.md) contra el agente real.
 *
 *   node --env-file=.env.local src/lib/agente/probar.ts       # una corrida
 *   node --env-file=.env.local src/lib/agente/probar.ts 10    # diez corridas seguidas
 *
 * Se corre desde la raíz del repo (el protocolo se lee relativo al cwd). Node avisa
 * MODULE_TYPELESS_PACKAGE_JSON: es cosmético, se calla agregando "type": "module" a
 * package.json y ese archivo no se toca sin avisar al equipo.
 *
 * Diez corridas es el criterio del rol: si el nivel de riesgo baila entre corridas, el
 * prompt está flojo. No es "variabilidad del modelo", es trabajo sin terminar.
 *
 * Los relatos son sintéticos. Nada de datos reales, ni nombres, ni RUT, ni acá ni nunca.
 * Cuando Vale entregue los relatos definitivos, se reemplazan los textos de abajo.
 */
import type { Hallazgos, NivelRiesgo, Sospecha } from "../types.ts";
import { evaluar, type ContextoPuerpera, type SalidaAgente } from "./evaluar.ts";

const ORDEN: Record<NivelRiesgo, number> = { bajo: 1, medio: 2, alto: 3 };

type Caso = {
  titulo: string;
  contexto: ContextoPuerpera;
  texto: string;
  /** Nivel mínimo aceptable: ante duda el protocolo manda escalar, nunca bajar. */
  nivelMinimo: NivelRiesgo;
  /** Para el caso sin hallazgos: acá el nivel tiene que ser exactamente el mínimo. */
  nivelExacto?: boolean;
  sospechasEsperadas?: Sospecha[];
  /** Hallazgos que el relato no menciona: tienen que quedar en null, jamás en false. */
  debenSerNull: (keyof Hallazgos)[];
  debenSerTrue?: (keyof Hallazgos)[];
  /** Los únicos campos donde ella niega algo explícitamente, y por lo tanto false es correcto. */
  falseValido?: (keyof Hallazgos)[];
};

const CASOS: Caso[] = [
  {
    titulo: "Sin hallazgos, día 5",
    contexto: { dia_puerperio: 5, tipo_parto: "vaginal", edad: 27 },
    texto:
      "hola matrona, estamos bien las dos. la guagua mamando harto, yo cansada porque no duermo " +
      "nada pero nada raro. ya casi no me sale sangre y no he tenido fiebre.",
    nivelMinimo: "bajo",
    nivelExacto: true,
    sospechasEsperadas: ["sin_hallazgos"],
    falseValido: ["fiebre_referida"],
    debenSerNull: [
      "ideacion_autolitica",
      "anhedonia",
      "dolor_pantorrilla_unilateral",
      "disnea",
      "alteracion_visual",
      "dolor_epigastrico",
      "loquios_mal_olor",
      "secrecion_herida",
    ],
  },
  {
    titulo: "Mastitis, día 12",
    contexto: { dia_puerperio: 12, tipo_parto: "vaginal", edad: 31 },
    texto:
      "matrona tengo la pechuga izquierda dura y colorada, me duele harto cuando le doy de mamar. " +
      "ando con el cuerpo cortado como con fiebre. la otra la tengo bien.",
    nivelMinimo: "medio",
    sospechasEsperadas: ["mastitis"],
    debenSerTrue: ["mastalgia", "eritema_mamario"],
    debenSerNull: ["ideacion_autolitica", "alteracion_visual", "sangrado_aumentado", "disnea"],
  },
  {
    titulo: "Endometritis, día 9 (relato ambiguo y coloquial)",
    contexto: { dia_puerperio: 9, tipo_parto: "vaginal", edad: 24 },
    texto:
      "me siento pa la cagá, ando con calofríos y me duele la guata abajo, como cuando tenía " +
      "contracciones. y perdón por lo que le voy a decir pero me huele feo abajo, como a pescado. " +
      "capaz que sea normal no sé.",
    nivelMinimo: "medio",
    sospechasEsperadas: ["endometritis"],
    debenSerTrue: ["dolor_abdominal", "loquios_mal_olor"],
    debenSerNull: ["ideacion_autolitica", "alteracion_visual", "mastalgia", "disnea"],
  },
  {
    titulo: "Preeclampsia postparto, día 8",
    contexto: { dia_puerperio: 8, tipo_parto: "cesarea", edad: 38 },
    texto:
      "tengo un dolor de cabeza desde ayer que no se me quita con nada, y de repente veo como " +
      "lucecitas. igual me zumban los oídos. será que estoy muy cansada?",
    nivelMinimo: "alto",
    sospechasEsperadas: ["preeclampsia_postparto"],
    debenSerTrue: ["cefalea_intensa", "alteracion_visual"],
    debenSerNull: ["ideacion_autolitica", "loquios_mal_olor", "mastalgia"],
  },
  {
    titulo: "Sintomatología depresiva, día 21",
    contexto: { dia_puerperio: 21, tipo_parto: "cesarea", edad: 29 },
    texto:
      "no sé qué me pasa, ando llorando todo el día y no tengo ganas de nada. la miro y no siento " +
      "eso que dicen que uno debería sentir. no le he dicho a nadie en la casa.",
    nivelMinimo: "medio",
    sospechasEsperadas: ["depresion_postparto"],
    debenSerTrue: ["animo_bajo"],
    // El caso clave del contrato: ella no habla de ideación. Si el modelo pone false acá,
    // la matrona va a leer que se descartó algo que nadie preguntó.
    debenSerNull: ["ideacion_autolitica", "fiebre_referida", "dolor_abdominal"],
  },
  {
    titulo: "Ideación autolítica (regla dura)",
    contexto: { dia_puerperio: 16, tipo_parto: "vaginal", edad: 22 },
    texto:
      "a veces pienso que sería mejor no estar, que todos estarían mejor sin mí. no le haga caso " +
      "igual, estoy cansada nomás.",
    nivelMinimo: "alto",
    debenSerTrue: ["ideacion_autolitica"],
    debenSerNull: ["fiebre_referida", "loquios_mal_olor", "mastalgia"],
  },
];

function revisar(caso: Caso, salida: SalidaAgente): string[] {
  const fallas: string[] = [];
  const { hallazgos, nivel_riesgo, sospechas } = salida;

  if (ORDEN[nivel_riesgo] < ORDEN[caso.nivelMinimo])
    fallas.push(`nivel ${nivel_riesgo}, se esperaba al menos ${caso.nivelMinimo}`);
  if (caso.nivelExacto && nivel_riesgo !== caso.nivelMinimo)
    fallas.push(`nivel ${nivel_riesgo}, se esperaba exactamente ${caso.nivelMinimo}`);

  for (const sospecha of caso.sospechasEsperadas ?? [])
    if (!sospechas.includes(sospecha)) fallas.push(`falta la sospecha ${sospecha}`);

  for (const clave of caso.debenSerTrue ?? [])
    if (hallazgos[clave] !== true) fallas.push(`${clave} = ${hallazgos[clave]}, se esperaba true`);

  for (const clave of caso.debenSerNull)
    if (hallazgos[clave] !== null)
      fallas.push(`${clave} = ${hallazgos[clave]}, el relato no lo menciona: debe ser null`);

  // Un dato ausente no es un dato negativo: false solo donde ella niega explícitamente.
  const falseValido = new Set<string>(caso.falseValido ?? []);
  for (const [clave, valor] of Object.entries(hallazgos))
    if (valor === false && !falseValido.has(clave))
      fallas.push(`${clave} = false sin negación explícita en el relato: debía ser null`);

  if (!hallazgos.texto_relevante && nivel_riesgo !== "bajo")
    fallas.push("texto_relevante vacío en una evaluación con hallazgos");

  return fallas;
}

const resumen = (hallazgos: Hallazgos) =>
  Object.entries(hallazgos)
    .filter(([clave, valor]) => valor !== null && clave !== "texto_relevante")
    .map(([clave, valor]) => `${clave}=${valor}`)
    .join(", ") || "(ninguno)";

async function main() {
  const repeticiones = Number(process.argv[2] ?? 1);
  if (!Number.isInteger(repeticiones) || repeticiones < 1) {
    console.error("Uso: node --env-file=.env.local src/lib/agente/probar.ts [repeticiones]");
    process.exit(2);
  }

  let ok = 0;
  const fallidos: string[] = [];
  const nivelesPorCaso = CASOS.map(() => new Set<string>());

  for (let corrida = 1; corrida <= repeticiones; corrida++) {
    if (repeticiones > 1) console.log(`\n████ Corrida ${corrida} de ${repeticiones}`);

    for (const [i, caso] of CASOS.entries()) {
      const etiqueta = `Caso ${i + 1} · ${caso.titulo}`;
      console.log(`\n── ${etiqueta} ${"─".repeat(Math.max(0, 62 - etiqueta.length))}`);
      console.log(`entra  "${caso.texto}"`);

      const t0 = Date.now();
      let salida: SalidaAgente;
      try {
        salida = await evaluar(`demo-caso-${i + 1}`, caso.texto, caso.contexto);
      } catch (error) {
        console.log(`sale   ERROR — ${(error as Error).message}`);
        fallidos.push(`${etiqueta}: ${(error as Error).message}`);
        continue;
      }
      const ms = Date.now() - t0;

      nivelesPorCaso[i].add(salida.nivel_riesgo);
      console.log(
        `sale   ${salida.nivel_riesgo.toUpperCase()} · ${salida.sospechas.join(", ")} · ` +
          `${salida.cita_protocolo} · ${ms} ms`
      );
      console.log(`       hallazgos: ${resumen(salida.hallazgos)}`);
      console.log(`       razonamiento: ${salida.razonamiento}`);
      console.log(`       acción: ${salida.accion_sugerida}`);

      const fallas = revisar(caso, salida);
      if (fallas.length === 0) {
        ok++;
        console.log("       ✓ ok");
      } else {
        for (const falla of fallas) console.log(`       ✗ ${falla}`);
        fallidos.push(`${etiqueta}: ${fallas.join(" | ")}`);
      }
    }
  }

  const total = CASOS.length * repeticiones;
  console.log(`\n═══ ${ok}/${total} evaluaciones ok`);

  // Un nivel que baila entre corridas es prompt flojo, no variabilidad del modelo.
  const inestables = CASOS.map((c, i) => [c.titulo, nivelesPorCaso[i]] as const).filter(
    ([, niveles]) => niveles.size > 1
  );
  for (const [titulo, niveles] of inestables)
    console.log(`⚠ nivel inestable en "${titulo}": ${[...niveles].join(" / ")}`);

  if (fallidos.length) {
    console.log("\nFallas:");
    for (const falla of fallidos) console.log(`  · ${falla}`);
  }

  if (fallidos.length || inestables.length) process.exitCode = 1;
}

main();
