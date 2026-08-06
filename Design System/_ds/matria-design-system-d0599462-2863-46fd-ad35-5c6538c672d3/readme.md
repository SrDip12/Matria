# Matria — Sistema de diseño

**Matria** es un agente de acompañamiento longitudinal del puerperio. Sigue a la puérpera durante
los 42 días posteriores al parto, interpreta en lenguaje natural lo que ella responde, estratifica
riesgo según un protocolo escrito por matrona y entrega al equipo clínico un panel priorizado para
intervenir antes del reingreso a urgencias.

> Contexto del proyecto de origen: Impact Lab Longevidad (Bendita IA + Caja La Araucana), Línea 03 —
> Continuidad y Medicina de Precisión. Jurado con representantes del MINSAL y revisión técnica de CENS.

La frase con la que el producto se presenta: *"Acompañamiento longitudinal del puerperio. Los 42
días que el sistema de salud no mira."*

**El sistema no diagnostica.** Detecta, prioriza y escala al profesional. Esa regla gobierna el
producto y también este sistema de diseño: ninguna etiqueta, ningún texto de componente y ningún
ejemplo de estas páginas puede afirmar un diagnóstico.

## Superficies del producto

| Superficie | Quién la usa | Forma |
|---|---|---|
| **Panel de la matrona** | Equipo clínico del CESFAM | Pantalla dividida: canal de la puérpera (35%) + panel de triage (65%). Densa, legible, tranquila. |
| **Seguimiento de la puérpera** | La mujer, desde su teléfono | Columna centrada, una cosa a la vez: chat, avisos, cómo he estado, mi ficha. |

## Fuentes

Todo lo que hay acá se leyó del código, no de capturas:

- **Repositorio:** [github.com/SrDip12/Matria](https://github.com/SrDip12/Matria) (rama `main`).
  Vale la pena explorarlo: `src/components/` tiene la implementación real de cada pieza,
  `src/app/globals.css` los tokens y clases, `CLAUDE.md` las reglas duras del proyecto y
  `docs/PROTOCOLO_CLINICO.md` la fuente de verdad clínica. Leer esos archivos antes de diseñar algo
  nuevo para Matria da un resultado bastante mejor que trabajar solo con este resumen.
- **Fuente de verdad visual dentro del repo:** `Design System/Design System Matria.dc.html`, la
  hoja de marca v1. Cuando el panel y esa hoja difieren, manda la hoja.
- **Capturas aportadas por el equipo:** portada de la hoja de marca, sección de color y la marca
  aislada (`uploads/`). Se usaron solo como referencia de alto nivel.
- Ver `github.md` para el registro de sincronización.

Nota: `CLAUDE.md` §10 del repositorio describe una paleta anterior verde/teal con Newsreader e IBM
Plex. Está obsoleta: el producto y la hoja de marca v1 usan la paleta de rojo clínico con Inter que
recoge este sistema.

---

## Content fundamentals — cómo se escribe

**Español de Chile, registro profesional, sin emojis.** Dos registros distintos y no
intercambiables, según quién lee:

**A la matrona** — clínico, preciso, sin adornos. Siempre "hallazgos compatibles con", "sospecha
de", "sugiere evaluación". Jamás "diagnóstico", "el paciente tiene", "confirmado".

> "Hallazgos compatibles con endometritis puerperal: fiebre referida, dolor uterino y loquios de
> mal olor al día 9. Sugiere evaluación presencial dentro del día. §3.1"

**A la puérpera** — cercano, en segunda persona, con sus palabras y no las del protocolo. Nunca el
nombre de una sospecha ni un nivel de riesgo: se le dice qué hacer, no qué tiene.

> "Le llegó lo que escribiste y va a revisar tu caso durante el día. Si algo cambia antes,
> escríbelo acá."
> "Dolor de cabeza que no se te pasa, ver borroso o zumbido en los oídos."

Reglas transversales:

- **Los botones dicen qué hacen.** "Marcar como resuelta", no "Confirmar". "Abrir el caso", "Escalar
  a matrona", "Ver conversación", "Quitar filtros".
- **Los estados vacíos dicen qué significa el vacío**, no que falta un dato: "Sin señales de alarma
  en las últimas 24 horas", "No hay alertas pendientes. La cola está al día", "Todavía no hay
  días registrados".
- **Un blanco nunca se lee como un no.** Un campo sin responder dice "No preguntado".
- **Toda alerta cita la sección del protocolo** que la justifica: `§3.1`, `§8`. La cita va en
  tabular y en tinta tenue.
- **Versalitas para nombrar zonas**, nunca para leer de corrido: `PANEL DE LA MATRONA`,
  `CANAL DE LA PUÉRPERA`, `ESCALAR AHORA`.
- **Ninguna cifra sin fuente.** En el producto, los números del pitch salen de `docs/DATOS_DEIS.md`.
- **Sin spinners.** En una herramienta clínica se leen como caída: el estado de espera es texto
  ("Leyendo lo que me contaste…", "Evaluando…").
- Los datos de puérperas son **sintéticos**, siempre. Nunca un RUT, nombre o teléfono real, ni en
  un ejemplo de esta carpeta.

---

## Visual foundations

**Color.** El rojo es la marca, no la alarma. Rojo 500 `#E01E37` es la base de marca; rojo 600
`#C1121F` pinta las acciones; rojo 900 `#5C0A18` es la barra superior. Los neutrales son cálidos y
rosados —fondo `#F2ECE9`, superficie `#FBF8F6`, borde `#E2D8D4`— nunca grises fríos. El riesgo tiene
su propia escala de tres pasos: verde `#1F8A5B` (seguimiento normal), ámbar `#C97A05` (revisar hoy),
carmesí `#C1121F` (escalar ahora), cada uno con su trío tinta/fondo/borde. **Si un elemento no
comunica riesgo, es tinta o es gris**, y el riesgo nunca se comunica solo por color: va acompañado
de la etiqueta de texto.

**Tipografía.** Una sola familia: **Inter**, servida desde Google Fonts. La jerarquía se hace por
tamaño y aire, no por negrita: display 34/500, título 24/500, subtítulo 17/500, cuerpo 14/400,
panel 13.5/400, etiqueta 11/600 con tracking 0.18em en versalitas. La cifra clínica va a 30/500 y
**todo lo numérico lleva `tabular-nums`** — días, horas, temperaturas, porcentajes, códigos de caso.

**Espaciado y layout.** Múltiplos de 4. Fila del panel 12 px, tarjeta 16 px, sección 20–24 px, banda
de cabecera 48–56 px. El panel es una sola vista sin navegación ni rutas: dos columnas fijas a 35/65
con la cabecera de la vista arriba y el scroll dentro de cada columna. El lado de la puérpera es una
columna centrada de 672 px máximo. No hay responsive más allá de la pantalla del demo.

**Fondos.** Color plano, siempre. **Sin gradientes, sin imágenes de fondo, sin texturas, sin
patrones, sin ilustraciones.** El único fondo oscuro es `#1B1016` y la única banda de color es la
barra superior en rojo 900.

**Bordes, radios y sombras.** Bordes de 1 px. Radios: 4 sm, 8 md (botones, chips, campos), 10 lg
(tarjetas y filas), 999 en píldoras. Las burbujas del hilo cierran la esquina del hablante a 4 px
(`14px 14px 4px 14px` para ella). **No hay sistema de sombras: ninguna sombra, ni interior ni
exterior.** La jerarquía de superficie se hace con el valor del fondo: fondo → superficie →
superficie alta (blanco puro), reservada para lo que flota sobre una lista.

**Tarjetas.** Superficie `#FBF8F6`, borde 1 px `#E2D8D4`, radio 10, padding 16, sin sombra. El
título va en versalitas y la ayuda en tinta tenue debajo. El estado vacío usa el mismo radio con
borde punteado.

**Transparencia y blur.** Nada de blur. La transparencia aparece solo con `color-mix` para mezclar
blanco sobre la barra roja (12% en el fondo del botón, 18% en su borde, 22% en el divisor) y para
bajar la celda futura de la franja al 55% de la línea.

**Animación.** 120 ms `ease` en color de fondo, borde y tinta. Nada más se anima: sin entradas, sin
rebotes, sin parpadeos, sin barras que crecen. Todo respeta `prefers-reduced-motion`.

**Hover, foco y press.** Hover cambia color, nunca tamaño ni sombra: el primario pasa a rojo 700, el
secundario toma fondo rojo 50, el fantasma toma `#EFE7E4` y sube la tinta a texto pleno, las filas de
lista toman el hover. Foco visible: contorno de 2 px en rojo 500 con 1 px de offset; en los campos el
borde también pasa a rojo 500. No hay estado press propio ni transformaciones de escala.
`disabled` = opacidad 0.45 (0.4 en el chip) y `cursor: not-allowed`.

**Imágenes.** El producto no usa fotografía ni ilustración. Si algún día hiciera falta, la única
regla heredable del sistema es la del color: cálido y sobrio, nunca decorativo sobre una vista
clínica.

**Elemento firma — la franja de 42 días.** Cada puérpera lleva una franja horizontal de 42 celdas
con tres estados que no son intercambiables: celda en color (hubo contacto y esa fue la señal más
grave del día), celda gris línea (el día pasó y ella no escribió: una ausencia, no un "todo bien"),
celda al 55% (el día aún no llega). El día actual sube de 12 a 16 px y lleva contorno rojo 500. El
corte de semana es un espacio de 6 px cada 7 celdas, no una línea. Es lo único con licencia para ser
llamativo: no se anima, no se le pone gradiente, no se reemplaza por tarjetas con íconos grandes.

---

## Iconografía

**Matria no tiene set de iconos.** El repositorio de origen no incluye ninguno: no hay biblioteca
(ni Lucide, ni Heroicons, ni Material), no hay fuente de iconos, no hay sprite SVG y no hay PNGs. Los
`.svg` de `public/` son los del scaffolding de Next.js y no pertenecen a la marca.

En su lugar el sistema usa **cuatro recursos gráficos mínimos**, todos ya presentes en el producto:

1. **El riel de riesgo** — barra de 4 px de ancho a la izquierda de cada fila, con el color del nivel.
2. **El punto de color** — círculo de 8–10 px antes de una etiqueta de riesgo.
3. **La celda de la franja** — el rectángulo de 1.5 px de radio de la franja de 42 días.
4. **La flecha en texto** — `→` como único glifo direccional ("Entrar →"). Es un carácter Unicode
   dentro del texto, no un icono.

**Sin emojis en la interfaz clínica** (regla dura del proyecto) y sin emojis en la de la puérpera.
La única marca gráfica del sistema es la silueta.

**El logo sí existe** y está en `assets/`, portado desde `src/components/LogoMatria.tsx`: una mujer
de perfil con guata y un punto adentro. El punto se cae bajo 32 px. La marca no se rota, no se le
cambia el color de relleno fuera de la paleta y no se le pone contorno. Aire mínimo: 40% del alto de
la marca por lado.

| Archivo | Uso |
|---|---|
| `assets/logo.svg` | Rojo 500 sobre superficie clara. |
| `assets/logo-marca-600.svg` | Rojo 600, para acompañar acciones. |
| `assets/logo-900.svg` | Rojo 900 sobre fondo claro. |
| `assets/logo-blanco.svg` | Sobre color plano. |
| `assets/logo-300-sobre-oscuro.svg` | Rojo 300 sobre `#1B1016`. |
| `assets/logo-solido.svg`, `assets/logo-solido-blanco.svg` | Bajo 32 px, sin el punto. |

Si hace falta un icono nuevo, **pregunta antes de dibujarlo**: el sistema no tiene lenguaje de
iconos definido y una familia inventada se leería como de otro producto.

---

## Índice

**Raíz**

- `styles.css` — único punto de entrada de CSS; solo `@import`.
- `readme.md` — esta guía.
- `SKILL.md` — envoltorio para usar este sistema como Agent Skill.
- `github.md` — repositorio de origen y registro de sincronización.
- `thumbnail.html` — tarjeta del sistema en la portada.

**`tokens/`** — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `superficies.css`,
`componentes.css` (las clases `.btn`, `.chip`, `.input`, `.tag`, `.card` tal como viven en el producto).

**`assets/`** — la silueta en sus siete variantes de color.

**`guidelines/`** — 18 fichas de fundamentos: marca (claro, oscuro, lockup, aire), color (marca,
neutrales, tinta, escala de riesgo, riel), tipografía (títulos, cuerpo, versalitas, cifra),
espaciado (escala, radios, superficies), franja de 42 días y tono.

**`components/`** — 12 componentes React, agrupados por concern. Cada uno con su `.d.ts` y su
`.prompt.md`.

| Grupo | Componentes |
|---|---|
| `components/core/` | `Boton`, `Chip`, `Campo`, `Etiqueta`, `Tarjeta`, `LogoMatria` |
| `components/panel/` | `Franja42`, `FilaPuerpera`, `TarjetaAlerta`, `Cifra`, `BarraRiesgo` |
| `components/conversacion/` | `Burbuja` |

**`ui_kits/`**

- `ui_kits/panel_matrona/` — la pantalla dividida completa, con resumen, lista priorizada y ficha
  del caso. Entrada: `index.html`; lógica en `Pantalla.jsx`.
- `ui_kits/app_puerpera/` — la columna de la puérpera con sus cuatro pestañas.
- `ui_kits/cohorte.js` — cohorte sintética compartida por los dos kits.

**`templates/`**

- `templates/panel-matrona/` — "Panel de Matria": punto de partida con la barra superior, el hilo y
  la lista priorizada armados con los componentes del sistema.

### Inventario y omisiones

El inventario de componentes es exactamente el que define el repositorio de origen; no se agregó
ninguna primitiva que Matria no tenga (no hay Toast, Avatar, Modal, Tooltip ni Tabs: la navegación
del producto se hace con `Chip`).

Adiciones intencionales, ambas para poder exponer piezas que en el producto viven dentro de un
componente mayor:

- **`Cifra`** — extrae `CifraGrande` y `CifraChica` de `DashboardMatrona.tsx` a un componente con
  variante `tamano`.
- **`BarraRiesgo`** — extrae la barra de reparto del mismo archivo.

Omisiones declaradas, para no inventar diseño:

- **`FichaOnboarding`** (ficha de ingreso como conversación) no está recreada; se documenta que
  reutiliza `Burbuja`.
- No hay páginas de marketing, ni login, ni ajustes: el producto no las tiene.
- No hay plantilla de slides porque no se aportó ninguna.
