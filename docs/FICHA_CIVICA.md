# Ficha cívica — respuestas para enviar

Formulario que Bendi pre-evalúa y que los mentores revisan el día 6. Todas las cifras salen de
`docs/DATOS_DEIS.md`. URLs verificadas (HTTP 200) el 5 de agosto de 2026.

Pendiente de validación de Vale: **Población específica** y **Normativa base**.

---

## Problema (290/300)

> Una mujer sale del hospital 48 horas después de una cesárea, con un recién nacido y sin
> ningún seguimiento. Las complicaciones graves aparecen después, en la casa. Hoy el sistema se
> entera cuando ella llega a urgencias: la matrona no tiene cómo saber a cuál de sus 300
> puérperas llamar hoy.

## Población específica

> Mujeres en puerperio, día 1 a 42 postparto, con parto por cesárea, entre 20 y 39 años,
> afiliadas a FONASA y controladas en la red pública de atención primaria de la Región
> Metropolitana.

Cubre los cuatro ejes de la rúbrica: condición y etapa vital + tramo etario + territorio +
previsión. Mantiene la decisión de `docs/ENTREGABLE.md` de acotar a cesárea, que es lo que
sostiene el argumento "cirugía mayor sin seguimiento".

## Canal de adopción

> WhatsApp, derivado desde la maternidad al alta y reforzado por la matrona en el control de
> puerperio del CESFAM. Llega al segmento porque es lo único que estas mujeres ya usan a
> diario: no exige descargar nada, crear cuenta ni tener datos. El panel se instala en el
> CESFAM, dentro del flujo de la matrona que ya hace el control de puerperio y de díada. Caja
> La Araucana administra pre y postnatal de sus afiliadas, así que el piloto tiene padrón y
> puerta de entrada.

## Impacto cuantificado

> 54,3% de los partos en Chile fueron por cesárea en 2025: 43.830 de 80.654 egresos por parto
> (42,1% en el sector público, 75,0% en el privado). Es la cirugía mayor más frecuente del país
> y la única tras la que se da el alta a las 48 horas sin seguimiento. En el mismo año hubo
> 1.785 egresos hospitalarios por causa puerperal (CIE-10 O85-O92), 2,21% de los partos. Cifras
> calculadas por el equipo sobre los microdatos de egresos hospitalarios DEIS 2025
> (EGR_DATOS_ABIERTO_2025).

**Advertencia:** la cifra no está publicada como tal en ninguna página del MINSAL; es cálculo
propio sobre el dataset. Por eso el campo lo declara explícitamente. Los 1.785 egresos son
carga hospitalaria de causa puerperal, **no reingresos verificados** — el archivo no trae
identificador de paciente. Ver `docs/DATOS_DEIS.md`, cifra 8.

### URL fuente oficial

```
https://deis.minsal.cl/#datosabiertos
```

## Fuentes oficiales de salud

```
https://deis.minsal.cl/#datosabiertos
https://www.minsal.cl/wp-content/uploads/2015/09/NORMA-TECNICA-PARA-LA-ATENCION-INTEGRAL-EN-EL-PUERPERIO_web.-08.10.2015-R.pdf
https://www.minsal.cl/wp-content/uploads/2015/10/GUIA-PERINATAL_2015.10.08_web.pdf-R.pdf
https://www.ine.gob.cl/estadisticas-por-tema/demografia-y-poblacion/estadisticas-vitales
```

| URL | Verificada |
|---|---|
| deis.minsal.cl (datos abiertos) | ✅ 200 |
| Norma Técnica del Puerperio (PDF) | ✅ 200 |
| Guía Perinatal (PDF) | ✅ 200 |
| INE Estadísticas Vitales | ✅ 200 |

## Normativa base (opcional)

> Ley 20.584, derechos y deberes del paciente (ficha clínica reservada, información veraz,
> decisión clínica del profesional). Ley 21.719 sobre protección de datos personales: la salud
> es dato sensible y exige autorización expresa; plena vigencia el 1 de diciembre de 2026. Ley
> 19.628, aplicable hasta esa transición. Norma Técnica para la Atención Integral en el
> Puerperio (MINSAL, 2015) y Guía Perinatal (MINSAL, 2015) como base clínica del protocolo. El
> prototipo no trata datos personales: la cohorte es 100% sintética y no hay RUT, nombre
> completo ni teléfono en ningún campo.

**No se incluyeron links de leychile.** `bcn.cl/leychile/navegar?idNorma=...` devuelve 401
desde consola y no se pudo confirmar el `idNorma` de la Ley 21.719. Si alguien los abre en el
navegador y verifica los IDs, se agregan al campo de fuentes.
