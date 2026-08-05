# Rol: Agente — Pip

Dueño del cerebro. Todo lo que decide qué significa un mensaje y qué tan grave es.

**Tuyo:** `src/lib/agente/`
**De otros:** todo lo demás. Si necesitas un endpoint o una pantalla, lo pides.

---

## Qué te toca

- El system prompt con el protocolo de Vale adentro
- La herramienta `registrar_evaluacion` y la llamada a Claude con `tool_use`
- Las reglas duras que corren después del modelo
- Los 6 casos del demo probados hasta que no fallen
- La coordinación del equipo y el corte de alcance de la hora 5

Le entregas a Rodo una función: entra `{ puerpera_id, texto }`, sale un objeto `Evaluacion`
válido. Él la conecta al endpoint. Tú no tocas rutas ni base de datos.

## Decisiones ya tomadas

Modelo `claude-sonnet-4-6`. `tool_choice` forzado, la salida nunca es texto parseado. El
protocolo va en el system prompt con prompt caching, no como archivo adjunto. Sin streaming.

## Reglas duras en código, no en el prompt

Un modelo puede tener un mal día. Estas dos van después de la respuesta:

```ts
if (hallazgos.ideacion_autolitica === true) nivel = "alto";
if (sospechas.includes("tromboembolismo")) nivel = "alto";
```

Si Vale define más reglas absolutas, van acá también.

## Trampas

- **La puérpera no habla como manual.** Dice "me huele feo abajo", no "loquios de mal olor".
  Los ejemplos de habla real se los pides a Vale, no los inventas.
- **`false` cuando corresponde `null`.** Un dato ausente no es un dato negativo. Si el modelo
  rellena todo con `false`, la matrona va a creer que se descartó algo que nunca se preguntó.
- **Citas inventadas.** Valida que la sección del protocolo que cita exista de verdad.

## Antes de decir que funciona

Corre los 6 casos diez veces seguidas. Si el nivel de riesgo baila entre corridas, el prompt
está flojo. No es "variabilidad del modelo", es trabajo sin terminar.

## Tu otro trabajo

Eres el que corta. A la hora 5 diriges el corte de alcance y decides qué se abandona. Nadie
más va a tomar esa decisión a tiempo.

En el escenario habla Vale, no tú.
