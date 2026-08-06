/**
 * Única herramienta del agente. Copiada literal de docs/CONTRATOS.md §4.
 *
 * NO se cambia el esquema. Si falta un campo, se avisa al equipo y se agrega en
 * docs/CONTRATOS.md, src/lib/types.ts y acá en el mismo commit.
 *
 * evaluar.ts deriva la validación de este objeto, así que el esquema es la única
 * fuente de verdad de los tipos de cada hallazgo.
 */
export const HERRAMIENTA = {
  name: "registrar_evaluacion",
  description:
    "Registra las variables clínicas extraídas del relato de la puérpera y su clasificación de riesgo según el protocolo.",
  input_schema: {
    type: "object" as const,
    properties: {
      hallazgos: {
        type: "object",
        description:
          "Variables clínicas. Usa null cuando el relato no permite afirmar ni descartar. Nunca uses false por defecto.",
        properties: {
          fiebre_referida: { type: ["boolean", "null"] },
          temperatura_c: { type: ["number", "null"] },
          dolor_abdominal: { type: ["boolean", "null"] },
          sangrado_aumentado: { type: ["boolean", "null"] },
          loquios_mal_olor: { type: ["boolean", "null"] },
          cefalea_intensa: { type: ["boolean", "null"] },
          alteracion_visual: { type: ["boolean", "null"] },
          dolor_epigastrico: { type: ["boolean", "null"] },
          mastalgia: { type: ["boolean", "null"] },
          mastalgia_unilateral: { type: ["boolean", "null"] },
          eritema_mamario: { type: ["boolean", "null"] },
          dolor_herida: { type: ["boolean", "null"] },
          secrecion_herida: { type: ["boolean", "null"] },
          dolor_pantorrilla_unilateral: { type: ["boolean", "null"] },
          disnea: { type: ["boolean", "null"] },
          animo_bajo: { type: ["boolean", "null"] },
          anhedonia: { type: ["boolean", "null"] },
          ideacion_autolitica: { type: ["boolean", "null"] },
          dificultad_lactancia: { type: ["boolean", "null"] },
          texto_relevante: {
            type: ["string", "null"],
            description: "Fragmento textual de la puérpera que sustenta los hallazgos.",
          },
        },
        required: ["texto_relevante"],
      },
      nivel_riesgo: {
        type: "string",
        enum: ["bajo", "medio", "alto"],
      },
      sospechas: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "preeclampsia_postparto",
            "hemorragia_tardia",
            "endometritis",
            "mastitis",
            "infeccion_herida_operatoria",
            "tromboembolismo",
            "depresion_postparto",
            "dificultad_lactancia",
            "sin_hallazgos",
          ],
        },
      },
      cita_protocolo: {
        type: "string",
        description:
          "Sección exacta del protocolo que justifica la clasificación, por ejemplo '§3.2'. Obligatorio.",
      },
      razonamiento: {
        type: "string",
        description:
          "Máximo dos frases dirigidas a la matrona. Describe los hallazgos y su peso clínico. " +
          "No nombres el nivel ni la categoría: eso lo dice nivel_riesgo, y las reglas duras " +
          "pueden subirlo después de ti. Nunca afirma un diagnóstico.",
      },
      accion_sugerida: {
        type: "string",
        description:
          "Una sola frase: qué hace la matrona ahora. Nunca una indicación de tratamiento ni de fármaco.",
      },
    },
    required: [
      "hallazgos",
      "nivel_riesgo",
      "sospechas",
      "cita_protocolo",
      "razonamiento",
      "accion_sugerida",
    ],
  },
};
