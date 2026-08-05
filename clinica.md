# Rol: Clínica — Vale

No escribes código. Escribes el criterio, y después dices si está bien o no está bien.

Cualquier equipo del hackathon puede armar una interfaz bonita. Ninguno puede escribir el
criterio clínico que va adentro. Ese criterio es el proyecto; el código es el envase.

---

## 1. El protocolo

Completar `docs/PROTOCOLO_CLINICO.md`. Ese documento entra completo al motor: **todo umbral
que esté ahí se aplica, y lo que no esté ahí, el sistema no lo sabe.**

No hace falta prosa formal. Hace falta criterio operacional: qué señal, en qué día, qué tan
grave, qué hace la matrona.

Si el tiempo aprieta: §2 preeclampsia, §3 infección, §4 hemorragia, §5 mastitis. Esas cuatro
sostienen la demo.

## 2. Cómo habla la gente

Vale casi tanto como el protocolo y nadie más lo puede aportar.

El sistema tiene que entender a una mujer real escribiendo con una guagua en brazos, no a una
ficha clínica. Escribe cómo te lo dicen tus pacientes de verdad:

| Término clínico | Cómo lo dice ella |
|---|---|
| Loquios de mal olor | |
| Dolor hipogástrico | |
| Fiebre | |
| Congestión mamaria | |
| Sangrado aumentado | |
| Ánimo bajo | |

Mientras más coloquial y más chileno, mejor. Esto va directo al motor y es lo que evita que
el sistema se pierda un caso grave porque la mujer no habló como manual.

## 3. Dar veracidad

Antes del pitch revisas los 6 casos y confirmas que cada alerta que sale es una alerta que tú
levantarías en tu consulta.

Si alguna te parece exagerada, alarmista o mal redactada, se cambia. Tu criterio manda por
sobre lo que haya decidido el modelo o el equipo, y no importa cuánto trabajo cueste rehacerlo.

Eres el freno. Si el sistema en algún momento:

- afirma un diagnóstico en vez de sugerir una evaluación
- indica un tratamiento, fármaco o dosis
- promete algo que en la práctica no se sostiene
- muestra una alerta que en el mundo real sería ruido

lo dices y se cambia. En eso no hay discusión.

## 4. El pitch

**Tú hablas en el escenario.** No Pip.

Un equipo técnico presentando un proyecto de salud es un equipo técnico. Una matrona
presentando la herramienta que necesita, respaldada por un equipo técnico, es otra cosa. El
jurado tiene gente del MINSAL: van a reconocer de inmediato si quien habla conoce el problema
desde adentro.

La estructura está en `docs/PITCH.md`. El primer minuto es tuyo y va en tus palabras.
