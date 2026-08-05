# CLAUDE.md

Este archivo lo lee tu agente antes de cada tarea. Es el contrato del proyecto.
Si algo que te piden contradice este archivo, **para y avisa en el canal del equipo**.

---

## 1. Qué estamos construyendo

**Matria** es un agente de acompañamiento longitudinal del puerperio.

Sigue a la puérpera durante los 42 días posteriores al parto, interpreta lo que ella
responde en lenguaje natural, lo convierte en variables clínicas estructuradas, estratifica
riesgo según un protocolo escrito por matrona, y entrega al equipo clínico un panel
priorizado para intervenir **antes** del reingreso a urgencias.

Contexto: Impact Lab Longevidad (Bendita IA + Caja La Araucana), Línea 03 — Continuidad y
Medicina de Precisión. Ventana de construcción: 8 horas. Jurado con representantes del
MINSAL y revisión técnica de CENS.

## 2. Reglas duras — no negociables

Estas no se discuten ni se optimizan. Romper una descalifica o hunde el pitch.

1. **Nada de código preexistente.** Todo se escribe dentro de la ventana del evento. Se
   revisan timestamps de commits. No copiar de Petilwild, Exovita, Hilo ni de ningún repo
   anterior. Librerías públicas de npm sí, obviamente.
2. **El sistema NO diagnostica.** Detecta, prioriza y escala al profesional. Ningún texto de
   la UI, ningún prompt y ningún nombre de variable puede afirmar un diagnóstico. Se escribe
   `sospecha`, `hallazgo`, `señal de alarma`, `sugerir evaluación`. Nunca `diagnóstico`,
   `el paciente tiene`, `confirmado`.
3. **Cero datos personales reales.** Toda la data es sintética. Nunca un RUT, nombre,
   teléfono o ficha real, ni siquiera en un comentario o en un seed de prueba.
4. **Ninguna acción clínica automática.** El sistema nunca contacta a un servicio de
   urgencia, nunca agenda, nunca indica tratamiento. Solo alerta a la matrona.
5. **No se toca WhatsApp real.** El canal se simula en el navegador. Ver sección 5.
6. **No edites archivos fuera de tu rol.** Ver el mapa de propiedad en la sección 6.
7. **`src/lib/types.ts` y `supabase/schema.sql` están congelados** desde la hora 1. Si
   necesitas cambiarlos, se avisa en voz alta al equipo antes de tocarlos. Nunca en silencio.

## 3. Stack fijo

No propongas alternativas. Esto se decidió antes del evento y cambiarlo cuesta horas.

| Capa | Elección |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Estilos | Tailwind + shadcn/ui |
| Base de datos | Supabase (solo Postgres) |
| IA | Claude API — `claude-sonnet-4-6` |
| Deploy | Vercel |
| Gestor de paquetes | pnpm |

**Lo que NO usamos:** tRPC, Prisma, NextAuth ni ningún auth, Supabase Realtime, Supabase RLS,
Zustand/Redux, tests, Storybook, i18n, Docker.

Sin autenticación. La matrona está fija en una constante. Para refrescar el panel se usa
polling cada 3 segundos, no suscripciones.

## 4. Convenciones

- **Dominio en español, plumbing en inglés.** Tablas, columnas, campos del contrato y textos
  de UI en español (`puerperas`, `dia_puerperio`, `nivel_riesgo`). Nombres de funciones
  utilitarias, hooks y variables internas en inglés (`fetchAlertas`, `useLoading`).
- Base de datos en `snake_case`, TypeScript en `camelCase` salvo los campos que vienen
  directo de la base, que mantienen `snake_case` para no mapear.
- Componentes en `PascalCase.tsx`. Un componente por archivo.
- Server Actions y Route Handlers, nunca una capa de API propia.
- Sin comentarios explicando lo obvio. Sí comentarios cuando un umbral clínico viene del
  protocolo: dejar la referencia (`// Protocolo §3.2 — fiebre ≥38°C tras día 1`).
- Todo el texto visible para el usuario en español de Chile, registro profesional, sin
  emojis en la interfaz clínica.

## 5. Cómo funciona la demo

Una sola pantalla dividida:

- **Izquierda:** conversación simulada de la puérpera, con aspecto de mensajería. Se puede
  escribir como si fuera ella y hay mensajes precargados para disparar escenarios.
- **Derecha:** panel de la matrona. Lista de puérperas ordenada por riesgo, con las alertas
  actualizándose en vivo cuando entra un mensaje.

El jurado tiene que ver, en la misma pantalla y sin cambiar de contexto: mensaje entra →
agente lo interpreta → alerta aparece priorizada. Esa es toda la demo. Si algo no sirve a
ese recorrido, no se construye.

**Criterio de rúbrica:** se evalúa que se vean en pantalla el input y el output del agente,
y que la demo corra en vivo. Diapositivas del flujo no puntúan. Cualquier cambio que aleje
el input del output en la pantalla nos cuesta nota.

## 6. Mapa de propiedad de archivos

Cada persona edita solo lo suyo. Si necesitas algo de otra zona, lo pides, no lo escribes.

| Rol | Persona | Carpetas que le pertenecen |
|---|---|---|
| **Agente** | Pip | `src/lib/agente/` |
| **Backend** | Rodo | `supabase/`, `src/lib/db/`, `src/app/api/`, `scripts/`, `docs/DATOS_DEIS.md` |
| **Frontend** | Senler | `src/app/(panel)/`, `src/components/`, `src/app/globals.css` |
| **Clínica** | Vale | `docs/PROTOCOLO_CLINICO.md` — nadie más lo edita |
| **Compartido — congelado** | — | `src/lib/types.ts`, `supabase/schema.sql` |
| **Nadie sin avisar** | — | `package.json`, `next.config.js`, `tailwind.config.ts` |

En una frase: **Pip piensa, Rodo conecta, Senler muestra, Vale valida.**

Si dos personas necesitan el mismo archivo, gana quien lo tiene asignado; el otro pide el
cambio.

## 7. Git

Trunk-based, sin ceremonia:

- Rama única `main`. Nada de pull requests, no hay tiempo.
- `git pull --rebase` **antes** de cada push. Siempre.
- Commits chicos y frecuentes, mínimo uno cada 30 minutos. Además de higiene, es la prueba
  de que el código se escribió dentro de la ventana.
- Mensajes en español, en imperativo: `agrega extracción de hallazgos`, `ajusta orden del panel`.
- Si hay conflicto en `types.ts` o `schema.sql`, no lo resuelvas solo: son archivos
  congelados y un conflicto ahí significa que alguien rompió la regla 7 de la sección 2.

## 8. Contrato de datos

`src/lib/types.ts` es la única fuente de verdad de las formas de datos. Panel y Agente
trabajan en paralelo contra ese archivo sin esperarse.

El detalle del esquema de extracción de Claude está en `docs/CONTRATOS.md`. Léelo antes de
tocar cualquier cosa que produzca o consuma una evaluación.

## 9. Uso de Claude API

Dos usos, separados y no intercambiables:

**A. Extracción clínica** (el corazón del producto). Sonnet 4.6 con `tool_use` para forzar
salida estructurada. Entra texto libre de la puérpera, sale un objeto `Evaluacion` validado.
El protocolo clínico curado va en el system prompt con prompt caching, no como archivo
adjunto.

**B. Loop de seguimiento.** Decide qué preguntar al día siguiente según el riesgo acumulado.
Si a la hora 5 esto no está estable, se degrada a una función determinística con reglas y el
pitch no cambia. No se hunde la demo por esto.

Cada alerta que el sistema genere debe citar la sección del protocolo que la justifica. Es
lo que separa este proyecto de un chatbot y es lo que el jurado del MINSAL va a mirar.

Nunca hardcodear la API key. Va en `.env.local`, que está en `.gitignore`.

## 10. Sistema visual del panel

Es una herramienta de triage que una matrona abre a las 8 de la mañana. Densa, legible,
tranquila. Todo el color está reservado para el estado de riesgo: si algo no comunica
riesgo, es gris.

```
Fondo          #F5F6F4   ground claro, levemente frío
Tinta          #1A1F1D   texto principal
Tinta suave    #6B7370   secundario, etiquetas
Estructura     #2C4A4A   chrome, encabezados, bordes marcados
Riesgo alto    #B3261E
Riesgo medio   #B26B00
Riesgo bajo    #4A7C59
```

Tipografía: **Newsreader** para títulos y cifras destacadas, **IBM Plex Sans** para interfaz
y cuerpo, **IBM Plex Mono** para datos tabulares, días y horas. Números siempre con
`font-variant-numeric: tabular-nums`.

**Elemento firma — la franja de 42 días.** Cada puérpera en el panel lleva una franja
horizontal de 42 celdas: la posición actual del puerperio, y marcada en color cada celda
donde se disparó una alerta. De un vistazo la matrona ve dónde está cada mujer en la ventana
de riesgo y dónde se le complicó. Es el único elemento con licencia para ser llamativo; todo
lo demás se mantiene sobrio. No lo reemplaces por tarjetas con íconos grandes.

Sin gradientes, sin sombras difusas, sin emojis, sin ilustraciones. Bordes de 1px, radio
pequeño y consistente.

## 11. Definición de listo

Una tarea está lista cuando está desplegada en la URL de producción y funciona ahí. No
cuando corre en local. Se despliega temprano y se despliega seguido.

## 12. Lo que NO se construye

Si te descubres empezando cualquiera de estas, para:

autenticación · integración real con WhatsApp · multi-tenant · RLS · tests · onboarding ·
panel de administración · envío de correos · exportar a PDF · modo oscuro · responsive más
allá de la pantalla del demo · CRUD de puérperas · edición de protocolo desde la UI ·
internacionalización · página de marketing

## 13. Si estás bloqueado

Después de 15 minutos sin avanzar en algo, no sigas. Anda al camino más corto que deje la
demo en pie y avisa al equipo qué degradaste. En un hackathon el enemigo no es la deuda
técnica, es la hora.
