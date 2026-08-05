/**
 * Traduce la ficha de la puérpera a los factores que modifican el riesgo basal (protocolo §8).
 *
 * §8 no cambia la categoría de un hallazgo salvo su excepción única; lo que hace es priorizar
 * dentro de la categoría. Por eso esto no toca el nivel de riesgo: se le entrega al modelo
 * como contexto y él lo pondera según §8.
 *
 * OJO CON LOS UMBRALES. §8 nombra "obesidad" y "parto prolongado" pero no define a partir de
 * qué cifra. El protocolo dice que todo umbral que no esté escrito, el agente no lo sabe, así
 * que acá no se inventa ninguno:
 *
 *   - Obesidad: se usa IMC ≥30, que es el corte de la OMS, no del protocolo. Marcado abajo
 *     para que Vale lo confirme o lo cambie. Es el único corte que este archivo asume.
 *   - Parto prolongado: no se etiqueta. Se entrega la duración en horas tal cual y el modelo
 *     la lee contra §8. Poner un corte propio acá sería escribir protocolo sin ser matrona.
 */
import type { Puerpera } from "@/lib/types";
import { imc } from "@/lib/types";

/** IMC ≥30. Corte OMS, NO del protocolo — confirmar con Vale. */
const IMC_OBESIDAD = 30;

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
  if (indice !== null && indice >= IMC_OBESIDAD) factores.push(`Obesidad, IMC ${indice} (§8)`);

  if (f.embarazo_multiple === true) factores.push("Embarazo múltiple (§8)");

  // Sin etiquetar: §8 no define desde cuántas horas un parto es prolongado.
  if (f.horas_trabajo_parto !== null)
    factores.push(
      `Trabajo de parto de ${f.horas_trabajo_parto} h (§8 pondera el parto prolongado)`
    );

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
