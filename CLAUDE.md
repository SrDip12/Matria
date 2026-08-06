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
   Cambios hechos con aviso, hasta ahora: `FichaExtendida` y la columna `puerperas.ficha_extendida`
   (una sola columna `jsonb`, migración en `supabase/migraciones/001_ficha_extendida.sql`). El
   seed de la cohorte no se tocó: para esas 200 puérperas la ficha queda en `null`.

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
  actualizándose en vivo cuando entra un mensaje. Tiene dos pestañas —resumen de la cohorte y
  mis pacientes, que es la que abre por defecto— y el caso abierto, que no es pestaña sino un
  destino con "volver a la lista".

**La pantalla dividida vive dentro del caso abierto.** En el resumen y en la lista el panel ocupa
el ancho completo: sobre doscientas puérperas no hay ninguna conversación concreta que mirar, y
tener una fija a la izquierda le comía un tercio de la pantalla a la lista sin decir nada. Al
abrir un caso aparecen las dos columnas —su canal a la izquierda al 35 %, la ficha y las alertas
a la derecha al 65 %— y ahí es donde el jurado ve el recorrido entero: entra el mensaje, el
agente lo interpreta, sale la alerta. **Ese es el momento de la rúbrica y no se toca.**

El jurado tiene que ver, en la misma pantalla y sin cambiar de contexto: mensaje entra →
agente lo interpreta → alerta aparece priorizada. Esa es toda la demo. Si algo no sirve a
ese recorrido, no se construye.

**Criterio de rúbrica:** se evalúa que se vean en pantalla el input y el output del agente,
y que la demo corra en vivo. Diapositivas del flujo no puntúan. Cualquier cambio que aleje
el input del output en la pantalla nos cuesta nota.

## 6. Mapa de propiedad de archivos

Cada persona edita solo lo suyo. Si necesitas algo de otra zona, lo pides, no lo escribes.

**La propiedad exclusiva por carpeta se levantó.** Cualquiera puede editar cualquier módulo. A
cambio, dos obligaciones que reemplazan lo que antes garantizaba el mapa:

1. **Avisa en el canal antes de entrar a un módulo que no venías tocando**, para que no haya dos
   personas editando el mismo archivo a ciegas. Ya pasó una vez con `src/lib/agente/`.
2. **Commit chico y frecuente.** Es lo único que evita el conflicto grande ahora que no hay
   dueños. `git pull --rebase` antes de cada push, siempre.

| Módulo | Referente | Qué es |
|---|---|---|
| **Agente** | Pip | `src/lib/agente/` — prompt, herramienta, reglas duras, factores §8 |
| **Backend** | Rodo | `supabase/`, `src/lib/db/`, `src/app/api/`, `scripts/` |
| **Frontend** | Senler | `src/app/`, `src/components/`, `src/lib/hooks/`, `src/app/globals.css` |
| **Clínica** | Vale | `docs/PROTOCOLO_CLINICO.md` — **sigue siendo solo de ella** |

El referente no es dueño: es a quien le preguntas primero y quien revisa si algo se rompe. La
única excepción que se mantiene es el protocolo clínico, que lo escribe la matrona y nadie más.

En una frase: **Pip piensa, Rodo conecta, Senler muestra, Vale valida** — pero todos construyen.

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

## 10. Sistema visual

Dos superficies con el mismo sistema: el **panel de la matrona**, una herramienta de triage
que ella abre a las 8 de la mañana —densa, legible, tranquila—, y el **seguimiento de la
puérpera**, una columna centrada de 672 px donde se hace una cosa a la vez.

La fuente de verdad es `Design System/_ds/matria-design-system-*/`: `readme.md` explica el
sistema y `tokens/*.css` trae los valores. `src/app/globals.css` es ese mismo sistema llevado
a las clases del producto. Si el panel y el design system difieren, manda el design system.

**Color. El rojo es la marca, no la alarma.** Si un elemento no comunica riesgo, es tinta o es
gris, y el riesgo nunca se comunica solo por color: siempre lleva su etiqueta de texto.

```
Marca 900      #5C0A18   barra superior
Marca 500      #E01E37   base de marca, foco
Marca 200 / 50 #E8B3BA / #FDECEE   contornos y fondos suaves

Acción         #C8446A   botones, chips activos, enlaces, progreso
Acción fuerte  #AB375A   hover del primario
Acción tinta   #9C3A51   texto de acción sobre superficie clara

Fondo          #F2ECE9   neutral cálido, nunca gris frío
Superficie     #FBF8F6   tarjetas y filas
Superficie alta #FFFFFF  lo que flota sobre una lista
Borde          #E2D8D4   1px
Línea          #EDE4E1   divisor interno de listas

Título         #3A1A20
Texto          #2A1418
Texto suave    #6E555A   secundario
Tenue          #7D6469   versalitas y metadatos

Riesgo alto    #C1121F   escalar ahora
Riesgo medio   #C97A05   revisar hoy
Riesgo bajo    #1F8A5B   seguimiento normal
```

Cada nivel de riesgo tiene además su trío tinta/fondo/borde para las píldoras, y la cabecera de
la tarjeta de alerta usa su tono `-cabecera`, un paso desaturado. Los valores exactos viven en
`tokens/colors.css` y su espejo de TypeScript es `TONO_RIESGO` (`src/lib/riesgo.ts`), que manda
de ese lado.

**La acción no se pinta con el rojo de marca.** El rojo 600 es el mismo valor que `--riesgo-alto`
(`#C1121F`), así que un botón pintado ahí grita tan fuerte como una alerta de escalamiento. Todo
lo accionable —botones, chips activos, enlaces, barras de progreso— usa `--accion` y sus dos
variantes. La marca sigue siendo roja y vive en la barra superior, en el logo y en el anillo de
foco. Si tocas un color, primero pregúntate si comunica **riesgo**, **marca** o **acción**: son
tres escalas distintas y mezclarlas es lo que hacía que el panel se leyera como una alarma
permanente.

**Tipografía: una sola familia, Inter**, servida desde Google Fonts. La jerarquía se hace por
tamaño y aire, no por negrita: display 34/500, título 24/500, subtítulo 17/500, cuerpo 14/400,
panel 13.5/400, etiqueta 11/600 con tracking 0.18em en versalitas. La cifra clínica va a
30/500 y **todo lo numérico lleva `font-variant-numeric: tabular-nums`** — días, horas,
temperaturas, porcentajes, códigos de caso.

**Espaciado, bordes y superficies.** Múltiplos de 4. Bordes de 1px. Radios: 4 sm, 8 md
(botones, chips, campos), 10 lg (tarjetas y filas), 999 en píldoras. La jerarquía de superficie
se hace con el valor del fondo: fondo → superficie → superficie alta.

**Sombras: solo en el hilo.** El sistema nació sin ninguna, y en el panel clínico sigue sin
tenerlas —ahí manda el valor del fondo y punto. La excepción es la conversación: la burbuja
blanca del agente sobre la superficie del teléfono no se despegaba, así que el hilo, las píldoras
de sugerencia y el campo de escribir usan `--sombra-1` y `--sombra-2`. Están construidas con la
tinta del título y no con negro: una sombra gris sobre un neutral cálido se lee sucia.

**Elemento firma — la franja de 42 días.** Cada puérpera lleva una franja horizontal de 42
celdas con tres estados que no son intercambiables: celda en color (hubo contacto y esa fue la
señal más grave del día), celda gris línea (el día pasó y ella no escribió: una ausencia, no un
"todo bien"), celda al 55% (el día aún no llega). El día actual sube de 12 a 16 px y lleva
contorno rojo 500. El corte de semana es un espacio de 6 px cada 7 celdas, no una línea. Es el
único elemento con licencia para ser llamativo; todo lo demás se mantiene sobrio. No se anima,
no lleva gradiente y no se reemplaza por tarjetas con íconos grandes.

**Animación.** 120 ms `ease` en color de fondo, borde y tinta. Además: el mensaje del hilo entra
en 180 ms, una vista nueva entra en 200 ms (`.vista-entra`, sube 6 px), los puntos de la espera
del agente laten, y botones y chips ceden medio píxel al apretarlos. Nada más se anima: sin
entradas de listas, sin rebotes, sin barras que crecen, sin salidas —esperar a que algo se
desvanezca para ver lo siguiente es tiempo regalado. **Sin spinners:** en una herramienta clínica
se leen como caída, el estado de espera es texto ("Leyendo lo que me contaste…", "Evaluando…").
Todo respeta `prefers-reduced-motion`.

Sin gradientes, sin blur, sin emojis, sin ilustraciones, sin fotografía.

**Contraste.** Todo texto cumple WCAG AA: 4.5:1 mínimo, y casi toda la tinta del sistema es de 11
a 13 px, así que no hay excepción de "texto grande" que aplique. Antes de bajar un tono o subir un
color de fondo, calcula el contraste — `--color-tenue` estuvo en 3.46:1 durante un tiempo y dejaba
ilegibles todas las versalitas y metadatos de la app.

**Fondos: color plano, con una excepción acotada.** El lado de la puérpera se muestra como lo que
es —un teléfono—: la columna va enmarcada al centro (`.telefono`, borde 1px, radio 22, superficie
casi blanca) y lo que sobra a los lados es un crema `#E6DBD6` con el motivo del partograma
(`.ondas`): la recta de la línea de alerta y, rezagada bajo ella, la curva de dilatación. Va en el
rosa de acción al 7–11 % y está al borde de lo invisible a propósito: es textura del fondo, nunca
contenido. **Fondo claro y no oscuro** — esta pantalla acompaña a alguien que acaba de parir y
tiene que transmitir calma, no gravedad. **En el panel clínico no entra ningún patrón.**

**La franja de 42 días no va en la cabecera del chat de ella.** Ahí era decoración: ella la tiene
completa, con su leyenda y sus cifras, en "Cómo he estado". En su chat manda el número del día.

**Iconos.** `src/components/Iconos.tsx`, dibujados para Matria: trazo de 1.5, esquinas redondas,
`currentColor` y sin relleno. Heredan la tinta de quien los contiene, así que **nunca introducen
color** y la regla de que el color es del riesgo queda intacta. Van en navegación, cabeceras de
zona y botones. **No van dentro de una fila del panel priorizado, de una tarjeta de alerta ni de
una cifra clínica:** ahí la atención es del riesgo y un icono compite con ella. Si hace falta uno
nuevo, se dibuja en ese archivo y con esas reglas; nada de traer una librería.

**Estados vacíos.** Un vacío dice qué significa el vacío, no que falta un dato: "Sin señales de
alarma en las últimas 24 horas", "No hay alertas pendientes. La cola está al día". Un campo sin
responder dice "No preguntado" — un blanco nunca se lee como un no.

## 11. Definición de listo

Una tarea está lista cuando está desplegada en la URL de producción y funciona ahí. No
cuando corre en local. Se despliega temprano y se despliega seguido.

## 12. Lo que NO se construye

Si te descubres empezando cualquiera de estas, para:

autenticación · integración real con WhatsApp · multi-tenant · RLS · panel de administración ·
envío de correos · exportar a PDF · modo oscuro · responsive más allá de la pantalla del demo ·
edición de protocolo desde la UI · internacionalización · página de marketing

**El onboarding de la puérpera salió de esta lista.** Se construyó: `FichaIngreso.tsx`, tres
pasos más la pantalla del nombre. Recoge los antecedentes que el protocolo §8 usa para modificar
el riesgo basal, y esos factores entran al agente en cada evaluación. Sin ficha, el agente evalúa
igual pero solo con la ficha básica.

Cada campo de esa ficha alimenta un factor de `src/lib/factores.ts`: peso y talla dan el IMC,
horas y paridad dan el parto prolongado, y el síndrome hipertensivo del embarazo es la excepción
única de §8. **Sacar un campo es perder su factor** — si se saca, se avisa.

## 13. Si estás bloqueado

Después de 15 minutos sin avanzar en algo, no sigas. Anda al camino más corto que deje la
demo en pie y avisa al equipo qué degradaste. En un hackathon el enemigo no es la deuda
técnica, es la hora.
