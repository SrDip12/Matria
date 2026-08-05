# Panel de la matrona — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir la pantalla única de dos columnas (conversación + panel de la matrona)
descrita en `docs/roles/frontend.md`, consumiendo los endpoints reales ya construidos
(`/api/panel`, `/api/conversacion/[id]`, `/api/evaluar`, `/api/alertas/[id]`).

**Architecture:** Next.js App Router, un solo route group `src/app/(panel)/page.tsx` como
única pantalla. Dos hooks de cliente (`usePanel`, `useConversacion`) manejan todo el fetching
(polling de 3s y refetch inmediato tras enviar un mensaje). Cuatro componentes de
presentación (`PanelMatrona`, `FilaPuerpera`, `Franja42`, `Conversacion`) sin estado de red
propio — reciben datos y callbacks por props.

**Tech Stack:** Next.js 15 (App Router) + TypeScript + Tailwind v4 (clases + variables CSS
arbitrarias, sin shadcn). Fetch nativo, sin librería de data-fetching.

## Global Constraints

- No tests, no frameworks de test (CLAUDE.md §3). Verificación = TypeScript check + revisión
  manual en el navegador.
- Nunca la palabra "diagnóstico" en ningún texto de UI (CLAUDE.md §2.2).
- Sin spinners girando; estado "evaluando…" corto y explícito (`docs/roles/frontend.md`).
- Estado vacío de alertas: "Sin señales de alarma en las últimas 24 horas."
- Polling del panel cada 3000ms (CLAUDE.md §3).
- Sin responsive, sin modo claro/oscuro alternable (un solo tema dark, decisión documentada
  en `docs/superpowers/specs/2026-08-05-panel-frontend-design.md`).
- Tokens de color: `--color-bg:#161826 --color-surface:#232532 --color-text:#e9e9ed
  --color-accent:#9184d9 --color-divider:color-mix(in srgb, #e9e9ed 16%, transparent)
  --riesgo-alto:#e5484d --riesgo-medio:#d9a441 --riesgo-bajo:#4a9d6f`. Tipografía Inter.
- Archivos propios del rol frontend: `src/app/(panel)/`, `src/components/`,
  `src/app/globals.css`, y utilidades de solo-lectura de UI en `src/lib/` (nuevas, no tocar
  `src/lib/types.ts`, `src/lib/db/`, `src/lib/agente/`).
- `src/lib/types.ts` es la fuente de verdad de tipos — no se modifica.
- `franja[i]` corresponde al día `i + 1` del puerperio (confirmado en
  `src/lib/db/index.ts:88`).

---

### Task 1: Tokens y estilos base

**Files:**
- Modify: `src/app/globals.css` (reemplazo completo del contenido actual)

**Interfaces:**
- Produces: variables CSS `--color-bg`, `--color-surface`, `--color-text`, `--color-accent`,
  `--color-divider`, `--radius-md`; clases `.btn`, `.card`, `.tag`, `.input`, `.tabular`.
  Todo componente posterior las consume vía `var(--color-*)` o estas clases.

- [ ] **Step 1: Reemplazar `src/app/globals.css`**

```css
@import "tailwindcss";
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

:root {
  --color-bg: #161826;
  --color-surface: #232532;
  --color-text: #e9e9ed;
  --color-accent: #9184d9;
  --color-divider: color-mix(in srgb, #e9e9ed 16%, transparent);
  --riesgo-alto: #e5484d;
  --riesgo-medio: #d9a441;
  --riesgo-bajo: #4a9d6f;
  --radius-md: 8px;
}

@theme inline {
  --color-background: var(--color-bg);
  --color-foreground: var(--color-text);
  --font-sans: "Inter", system-ui, sans-serif;
}

html,
body {
  height: 100%;
}

body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 15px;
}

.tabular {
  font-variant-numeric: tabular-nums;
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  background: transparent;
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
  padding: 8px 14px;
  border-radius: var(--radius-md);
}
.btn:hover {
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
}
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.input {
  min-height: 36px;
  padding: 6px 10px;
  font: inherit;
  font-size: 14px;
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-md);
}
.input:focus-visible {
  border-color: var(--color-accent);
  outline-offset: 0;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 0.02em;
  padding: 3px 10px;
  border-radius: 6px;
}
```

- [ ] **Step 2: Verificar que el proyecto sigue compilando**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores (el archivo es CSS, este check solo confirma que no rompiste nada de
TS en el resto del repo).

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "agrega tokens y estilos base del panel"
```

---

### Task 2: Utilidades compartidas de UI

**Files:**
- Create: `src/lib/riesgo.ts`
- Create: `src/lib/formato.ts`

**Interfaces:**
- Consumes: `NivelRiesgo`, `TipoParto` de `@/lib/types`.
- Produces: `NIVEL_COLOR: Record<NivelRiesgo, string>` desde `@/lib/riesgo`;
  `ETIQUETA_PARTO: Record<TipoParto, string>` desde `@/lib/formato`. Usados por
  `Franja42`, `FilaPuerpera` y `Conversacion` (tasks 3, 4, 8).

- [ ] **Step 1: Crear `src/lib/riesgo.ts`**

```ts
import type { NivelRiesgo } from "@/lib/types";

export const NIVEL_COLOR: Record<NivelRiesgo, string> = {
  alto: "#e5484d",
  medio: "#d9a441",
  bajo: "#4a9d6f",
};
```

- [ ] **Step 2: Crear `src/lib/formato.ts`**

```ts
import type { TipoParto } from "@/lib/types";

export const ETIQUETA_PARTO: Record<TipoParto, string> = {
  vaginal: "vaginal",
  cesarea: "cesárea",
};
```

- [ ] **Step 3: Verificar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/lib/riesgo.ts src/lib/formato.ts
git commit -m "agrega utilidades de color de riesgo y etiquetas de parto"
```

---

### Task 3: `Franja42` — el elemento firma

**Files:**
- Create: `src/components/Franja42.tsx`

**Interfaces:**
- Consumes: `NIVEL_COLOR` de `@/lib/riesgo` (Task 2); tipo `NivelRiesgo` de `@/lib/types`.
- Produces: componente `Franja42({ franja, diaActual }: { franja: (NivelRiesgo | null)[];
  diaActual: number })`, consumido por `FilaPuerpera` (Task 4).

- [ ] **Step 1: Crear `src/components/Franja42.tsx`**

```tsx
import { NIVEL_COLOR } from "@/lib/riesgo";
import type { NivelRiesgo } from "@/lib/types";

interface Franja42Props {
  franja: (NivelRiesgo | null)[];
  diaActual: number;
}

export function Franja42({ franja, diaActual }: Franja42Props) {
  return (
    <div className="flex gap-px" role="img" aria-label={`Día ${diaActual} de 42 del puerperio`}>
      {franja.map((nivel, indice) => {
        const dia = indice + 1;
        const esActual = dia === diaActual;
        return (
          <div
            key={dia}
            title={nivel ? `Día ${dia} — riesgo ${nivel}` : `Día ${dia} — sin contacto`}
            className={esActual ? "h-3 flex-1 ring-1 ring-[var(--color-accent)]" : "h-3 flex-1"}
            style={{ background: nivel ? NIVEL_COLOR[nivel] : "var(--color-divider)" }}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/Franja42.tsx
git commit -m "agrega componente Franja42"
```

---

### Task 4: `FilaPuerpera`

**Files:**
- Create: `src/components/FilaPuerpera.tsx`

**Interfaces:**
- Consumes: `Franja42` (Task 3), `NIVEL_COLOR` (Task 2), `ETIQUETA_PARTO` (Task 2),
  `ETIQUETA_RIESGO` de `@/lib/types`, tipo `FilaPanel` de `@/lib/types`.
- Produces: componente `FilaPuerpera({ fila, seleccionada, onSeleccionar, onResolverAlerta })`
  consumido por `PanelMatrona` (Task 5). `onSeleccionar: () => void`,
  `onResolverAlerta: (alertaId: string) => void`.

- [ ] **Step 1: Crear `src/components/FilaPuerpera.tsx`**

```tsx
"use client";

import { Franja42 } from "@/components/Franja42";
import { ETIQUETA_PARTO } from "@/lib/formato";
import { NIVEL_COLOR } from "@/lib/riesgo";
import { ETIQUETA_RIESGO, type FilaPanel } from "@/lib/types";

interface FilaPuerperaProps {
  fila: FilaPanel;
  seleccionada: boolean;
  onSeleccionar: () => void;
  onResolverAlerta: (alertaId: string) => void;
}

export function FilaPuerpera({ fila, seleccionada, onSeleccionar, onResolverAlerta }: FilaPuerperaProps) {
  const { puerpera, ultima_evaluacion, alertas_pendientes, nivel_riesgo, franja } = fila;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSeleccionar}
      onKeyDown={(evento) => {
        if (evento.key === "Enter") onSeleccionar();
      }}
      className="card flex cursor-pointer flex-col gap-2 border p-3"
      style={{ borderColor: seleccionada ? "var(--color-accent)" : "transparent" }}
    >
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: NIVEL_COLOR[nivel_riesgo] }}
          aria-hidden
        />
        <span className="font-medium">{puerpera.nombre}</span>
        <span className="tabular text-sm opacity-60">
          {puerpera.edad}a · {ETIQUETA_PARTO[puerpera.tipo_parto]} · d.{puerpera.dia_puerperio}
        </span>
      </div>

      {nivel_riesgo !== "bajo" && ultima_evaluacion ? (
        <p className="text-sm opacity-85">
          {ultima_evaluacion.razonamiento} <span className="opacity-60">{ultima_evaluacion.cita_protocolo}</span>
        </p>
      ) : (
        <p className="text-sm opacity-60">{ETIQUETA_RIESGO.bajo}</p>
      )}

      <Franja42 franja={franja} diaActual={puerpera.dia_puerperio} />

      {alertas_pendientes.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {alertas_pendientes.map((alerta) => (
            <span
              key={alerta.id}
              className="tag"
              style={{
                background: `color-mix(in srgb, ${NIVEL_COLOR[alerta.nivel]} 20%, transparent)`,
                color: NIVEL_COLOR[alerta.nivel],
              }}
            >
              {alerta.titulo}
              <button
                onClick={(evento) => {
                  evento.stopPropagation();
                  onResolverAlerta(alerta.id);
                }}
                className="underline"
              >
                Marcar como resuelta
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/FilaPuerpera.tsx
git commit -m "agrega componente FilaPuerpera"
```

---

### Task 5: `PanelMatrona`

**Files:**
- Create: `src/components/PanelMatrona.tsx`

**Interfaces:**
- Consumes: `FilaPuerpera` (Task 4), tipo `FilaPanel` de `@/lib/types`.
- Produces: componente `PanelMatrona({ filas, seleccionadaId, onSeleccionar,
  onResolverAlerta })`, consumido por `src/app/(panel)/page.tsx` (Task 9).

- [ ] **Step 1: Crear `src/components/PanelMatrona.tsx`**

```tsx
"use client";

import { FilaPuerpera } from "@/components/FilaPuerpera";
import type { FilaPanel } from "@/lib/types";

interface PanelMatronaProps {
  filas: FilaPanel[];
  seleccionadaId: string | null;
  onSeleccionar: (puerperaId: string) => void;
  onResolverAlerta: (alertaId: string) => void;
}

export function PanelMatrona({ filas, seleccionadaId, onSeleccionar, onResolverAlerta }: PanelMatronaProps) {
  const pendientes = filas.reduce((total, fila) => total + fila.alertas_pendientes.length, 0);

  return (
    <section className="flex h-full flex-col gap-3 overflow-y-auto p-4">
      <h1 className="tabular text-lg font-medium">
        {filas.length} puérperas en seguimiento · {pendientes} pendientes
      </h1>
      <div className="flex flex-col gap-2">
        {filas.map((fila) => (
          <FilaPuerpera
            key={fila.puerpera.id}
            fila={fila}
            seleccionada={fila.puerpera.id === seleccionadaId}
            onSeleccionar={() => onSeleccionar(fila.puerpera.id)}
            onResolverAlerta={onResolverAlerta}
          />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/PanelMatrona.tsx
git commit -m "agrega componente PanelMatrona"
```

---

### Task 6: Hook `usePanel`

**Files:**
- Create: `src/lib/hooks/usePanel.ts`

**Interfaces:**
- Consumes: `GET /api/panel` → `{ filas: FilaPanel[] }`; `PATCH /api/alertas/[id]` →
  `{ alerta: Alerta }` (contratos ya construidos, ver `docs/CONTRATOS.md`).
- Produces: `usePanel(): { filas: FilaPanel[]; cargando: boolean; refrescar: () =>
  Promise<void>; resolverAlerta: (alertaId: string) => Promise<void> }`, consumido por
  `src/app/(panel)/page.tsx` (Task 9).

- [ ] **Step 1: Crear `src/lib/hooks/usePanel.ts`**

```ts
"use client";

import { useCallback, useEffect, useState } from "react";
import type { FilaPanel } from "@/lib/types";

const INTERVALO_MS = 3000;

export function usePanel() {
  const [filas, setFilas] = useState<FilaPanel[]>([]);
  const [cargando, setCargando] = useState(true);

  const refrescar = useCallback(async () => {
    const respuesta = await fetch("/api/panel");
    const { filas } = (await respuesta.json()) as { filas: FilaPanel[] };
    setFilas(filas);
    setCargando(false);
  }, []);

  useEffect(() => {
    refrescar();
    const id = setInterval(refrescar, INTERVALO_MS);
    return () => clearInterval(id);
  }, [refrescar]);

  const resolverAlerta = useCallback(
    async (alertaId: string) => {
      await fetch(`/api/alertas/${alertaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "resuelta" }),
      });
      await refrescar();
    },
    [refrescar]
  );

  return { filas, cargando, refrescar, resolverAlerta };
}
```

- [ ] **Step 2: Verificar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/lib/hooks/usePanel.ts
git commit -m "agrega hook usePanel con polling de 3s"
```

---

### Task 7: Hook `useConversacion`

**Files:**
- Create: `src/lib/hooks/useConversacion.ts`

**Interfaces:**
- Consumes: `GET /api/conversacion/[id]` → `{ mensajes: Mensaje[] }`; `POST /api/evaluar`
  con `{ puerpera_id, texto }` → `{ evaluacion, alerta }` (contratos ya construidos).
- Produces: `useConversacion(puerperaId: string | null, onEvaluado?: () => void): {
  mensajes: Mensaje[]; enviando: boolean; enviar: (texto: string) => Promise<void> }`,
  consumido por `src/app/(panel)/page.tsx` (Task 9).

- [ ] **Step 1: Crear `src/lib/hooks/useConversacion.ts`**

```ts
"use client";

import { useCallback, useEffect, useState } from "react";
import type { Mensaje } from "@/lib/types";

export function useConversacion(puerperaId: string | null, onEvaluado?: () => void) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [enviando, setEnviando] = useState(false);

  const refrescar = useCallback(async () => {
    if (!puerperaId) {
      setMensajes([]);
      return;
    }
    const respuesta = await fetch(`/api/conversacion/${puerperaId}`);
    const { mensajes } = (await respuesta.json()) as { mensajes: Mensaje[] };
    setMensajes(mensajes);
  }, [puerperaId]);

  useEffect(() => {
    refrescar();
  }, [refrescar]);

  const enviar = useCallback(
    async (texto: string) => {
      if (!puerperaId) return;
      setEnviando(true);
      await fetch("/api/evaluar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ puerpera_id: puerperaId, texto }),
      });
      await refrescar();
      setEnviando(false);
      onEvaluado?.();
    },
    [puerperaId, refrescar, onEvaluado]
  );

  return { mensajes, enviando, enviar };
}
```

- [ ] **Step 2: Verificar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/lib/hooks/useConversacion.ts
git commit -m "agrega hook useConversacion"
```

---

### Task 8: `Conversacion`

**Files:**
- Create: `src/components/Conversacion.tsx`

**Interfaces:**
- Consumes: `ETIQUETA_PARTO` de `@/lib/formato` (Task 2); tipos `Mensaje`, `Puerpera` de
  `@/lib/types`.
- Produces: componente `Conversacion({ puerpera, mensajes, enviando, onEnviar })` donde
  `onEnviar: (texto: string) => void`, consumido por `src/app/(panel)/page.tsx` (Task 9).

- [ ] **Step 1: Crear `src/components/Conversacion.tsx`**

```tsx
"use client";

import { useState } from "react";
import { ETIQUETA_PARTO } from "@/lib/formato";
import type { Mensaje, Puerpera } from "@/lib/types";

interface ConversacionProps {
  puerpera: Puerpera | null;
  mensajes: Mensaje[];
  enviando: boolean;
  onEnviar: (texto: string) => void;
}

export function Conversacion({ puerpera, mensajes, enviando, onEnviar }: ConversacionProps) {
  const [texto, setTexto] = useState("");

  function enviar() {
    const limpio = texto.trim();
    if (!limpio || enviando) return;
    onEnviar(limpio);
    setTexto("");
  }

  if (!puerpera) {
    return <div className="p-4 opacity-60">Selecciona una puérpera del panel.</div>;
  }

  return (
    <section className="flex h-full flex-col">
      <header className="border-b p-4" style={{ borderColor: "var(--color-divider)" }}>
        <h2 className="font-medium">
          {puerpera.nombre} · día {puerpera.dia_puerperio}
        </h2>
        <p className="tabular text-sm opacity-60">
          {ETIQUETA_PARTO[puerpera.tipo_parto]} · {puerpera.edad} años
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {mensajes.map((mensaje) => (
          <div
            key={mensaje.id}
            className={
              mensaje.autor === "puerpera"
                ? "max-w-[80%] self-start rounded-lg px-3 py-2 text-sm"
                : "max-w-[80%] self-end rounded-lg px-3 py-2 text-sm"
            }
            style={{
              background:
                mensaje.autor === "puerpera"
                  ? "var(--color-surface)"
                  : "color-mix(in srgb, var(--color-accent) 20%, transparent)",
            }}
          >
            {mensaje.texto}
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-t p-4" style={{ borderColor: "var(--color-divider)" }}>
        <input
          className="input flex-1"
          placeholder={`escribir como ${puerpera.nombre}`}
          value={texto}
          disabled={enviando}
          onChange={(evento) => setTexto(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === "Enter") enviar();
          }}
        />
        <button className="btn" disabled={enviando} onClick={enviar}>
          {enviando ? "evaluando…" : "Enviar"}
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/Conversacion.tsx
git commit -m "agrega componente Conversacion"
```

---

### Task 9: Pantalla única y limpieza del placeholder

**Files:**
- Create: `src/app/(panel)/page.tsx`
- Delete: `src/app/page.tsx` (placeholder de hora 1; el route group `(panel)` pasa a servir
  `/` porque los route groups son transparentes en la URL)

**Interfaces:**
- Consumes: `usePanel` (Task 6), `useConversacion` (Task 7), `PanelMatrona` (Task 5),
  `Conversacion` (Task 8).
- Produces: la pantalla completa en `/`.

- [ ] **Step 1: Borrar el placeholder**

```bash
rm "src/app/page.tsx"
```

- [ ] **Step 2: Crear `src/app/(panel)/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { Conversacion } from "@/components/Conversacion";
import { PanelMatrona } from "@/components/PanelMatrona";
import { useConversacion } from "@/lib/hooks/useConversacion";
import { usePanel } from "@/lib/hooks/usePanel";

export default function PanelPage() {
  const { filas, refrescar, resolverAlerta } = usePanel();
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);

  useEffect(() => {
    if (!seleccionadaId && filas.length > 0) setSeleccionadaId(filas[0].puerpera.id);
  }, [filas, seleccionadaId]);

  const puerpera = filas.find((fila) => fila.puerpera.id === seleccionadaId)?.puerpera ?? null;
  const { mensajes, enviando, enviar } = useConversacion(seleccionadaId, refrescar);

  return (
    <main className="flex h-screen">
      <div className="w-[35%] border-r" style={{ borderColor: "var(--color-divider)" }}>
        <Conversacion puerpera={puerpera} mensajes={mensajes} enviando={enviando} onEnviar={enviar} />
      </div>
      <div className="w-[65%]">
        <PanelMatrona
          filas={filas}
          seleccionadaId={seleccionadaId}
          onSeleccionar={setSeleccionadaId}
          onResolverAlerta={resolverAlerta}
        />
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verificar tipos y build**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores.

Run: `pnpm build`
Expected: build exitoso, sin error de rutas duplicadas para `/`.

- [ ] **Step 4: Commit**

```bash
git add -A src/app
git commit -m "arma la pantalla unica del panel en src/app/(panel)"
```

---

### Task 10: Verificación manual end-to-end

**Files:** ninguno (solo verificación)

**Interfaces:** ninguna — consume todo lo anterior integrado.

- [ ] **Step 1: Confirmar variables de entorno**

Run: `cat .env.local` (o `.env.example` si `.env.local` no existe todavía)
Expected: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` presentes. Si no
existen, avisar al equipo (backend) antes de seguir — sin esto el panel no tiene datos.

- [ ] **Step 2: Levantar el servidor**

Run: `pnpm dev`
Expected: arranca sin error en `http://localhost:3000`.

- [ ] **Step 3: Revisión visual en el navegador**

Abrir `http://localhost:3000` y confirmar:
- Dos columnas: conversación a la izquierda (~35%), panel a la derecha (~65%).
- El panel muestra filas ordenadas por riesgo, cada una con su franja de 42 celdas y el día
  actual marcado.
- La fila de mayor riesgo aparece seleccionada por defecto y su conversación se carga a la
  izquierda.
- Click en otra fila cambia la conversación mostrada.
- Escribir un mensaje y enviarlo: el botón dice "evaluando…" sin spinner mientras está en
  vuelo, y al terminar aparece el mensaje nuevo y (si corresponde) una alerta nueva en la
  fila, sin recargar la página.
- "Marcar como resuelta" en una alerta la hace desaparecer de esa fila tras el refresco.
- Ningún texto en pantalla dice "diagnóstico".

- [ ] **Step 4: Commit final si hubo ajustes**

```bash
git add -A
git commit -m "ajustes tras verificacion manual del panel"
```

(Si no hubo cambios, este paso se omite.)
