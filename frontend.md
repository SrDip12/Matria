# Rol: Frontend — Senler

Dueño de la única pantalla que ve el jurado. Todo el trabajo del equipo se juzga a través del
tuyo.

**Tuyo:** `src/app/(panel)/`, `src/components/`, `src/app/globals.css`
**De otros:** nada de `api/`, `supabase/`, `scripts/`, `agente/`.

---

## La pantalla

Una sola vista, dos columnas. Sin navegación, sin rutas, sin menú.

```
┌────────────────────────────┬──────────────────────────────────────────────┐
│  CONVERSACIÓN (35%)        │  PANEL DE LA MATRONA (65%)                   │
│                            │                                              │
│  Camila Rojas · día 9      │  12 puérperas en seguimiento · 3 pendientes   │
│  cesárea · 31 años         │                                              │
│                            │  ┌────────────────────────────────────────┐  │
│  ┌──────────────────────┐  │  │ ● Camila Rojas      31a  cesárea  d.9  │  │
│  │ ¿Cómo te has sentido │  │  │   Hallazgos compatibles con endometri-  │  │
│  │ hoy?                 │  │  │   tis. Sugiere evaluación presencial.   │  │
│  └──────────────────────┘  │  │   §3.1                                  │  │
│        ┌────────────────┐  │  │   ▓▓▓▓▓▓▓▓█░░░░░░░░░░░░░░░░░░░░░░░░░░   │  │
│        │ me duele la    │  │  └────────────────────────────────────────┘  │
│        │ guata y me     │  │  ┌────────────────────────────────────────┐  │
│        │ huele feo      │  │  │ ● Ana Pérez         27a  vaginal  d.14  │  │
│        └────────────────┘  │  └────────────────────────────────────────┘  │
│  [escribir como Camila]    │                                              │
└────────────────────────────┴──────────────────────────────────────────────┘
```

La izquierda se ve como mensajería, no como formulario. El jurado tiene que entender sin
explicación que ese es el canal de la mujer.

**El recorrido completo ocurre sin cambiar de pantalla:** se escribe a la izquierda, aparece
la alerta priorizada a la derecha. Ese es el momento del pitch. Todo lo que construyas sirve
a ese momento o sobra.

## Elemento firma: la franja de 42 días

Cada fila lleva una franja horizontal de 42 celdas. La posición actual marcada, y cada celda
donde se disparó una alerta pintada con su color. De un vistazo la matrona ve dónde está cada
mujer en la ventana de riesgo y dónde se le complicó.

Es lo único con licencia para ser llamativo. No lo cambies por tarjetas con íconos grandes,
no le pongas gradiente, no lo animes con rebote. Que sea preciso.

Los datos vienen en `FilaPanel.franja`: 42 posiciones, `null` cuando no hubo contacto.

## Tokens

```css
--ground:      #F5F6F4;
--tinta:       #1A1F1D;
--tinta-suave: #6B7370;
--estructura:  #2C4A4A;
--alto:        #B3261E;
--medio:       #B26B00;
--bajo:        #4A7C59;
```

Newsreader para títulos y cifras, IBM Plex Sans para interfaz, IBM Plex Mono para días, horas
y números. `tabular-nums` en todo lo numérico.

**Todo el color está reservado para el riesgo.** Si un elemento no comunica riesgo, es gris.
Sin gradientes, sin sombras difusas, sin emojis, sin ilustraciones. Bordes de 1px.

## Cómo escribir en la interfaz

Nunca la palabra "diagnóstico": se escribe "hallazgos compatibles con", "sugiere evaluación".
Los botones dicen qué hacen: "Marcar como resuelta", no "Confirmar". El estado vacío no dice
"no hay datos", dice qué significa: "Sin señales de alarma en las últimas 24 horas."

## No esperes a nadie

La cohorte sintética llega con evaluaciones y alertas sembradas desde la hora 2. **El panel
tiene que verse terminado antes de que exista una sola llamada a Claude.** Lees
`src/lib/types.ts` y construyes contra eso. Después cambias el origen por `/api/panel` con
polling y listo.

## Trampas

- **El panel vacío mata el proyecto.** Si el seed no está a la hora 2, reclámale a Rodo fuerte.
- **Nada de responsive.** Averigua a qué resolución se proyecta y optimiza para esa sola.
- **Sin spinners girando.** En una herramienta clínica se lee como caída. Un estado de
  "evaluando" corto y explícito.
