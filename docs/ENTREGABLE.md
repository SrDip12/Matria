# Entregable técnico

Campos exactos que evalúa la rúbrica del mentor (Fase 1). **24% de la nota total** entre
"Problema y población" y "Responsabilidad clínica", y no requieren una línea de código.

Se cierran en los primeros 30 minutos. Responsable: Pip redacta, Vale valida las secciones
clínicas, Rodo consigue las URLs.

---

## Problema y población — 12%

### `segmento_ciudadano`

La rúbrica exige condición de salud o etapa vital **más** al menos un eje adicional (edad,
territorio o sistema previsional). No sirve "las mujeres" ni "los pacientes".

> Mujeres en puerperio, día 1 a 42 postparto, con parto por cesárea, afiliadas a FONASA y
> atendidas en la red pública de la Región Metropolitana.

_Vale: confirmar si acotar a cesárea nos deja mejor o peor parados. Acotar es más específico
y suma en este criterio, pero achica la población del impacto. Mi recomendación es dejar
cesárea, porque es lo que sostiene el "cirugía mayor sin seguimiento"._

### `impacto_cuantificado`

Un número, con fuente oficial verificable.

> 54,3% de los partos en Chile fueron por cesárea en 2025 (43.830 de 80.654 egresos por parto; 42,1% en el sector público, 75,0% en el privado). Fuente: DEIS — Egresos hospitalarios 2025, cálculo propio del equipo sobre microdatos censales.

### `fuente_impacto_url`

Tiene que ser dominio oficial. No prensa, no papers, no el chat del equipo.

> `https://deis.minsal.cl/#datosabiertos` (Portal oficial de Datos Abiertos DEIS, recurso Egresos Hospitalarios 2025, descargado el 04-08-2026).

---

## Responsabilidad clínica — 12%

### `fuentes_regulatorias`

Mínimo 2 URLs de organismos oficiales. Recomiendo 3, cuesta lo mismo.

| # | Fuente | URL | Verificada |
|---|---|---|---|
| 1 | MINSAL — Guía Perinatal (2015) | `https://www.minsal.cl/wp-content/uploads/2015/10/GUIA-PERINATAL_2015.10.08_web.pdf-R.pdf` | ☑ |
| 2 | DEIS — Egresos Hospitalarios | `https://deis.minsal.cl/#datosabiertos` | ☑ |
| 3 | MINSAL — Norma Técnica del Puerperio | `https://www.minsal.cl/wp-content/uploads/2015/09/NORMA-TECNICA-PARA-LA-ATENCION-INTEGRAL-EN-EL-PUERPERIO_web.-08.10.2015-R.pdf` | ☑ |

**Nadie inventa una URL.** Se abre, se verifica que cargue, se pega. Un enlace roto en este
campo es peor que no ponerlo.

### `agente_no_hace`

Redactado por Vale. Este campo es el que nos protege y el que el jurado va a leer con lupa.

> Matria no diagnostica. No indica tratamiento, fármaco ni dosis. No modifica ni sustituye el
> control de puerperio ni el control de díada. No contacta servicios de urgencia por su
> cuenta. No toma ninguna decisión clínica: clasifica señales de alarma definidas en un
> protocolo escrito por matrona y las escala al profesional, que decide.

### `agente_deriva`

Este es el campo que conecta con el criterio de Defensa: el jurado va a preguntar **por qué
deriva cuando deriva**, y la respuesta tiene que ser la misma que está acá.

> El agente escala a la matrona cuando los hallazgos extraídos del relato cumplen un umbral
> definido en el protocolo clínico, citando la sección que lo justifica. Tres reglas absolutas
> están codificadas fuera del modelo y no admiten excepción: cualquier señal de ideación
> autolítica escala a riesgo alto, cualquier sospecha de evento tromboembólico escala a riesgo
> alto, y ante duda entre dos niveles el sistema siempre elige el más alto.
>
> El criterio es asimétrico a propósito: el costo de una alerta de más es un minuto de la
> matrona; el costo de una alerta de menos es un reingreso.

_Vale: agrega o corrige los umbrales concretos por condición. Mientras más específico, mejor
puntúa y mejor se defiende._

---

## Construyó con Claude — 16%

No es un campo escrito, es **observación del mentor en el venue**. Ver `docs/PLAN.md`.

Dos preguntas que el mentor va a responder mirando:

**¿Vio el agente funcionando, aunque sea parcialmente?** Alguien del equipo tiene que ir a
buscar al mentor cuando haya algo que mostrar. No van a venir solos.

**¿Claude es el motor o un agregado decorativo? Si se saca a Claude, ¿deja de funcionar?**
Nuestra respuesta se demuestra, no se explica: se le muestra un mensaje coloquial y ambiguo
("me duele la guata y me huele feo") del que ninguna regla ni regex podría sacar hallazgos
clínicos estructurados. Sin Claude no hay producto, solo un formulario.
