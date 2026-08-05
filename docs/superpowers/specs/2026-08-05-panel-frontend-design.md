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
