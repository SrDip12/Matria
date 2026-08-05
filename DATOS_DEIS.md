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
| 1 | Nacimientos anuales en Chile | DEIS nacimientos | | | |
| 2 | Proporción de partos por cesárea | DEIS egresos, O82 / O80–O84 | | | |
| 3 | Cesáreas sector público | DEIS egresos por dependencia | | | |
| 4 | Cesáreas sector privado | DEIS egresos por dependencia | | | |
| 5 | Edad promedio de la gestante | DEIS nacimientos | | | |
| 6 | Proporción de gestantes ≥35 años | DEIS nacimientos | | | |
| 7 | Embarazos con patología (ver abajo) | DEIS egresos, lista CIE-10 | | | |
| 8 | Reingreso ≤42 días por causa puerperal | DEIS egresos, capítulo O | | | |
| 9 | Mortalidad materna tardía | DEIS defunciones, capítulo O | | | |

La cifra 2 es el número ancla de todo el pitch. Elijan **una** con su año y úsenla de forma
consistente en el deck, el formulario y el discurso.

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

- **Buscado en:** _(completar)_
- **Qué se encontró:** _(completar)_
- **Por qué el dato no existe:** los egresos hospitalarios solo capturan casos que
  terminaron en hospitalización. La mastitis se maneja de forma ambulatoria o simplemente no
  se consulta. El REM de APS reporta producción agregada, no incidencia.

### Endometritis puerperal — tasa nacional de incidencia

- **Buscado en:** _(completar)_
- **Qué se encontró:** _(completar)_
- **Por qué el dato no existe:** _(completar)_

### Conclusión para el pitch

Chile no sabe cuánta morbilidad puerperal tiene, porque el puerperio ocurre después del alta
y fuera del sistema de registro. Matria no solo acompaña: genera el primer dato longitudinal
de puerperio del país.
