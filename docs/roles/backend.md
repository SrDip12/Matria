# Rol: Backend — Rodo

Dueño de todo lo que no se ve. Base, endpoints, datos y deploy.

**Tuyo:** `supabase/`, `src/lib/db/`, `src/app/api/`, `scripts/`
**De otros:** `src/lib/agente/` es de Pip, `src/components/` es de Senler.

---

## Qué te toca

- Aplicar el esquema y dejar la base viva
- Los endpoints: `/api/evaluar`, `/api/panel`, `/api/alertas/[id]`, `/api/conversacion/[id]`
- La cohorte sintética de ~200 puérperas
- Bajar las cifras del DEIS para el deck
- El deploy en Vercel y la URL de producción

Tú eres el pegamento: Pip te entrega la función que evalúa, Senler consume tus endpoints. Si
alguno de los dos está bloqueado, probablemente sea porque algo tuyo no está listo.

## Tu primera hora, y esto no se negocia

**Una URL de producción viva antes que cualquier otra cosa.** Puede decir "hola mundo".
Esquema aplicado, Vercel desplegado, `.env` funcionando en las tres máquinas.

Equipo que despliega a la hora 7 es equipo que no presenta. Ese riesgo es tuyo.

## La cohorte sintética

No es relleno, es la mitad de la demo. Con 3 puérperas el panel se ve como un ejercicio de
clase; con 200 priorizadas por riesgo se ve como un producto en operación.

Que las distribuciones repliquen las del DEIS de verdad: proporción de cesáreas, edad con su
cola sobre 35, previsión por tramo, región y establecimientos con nombres reales del catálogo.
Reparte los días del puerperio a lo largo de los 42, no todas en el día 1. Siembra también
evaluaciones y alertas históricas, para que las franjas se vean pobladas desde el primer
render.

Nombres ficticios generados por lista. Ningún nombre real de nadie conocido, ni de broma. Sin
RUT, sin teléfono real.

Déjalo idempotente y rápido, lo van a correr muchas veces.

## Las cifras

Cada número del pitch necesita fuente, año y fecha de corte. Con jurado del MINSAL y revisión
de CENS, un dato mal citado cuesta más de lo que gana un dato bien citado.

Los llenas en `docs/DATOS_DEIS.md`. **No confíes en cifras de prensa ni en las que
circularon en el chat, aunque citen al MINSAL. Bájalas tú del DEIS.**

Orden de prioridad si falta tiempo: cesáreas sobre total de partos, brecha público vs privado,
reingreso ≤42 días por causa puerperal, edad de la gestante. El resto es bonus.

## El hallazgo negativo

Vas a buscar la tasa nacional de mastitis y endometritis puerperal y **no la vas a
encontrar**, porque los egresos solo capturan lo hospitalizado.

No es un fracaso, es el hallazgo. Documenta qué buscaste, dónde, y por qué no existe. Esa
sección sostiene la frase más fuerte del pitch y es la respuesta si el jurado pregunta si
buscaron bien.

## Decisiones ya tomadas

Sin auth, sin RLS, sin Realtime, sin ORM. Consultas directas con el cliente de Supabase. El
panel refresca con polling cada 3 segundos. La matrona está fija en una constante.
