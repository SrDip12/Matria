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
| 1 | Nacimientos anuales en Chile | INE, Estadísticas Vitales | 2023 (provisional) | 171.992 nacidos vivos | ✅ Completo |
| 2 | Proporción de partos por cesárea | OVO-Chile / CIPER, sobre datos DEIS | 2021 | 59% nacional | ✅ Completo — **ancla** |
| 3 | Cesáreas sector público | OVO-Chile / CIPER, sobre datos DEIS | 2021 | 49% | ✅ Completo |
| 4 | Cesáreas sector privado | OVO-Chile / CIPER, sobre datos DEIS | 2021 | 73% | ✅ Completo |
| 5 | Edad de la gestante (tramo modal) | INE, Estadísticas Vitales | 2023 (provisional) | 30–34 años: 29,4% (50.523 nac.) | ✅ Completo |
| 6 | Proporción de gestantes ≥35 años | INE, Estadísticas Vitales | 2023 (provisional) | 23,9% | ✅ Completo |
| 7 | Embarazos con patología (ver abajo) | DEIS egresos, lista CIE-10 | — | — | ⛔ Pendiente — ver nota |
| 8 | Reingreso ≤42 días por causa puerperal | DEIS egresos, capítulo O | — | — | ⛔ Pendiente — ver nota |
| 9 | Mortalidad materna tardía (O96) | Flores & Garmendia 2021, sobre datos DEIS | 1990–2018 | TMM global 23/100.000 nv; O96 es la causa de mayor crecimiento (39% del subgrupo "otras afecciones obstétricas" en 2004–2018, subgrupo que fue 1ª causa con 50,4%) | ✅ Completo |

**La cifra 2 es el número ancla de todo el pitch: 59% nacional de cesáreas en 2021 (49%
público, 73% privado).** Úsenla de forma consistente en el deck, el formulario y el discurso.

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

### Cifras 7 y 8 — no se pudieron completar en esta ventana

Ambas requieren microdatos de egresos hospitalarios (registro a nivel de cada egreso, con
CIE-10 y, para la 8, capacidad de enlazar reingresos de la misma paciente), que solo están
disponibles en el sistema autenticado `egresos40.minsal.cl`. No existe un indicador agregado
público que las resuma directamente:

- **Cifra 7 (patología del embarazo):** los códigos ya están definidos por Vale más abajo;
  falta solo cruzarlos contra el total de egresos por dependencia y año una vez que alguien
  del equipo consiga acceso al sistema (institucional, o vía Ley de Transparencia como hizo
  OVO-Chile).
- **Cifra 8 (reingreso ≤42 días):** lo único encontrado fue un estudio de un solo hospital
  (*Rev Chil Obstet Ginecol* 2017;82(1):30-36, alta a las 48h post-cesárea) con causas de
  reingreso (metrorragia, infección puerperal, legrado puerperal = 70% de los reingresos) pero
  **sin representar una tasa nacional**. No se usa en el deck.

Si sobra tiempo real: cifra 7 y 8 son las primeras candidatas a intentar de nuevo, en ese
orden.

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
