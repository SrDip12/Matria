# Datos: fuentes y cifras

Regla del proyecto: **si un número no tiene fuente, año y fecha de corte, no entra al deck.**

Responsable: Rodo. Validación clínica de las categorías: Vale.

---

## Fuentes

| Fuente | Qué tiene | Dónde |
|---|---|---|
| DEIS — Egresos hospitalarios | Diagnóstico CIE-10, estadía, condición de egreso, dependencia del establecimiento. Reporte obligatorio, cobertura censal | `deis.minsal.cl/sistemas` |
| DEIS — Estadísticas vitales | Nacimientos (serie desde 1992), defunciones | mismo portal |
| DEIS — Diccionarios de datos | Definición de columnas por año, manuales de series REM | mismo portal |
| INE | Anuarios de estadísticas vitales desde 1997 | `ine.gob.cl` |
| MINSAL — Glosa 06 | Listas de espera, fuente SIGTE, con fecha de corte explícita | `minsal.cl/eje-tiempos-de-espera` |
| BCN | Informes que ya cruzaron y contextualizaron cifras | `bcn.cl` |
| Datasets del Lab | Curados y anonimizados por la organización | entregados en el evento |

Los datasets del Lab son los que el jurado conoce de memoria. Úsenlos **y además** DEIS por
cuenta propia: lo primero muestra que leyeron las bases, lo segundo que fueron más allá.

## Cifras a completar

| # | Cifra | Fuente | Año | Valor | Estado |
|---|---|---|---|---|---|
| 1 | Nacimientos anuales en Chile | INE, series vitales mensuales | 2025 (provisional) | 146.446 nacidos vivos | ✅ Completo — actualizado |
| 2 | Proporción de partos por cesárea | DEIS, egresos hospitalarios | 2025 | **54,3% nacional** (43.830 de 80.654 egresos por parto) | ✅ Completo — **ancla** |
| 3 | Cesáreas sector público (SNSS) | DEIS, egresos hospitalarios | 2025 | 42,1% (20.042 / 47.665) | ✅ Completo |
| 4 | Cesáreas sector privado (no SNSS) | DEIS, egresos hospitalarios | 2025 | 75,0% (19.658 / 26.217) | ✅ Completo |
| 5 | Edad de la gestante (tramo modal) | INE, series vitales mensuales | 2025 (provisional) | 30–34 años: 29,6% (43.327 nac.) | ✅ Completo — actualizado |
| 6 | Proporción de gestantes ≥35 años | INE, series vitales mensuales | 2025 (provisional) | 25,8% | ✅ Completo — actualizado |
| 7 | Embarazos con patología (ver abajo) | DEIS egresos, lista CIE-10 | 2025 | Diabetes gestacional 12,8% · SHE 10,7% · parto prematuro 6,8%, sobre los 80.654 egresos por parto | ✅ Completo — con la advertencia de abajo |
| 8 | Egresos por causa puerperal (O85–O92) | DEIS egresos, capítulo O | 2025 | 1.785 egresos = **2,21% de los partos del mismo año** | ⚠️ Completo con reserva — no es un reingreso verificado, ver abajo |
| 9 | Mortalidad materna tardía (O96) | Flores & Garmendia 2021, sobre datos DEIS | 1990–2018 | TMM global 23/100.000 nv; O96 es la causa de mayor crecimiento (39% del subgrupo "otras afecciones obstétricas" en 2004–2018, subgrupo que fue 1ª causa con 50,4%) | ✅ Completo |

**La cifra 2 es el número ancla de todo el pitch: 54,3% nacional de cesáreas en 2025 (42,1%
público, 75,0% privado), calculado por el equipo directamente sobre los microdatos de egresos
DEIS.** Úsenla de forma consistente en el deck, el formulario y el discurso. Reemplaza al 59%
de 2021 de OVO/CIPER, que sigue citado abajo como contraste y como serie histórica: la brecha
público/privado se abrió (era 49/73, ahora 42/75).

### Por qué la 2/3/4 no vienen directo de un dashboard DEIS

Se intentó bajar la tasa de cesáreas directo de DEIS por tres vías: el portal público de
datos abiertos (`datos.gob.cl`, dataset "Egresos Hospitalarios" — recurso huérfano de 2013,
de un solo hospital, inservible), el catálogo de tableros SAS de DEIS
(`informesdeis.minsal.cl`, carpeta "ReportesExternos" — decenas de informes de vigilancia
epidemiológica, ninguno de egresos por parto o cesárea) y el sistema de egresos hospitalarios
propiamente tal (`egresos40.minsal.cl`), que **exige login institucional** y no es accesible
como ciudadano. No es un vacío de búsqueda: los mismos investigadores de OVO-Chile (Sadler &
Leiva, columna CIPER 11.01.2023) documentan haber necesitado **cuatro solicitudes por Ley de
Transparencia** y una visita al Senado para conseguir el desglose público/privado de 2021. Esa
columna, con la cifra ya publicada y trazable a la fuente oficial que la generó (Minsal, en
base a egresos hospitalarios DEIS por dependencia administrativa), es la fuente más sólida
disponible sin acceso institucional a DEIS. Se cruzó contra el Informe Anual de Derechos
Humanos 2016 del INDH, que reporta la misma serie para 2015 (50% nacional, 41% público, 69%
privado) también en base a DEIS — la tendencia es consistente y al alza.

### Cifras 7 y 8 — resueltas con los microdatos de egresos 2025

El dataset de datos abiertos `Datos/EGR_DATOS_ABIERTO_2025.csv` (199.473 egresos del capítulo O,
filtrado según `docs/FILTRADO_DATOS.md`) sí trae el registro a nivel de egreso, así que las dos
cifras se calcularon por cuenta propia. **Denominador de todo lo que sigue: 80.654 egresos con
`DIAG1` en O80–O84, es decir partos del año 2025.**

**Advertencia metodológica que hay que decir en voz alta si el jurado pregunta:** `DIAG2` viene
vacío en el 99,9% del archivo — solo 200 filas de 199.473 lo traen, y ninguna con código O. Cada
egreso porta un único diagnóstico. Eso significa que un egreso por parto **no puede** portar
además su comorbilidad codificada, y por lo tanto la cifra 7 **no es prevalencia intra-parto**:
es la razón entre egresos por esa patología y egresos por parto del mismo año. Es un indicador
de carga hospitalaria, no de prevalencia clínica.

- **Cifra 7 (patología del embarazo), egresos 2025:**

  | Categoría | Códigos | Egresos | Razón sobre partos |
  |---|---|---|---|
  | Diabetes gestacional | O24 | 10.334 | 12,8% |
  | Síndrome hipertensivo del embarazo | O10–O16 | 8.646 | 10,7% |
  | Parto prematuro | O60 | 5.451 | 6,8% |

  Dentro de O10–O16, el desglose útil: O13 hipertensión gestacional 2.381 · O14 preeclampsia
  3.495 (O14.0 1.014, O14.1 1.159, O14.2 268, O14.9 1.054) · O15 eclampsia 84 · O11 398 · O16 831.

- **Cifra 8 (causa puerperal), egresos 2025:** el bloque O85–O92, que es el puerperio propiamente
  tal, suma **1.785 egresos = 2,21% de los partos del año**.

  | Código | Qué es | Egresos |
  |---|---|---|
  | O86 | Otras infecciones puerperales (O86.0 herida quirúrgica obstétrica: 361) | 504 |
  | O90 | Otras complicaciones del puerperio | 479 |
  | O91 | Infecciones de la mama asociadas al parto | 382 |
  | O85 | Sepsis puerperal | 205 |
  | O89 | Complicaciones de la anestesia durante el puerperio | 102 |
  | O92 | Trastornos de la mama y de la lactancia | 71 |
  | O87 | Complicaciones venosas del puerperio | 23 |
  | O88 | Embolia obstétrica | 19 |

  Fuera de ese bloque pero dentro de la ventana de Matria: **O72.2 hemorragia postparto tardía y
  secundaria, 237 egresos**.

  **Por qué la cifra 8 lleva reserva:** el archivo no trae identificador de paciente ni marca de
  readmisión. 1.785 es "egresos con causa puerperal como diagnóstico principal", **no reingresos
  verificados**: no hay forma de saber cuántos son la misma mujer volviendo tras un parto que
  también está en el archivo. Decirlo como "tasa de reingreso" sería falsearlo. Se cita como
  *carga hospitalaria de causa puerperal*. El estudio de un solo hospital que ya estaba
  documentado acá (*Rev Chil Obstet Ginecol* 2017;82(1):30-36, alta a las 48h post-cesárea:
  metrorragia, infección puerperal y legrado puerperal = 70% de los reingresos) sigue sirviendo
  como referencia cualitativa de las causas, no como tasa nacional.

  El sesgo de sector es marcado y vale la pena mostrarlo: **79,8% de los egresos por causa
  puerperal ocurren en el SNSS**, contra 67,4% del total de egresos obstétricos. La estadía
  mediana del bloque es de 3 días (media 4,0), contra 2 días de un parto.

### Citas completas

- **Cifra 1, 5, 6** — Instituto Nacional de Estadísticas (INE). *Estadísticas Vitales. Cifras
  Provisionales 2023*. Santiago: INE, 2024. Datos SRCeI, hechos ocurridos entre el
  1-ene-2023 y el 31-dic-2023.
- **Cifra 2, 3, 4** — Sadler, M. & Leiva, G. "Más cesáreas que nunca en Chile". *CIPER Chile*,
  11 de enero de 2023 (columna de opinión, Fundación OVO Chile, datos obtenidos vía Ley
  N°20.285 de Transparencia). Contraste: Instituto Nacional de Derechos Humanos (INDH),
  *Informe Anual Situación de los Derechos Humanos en Chile 2016*, cifras 2015.
- **Cifra 9** — Flores, M. & Garmendia, M.L. "Tendencia y causas de la mortalidad materna en
  Chile de 1990 a 2018". *Revista Médica de Chile* 2021;149(10). DOI:
  10.4067/s0034-98872021001001440. Metodología: defunciones DEIS (capítulo O, CIE-9/CIE-10) +
  nacidos vivos INE.

## Distribuciones de la cohorte sintética

De dónde sale cada distribución de `scripts/seed.ts`. Ninguna persona es real: los nombres se
arman por combinación de dos listas, y no hay RUT ni teléfono en ningún campo.

| Variable | Cómo se distribuye | Fuente |
|---|---|---|
| Región | 16 regiones con la glosa oficial DEIS | **Real.** Proporción de egresos por parto (`DIAG1` en O80–O84) por `GLOSA_REGION_RESIDENCIA` en `Datos/EGR_DATOS_ABIERTO_2025.csv`, sobre los 72.983 partos con región identificada. Se excluyen del denominador 6.772 filas suprimidas por DEIS, 693 "Ignorada" y 206 "Extranjero" |
| Establecimiento | 2 a 6 por región, público o privado según previsión | Nombre oficial del Anexo 4 "Establecimientos de procedencia", `Datos/Esquema_Registros_2026.xlsx` (Esquema de Registros DEIS 2026), campos `Nombre Oficial`, `Pertenencia al SNSS` y `Código Región`. Verificado byte a byte contra el anexo |
| Tipo de parto | 42,1% cesárea si el establecimiento es SNSS, 75,0% si no lo es | **Real.** Cifras 3 y 4 de la tabla de arriba |
| Edad | Tramos quinquenales 12–54; modal 30–34 (29,6%), ≥35 años 25,8% | **Real.** INE, `Datos/series-vitales-mensuales-2024p-2026p.xlsx`, hoja Nacimientos, año 2025 completo, Total País, n = 146.161 con edad especificada |
| Previsión | FONASA 90,7% · ISAPRE 9,3% | **Real** en el eje FONASA/ISAPRE: 66.409 y 6.806 partos DEIS 2025. El desglose de FONASA en tramos A/B/C/D (26,8 / 31,7 / 17,1 / 24,4 dentro de FONASA) **sigue siendo supuesto del equipo**: el dataset trae "FONASA" sin tramo |
| Establecimiento no SNSS según previsión | 28,8% en FONASA, 98,6% en ISAPRE | **Real.** Cruce `GLOSA_PREVISION` × `PERTENENCIA_ESTABLECIMIENTO_SALU` sobre los partos. El 28,8% de FONASA en establecimiento privado es modalidad libre elección |
| Comorbilidades | Diabetes gestacional 12,8% · SHE 10,7% · parto prematuro 6,8% | **Real, con la reserva de la cifra 7**: son razones de egresos por patología sobre egresos por parto, no prevalencias intra-parto |
| Mezcla de señales de alarma | Ponderada por cuadro, en casos por 1.000 puérperas seguidas | **Mixta.** Ver la nota sobre el factor de subregistro, abajo |
| Ventanas de riesgo por cuadro | Días del puerperio en que cada cuadro puede dispararse | **Real donde la norma la define:** hemorragia tardía días 2–42 (Norma Técnica del Puerperio MINSAL 2015 p.58 y Guía Perinatal 2015 p.367: entre las 24 h y las 6 semanas) e infección de herida operatoria días 3–30 (Norma p.87). Para endometritis, mastitis y TVP/TEP **la norma no define ventana temporal** — lo único disponible es la tabla cualitativa por etapa de la p.45. Esas tres siguen con rango del equipo, pendientes de Vale |

Las 16 regiones y los 9 escenarios clínicos tienen cobertura garantizada en la cohorte: las
primeras filas del seed toman una región y un escenario cada una antes de pasar al muestreo
aleatorio. Con 200 mujeres, Aisén (0,9%) y el tromboembolismo (0,5 por 1.000) se caen del
muestreo en buena parte de las corridas, y la demo no puede depender de eso.

La proporción de cesáreas que resulta de la cohorte queda cerca del 53,7%, algo bajo el 54,3%
observado: el 54,3% incluye las 6.772 filas que DEIS suprime, cuya tasa de cesárea es 61,0%, y
que la cohorte no puede representar porque no tienen región ni previsión. La corrida imprime el
porcentaje efectivo y falla si se aleja más de 8 puntos, para que nadie cite de memoria.

### El factor de subregistro de la mezcla de señales

DEIS mide hospitalizaciones y Matria mira el puerperio en la casa. Poner tasas de egreso y
supuestos ambulatorios en la misma escala deforma la cohorte: con las tasas DEIS crudas, la
mastitis aparecía 20 veces menos que la dificultad de lactancia, que es clínicamente absurdo.

La mezcla usa entonces **la tasa DEIS multiplicada por un factor único de subregistro de 10×**,
aplicado por igual a todos los cuadros para no alterar la mezcla relativa entre ellos, que es la
parte que sí tiene fuente. El factor está anclado en el único cuadro donde hay con qué
contrastar: **mastitis da 0,47% en egresos DEIS 2025 contra 3%–33% en la literatura clínica**,
es decir un factor real de entre 6 y 70. Se toma 10, el extremo prudente.

| Escenario | § | Base DEIS 2025 | Peso (×10) |
|---|---|---|---|
| Mastitis | §5.1 | O91, 382 egresos | 47,4 |
| Infección de herida operatoria | §3.2 | O86.0, 361 egresos | 44,8 |
| Endometritis | §3.1 | O85 + O86.1 + O86.4, 248 egresos | 30,7 |
| Hemorragia tardía | §4 | O72.2, 237 egresos | 29,4 |
| Tromboembolismo | §6 | O87 + O88, 42 egresos | 5,2 |
| Preeclampsia postparto | §2 | O15.2, 24 egresos | 3,0 |
| Sintomatología depresiva | §7.1 | — sin dato posible | 40 (supuesto) |
| Dificultad de lactancia | §5.2 | O92 solo hospitalizada, 71 | 25 (supuesto) |
| Ideación autolítica | §7.2 | — sin dato posible | 6 (supuesto) |

Un dato del archivo que conviene tener a mano y que sorprende: **Los Ríos registra 491 partos y
Aisén 672**, pese a que Los Ríos tiene el triple de población. La variable es región de
*residencia* y el subregistro es del archivo, no del seed. Se deja tal cual porque el dato es
real y trazable; si alguien pregunta, esa es la respuesta.

## Códigos CIE-10

Lista definida por Vale. **No agregar códigos por cuenta propia.**

| Categoría | Códigos | Confirmado por Vale |
|---|---|---|
| Trastornos hipertensivos del embarazo | O10–O16 | ☐ |
| Diabetes gestacional | O24 | ☐ |
| Parto prematuro / amenaza | O60 | ☐ |
| Parto por cesárea | O82 | ☐ |
| Total de partos (denominador) | O80–O84 | ☐ |
| Sepsis puerperal | O85 | ☐ |
| Otras infecciones puerperales | O86 | ☐ |
| Hemorragia postparto | O72 | ☐ |
| Mastitis puerperal | O91 | ☐ |
| _(agregar los que falten)_ | | ☐ |

## Hallazgos negativos

Documentar acá lo que se buscó y **no existe**. Esta sección sostiene el argumento más fuerte
del pitch y es la respuesta cuando el jurado pregunte si buscaron bien.

### Depresión postparto — cero registros en 199.473 egresos obstétricos

- **Buscado en:** `Datos/EGR_DATOS_ABIERTO_2025.csv`, búsqueda del código **F53** (trastornos
  mentales y del comportamiento asociados al puerperio) en `DIAG1` y en `DIAG2`, sobre la
  totalidad del archivo.
- **Qué se encontró:** **0 casos. Cero, en los 199.473 egresos del capítulo O de todo 2025.**
  El único proxy disponible es O99.3 (trastornos mentales y del sistema nervioso que complican
  el embarazo, parto y puerperio) con 968 egresos, categoría que mezcla depresión, ansiedad,
  epilepsia y cualquier condición neurológica, y que no es separable con este dataset.
- **Por qué el dato no existe:** la depresión postparto no hospitaliza. El sistema de egresos
  solo ve a la mujer cuando ya ocupó una cama, y para este cuadro eso prácticamente no ocurre —
  o cuando ocurre, se codifica por la causa del ingreso, no por el cuadro de base.
- **Por qué importa acá:** es el cuadro que el protocolo escala más agresivamente (§7.2, ideación
  autolítica escala a alto sin excepción) y es, al mismo tiempo, el que el país no cuenta. Los
  pesos de §7.1 y §7.2 en la cohorte sintética son supuesto del equipo por esta razón, y está
  declarado en `scripts/seed.ts`.

### Mastitis puerperal — tasa nacional de incidencia

- **Buscado en:** DEIS egresos hospitalarios (vía las mismas rutas descritas arriba), DEIS
  REM series A y P de atención primaria, portal de tableros SAS de DEIS
  (`informesdeis.minsal.cl`, sin resultados al buscar "mastitis" ni "puerperal"), Norma
  Técnica y guías de puerperio de Minsal, y literatura clínica nacional (Síntesis de
  Conocimientos, Facultad de Medicina U. de Chile).
- **Qué se encontró:** solo cifras clínicas genéricas de revisiones internacionales (rango
  3%–33% de mujeres en lactancia, sin desagregar por país) y un dato puntual de un protocolo
  de lavado de manos en un establecimiento local (bajó de 2,9% a 0,65%, no representativo a
  nivel nacional). Ningún indicador nacional agregado ni vigente.
- **Lo que sí se pudo calcular ahora, y por qué no cierra el vacío:** con los microdatos 2025,
  O91 (infecciones de la mama asociadas al parto) tiene **382 egresos**, es decir **0,47% de los
  partos del año**. Contrastar ese 0,47% con el rango clínico internacional de 3%–33% es la
  demostración numérica del argumento: entre el piso de ese rango y lo que el sistema registra
  hay un factor de seis a setenta. Lo que se ve en DEIS es la mastitis que terminó hospitalizada.
- **Por qué el dato no existe:** los egresos hospitalarios solo capturan casos que
  terminaron en hospitalización. La mastitis se maneja de forma ambulatoria o simplemente no
  se consulta. El REM de APS reporta producción agregada, no incidencia.

### Endometritis puerperal — tasa nacional de incidencia

- **Buscado en:** mismas rutas que mastitis, más la Guía Perinatal de Minsal y Síntesis de
  Conocimientos (U. de Chile).
- **Qué se encontró:** una única cifra puntual y no vigente — tasa nacional 2012 de 0,46%
  para parto vaginal y 0,47% para cesárea en trabajo de parto, citada en material docente de
  la U. de Chile. **No se logró rastrear el informe DEIS primario del que sale esa cifra en
  esta ventana de tiempo**, así que no entra al deck sin esa verificación. No hay serie
  temporal ni indicador vigente posterior a 2012.
- **Por qué el dato no existe:** mismo argumento estructural que la mastitis — el sistema
  solo ve lo hospitalizado, y el puerperio ambulatorio no tiene seguimiento longitudinal.

### Conclusión para el pitch

Chile no sabe cuánta morbilidad puerperal tiene, porque el puerperio ocurre después del alta
y fuera del sistema de registro. Matria no solo acompaña: genera el primer dato longitudinal
de puerperio del país.

---

## Cumplimiento de la wiki legal del Lab

Referencia: `https://longevidad.benditaia.cl/es/wiki-legal`. Una fila por regla no negociable,
con dónde se cumple en el repo. Esto es lo que se responde si el jurado o CENS pregunta.

| Regla de la wiki | Cómo se cumple en Matria | Dónde verificarlo |
|---|---|---|
| Solo anonimizado y agregado | Ninguna fila viene de una persona. La cohorte se genera; lo que se toma de DEIS/INE son distribuciones agregadas (región, tipo de parto, previsión, edad, comorbilidades) | `scripts/seed.ts`, tabla de fuentes arriba |
| Prospección sintética | Es exactamente la técnica usada: 200 puérperas generadas que replican los patrones de 80.654 partos reales de 2025 sin exponer a nadie | `scripts/seed.ts` |
| Fuentes públicas curadas | DEIS egresos 2025, DEIS defunciones, INE series vitales, Anexo 4 del Esquema de Registros 2026. Todas públicas, todas trazadas con año y fecha de corte | secciones anteriores de este documento |
| Cero PII: ni dataset, ni prompt, ni demo | Sin RUT, teléfono, fecha de nacimiento ni ficha en ningún campo. La etiqueta visible es nombre de pila + inicial + código de caso (`Antonia M. · PM-042`), nunca un nombre completo. El nombre **no** se envía a la API de Claude: el prompt recibe día de puerperio, tipo de parto y texto del mensaje | `supabase/schema.sql` (tabla `puerperas`), `src/lib/agente/prompt.ts` |
| Prohibido re-identificar | No aplica: no hay dataset de origen con personas que re-identificar. Los microdatos DEIS usados ya vienen agregados y suprimidos en origen | `docs/FILTRADO_DATOS.md` |
| Privacy by design desde el prototipo | La demo no necesita ni un solo dato identificable para funcionar. Se puede correr entera con la etiqueta reducida a un código | `scripts/seed.ts` |
| Asistencia, no diagnóstico | El agente clasifica riesgo y escala; tiene prohibido el lenguaje diagnóstico en el system prompt (`nunca "tiene", "presenta un cuadro de", "diagnóstico", "confirmado"`) | `src/lib/agente/prompt.ts`, regla 2 de `CLAUDE.md` |
| Humano en el circuito | Ninguna acción clínica automática. El sistema no contacta urgencias, no agenda, no indica tratamiento: solo levanta la alerta para la matrona | regla 4 de `CLAUDE.md` |
| Cita tu evidencia | Cada evaluación obliga a citar la sección del protocolo que la justifica. La columna `cita_protocolo` es `not null`: sin cita no se persiste | `supabase/schema.sql`, `docs/PROTOCOLO_CLINICO.md` |
| Guardrails clínicos | El system prompt se arma desde el protocolo curado; lo que no está en ese archivo, el agente no lo sabe | `src/lib/agente/prompt.ts` |
| Claude como motor principal | Llamadas reales a `claude-sonnet-4-6` con `tool_use` para forzar salida estructurada | `src/lib/agente/evaluar.ts`, `src/app/api/evaluar/` |
| Criterio clínico en el equipo | Vale, matrona, es autora única de `docs/PROTOCOLO_CLINICO.md` | mapa de propiedad en `CLAUDE.md` |

### Gobernanza del dato

- **Dueño:** las fuentes son datasets públicos del Estado (DEIS, INE). No hay convenio de datos
  que gestionar porque no se recibió ningún dataset de terceros ni datos de pacientes.
- **Quién autoriza:** no aplica en el prototipo — no hay tratamiento de datos personales de
  pacientes, así que no hay autorización expresa que recabar (Ley 19.628 / 21.719).
- **Quién administra:** Rodo mantiene el seed y las fuentes; Vale valida las categorías clínicas.

### Qué cambia al pasar a producción

El prototipo no trata datos personales. Un despliegue real sí lo haría, y ahí el régimen es
otro: dato sensible bajo Ley 21.719 (plena vigencia 1 de diciembre de 2026), ficha clínica
reservada bajo Ley 20.584, autorización expresa de la puérpera, derechos ARCO+ y notificación
de brechas. Los controles técnicos que hoy no existen porque no hay nada que proteger
—autenticación, RLS, cifrado, log de accesos— son el delta explícito de esa transición.
