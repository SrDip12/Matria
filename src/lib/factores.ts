/**
 * Traduce la ficha de la puérpera a los factores que modifican el riesgo basal (protocolo §8).
 *
 * §8 no cambia la categoría de un hallazgo salvo su excepción única; lo que hace es priorizar
 * dentro de la categoría. Por eso esto no toca el nivel de riesgo: se le entrega al modelo
 * como contexto y él lo pondera según §8.
 *
 * UMBRALES. §8 nombra "obesidad" y "parto prolongado" sin dar cifras. Estas las definió Vale
 * y por eso están acá y no inventadas:
 *
 *   - Obesidad: IMC >30 moderada, >35 severa.
 *   - Parto prolongado: >20 h en nulíparas, >14 h en multíparas.
 *
 * La gravedad del factor NO es el nivel de riesgo. §8 es explícito: los factores no cambian la
 * categoría de un hallazgo, priorizan dentro de ella, y la única excepción es la que la propia
 * §8 define. Un IMC de 36 sin ningún síntoma no es una emergencia: es una puérpera que, ante la
 * misma señal que otra, se atiende primero. Por eso acá se grada el factor y no se toca el nivel.
 *
 * Pendiente de Vale: estos dos umbrales deberían quedar escritos en docs/PROTOCOLO_CLINICO.md
 * para que una alerta pueda citarlos. Hoy viven solo en este archivo.
 */
import type { Puerpera } from "./types.ts";
import { imc } from "./types.ts";

/** Umbrales definidos por Vale. Gradúan el factor, no el nivel de riesgo. */
const IMC_OBESIDAD = 30;
const IMC_OBESIDAD_SEVERA = 35;

/** Horas de trabajo de parto sobre las que §8 lo considera prolongado. */
const HORAS_PARTO_PROLONGADO = { nulipara: 20, multipara: 14 };

const contiene = (valores: string[], ...agujas: string[]) =>
  valores.some((v) => agujas.some((a) => v.toLowerCase().includes(a)));

/**
 * Devuelve los factores de §8 presentes, en texto, listos para el prompt.
 * Lista vacía = ninguno detectable, que no es lo mismo que "ninguno": una ficha sin
 * completar no tiene factores que mostrar, y eso se dice aparte.
 */
export function factoresRiesgo(puerpera: Puerpera): string[] {
  const f = puerpera.ficha_extendida;
  const factores: string[] = [];

  // Estos dos salen de la ficha básica y están siempre disponibles.
  if (puerpera.tipo_parto === "cesarea")
    factores.push("Cesárea: cirugía mayor, mayor riesgo de infección y de tromboembolismo (§8)");
  if (puerpera.edad >= 35) factores.push(`Edad ${puerpera.edad} (≥35) (§8)`);

  // Las comorbilidades de la ficha básica también pesan.
  const antecedentes = [...puerpera.comorbilidades, ...(f?.enfermedades_cronicas ?? [])];
  if (contiene(antecedentes, "hipertens", "preeclampsia"))
    factores.push("Antecedente de trastorno hipertensivo (§8)");
  if (contiene(antecedentes, "diabetes")) factores.push("Diabetes (§8)");
  if (contiene(antecedentes, "obesidad")) factores.push("Obesidad referida en antecedentes (§8)");

  if (!f) return factores;

  // Del embarazo actual. El trastorno hipertensivo del embarazo es el que dispara la
  // excepción única de §8, así que se nombra explícito para que el modelo lo vea.
  if (contiene(f.enfermedades_embarazo, "hipertens", "preeclampsia", "eclampsia"))
    factores.push(
      "Trastorno hipertensivo del embarazo: §8 lo marca como excepción única — junto a " +
        "cualquier señal de §2 escala directo a emergencia, aunque haya un solo signo y no " +
        "haya cifra de presión"
    );
  if (contiene(f.enfermedades_embarazo, "diabetes")) factores.push("Diabetes gestacional (§8)");

  const indice = imc(f);
  if (indice !== null && indice > IMC_OBESIDAD_SEVERA)
    factores.push(`Obesidad severa, IMC ${indice} (§8, factor de mayor peso)`);
  else if (indice !== null && indice > IMC_OBESIDAD)
    factores.push(`Obesidad, IMC ${indice} (§8)`);

  if (f.embarazo_multiple === true) factores.push("Embarazo múltiple (§8)");

  // El umbral depende de la paridad, así que sin paridad no se puede etiquetar: se entregan
  // las horas crudas y la matrona juzga. Inventar cuál de los dos cortes aplica sería peor
  // que no decir nada.
  if (f.horas_trabajo_parto !== null) {
    const horas = f.horas_trabajo_parto;
    if (f.paridad === null) {
      factores.push(`Trabajo de parto de ${horas} h, paridad no registrada (§8)`);
    } else {
      const limite =
        f.paridad === 0 ? HORAS_PARTO_PROLONGADO.nulipara : HORAS_PARTO_PROLONGADO.multipara;
      const cual = f.paridad === 0 ? "nulípara" : "multípara";
      factores.push(
        horas > limite
          ? `Parto prolongado: ${horas} h en ${cual} (umbral ${limite} h) (§8)`
          : `Trabajo de parto de ${horas} h en ${cual}, bajo el umbral de ${limite} h (§8)`
      );
    }
  }

  // §8 nombra la inmovilización durante el parto; la anestesia peridural es su vía habitual.
  if (f.uso_anestesia === true)
    factores.push(
      `Anestesia en el parto${f.tipo_anestesia ? ` (${f.tipo_anestesia})` : ""}: ` +
        "considerar inmovilización durante el parto (§8)"
    );

  return factores;
}

/**
 * Antecedentes que no son factores de §8 pero que la matrona necesita ver junto al caso:
 * lo que la puérpera toma, lo que le pasó en el parto y cómo va la lactancia.
 */
export function antecedentesRelevantes(puerpera: Puerpera): string[] {
  const f = puerpera.ficha_extendida;
  if (!f) return [];
  const notas: string[] = [];

  if (f.medicamentos_habituales.length)
    notas.push(`Medicamentos de uso habitual: ${f.medicamentos_habituales.join(", ")}`);
  if (f.complicaciones_parto.length)
    notas.push(`Complicaciones del parto: ${f.complicaciones_parto.join(", ")}`);
  if (f.episiotomia === true) notas.push("Episiotomía: herida perineal vigente (§3.2)");
  if (f.antecedentes_ginecologicos.length)
    notas.push(`Antecedentes ginecológicos: ${f.antecedentes_ginecologicos.join(", ")}`);
  if (f.apego_inmediato === false) notas.push("Sin apego inmediato tras el parto");
  if (f.fecha_inicio_lactancia) notas.push(`Lactancia iniciada el ${f.fecha_inicio_lactancia}`);
  if (f.semanas_gestacion !== null) notas.push(`${f.semanas_gestacion} semanas de gestación`);
  if (f.paridad !== null) notas.push(`Paridad previa: ${f.paridad}`);

  const habitos = [
    f.tabaco && f.tabaco !== "no" ? `tabaco ${f.tabaco}` : null,
    f.alcohol && f.alcohol !== "no" ? `alcohol ${f.alcohol}` : null,
    f.drogas && f.drogas !== "no" ? `drogas ${f.drogas}` : null,
  ].filter(Boolean);
  if (habitos.length) notas.push(`Hábitos: ${habitos.join(", ")}`);

  return notas;
}
