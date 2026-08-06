# Contratos

Congelados en la hora 1. Panel y Agente construyen contra esto en paralelo, sin esperarse.

---

## 1. Regla de oro

`src/lib/types.ts` manda. Si este documento y ese archivo se contradicen, gana el archivo.

Nadie inventa un campo. Si falta algo, se avisa al equipo y se agrega en los dos lados a la
vez, en un solo commit.

## 2. Flujo completo

```
mensaje de la puérpera (texto libre)
        │
        ▼
POST /api/evaluar          ← lo construye Agente
        │
        │  Claude Sonnet 4.6 + tool_use
        │  system prompt = protocolo clínico curado (con prompt caching)
        ▼
Evaluacion  { hallazgos, nivel_riesgo, sospechas, cita_protocolo, razonamiento }
        │
        ├──▶ insert en `evaluaciones`
        │
        └──▶ si nivel_riesgo ≠ 'bajo' → insert en `alertas`
                    │
                    ▼
        GET /api/panel  → FilaPanel[]   ← lo consume Panel, polling cada 3s
```

## 3. Endpoints

### `POST /api/evaluar`

```ts
// entrada
{ puerpera_id: string; texto: string }

// salida
{ evaluacion: Evaluacion; alerta: Alerta | null }
```

Guarda el mensaje, evalúa, persiste la evaluación y crea alerta si corresponde. Todo en una
llamada, para que el demo se sienta instantáneo.

### `GET /api/panel`

```ts
// salida
{ filas: FilaPanel[] }
```

Ordenadas por: `nivel_riesgo` descendente, luego alerta pendiente más antigua primero. Una
matrona atiende primero lo grave, y dentro de lo grave, lo que lleva más rato esperando.

### `PATCH /api/alertas/[id]`

```ts
// entrada
{ estado: EstadoAlerta }
```

### `GET /api/conversacion/[puerperaId]`

```ts
// salida
{ mensajes: Mensaje[] }
```

## 4. Esquema de extracción de Claude (`tool_use`)

El agente declara una sola herramienta y fuerza su uso con
`tool_choice: { type: "tool", name: "registrar_evaluacion" }`. Así la salida es siempre
estructurada y no hay que parsear texto ni limpiar bloques de markdown.

```json
{
  "name": "registrar_evaluacion",
  "description": "Registra las variables clínicas extraídas del relato de la puérpera y su clasificación de riesgo según el protocolo.",
  "input_schema": {
    "type": "object",
    "properties": {
      "hallazgos": {
        "type": "object",
        "description": "Variables clínicas. Usa null cuando el relato no permite afirmar ni descartar. Nunca uses false por defecto.",
        "properties": {
          "fiebre_referida":              { "type": ["boolean", "null"] },
          "temperatura_c":                { "type": ["number", "null"] },
          "dolor_abdominal":              { "type": ["boolean", "null"] },
          "sangrado_aumentado":           { "type": ["boolean", "null"] },
          "loquios_mal_olor":             { "type": ["boolean", "null"] },
          "cefalea_intensa":              { "type": ["boolean", "null"] },
          "alteracion_visual":            { "type": ["boolean", "null"] },
          "dolor_epigastrico":            { "type": ["boolean", "null"] },
          "mastalgia":                    { "type": ["boolean", "null"] },
          "mastalgia_unilateral":         { "type": ["boolean", "null"] },
          "eritema_mamario":              { "type": ["boolean", "null"] },
          "dolor_herida":                 { "type": ["boolean", "null"] },
          "secrecion_herida":             { "type": ["boolean", "null"] },
          "dolor_pantorrilla_unilateral": { "type": ["boolean", "null"] },
          "disnea":                       { "type": ["boolean", "null"] },
          "animo_bajo":                   { "type": ["boolean", "null"] },
          "anhedonia":                    { "type": ["boolean", "null"] },
          "ideacion_autolitica":          { "type": ["boolean", "null"] },
          "dificultad_lactancia":         { "type": ["boolean", "null"] },
          "texto_relevante":              { "type": ["string", "null"], "description": "Fragmento textual de la puérpera que sustenta los hallazgos." }
        },
        "required": ["texto_relevante"]
      },
      "nivel_riesgo": {
        "type": "string",
        "enum": ["bajo", "medio", "alto"]
      },
      "sospechas": {
        "type": "array",
        "items": {
          "type": "string",
          "enum": [
            "preeclampsia_postparto", "hemorragia_tardia", "endometritis", "mastitis",
            "infeccion_herida_operatoria", "tromboembolismo", "depresion_postparto",
            "dificultad_lactancia", "sin_hallazgos"
          ]
        }
      },
      "cita_protocolo": {
        "type": "string",
        "description": "Sección exacta del protocolo que justifica la clasificación, por ejemplo '§3.2'. Obligatorio."
      },
      "razonamiento": {
        "type": "string",
        "description": "Máximo dos frases dirigidas a la matrona. Describe hallazgos y por qué se escala. Nunca afirma un diagnóstico."
      },
      "accion_sugerida": {
        "type": "string",
        "description": "Una sola frase: qué hace la matrona ahora. Nunca una indicación de tratamiento ni de fármaco."
      }
    },
    "required": ["hallazgos", "nivel_riesgo", "sospechas", "cita_protocolo", "razonamiento", "accion_sugerida"]
  }
}
```

## 5. Reglas de lenguaje del modelo

Van en el system prompt, no son opcionales:

- Nunca afirmar un diagnóstico. Se escribe "hallazgos compatibles con", "sugiere evaluación
  por", "señal de alarma para".
- Nunca indicar tratamiento, fármaco ni dosis.
- Nunca dirigirse a la puérpera en el campo `razonamiento`: ese texto lo lee la matrona.
- Ante duda entre dos niveles de riesgo, elegir el más alto. El costo de una alerta de más
  es un minuto de la matrona; el costo de una de menos es un reingreso.
- `ideacion_autolitica` verdadero fuerza `nivel_riesgo: "alto"` sin excepción, en cualquier
  día del puerperio y sin importar el resto de los hallazgos.

## 6. Mientras el otro lado no existe

**Panel** no espera al Agente. Trabaja contra los datos sembrados: la cohorte sintética ya
trae evaluaciones y alertas históricas. El panel debe verse completo antes de que exista una
sola llamada a Claude.

**Agente** no espera al Panel. Prueba con un script de consola contra casos del protocolo.

Ese es todo el sentido de congelar los tipos: las dos mitades se encuentran a la hora 5 y
calzan.
