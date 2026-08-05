# Pitch

**Habla Vale.** Pip opera el demo en silencio.

Un equipo técnico presentando un proyecto de salud es un equipo técnico. Una matrona
presentando la herramienta que necesita, respaldada por un equipo técnico, es otra cosa.

---

## Minuto 1 — El problema, en primera persona

Vale, en sus palabras. No leído.

El arco: **más de la mitad de los partos en Chile son cesáreas** — la cirugía mayor más
frecuente del país — y es la única de la que mandamos a la paciente para la casa a las 48
horas, a cargo de un recién nacido, sin ningún sistema de seguimiento. El puerperio dura 42
días y ahí se concentra todo: preeclampsia postparto, hemorragia tardía, endometritis,
mastitis, depresión postparto. El sistema se entera cuando la mujer llega a urgencias.

Si tiene un caso propio, ese caso vale más que cualquier cifra. Uno solo, treinta segundos.

## Minuto 2 — La demo, en vivo

Sin explicar la arquitectura. Se muestra.

Un caso: **endometritis, día 9**. Se escribe el mensaje como lo escribiría ella —
coloquial, ambiguo, con faltas — y el jurado ve la alerta aparecer priorizada en el panel,
citando la sección del protocolo.

Vale narra mientras ocurre: qué habría pasado sin esto, y en cuántos días.

Si sobra tiempo, un segundo caso: **ideación autolítica**, para mostrar la regla dura.
Escala a alto de inmediato, sin importar nada más. Ese es el caso que demuestra que el
diseño clínico es serio y no decorativo.

## Minuto 3 — Impacto real: el 21% se gana acá

La rúbrica pide dos cosas explícitas. Dígalas con estas palabras, no las insinúen.

**1. Qué hace hoy esa persona sin la solución.**

Hoy una mujer con cesárea sale del hospital a las 48 horas con un papel que dice a qué hora
volver. Si a los nueve días le duele la guata y le huele feo, tiene tres opciones: aguantar,
buscar en internet, o irse a urgencias. No tiene a quién preguntarle. La matrona que la
controló no sabe que existe hasta el control, y el control puede ser en dos semanas.

Con Matria, esa misma mujer escribe un mensaje y la matrona la ve priorizada esa mañana.

**2. El canal de adopción, con nombre.**

WhatsApp para la mujer, porque es lo único que ya usa. El panel se instala en el CESFAM, en
el flujo de la matrona que ya hace el control de puerperio y de díada. Y La Araucana es una
caja de compensación: sus afiliadas son mujeres en edad laboral y ya administran pre y
postnatal, así que el piloto tiene población y tiene puerta de entrada.

**3. El puente con longevidad.**

El embarazo es el primer test de estrés cardiovascular en la vida de una mujer. La
preeclampsia y la hipertensión gestacional multiplican el riesgo cardiovascular décadas
después, y hoy ese dato se pierde apenas la mujer sale de la maternidad. Matria no cierra el
puerperio: **abre la ficha de riesgo de longevidad de esa mujer a los 30 años en vez de a los
60.**

**4. El punto ciego.**

Buscamos la tasa nacional de mastitis puerperal y Chile no la tiene, porque las estadísticas
solo capturan lo que terminó hospitalizado. Matria acompaña y, de paso, genera el primer dato
longitudinal de puerperio del país.

---

## Q&A — 2 minutos, 15% de la nota

La rúbrica evalúa dos cosas: que respondan **sin evadir**, y que sostengan la decisión
clínica sabiendo **por qué el agente deriva cuando deriva**.

Esa segunda es de Vale. Si Pip contesta una pregunta clínica, se pierde el criterio.

Regla: si no saben algo, lo dicen. "No lo medimos" puntúa mejor que una respuesta inflada,
porque el jurado tiene gente del MINSAL y se nota.

### **"¿Por qué deriva cuando deriva?"** — la pregunta que decide el criterio

El agente escala cuando los hallazgos extraídos del relato cumplen un umbral del protocolo, y
cita la sección que lo justifica. Hay tres reglas absolutas codificadas fuera del modelo:
ideación autolítica escala a alto, sospecha de tromboembolismo escala a alto, y ante duda
entre dos niveles siempre gana el más alto. El criterio es asimétrico a propósito: una alerta
de más cuesta un minuto de la matrona, una de menos cuesta un reingreso.

Vale debe poder dar un umbral concreto de memoria. Ej: fiebre sobre X grados desde el día Y
con loquios de mal olor.

### **"¿Esto no es diagnóstico?"**

No. Detecta señales de alarma definidas en un protocolo escrito por matrona, las prioriza y
las escala. La decisión clínica es siempre del profesional. Está en el diseño, no en el
descargo legal.

### **"¿Qué pasa si el modelo se equivoca?"**

Las reglas críticas no dependen del modelo, están en código. Y ante duda el sistema siempre
escala hacia arriba, nunca hacia abajo.

### **"¿De dónde sacaron los datos?"**

DEIS, egresos hospitalarios y estadísticas vitales, con año y fecha de corte. Las puérperas
del demo son sintéticas con distribuciones que replican las reales. Nunca hubo acceso a
fichas clínicas.

### **"¿Por qué no lo hace el CESFAM hoy?"**

Porque una matrona no puede llamar a 300 puérperas. Matria no la reemplaza: le dice a cuál de
las 300 llamar hoy.

### **"¿Y si le sacan Claude?"**

Deja de funcionar. La mujer escribe "me duele la guata y me huele feo": no hay regla ni
palabra clave que convierta eso en hallazgos clínicos estructurados con nivel de riesgo y
cita de protocolo. Sin Claude queda un formulario.

---

## Reglas del pitch

- **Ninguna cifra sin fuente.** Si el número no está verificado en `docs/DATOS_DEIS.md`, no
  se dice.
- **Nunca la palabra "diagnóstico".** Detecta, prioriza, escala.
- **La demo corre en vivo.** Se muestra el input y el output del agente en pantalla, no
  diapositivas del flujo.
- Ensayar **tres veces cronometrado**, incluyendo el Q&A.
