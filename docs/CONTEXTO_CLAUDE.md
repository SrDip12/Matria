# Matria — dossier de contexto

Documento autocontenido para pegar en una conversación con Claude (claude.ai) y poder hacer
preguntas sobre el proyecto sin tener el repositorio a mano.

Corte: 6 de agosto de 2026. Todo lo que dice acá está verificado contra el código, no es
memoria de una conversación.

---

## 0. Cómo usar esto

Pégalo completo al inicio de la conversación y parte con algo así:

> Este es el contexto de un proyecto en el que estoy trabajando. Léelo y respóndeme sobre él.
> Si algo no está en el documento, dímelo en vez de suponerlo.

Al final (§13) hay una lista de preguntas para las que este documento tiene material suficiente,
y otra de cosas que **no** están acá y que Claude no va a poder responder.

---

## 1. Qué es Matria

**Un agente de acompañamiento longitudinal del puerperio.**

Sigue a la mujer durante los 42 días posteriores al parto. Ella escribe en lenguaje natural cómo
se siente; el agente interpreta ese texto, lo convierte en variables clínicas estructuradas,
estratifica el riesgo según un protocolo escrito por una matrona, y entrega al equipo clínico un
panel priorizado para intervenir **antes** del reingreso a urgencias.

La frase con la que se presenta: *"Acompañamiento longitudinal del puerperio. Los 42 días que el
sistema de salud no mira."*

### El problema en una frase

Más de la mitad de los partos en Chile son cesáreas —la cirugía mayor más frecuente del país— y
es la única de la que se manda a la paciente a la casa a las 48 horas, a cargo de un recién
nacido, sin ningún sistema de seguimiento. En esos 42 días se concentran preeclampsia postparto,
hemorragia tardía, endometritis, mastitis y depresión postparto. El sistema se entera cuando la
mujer llega a urgencias.

### Contexto del evento

- **Impact Lab Longevidad** (Bendita IA + Caja La Araucana), Línea 03 — Continuidad y Medicina de
  Precisión.
- Ventana de construcción: **8 horas**. Nada de código preexistente; se revisan timestamps de
  commits.
- Jurado con representantes del **MINSAL** y revisión técnica de **CENS**.

### El equipo

| Rol | Persona | Qué hace |
|---|---|---|
| Agente | Pip | Prompt, herramienta, reglas duras, factores §8 |
| Backend | Rodo | Supabase, `src/lib/db/`, `src/app/api/`, scripts |
| Frontend | Senler | `src/app/`, `src/components/`, hooks, estilos |
| Clínica | Vale (matrona) | `docs/PROTOCOLO_CLINICO.md` — solo ella lo escribe |

En una frase: **Pip piensa, Rodo conecta, Senler muestra, Vale valida.**

---

## 2. Las reglas duras del proyecto

Estas no se discuten. Romper una descalifica o hunde el pitch.

1. **Nada de código preexistente.** Todo se escribe dentro de la ventana del evento.
2. **El sistema NO diagnostica.** Detecta, prioriza y escala al profesional. Ningún texto de UI,
   ningún prompt y ningún nombre de variable puede afirmar un diagnóstico. Se escribe `sospecha`,
   `hallazgo`, `señal de alarma`, `sugerir evaluación`. Nunca `diagnóstico`, `el paciente tiene`,
   `confirmado`.
3. **Cero datos personales reales.** Toda la data es sintética. Nunca un RUT, nombre, teléfono o
   ficha real, ni en un comentario ni en un seed.
4. **Ninguna acción clínica automática.** El sistema nunca contacta a urgencias, nunca agenda,
   nunca indica tratamiento. Solo alerta a la matrona.
5. **No se toca WhatsApp real.** El canal se simula en el navegador.
6. **`src/lib/types.ts` y `supabase/schema.sql` están congelados** desde la hora 1.

---

## 3. Stack

| Capa | Elección |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Estilos | Tailwind v4 |
| Base de datos | Supabase (solo Postgres) |
| IA | Claude API — `claude-sonnet-4-6` |
| Deploy | Vercel |
| Paquetes | pnpm |

**Lo que NO se usa:** tRPC, Prisma, NextAuth ni ningún auth, Supabase Realtime, Supabase RLS,
Zustand/Redux, tests, Storybook, i18n, Docker.

Sin autenticación: la matrona está fija en una constante. El panel se refresca con **polling cada
3 segundos**, no con suscripciones.

### Convenciones

- **Dominio en español, plumbing en inglés.** Tablas, columnas y textos de UI en español
  (`puerperas`, `dia_puerperio`, `nivel_riesgo`); funciones y hooks en inglés (`fetchAlertas`,
  `useLoading`).
- Base de datos en `snake_case`. TypeScript en `camelCase`, salvo los campos que vienen directo de
  la base, que mantienen `snake_case` para no mapear.
- Server Actions y Route Handlers, nunca una capa de API propia.
- Todo el texto visible en español de Chile, registro profesional, sin emojis en la interfaz
  clínica.

---

## 4. Arquitectura y flujo

```
mensaje de la puérpera (texto libre)
        │
        ▼
POST /api/evaluar
        │
        │  Claude Sonnet 4.6 + tool_use (salida forzada y estructurada)
        │  system prompt = protocolo clínico curado, con prompt caching
        ▼
Evaluacion { hallazgos, nivel_riesgo, sospechas, cita_protocolo, razonamiento }
        │
        ├──▶ insert en `evaluaciones`
        │
        └──▶ si nivel_riesgo ≠ 'bajo' → insert en `alertas`
                    │
                    ▼
        GET /api/panel  → FilaPanel[]   ← el panel lo consume por polling cada 3 s
```

### Endpoints

| Endpoint | Entrada | Salida |
|---|---|---|
| `POST /api/evaluar` | `{ puerpera_id, texto }` | `{ evaluacion, alerta \| null }` |
| `GET /api/panel` | — | `{ filas: FilaPanel[] }` |
| `PATCH /api/alertas/[id]` | `{ estado }` | — |
| `GET /api/conversacion/[puerperaId]` | — | `{ mensajes: Mensaje[] }` |
| `POST /api/puerperas` | `{ base, ficha }` | `{ puerpera }` |

`GET /api/panel` devuelve las filas ordenadas por `nivel_riesgo` descendente y, dentro del mismo
nivel, por alerta pendiente más antigua primero. Una matrona atiende primero lo grave, y dentro de
lo grave, lo que lleva más rato esperando.

### Archivos principales

```
src/
  app/
    (panel)/page.tsx          la aplicación entera: puerta, panel, lado de la puérpera
    globals.css               tokens y clases del sistema visual
    api/                      evaluar, panel, alertas, conversacion, puerperas
  components/
    Inicio.tsx                la puerta: elegir desde qué lado mirar
    TabBar.tsx                barra superior
    PanelMatrona.tsx          panel de triage + la pantalla del caso abierto
    DashboardMatrona.tsx      resumen de la cohorte
    FilaPuerpera.tsx          una puérpera en la lista priorizada
    Franja42.tsx              elemento firma: los 42 días en una línea
    TarjetaAlerta.tsx         alerta con cabecera del color del riesgo
    Conversacion.tsx          el hilo (lo usan la matrona y la puérpera)
    FichaIngreso.tsx          onboarding en 4 pasos
    Notificaciones.tsx        "mis avisos" de la puérpera
    MiEvolucion.tsx           "cómo he estado"
    PerfilPaciente.tsx        la ficha, leída por ella o por la matrona
    Iconos.tsx                set de iconos propio
    LogoMatria.tsx            la silueta
  lib/
    types.ts                  CONTRATO CONGELADO
    riesgo.ts                 colores y etiquetas de riesgo
    factores.ts               traduce la ficha a los factores de §8
    metricas.ts               métricas del panel, derivadas de las filas
    formato.ts                fechas, horas, nombres
    agente/
      prompt.ts               system prompt con el protocolo
      herramienta.ts          definición de la tool
      evaluar.ts              llamada a Claude
      riesgo.ts               reglas duras, fuera del modelo
      seguimiento.ts          qué preguntar al día siguiente
      probar.ts               casos de prueba de consola
    db/index.ts               acceso a Supabase
    hooks/
      usePanel.ts             polling cada 3 s
      useConversacion.ts      hilo y envío
docs/                         protocolo, contratos, pitch, datos DEIS, entregable
Design System/                sistema de diseño con tokens y componentes de referencia
```

---

## 5. El protocolo clínico

Escrito por Vale (matrona), versión 1.2 validada. **Se inyecta completo en el system prompt.**
Todo umbral que está ahí se aplica; todo lo que no está, el agente no lo sabe. Los números de
sección (§) son el identificador que cada alerta cita y **no se renumeran**.

### §1.1 — Clasificación: dos categorías clínicas, no tres

| Categoría | Qué significa | Acción | Valor en el sistema |
|---|---|---|---|
| **Signo de emergencia** | Riesgo vital o de daño grave | Acudir a urgencias de inmediato + telellamada de la matrona | `alto` |
| **Señal de alarma** | Requiere contacto de la matrona el mismo día | Teleconsulta durante el día o evaluación presencial en las próximas horas | `medio` |
| Sin señales | Seguimiento habitual | Ninguna | `bajo` |

Reglas transversales: **ante duda entre dos categorías, se elige siempre la más grave**, y ninguna
señal se difiere a 24 o 48 horas. O es hoy, o es ahora.

### Las secciones

- **§2 Preeclampsia postparto** (ventana 42 días). Señales de alarma: PA 140/90–159/109, edema
  generalizado, oliguria. Emergencia: PA ≥160/110, epigastralgia, cefalea que no cede, tinitus,
  alteraciones visuales, alteración de conciencia, convulsión. **Sin cifra de presión: dos o más
  signos de emergencia escalan igual; uno solo aislado es señal de alarma.**
- **§3.1 Endometritis** (42 días). Alarma: fiebre, dolor hipogástrico, loquios de mal olor,
  subinvolución uterina. Emergencia: T ≥38 °C **sostenida** (dos mediciones separadas por 6 h) más
  alguna señal, con malestar general. **Sin termómetro: dos o más señales con malestar general
  escalan; fiebre referida aislada es alarma.**
- **§3.2 Infección de herida operatoria o de episiorrafia** (14 días). Sin fiebre: alarma, la
  matrona guía la curación en teleconsulta y solo si la paciente tiene los insumos. Con fiebre:
  emergencia. **El agente nunca describe ni indica el procedimiento de curación.**
- **§4 Hemorragia postparto tardía** (42 días). El agente cuantifica sin instrumentos preguntando
  por toallas usadas por hora, si se llenan completas, si el sangrado subió, y el tamaño de los
  coágulos. Emergencia con cualquiera de estas tres: una toalla completa en una hora o menos,
  coágulos grandes, o cualquier signo de shock.
- **§5 Mastitis y lactancia.** Alarma con eritema, dolor local, fiebre y malestar general. Escala
  con secreción de mal olor. §5.2: la dificultad de lactancia pasa a alarma cuando el recién nacido
  no se alimenta bien, hay dolor al amamantar, grietas o mal acople.
- **§6 Evento tromboembólico** (42 días). **Todas las señales son signo de emergencia por
  separado**, no se exige combinación. TVP: edema unilateral, sensibilidad al caminar, calor,
  eritema. TEP: disnea, taquipnea, dolor torácico, sensación de desmayo.
- **§7.1 Tamizaje de salud mental.** La EPDS se aplica a las 8 semanas, **fuera** de la ventana de
  42 días, así que **el agente no aplica ni puntúa la escala**. Registra las señales de ánimo que
  ella reporte y al día 42 entrega un resumen para el control de las 8 semanas.
- **§7.2 Ideación autolítica.** Cualquier señal escala a emergencia de forma inmediata, en
  cualquier día y sin importar el resto de los hallazgos.
- **§8 Factores que modifican el riesgo basal.** **No cambian la categoría** de un hallazgo: la
  priorizan dentro de ella. Entre dos mujeres con señal de alarma, la que tiene factores aparece
  primero. Factores: cesárea, edad ≥35, trastorno hipertensivo del embarazo, diabetes gestacional,
  embarazo múltiple, obesidad, parto prolongado, inmovilización durante el parto.
  **Excepción única:** antecedente de trastorno hipertensivo del embarazo + cualquier señal de §2
  escala directo a emergencia, aunque haya un solo signo y no haya cifra de presión.
- **§9 Calendario de contacto.** Días 1–3 sin contacto (está hospitalizada). El agente parte en el
  día 4. Días 4–7: sangrado, loquios, lactancia, signos de infección. 8–14: control de díada,
  evolución del sangrado, retiro de puntos. 15–28: lactancia, hinchazón de piernas, reaparición del
  sangrado. 29–42: ánimo y cierre. Fuera de eso, ella puede escribir cuando quiera.

### §10 — Lo que el sistema nunca hace

No indica tratamiento, fármaco ni dosis · no describe procedimientos, incluida la curación de
heridas · no afirma un diagnóstico · no aplica ni puntúa escalas clínicas · no contacta servicios
de urgencia por su cuenta · no reemplaza el control de puerperio ni el de díada · no interpreta
exámenes ni imágenes · no clasifica fuera de lo definido en el protocolo.

### Anexo — Cómo habla la gente

El agente tiene que entender a una mujer real escribiendo con un bebé en brazos, no a una ficha
clínica. El protocolo trae un glosario de equivalencias:

| Término clínico | Cómo lo dice ella |
|---|---|
| Loquios de mal olor | me huele feo abajo · tengo un olor raro |
| Dolor hipogástrico | me duele la guata abajo · dolor en el bajo vientre |
| Epigastralgia | dolor en la boca del estómago |
| Fiebre | estoy hirviendo · ando afiebrada |
| Tinitus | zumbido en el oído · me chillan los oídos |
| Alteración visual | veo lucecitas · veo borroso · veo puntitos negros |
| Sangrado aumentado | me está bajando harto · se me llena la toalla |
| Coágulos | pelotitas de sangre · me salió un coágulo grande |
| Disnea | me falta el aire · me ahogo |
| Sensación de desmayo | se me va la vista · se me nubla todo |
| Ánimo bajo | ando bajoneada · no tengo ganas de nada |

---

## 6. Cómo funciona el agente

### Extracción clínica (el corazón del producto)

Sonnet 4.6 con `tool_use` y `tool_choice` forzado sobre una sola herramienta,
`registrar_evaluacion`. Así la salida es siempre estructurada: no hay que parsear texto ni limpiar
bloques de markdown. El protocolo curado va en el **system prompt con prompt caching**, no como
archivo adjunto.

La herramienta devuelve:

- `hallazgos` — 19 variables booleanas (`fiebre_referida`, `dolor_abdominal`, `sangrado_aumentado`,
  `loquios_mal_olor`, `cefalea_intensa`, `alteracion_visual`, `dolor_epigastrico`, `mastalgia`,
  `mastalgia_unilateral`, `eritema_mamario`, `dolor_herida`, `secrecion_herida`,
  `dolor_pantorrilla_unilateral`, `disnea`, `animo_bajo`, `anhedonia`, `ideacion_autolitica`,
  `dificultad_lactancia`) más `temperatura_c` y `texto_relevante`.
  **Todo campo desconocido va en `null`, nunca en `false`.** Un dato ausente no es un dato negativo.
- `nivel_riesgo` — `bajo` | `medio` | `alto`
- `sospechas` — arreglo de un enum cerrado de 9 valores
- `cita_protocolo` — la sección exacta, obligatoria. Ej: `§3.2`
- `razonamiento` — máximo dos frases dirigidas a la matrona
- `accion_sugerida` — una frase: qué hace la matrona ahora

### Reglas de lenguaje que van en el system prompt

- Nunca afirmar un diagnóstico: "hallazgos compatibles con", "sugiere evaluación por", "señal de
  alarma para".
- Nunca indicar tratamiento, fármaco ni dosis.
- Nunca dirigirse a la puérpera en `razonamiento`: ese texto lo lee la matrona.
- Ante duda entre dos niveles, elegir el más alto.

### Las tres reglas duras, fuera del modelo

Están codificadas en `src/lib/agente/riesgo.ts`, **no dependen de que el modelo las note**:

1. `ideacion_autolitica === true` fuerza `nivel_riesgo: "alto"` (§7.2).
2. Cualquier señal compatible con evento tromboembólico fuerza `alto` (§6).
3. Antecedente de trastorno hipertensivo del embarazo + cualquier señal de §2 fuerza `alto` (§8,
   excepción única).

**Este es el punto que más va a mirar el jurado del MINSAL:** lo crítico no queda a criterio del
modelo.

### Loop de seguimiento

Decide qué preguntar al día siguiente según el riesgo acumulado y el calendario de §9. Si no queda
estable, se degrada a una función determinística con reglas y el pitch no cambia.

---

## 7. Contrato de datos

`src/lib/types.ts` es la única fuente de verdad. Está congelado: nadie inventa un campo.

```ts
type NivelRiesgo = "bajo" | "medio" | "alto";
type TipoParto = "vaginal" | "cesarea";
type EstadoAlerta = "pendiente" | "vista" | "resuelta";
type AutorMensaje = "puerpera" | "sistema";
type Sospecha =
  | "preeclampsia_postparto" | "hemorragia_tardia" | "endometritis" | "mastitis"
  | "infeccion_herida_operatoria" | "tromboembolismo" | "depresion_postparto"
  | "dificultad_lactancia" | "sin_hallazgos";

interface Puerpera {
  id, nombre, edad, tipo_parto, fecha_parto, prevision, region,
  establecimiento, comorbilidades[],
  dia_puerperio,              // 1 a 42, derivado de fecha_parto
  ficha_extendida             // FichaExtendida | null
}

interface Evaluacion {
  id, puerpera_id, mensaje_id, dia_puerperio,
  hallazgos, nivel_riesgo, sospechas[],
  cita_protocolo,             // ej. "§3.2"
  razonamiento, created_at
}

interface Alerta {
  id, puerpera_id, evaluacion_id, nivel,
  titulo, accion_sugerida, cita_protocolo,
  estado, created_at, resuelta_at
}

// Lo que consume el panel:
interface FilaPanel {
  puerpera, ultima_evaluacion, alertas_pendientes[], nivel_riesgo,
  franja                      // 42 posiciones, null = sin contacto ese día
}
```

`FichaExtendida` es el onboarding: peso, talla, enfermedades crónicas y del embarazo, antecedentes
familiares y ginecológicos, medicamentos, hábitos (tabaco/alcohol/drogas), fecha de última regla,
semanas de gestación, paridad, embarazo múltiple, horas de trabajo de parto, anestesia,
complicaciones, episiotomía, apego inmediato, inicio de lactancia y contacto de emergencia. Vive en
una sola columna `jsonb`. **Todo es opcional a propósito:** una ficha a medias es lo normal.

---

## 8. Las pantallas

### La puerta

Se elige desde qué lado mirar el mismo caso: puérpera o matrona.

### Lado de la matrona — panel de triage

Ocupa la pantalla completa. Dos pestañas y un destino:

- **Resumen de la cohorte** — cuántas alertas en cola, cuál espera hace más, cuántas en riesgo
  alto, cuántas en la primera semana, cuántas en silencio hace 3 días o más, cobertura de contacto,
  fichas completas. Más la cola de hoy, el reparto por riesgo, quiénes dejaron de escribir, dónde
  se complica el puerperio (las señales de toda la cohorte repartidas en los 42 días) y las señales
  activas.
- **Mis pacientes** — la lista priorizada. Filtros por nivel y por alerta pendiente, búsqueda por
  nombre. Cada fila abre con el riel de riesgo de 4 px y cierra con la franja de 42 días.
- **El caso abierto** — no es pestaña, es un destino con "Volver a la lista". Es **la pantalla
  dividida**: su conversación a la izquierda (35 %) y a la derecha (65 %) las alertas pendientes,
  la última evaluación, la franja y la ficha completa con los factores de §8.

### Lado de la puérpera — seguimiento

Se muestra como un teléfono: columna enmarcada al centro sobre un fondo con el motivo del
partograma. Cuatro pestañas: **Chat**, **Mis avisos**, **Cómo he estado**, **Mi ficha**. Antes del
chat hay una ficha de ingreso de cuatro pasos con validación.

**Registro:** a ella se le habla en segunda persona, con sus palabras, sin nombrar sospechas ni
niveles de riesgo. Se le dice qué hacer, no qué tiene.

### El elemento firma — la franja de 42 días

Cada puérpera lleva una franja horizontal de 42 celdas con tres estados que no son
intercambiables:

- **celda en color** — hubo contacto y esa fue la señal más grave del día;
- **celda gris línea** — el día pasó y ella no escribió: una ausencia, no un "todo bien";
- **celda al 55 %** — el día aún no llega.

El día actual sube de 12 a 16 px y lleva contorno. El corte de semana es un espacio cada 7 celdas,
no una línea.

### El criterio de rúbrica que gobierna el diseño

Se evalúa que se vean **en pantalla el input y el output del agente**, y que la demo corra en vivo.
Las diapositivas del flujo no puntúan. Por eso la pantalla dividida existe: el jurado tiene que ver
el mensaje entrar y la alerta salir sin cambiar de contexto.

---

## 9. Sistema visual

Herramienta de triage que una matrona abre a las 8 de la mañana. Densa, legible, tranquila.

**Tres escalas de color separadas.** Confundirlas era lo que hacía que el panel se leyera como una
alarma permanente:

```
MARCA          #5C0A18 (barra superior) · #E01E37 (foco, logo)
ACCIÓN         #C8446A (botones, chips activos, enlaces, progreso)
RIESGO         #C1121F alto · #C97A05 medio · #1F8A5B bajo
```

Antes de tocar un color: preguntarse si comunica **riesgo**, **marca** o **acción**.

**Neutrales cálidos**, nunca grises fríos: fondo `#ECE4E0`, superficie `#FBF8F6`, superficie alta
`#FFFFFF`, borde `#E2D8D4`. Tinta: título `#3A1A20`, texto `#2A1418`, suave `#6E555A`, tenue
`#7D6469`.

**Tipografía: una sola familia, Inter.** La jerarquía se hace por tamaño y aire, no por negrita:
display 34/500, título 24/500, subtítulo 17/500, cuerpo 14/400, panel 13.5/400, etiqueta 11/600 con
tracking 0.18em en versalitas, cifra clínica 30/500. Todo lo numérico lleva `tabular-nums`.

**Reglas de forma.** Múltiplos de 4. Bordes de 1 px. Radios 4/8/10/999. Sin gradientes, sin blur,
sin emojis, sin ilustraciones, sin fotografía. Las sombras existen **solo en la conversación**; en
el panel clínico la jerarquía se hace con el valor del fondo.

**Contraste:** todo texto cumple WCAG AA (4.5:1). Casi toda la tinta del sistema es de 11 a 13 px,
así que no aplica la excepción de "texto grande".

**Iconos:** set propio, trazo 1.5, `currentColor`, sin relleno. Nunca introducen color. Van en
navegación y cabeceras; no dentro de una fila del panel, una tarjeta de alerta o una cifra clínica.

**Estados vacíos:** dicen qué significa el vacío, no que falta un dato. "Sin señales de alarma en
las últimas 24 horas", "No hay alertas pendientes. La cola está al día". Un campo sin responder
dice "No preguntado" — un blanco nunca se lee como un no.

**Sin spinners:** en una herramienta clínica se leen como caída. El estado de espera es texto
("Leyendo lo que me contaste…", "Evaluando…") o un esqueleto con la forma de lo que viene.

---

## 10. Cifras y fuentes verificadas

**Ninguna cifra sin fuente.** Si no está verificada, no se dice.

- **54,3 % de los partos en Chile fueron por cesárea en 2025** (43.830 de 80.654 egresos por parto;
  42,1 % en el sector público, 75,0 % en el privado). Fuente: DEIS — Egresos hospitalarios 2025,
  cálculo propio sobre microdatos.

### Fuentes regulatorias

| # | Fuente | URL |
|---|---|---|
| 1 | MINSAL — Guía Perinatal (2015) | `https://www.minsal.cl/wp-content/uploads/2015/10/GUIA-PERINATAL_2015.10.08_web.pdf-R.pdf` |
| 2 | DEIS — Egresos Hospitalarios | `https://deis.minsal.cl/#datosabiertos` |
| 3 | MINSAL — Norma Técnica del Puerperio | `https://www.minsal.cl/wp-content/uploads/2015/09/NORMA-TECNICA-PARA-LA-ATENCION-INTEGRAL-EN-EL-PUERPERIO_web.-08.10.2015-R.pdf` |

### Segmento ciudadano (campo de la rúbrica)

> Mujeres en puerperio, día 1 a 42 postparto, con parto por cesárea, afiliadas a FONASA y atendidas
> en la red pública de la Región Metropolitana.

### Un punto ciego que el proyecto aprovecha

Chile no tiene tasa nacional de mastitis puerperal, porque las estadísticas solo capturan lo que
terminó hospitalizado. Matria acompaña y, de paso, generaría el primer dato longitudinal de
puerperio del país.

---

## 11. El pitch y el Q&A

**Habla Vale (la matrona). Pip opera el demo en silencio.** Un equipo técnico presentando un
proyecto de salud es un equipo técnico; una matrona presentando la herramienta que necesita,
respaldada por un equipo técnico, es otra cosa.

- **Minuto 1 — el problema en primera persona.** El arco de la cesárea sin seguimiento. Si Vale
  tiene un caso propio, ese caso vale más que cualquier cifra.
- **Minuto 2 — la demo en vivo.** Un caso: endometritis, día 9. Se escribe el mensaje coloquial y
  el jurado ve la alerta aparecer priorizada citando la sección. Si sobra tiempo, un segundo caso
  de ideación autolítica, para mostrar la regla dura.
- **Minuto 3 — impacto.** Qué hace hoy esa persona sin la solución; el canal de adopción con
  nombre (WhatsApp para ella, el panel en el CESFAM, La Araucana como puerta de entrada); y el
  puente con longevidad.

### El puente con longevidad (por qué encaja en la Línea 03)

El embarazo es el primer test de estrés cardiovascular en la vida de una mujer. La preeclampsia y
la hipertensión gestacional multiplican el riesgo cardiovascular décadas después, y hoy ese dato se
pierde apenas la mujer sale de la maternidad. **Matria no cierra el puerperio: abre la ficha de
riesgo de longevidad de esa mujer a los 30 años en vez de a los 60.**

### Q&A — las preguntas y sus respuestas

**"¿Por qué deriva cuando deriva?"** (la que decide el criterio de defensa)
El agente escala cuando los hallazgos extraídos del relato cumplen un umbral del protocolo, y cita
la sección que lo justifica. Tres reglas absolutas están codificadas fuera del modelo: ideación
autolítica (§7.2), tromboembolismo (§6), y trastorno hipertensivo del embarazo + señal de §2 (§8).
Aparte de eso, el criterio es asimétrico a propósito: ante duda, gana el nivel más alto. Una alerta
de más cuesta un minuto de la matrona; una de menos cuesta un reingreso.

**"¿Esto no es diagnóstico?"** No. Detecta señales definidas en un protocolo escrito por matrona,
las prioriza y las escala. La decisión clínica es siempre del profesional. Está en el diseño, no en
el descargo legal.

**"¿Qué pasa si el modelo se equivoca?"** Las reglas críticas no dependen del modelo, están en
código. Y ante duda el sistema siempre escala hacia arriba.

**"¿De dónde sacaron los datos?"** DEIS, egresos hospitalarios y estadísticas vitales, con año y
fecha de corte. Las puérperas del demo son sintéticas con distribuciones que replican las reales.
Nunca hubo acceso a fichas clínicas.

**"¿Por qué no lo hace el CESFAM hoy?"** Porque una matrona no puede llamar a 300 puérperas. Matria
no la reemplaza: le dice a cuál de las 300 llamar hoy.

**"¿Y si le sacan Claude?"** Deja de funcionar. La mujer escribe "me duele la guata y me huele
feo": no hay regla ni palabra clave que convierta eso en hallazgos clínicos estructurados con nivel
de riesgo y cita de protocolo. Sin Claude queda un formulario.

### Reglas del pitch

Ninguna cifra sin fuente · nunca la palabra "diagnóstico" (detecta, prioriza, escala) · la demo
corre en vivo · si no saben algo, lo dicen: "no lo medimos" puntúa mejor que una respuesta inflada,
porque el jurado tiene gente del MINSAL y se nota.

---

## 12. Lo que NO se construyó (a propósito)

Autenticación · integración real con WhatsApp · multi-tenant · RLS · panel de administración ·
envío de correos · exportar a PDF · modo oscuro · responsive más allá de la pantalla del demo ·
edición del protocolo desde la UI · internacionalización · página de marketing.

---

## 13. Para qué sirve este documento

### Preguntas que Claude puede responder bien con esto

- Ensayar el Q&A del jurado: pídele que haga de jurado del MINSAL y te presione.
- Revisar si una respuesta tuya afirma un diagnóstico sin querer.
- Buscar huecos en el argumento de impacto o en el puente con longevidad.
- Discutir el diseño clínico: si las tres reglas duras son las correctas, si falta alguna.
- Redactar o pulir textos de UI respetando el registro (a la matrona vs. a ella).
- Pensar objeciones que el jurado podría hacer y que todavía no tienen respuesta.
- Analizar decisiones de diseño de producto y de interfaz.

### Lo que NO está acá y Claude no va a poder responder

- El código fuente completo. Están las formas de datos y la arquitectura, no las implementaciones.
- El texto literal del system prompt (`src/lib/agente/prompt.ts`).
- Los datos crudos del DEIS (`docs/DATOS_DEIS.md`) más allá de la cifra de cesáreas.
- El seed de la cohorte sintética y sus distribuciones.
- La rúbrica completa del evento: solo están los criterios que el equipo registró.
- Métricas de desempeño del agente: **no se midieron**. Si el jurado pregunta por precisión o
  recall, la respuesta honesta es que no se evaluó formalmente en la ventana de 8 horas.
