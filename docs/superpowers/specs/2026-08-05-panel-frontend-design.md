# Panel de la matrona — diseño de frontend

Rol: Frontend (Senler). Carpetas propias: `src/app/(panel)/`, `src/components/`, `src/app/globals.css`.

## Contexto

Una sola pantalla, dos columnas: conversación simulada (35%) a la izquierda, panel de la
matrona (65%) a la derecha. Sin navegación, sin rutas, sin auth. El recorrido completo del
pitch ocurre sin cambiar de pantalla: se escribe a la izquierda, la alerta priorizada aparece
a la derecha.

Backend y agente ya están construidos y funcionando contra el contrato congelado
(`src/lib/types.ts`, `docs/CONTRATOS.md`): `GET /api/panel`, `GET /api/conversacion/[id]`,
`POST /api/evaluar`, `PATCH /api/alertas/[id]`. El frontend consume datos reales desde el
principio, sin mocks.

## Decisión de sistema visual (aprobada explícitamente por el usuario)

El `Design System` del repo (Nocturne: dark, acento morado, Inter) **contradice** las reglas
duras de `CLAUDE.md` §10 y §12 (fondo claro, sin modo oscuro, "todo el color reservado para
riesgo"). Se preguntó al usuario y eligió explícitamente seguir Nocturne tal cual, pese a la
advertencia. Esta es una decisión consciente, documentada acá para que quede registro.

**Tokens base (de Nocturne, sin modificar):**

```css
--color-bg:      #161826
--color-surface: #232532
--color-text:    #e9e9ed
--color-accent:  #9184d9
--color-divider: color-mix(in srgb, #e9e9ed 16%, transparent)
--radius-md:     8px
font: Inter (heading 500, body 400)
```

**Extensión necesaria — colores de riesgo.** Nocturne no define semántica de riesgo (es un
sistema de producto genérico). Se agregan tres tokens nuevos, usados *exclusivamente* en:
punto de riesgo de la fila, celdas de la franja de 42 días, y tag de alerta. En ningún otro
lugar de la interfaz aparece color fuera del acento y los neutros de Nocturne.

```css
--riesgo-alto:  #e5484d
--riesgo-medio: #d9a441
--riesgo-bajo:  #4a9d6f
```

Componentes reutilizados de Nocturne (`.btn-primary/.btn-secondary`, `.card`, `.tag`,
`.table`, `.input`, `:focus-visible` en acento) tal como están documentados en
`Design System/_ds/.../readme.md`.

## Rutas y archivos

- **Reemplaza** `src/app/page.tsx` (placeholder de hora 1) por `src/app/(panel)/page.tsx`.
  El route group es transparente en la URL: sigue sirviendo `/`. Es la carpeta que el rol de
  frontend tiene asignada.
- `src/components/PanelMatrona.tsx` — columna derecha completa: header con conteo
  ("N puérperas en seguimiento · M pendientes") + lista de filas.
- `src/components/FilaPuerpera.tsx` — una fila: punto de riesgo, nombre/edad/tipo parto/día,
  razonamiento de la última evaluación + cita de protocolo, franja de 42, acción "Marcar como
  resuelta" en alertas pendientes. Click selecciona la puérpera para la conversación.
- `src/components/Franja42.tsx` — elemento firma: 42 celdas horizontales, día actual marcado,
  cada celda con alerta pintada según `NivelRiesgo`, `null` = sin contacto (celda vacía/gris
  tenue). Recibe `franja: (NivelRiesgo | null)[]` y `diaActual: number`.
- `src/components/Conversacion.tsx` — columna izquierda: header de la puérpera seleccionada
  (nombre, día, tipo parto, edad), lista de mensajes tipo burbuja (`autor: puerpera` vs
  `sistema`), input + botón "escribir como {nombre}".
- `src/lib/hooks/usePanel.ts` — polling a `GET /api/panel` cada 3000ms (`setInterval`,
  limpieza en `useEffect`). Sin librería externa: fetch nativo.
- `src/lib/hooks/useConversacion.ts` — fetch a `GET /api/conversacion/[id]` cuando cambia la
  puérpera seleccionada; expone función `enviarMensaje(texto)` que hace
  `POST /api/evaluar` y luego re-fetch de conversación y panel (no espera el próximo poll).

## Flujo de datos

```
usePanel() ──(poll 3s)──> filas: FilaPanel[]  (ordenadas por riesgo, ya viene así del server)
   │
   └─ selección por click (default: primera fila = mayor riesgo)
         │
         ▼
useConversacion(puerperaId) ──> mensajes: Mensaje[]
         │
         │  enviarMensaje(texto)
         ▼
   POST /api/evaluar { puerpera_id, texto }
         │
         ├─ estado "evaluando…" (texto corto, sin spinner) en el input mientras está en vuelo
         ▼
   refetch conversación + refetch panel inmediato
         │
         ▼
   nueva evaluación/alerta visible en la fila correspondiente, sin recargar pantalla
```

`PATCH /api/alertas/[id]` con `{ estado: "resuelta" }` al click en "Marcar como resuelta";
refetch panel tras la respuesta.

## Copy y estados

- Nunca la palabra "diagnóstico" en ningún texto de UI (regla dura del proyecto).
- Estado vacío de alertas: "Sin señales de alarma en las últimas 24 horas."
- Botones dicen la acción: "Marcar como resuelta".
- Sin spinners girando: mientras se espera `/api/evaluar`, el input muestra "evaluando…" y se
  deshabilita; nada gira.
- Español de Chile, registro profesional, sin emojis.

## Fuera de alcance (explícitamente, por CLAUDE.md §12 y frontend.md)

Responsive, modo oscuro *como opción* (el dark es el único tema, no hay toggle), navegación,
auth, CRUD de puérperas, animaciones más allá de transiciones de color simples.

## Testing

Sin frameworks de test (prohibido por CLAUDE.md §3). Verificación manual: `pnpm dev`,
confirmar que el panel carga con la cohorte sembrada, seleccionar una fila, enviar un mensaje
y ver la evaluación/alerta aparecer sin recargar.

---

## Corrección v2 (misma fecha) — sistema visual real + dashboard/chatbot

**Corrección de fuente de diseño.** La decisión de sistema visual de más arriba usó
`Design System/_ds/nocturne-.../` (dark, morado, genérico) porque era lo único explorado en
esa sesión. El usuario señaló después `Design System/Design System Matria.dc.html`, que es
el sistema **específico de Matria** — construido sobre la misma base Nocturne pero con paleta,
logo y componentes propios — y pidió guiarse por ese para todo lo hecho y por hacerse. Se
reemplazan los tokens de la sección "Decisión de sistema visual" por los de abajo; el resto de
esta sección (rutas, hooks, flujo de datos, copy) sigue vigente.

**Tokens reales (de `Design System Matria.dc.html`):**

```css
--fondo:        #F2ECE9
--superficie:   #FBF8F6
--borde:        #E2D8D4
--texto:        #2A1418
--texto-suave:  #6E555A
--marca-900:    #5C0A18   /* franja superior, fondo oscuro puntual */
--marca-700:    #A50B20
--marca-600:    #C1121F
--marca-500:    #E01E37   /* rojo base */
--marca-300:    #FF6B82
--marca-100:    #FFD9DF

--riesgo-alto:   #C1121F  /* carmesí — escalar ahora, bg #FDECEE borde #F5C2C9 */
--riesgo-medio:  #C97A05  /* ámbar — revisar hoy, bg #FDF4E3 borde #F0DCB4 */
--riesgo-bajo:   #1F8A5B  /* verde — seguimiento normal, bg #EDF7F1 borde #C7E3D4 */
```

Tipografía: Inter (sin cambio). Radio 8px en superficies, 999px en etiquetas/pills. Botón
primario relleno rojo 600, secundario contorno rojo, ghost solo texto. Burbuja de la
puérpera: rojo 600 relleno, texto blanco, alineada a la derecha. Burbuja del agente/sistema:
superficie blanca con borde, alineada a la izquierda — invierte lo implementado con Nocturne.

**Logo.** La marca elegida es "la silueta" (mujer de perfil, guata, un punto adentro) —
`Logo Matria.dc.html` sección `1e`, confirmada por el usuario contra `Design System
Matria.dc.html` (misma marca en su banda superior). Un solo color de relleno según contexto
(`#E01E37` sobre claro, blanco sobre rojo, `#FF3B57` sobre oscuro). Nunca rotada, nunca con
contorno, nunca multicolor.

**Alcance ampliado — dashboard + chatbot, sin config de reglas.** El usuario pidió un
"dashboard" y un "tab navegador", que contradice CLAUDE.md §5/§10/§12 (una sola vista, sin
navegación, sin panel de administración). Resuelto así, confirmado con el usuario:

- El **dashboard** es el panel de la matrona ya construido (200 puérperas de la cohorte
  sembrada) — no es una pantalla nueva, es la apertura de la app.
- Se agrega un **tab "Chatbot"**: vista aparte, solo conversación con selector de puérpera,
  para simular el canal como paciente fuera del recorrido del pitch.
- **No se construye** portal de configuración de parámetros/reglas — excluido explícitamente
  por el usuario.
- Los tabs son estado de cliente (`useState` en `src/app/(panel)/page.tsx`), sin URLs ni
  rutas nuevas — se mantiene la letra de "sin rutas". El tab "Dashboard" conserva intacto el
  mecanismo de dos columnas (conversación + panel) que exige la rúbrica: mensaje entra →
  alerta aparece, en la misma vista, sin cambiar de tab. El tab "Chatbot" es una superficie
  adicional que nunca se usa durante el momento del pitch.

**Archivos nuevos:**
- `src/components/LogoMatria.tsx` — el mark SVG de "la silueta", con prop `fill`.
- `src/components/TabBar.tsx` — barra superior: logo + wordmark + selector Dashboard/Chatbot.
- `src/components/ChatbotPaciente.tsx` — selector de puérpera + `Conversacion` a ancho
  completo, para el tab "Chatbot".

**Archivos que cambian de paleta (sin cambiar su lógica):** `globals.css`, `riesgo.ts`,
`Franja42.tsx`, `FilaPuerpera.tsx`, `PanelMatrona.tsx`, `Conversacion.tsx`.
