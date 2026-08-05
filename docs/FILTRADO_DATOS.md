# Documentación de Filtrado y Metodología de Datos

Este documento describe el proceso, los criterios clínicos y la justificación técnica utilizada para filtrar y reducir el peso de los datasets masivos de datos abiertos de **DEIS** e **INE** almacenados en la carpeta [`Datos/`](file:///c:/Users/Asus/OneDrive/Escritorio/Proyectos/Matria/Datos).

---

## 1. Contexto y Requerimiento

Los datasets originales publicados por el **DEIS** (Departamento de Estadística e Información de Salud) y el **INE** contienen información censal a nivel nacional. El archivo de egresos hospitalarios superaba los **302 MB** y el de defunciones rozaba los **95 MB**.

### Objetivos del Filtrado:
1. **Límite de Tamaño:** Garantizar que ningún archivo supere los **100 MB** (límite de Git/GitHub) y que la carpeta del proyecto sea ligera y rápida de clonar.
2. **Integridad de Datos:** Conservar el **100% de los datos necesarios** para la plataforma **Matria** (seguimiento del puerperio de 42 días, patologías maternas, epidemiología perinatal y mortalidad materna).

---

## 2. Detalle del Filtrado por Archivo

### A. Egresos Hospitalarios 2025 (`Datos/EGR_DATOS_ABIERTO_2025.csv`)

- **Tamaño Original:** 302.67 MB (1,705,514 registros)
- **Tamaño Final:** **33.34 MB** (199,473 registros)
- **Porcentaje de Reducción:** **-88.98%**

#### Criterio Aplicado:
Se conservaron únicamente los registros donde el diagnóstico primario (`DIAG1`) o el diagnóstico secundario (`DIAG2`) pertenezcan al **Capítulo XV de la CIE-10: Embarazo, parto y puerperio (códigos `O00` a `O99`)**.

#### ¿Por qué?
Matria es un sistema enfocado en la atención longitudinal del puerperio y salud materna. Todos los indicadores de patología obstétrica y puerperal especificados en la literatura clínica y en [`docs/DATOS_DEIS.md`](file:///c:/Users/Asus/OneDrive/Escritorio/Proyectos/Matria/docs/DATOS_DEIS.md) corresponden al Capítulo O:
- **`O10–O16`:** Trastornos hipertensivos del embarazo y preeclampsia postparto.
- **`O24`:** Diabetes gestacional.
- **`O60`:** Parto prematuro y amenaza de parto prematuro.
- **`O72`:** Hemorragia postparto tardía.
- **`O80–O84`:** Totalidad de partos y cesáreas (`O82`).
- **`O85–O86`:** Sepsis puerperal y otras infecciones puerperales (endometritis, infección herida operatoria).
- **`O91`:** Mastitis puerperal.
- **`O96`:** Mortalidad materna tardía y causas puerperales posteriores.

Las hospitalizaciones no obstétricas (ej. traumatología, cardiología masculina, geriatría) no forman parte del universo del puerperio y fueron descartadas.

---

### B. Defunciones 2024–2026 (`Datos/DEFUNCIONES_FUENTE_DEIS_2024_2026_04082026.csv`)

- **Tamaño Original:** 94.42 MB (327,111 registros)
- **Tamaño Final:** **43.96 MB** (157,033 registros)
- **Porcentaje de Reducción:** **-53.44%**

#### Criterio Aplicado:
Se conservaron todas las defunciones donde el sexo de la persona fallecida fuera femenino (`SEXO_NOMBRE` = 'Mujer') o el diagnóstico de defunción perteneciera al Capítulo O de la CIE-10.

#### ¿Por qué?
Para el análisis de mortalidad materna directa, tardía y de salud mental en el puerperio (ideación autolítica / depresión postparto severa, según la sección §7.2 de [`docs/PROTOCOLO_CLINICO.md`](file:///c:/Users/Asus/OneDrive/Escritorio/Proyectos/Matria/docs/PROTOCOLO_CLINICO.md)), era indispensable mantener la totalidad de las defunciones femeninas de todas las edades. Las defunciones masculinas (170,078 registros) no guardan relación con la salud materna ni con los denominadores de las tasas de mortalidad perinatal.

---

### C. Series Vitales Mensuales INE (`Datos/series-vitales-mensuales-2024p-2026p.xlsx`)

- **Tamaño:** **0.32 MB** (324 KB)
- **Acción:** Conservado intacto (100% de los datos sin filtrar).

#### ¿Por qué?
Dado que su peso es de apenas 324 KB, no existía restricción de espacio. Contiene las series mensuales consolidadas de nacimientos desagregados por grupo de edad de la madre (<15 hasta 50+ años), defunciones acumuladas, matrimonios y AUC, sirviendo como fuente primaria para las cifras del pitch.

---

## 3. Scripts de Replicabilidad

Para reproducir el proceso de filtrado de forma determinista, se utilizaron scripts en Python con las librerías estándar `csv` y `os`.

### Script para `EGR_DATOS_ABIERTO_2025.csv`:
```python
import csv, os

input_path = 'Datos/EGR_DATOS_ABIERTO_2025_ORIGINAL.csv'
output_path = 'Datos/EGR_DATOS_ABIERTO_2025.csv'

with open(input_path, 'r', encoding='latin1', newline='') as infile:
    reader = csv.reader(infile, delimiter=';')
    header = next(reader)
    
    with open(output_path, 'w', encoding='latin1', newline='') as outfile:
        writer = csv.writer(outfile, delimiter=';')
        writer.writerow(header)
        for row in reader:
            if len(row) > 12:
                d1 = row[12].strip().upper()
                d2 = row[13].strip().upper() if len(row) > 13 else ''
                if d1.startswith('O') or d2.startswith('O'):
                    writer.writerow(row)
```

### Script para `DEFUNCIONES_FUENTE_DEIS_2024_2026_04082026.csv`:
```python
import csv, os

input_path = 'Datos/DEFUNCIONES_ORIGINAL.csv'
output_path = 'Datos/DEFUNCIONES_FUENTE_DEIS_2024_2026_04082026.csv'

with open(input_path, 'r', encoding='latin1', newline='') as infile:
    reader = csv.reader(infile, delimiter=';')
    header = next(reader)
    
    with open(output_path, 'w', encoding='latin1', newline='') as outfile:
        writer = csv.writer(outfile, delimiter=';')
        writer.writerow(header)
        for row in reader:
            sex = row[2].strip().lower() if len(row) > 2 else ''
            d1 = row[8].strip().upper() if len(row) > 8 else ''
            d2 = row[17].strip().upper() if len(row) > 17 else ''
            cap1 = row[9].strip().upper() if len(row) > 9 else ''
            cap2 = row[18].strip().upper() if len(row) > 18 else ''
            
            is_o = d1.startswith('O') or d2.startswith('O') or cap1 == 'O00-O99' or cap2 == 'O00-O99'
            if sex == 'mujer' or is_o:
                writer.writerow(row)
```

---

## 4. Estado de Verificación de Integridad

| Archivo | Filas Originales | Filas Filtradas | Tamaño Final | Estado |
|---|---|---|---|---|
| `EGR_DATOS_ABIERTO_2025.csv` | 1,705,514 | 199,473 | 33.34 MB | ✅ Verificado |
| `DEFUNCIONES_FUENTE_DEIS_2024_2026_04082026.csv` | 327,111 | 157,033 | 43.96 MB | ✅ Verificado |
| `series-vitales-mensuales-2024p-2026p.xlsx` | — | 485 | 0.32 MB | ✅ Completo |

- **Codificación:** Preservada en `latin1` con delimitador de campos `;`.
- **Estructura de Columnas:** 100% idéntica a las bases originales publicadas por DEIS.
