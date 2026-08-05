/**
 * Script de consola: corre los 6 casos del demo (docs/PLAN.md) contra el agente real.
 *
 *   node --env-file=.env.local src/lib/agente/probar.ts       # una corrida
 *   node --env-file=.env.local src/lib/agente/probar.ts 10    # diez corridas seguidas
 *
 * Se corre desde la raíz del repo: antes de evaluar nada compara la copia del protocolo
 * que vive en prompt.ts contra docs/PROTOCOLO_CLINICO.md, y aborta si se desincronizaron.
 * Node avisa MODULE_TYPELESS_PACKAGE_JSON: es cosmético, se calla agregando "type": "module"
 * a package.json y ese archivo no se toca sin avisar al equipo.
 *
 * Diez corridas es el criterio del rol: si el nivel de riesgo baila entre corridas, el
 * prompt está flojo. No es "variabilidad del modelo", es trabajo sin terminar.
 *
 * Los relatos son sintéticos. Nada de datos reales, ni nombres, ni RUT, ni acá ni nunca.
 * Cuando Vale entregue los relatos definitivos, se reemplazan los textos de abajo.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { FICHA_VACIA, type FichaExtendida, type Puerpera } from "../types.ts";
import { factoresRiesgo } from "../factores.ts";
import type { Hallazgos, NivelRiesgo, Sospecha } from "../types.ts";
import { evaluar, type ContextoPuerpera, type SalidaAgente } from "./evaluar.ts";
import { HERRAMIENTA } from "./herramienta.ts";
import { PROTOCOLO, recortarProtocolo } from "./prompt.ts";
import { aplicarReglasDuras } from "./riesgo.ts";

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
    // Los dos únicos campos que ella reporta de forma reconocible: "no he tenido fiebre" y
    // "ya casi no me sale sangre". Ese segundo sí niega un sangrado aumentado, y mandarlo a
    // null le borraría a la matrona un dato que la puérpera sí entregó.
    // dificultad_lactancia NO entra: §5.2 agrupa cuatro criterios (acople, dolor, grietas,
    // alimentación) y "mamando harto" solo cubre uno. Los otros tres nadie los preguntó.
    falseValido: ["fiebre_referida", "sangrado_aumentado"],
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
  {
    titulo: "Excepción única §8: antecedente hipertensivo + cefalea sin cifra",
    contexto: {
      dia_puerperio: 6,
      tipo_parto: "cesarea",
      edad: 33,
      antecedenteTrastornoHipertensivo: true,
    },
    texto:
      "matrona tengo un dolor de cabeza que no se me quita para nada desde anoche, bien fuerte. " +
      "acá en la casa no tengo cómo tomarme la presión.",
    // La cefalea sola, sin cifra, sería señal de alarma (medio). El antecedente hipertensivo
    // la sube a emergencia por la regla dura de §8, exista o no el matiz en el modelo.
    nivelMinimo: "alto",
    nivelExacto: true,
    sospechasEsperadas: ["preeclampsia_postparto"],
    debenSerTrue: ["cefalea_intensa"],
    debenSerNull: ["ideacion_autolitica", "loquios_mal_olor", "mastalgia", "disnea"],
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

/**
 * El protocolo va copiado dentro de prompt.ts porque `.vercelignore` excluye docs/ y en
 * producción el archivo no existe. Esa copia se puede pudrir sin que nadie lo note, así que
 * acá se compara contra el original de Vale antes de gastar una sola llamada a la API.
 */
function verificarCopiaDelProtocolo() {
  const ruta = path.join(process.cwd(), "docs", "PROTOCOLO_CLINICO.md");
  let enDisco: string;
  try {
    enDisco = fs.readFileSync(ruta, "utf8");
  } catch {
    console.error(`✗ No se encontró ${ruta}. Correr desde la raíz del repo.`);
    process.exit(2);
  }

  const normalizar = (t: string) => recortarProtocolo(t).replace(/\r\n/g, "\n");
  if (normalizar(enDisco) !== normalizar(PROTOCOLO)) {
    console.error(
      "✗ La copia del protocolo en src/lib/agente/prompt.ts ya no calza con " +
        "docs/PROTOCOLO_CLINICO.md.\n" +
        "  Antes de copiar nada, mira cuál de los dos es el nuevo. Los dos casos pasan:\n" +
        "    · Vale editó el protocolo → copiar el documento a la constante PROTOCOLO.\n" +
        "    · El archivo en disco quedó atrás (p. ej. su versión buena está sin commitear)\n" +
        "      → NO copiar: eso degradaría el prompt. Recuperar el documento primero.\n" +
        "  La copia de prompt.ts corresponde a la versión 1.2 del protocolo."
    );
    process.exit(2);
  }
  console.log("✓ Copia del protocolo sincronizada con docs/PROTOCOLO_CLINICO.md");
}

/**
 * Las reglas duras casi nunca se disparan en los 6 casos, porque el modelo clasifica bien.
 * Existen para el día en que no lo haga, así que se prueban acá con salidas fabricadas: si
 * solo se ejercitaran a través de la API, serían código sin probar el día que hacen falta.
 * Corre offline y no gasta una llamada.
 */
function verificarReglasDuras() {
  // Los campos salen del esquema de la herramienta para no mantener una segunda lista.
  const hallazgosVacios = Object.fromEntries(
    Object.keys(HERRAMIENTA.input_schema.properties.hallazgos.properties).map((k) => [k, null])
  ) as unknown as Hallazgos;

  const base: SalidaAgente = {
    hallazgos: hallazgosVacios,
    nivel_riesgo: "bajo",
    sospechas: ["sin_hallazgos"],
    cita_protocolo: "§1.1",
    razonamiento: "Sin señales de alarma.",
    accion_sugerida: "Seguimiento habitual.",
  };

  // El modelo tuvo un mal día: detectó la ideación pero la clasificó bajo.
  const ideacion = aplicarReglasDuras({
    ...base,
    hallazgos: { ...base.hallazgos, ideacion_autolitica: true },
  });
  assert.equal(ideacion.nivel_riesgo, "alto", "ideación autolítica debe forzar alto");
  assert.equal(ideacion.cita_protocolo, "§7.2");
  assert.ok(ideacion.sospechas.includes("depresion_postparto"));
  assert.ok(!ideacion.sospechas.includes("sin_hallazgos"), "sin_hallazgos no convive con alto");
  assert.match(ideacion.razonamiento, /^Escalado a riesgo alto por §7\.2/);

  // §6 no exige combinación: una disnea aislada basta, aunque el modelo no haya puesto la
  // sospecha ni haya escalado.
  const disnea = aplicarReglasDuras({
    ...base,
    nivel_riesgo: "medio",
    sospechas: ["dificultad_lactancia"],
    hallazgos: { ...base.hallazgos, disnea: true },
  });
  assert.equal(disnea.nivel_riesgo, "alto", "disnea aislada debe forzar alto por §6");
  assert.equal(disnea.cita_protocolo, "§6");
  assert.ok(disnea.sospechas.includes("tromboembolismo"));

  // Lo mismo por la pierna.
  const pantorrilla = aplicarReglasDuras({
    ...base,
    hallazgos: { ...base.hallazgos, dolor_pantorrilla_unilateral: true },
  });
  assert.equal(pantorrilla.nivel_riesgo, "alto");

  // Si el modelo ya escaló, su cita y su razonamiento son más específicos: no se pisan.
  const yaAlto = aplicarReglasDuras({
    ...base,
    nivel_riesgo: "alto",
    sospechas: ["preeclampsia_postparto"],
    cita_protocolo: "§2",
    razonamiento: "Dos signos de emergencia de §2.",
    hallazgos: { ...base.hallazgos, ideacion_autolitica: true },
  });
  assert.equal(yaAlto.cita_protocolo, "§2", "no se pisa la cita del modelo si ya venía alto");
  assert.equal(yaAlto.razonamiento, "Dos signos de emergencia de §2.");
  assert.ok(yaAlto.sospechas.includes("depresion_postparto"), "la sospecha igual se registra");

  // §8, excepción única: antecedente hipertensivo + una sola señal de §2, sin cifra de
  // presión, también fuerza alto. Antes solo vivía en el prompt.
  const conAntecedente: SalidaAgente = {
    ...base,
    nivel_riesgo: "medio",
    sospechas: ["preeclampsia_postparto"],
    hallazgos: { ...base.hallazgos, cefalea_intensa: true },
  };
  const excepcion8 = aplicarReglasDuras(conAntecedente, { antecedenteTrastornoHipertensivo: true });
  assert.equal(excepcion8.nivel_riesgo, "alto", "antecedente hipertensivo + señal de §2 debe forzar alto");
  assert.equal(excepcion8.cita_protocolo, "§8");

  // Sin el antecedente, la misma señal aislada no dispara esta regla: queda en lo que haya
  // decidido el modelo.
  assert.equal(
    aplicarReglasDuras(conAntecedente).nivel_riesgo,
    "medio",
    "sin el antecedente no debe escalar por esta regla"
  );

  // Sin gatillo, la salida pasa intacta.
  assert.deepEqual(aplicarReglasDuras(base), base);

  console.log("✓ Reglas duras (§7.2 ideación, §6 tromboembolismo, §8 excepción) verificadas");
}

/**
 * Umbrales de §8 que definió Vale: obesidad IMC >30 / >35, y parto prolongado >20 h en
 * nulíparas y >14 h en multíparas. Son ramas con cifras, o sea justo donde un off-by-one pasa
 * inadvertido, y ninguna de ellas debe tocar el nivel de riesgo. Corre offline.
 */
function verificarFactores() {
  const base: Puerpera = {
    id: "demo",
    nombre: "Prueba",
    edad: 28,
    tipo_parto: "vaginal",
    fecha_parto: "2026-07-20",
    prevision: "fonasa_b",
    region: "Metropolitana",
    establecimiento: "—",
    comorbilidades: [],
    dia_puerperio: 10,
    ficha_extendida: null,
  };
  const con = (ficha: Partial<FichaExtendida>): Puerpera => ({
    ...base,
    ficha_extendida: { ...FICHA_VACIA, ...ficha },
  });
  const texto = (p: Puerpera) => factoresRiesgo(p).join(" | ");

  // Obesidad: el corte es estricto (>30, >35), así que el límite exacto no gatilla.
  assert.doesNotMatch(texto(con({ peso_kg: 76.8, talla_cm: 160 })), /Obesidad/); // 30.0 justo
  assert.match(texto(con({ peso_kg: 77, talla_cm: 160 })), /Obesidad, IMC/); // 30.1, un pelo arriba
  assert.doesNotMatch(texto(con({ peso_kg: 89.6, talla_cm: 160 })), /severa/); // 35.0 justo
  assert.match(texto(con({ peso_kg: 82, talla_cm: 160 })), /Obesidad, IMC/); // 32.0
  assert.doesNotMatch(texto(con({ peso_kg: 82, talla_cm: 160 })), /severa/);
  assert.match(texto(con({ peso_kg: 95, talla_cm: 160 })), /Obesidad severa/); // 37.1
  assert.doesNotMatch(texto(con({ peso_kg: 70, talla_cm: 170 })), /Obesidad/); // 24.2

  // Parto prolongado: el umbral depende de la paridad.
  assert.match(texto(con({ paridad: 0, horas_trabajo_parto: 21 })), /Parto prolongado.*nulípara/);
  assert.doesNotMatch(texto(con({ paridad: 0, horas_trabajo_parto: 20 })), /Parto prolongado/);
  assert.match(texto(con({ paridad: 2, horas_trabajo_parto: 15 })), /Parto prolongado.*multípara/);
  assert.doesNotMatch(texto(con({ paridad: 2, horas_trabajo_parto: 14 })), /Parto prolongado/);
  // 16 h es prolongado en multípara y no en nulípara: el mismo número, distinta lectura.
  assert.doesNotMatch(texto(con({ paridad: 0, horas_trabajo_parto: 16 })), /Parto prolongado/);
  assert.match(texto(con({ paridad: 1, horas_trabajo_parto: 16 })), /Parto prolongado/);

  // Sin paridad no se puede elegir umbral: se entregan las horas y no se etiqueta.
  const sinParidad = texto(con({ paridad: null, horas_trabajo_parto: 30 }));
  assert.match(sinParidad, /paridad no registrada/);
  assert.doesNotMatch(sinParidad, /Parto prolongado/);

  // La excepción única de §8 se nombra explícita para que el modelo la vea.
  assert.match(
    texto(con({ enfermedades_embarazo: ["preeclampsia"] })),
    /excepción única/,
    "el trastorno hipertensivo del embarazo debe declararse como excepción de §8"
  );

  // Ficha ausente: solo los factores de la ficha básica, sin inventar nada.
  assert.deepEqual(factoresRiesgo(base), []);
  assert.match(factoresRiesgo({ ...base, edad: 38 }).join(" | "), /Edad 38/);

  console.log("✓ Umbrales de §8 (obesidad y parto prolongado) verificados");
}

async function main() {
  verificarCopiaDelProtocolo();
  verificarReglasDuras();
  verificarFactores();

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
