# Protocolo clínico del puerperio

**Autora clínica:** Vale — matrona
**Estado:** plantilla por completar
**Uso:** este documento se inyecta completo en el system prompt del agente. Todo umbral que
esté acá se aplica; todo lo que no esté acá, el agente no lo sabe.

> **Para el equipo técnico:** no editen el contenido clínico. Si algo acá parece inconsistente,
> se le pregunta a Vale, no se corrige por cuenta propia. Los números de sección (§) son
> el identificador que cada alerta va a citar, así que **no se renumeran** una vez que el
> agente esté funcionando.

> **Para Vale:** no necesitas escribir prosa bonita. Necesito criterio operacional: qué
> señal, en qué día, qué tan grave, qué hace la matrona. Mientras más específicos los
> umbrales, mejor funciona el agente y menos ruido genera.

---

## §1. Alcance

El seguimiento cubre desde el alta hospitalaria hasta el día 42 postparto.

El sistema **no diagnostica**. Detecta señales de alarma, las clasifica en tres niveles y
las escala a la matrona con la sección de este protocolo que las justifica.

### §1.1 Niveles de riesgo

| Nivel | Qué significa | Qué gatilla |
|---|---|---|
| **alto** | Requiere contacto de la matrona hoy | _(completar: ¿en cuánto tiempo? ¿derivación directa a urgencia en algún caso?)_ |
| **medio** | Requiere contacto dentro de 24 a 48 h | _(completar)_ |
| **bajo** | Seguimiento habitual, sin acción | — |

## §2. Preeclampsia postparto

Ventana de riesgo: _(completar — hasta qué día postparto)_

**Señales de alarma:**
- _(completar: cefalea intensa que no cede, alteraciones visuales, dolor epigástrico, etc.)_

**Umbrales:**
- _(completar: ¿presión arterial autorreportada?, ¿qué combinación de síntomas escala a alto?)_

**Acción sugerida a la matrona:** _(completar)_

## §3. Infección puerperal

### §3.1 Endometritis
Ventana de riesgo: _(completar)_

Señales: _(completar — fiebre, dolor hipogástrico, loquios de mal olor, subinvolución uterina)_

Umbral de temperatura que escala a alto: _(completar — ¿≥38°C?, ¿desde qué día?)_

Acción sugerida: _(completar)_

### §3.2 Infección de herida operatoria (cesárea)
Ventana de riesgo: _(completar)_

Señales: _(completar)_

Acción sugerida: _(completar)_

## §4. Hemorragia postparto tardía

Ventana de riesgo: _(completar)_

Cómo pedirle a la puérpera que cuantifique el sangrado sin instrumentos:
_(completar — este punto es clave, define la pregunta que hace el agente)_

Umbral que escala a alto: _(completar)_

Acción sugerida: _(completar)_

## §5. Mastitis y lactancia

### §5.1 Mastitis
Ventana de riesgo: _(completar)_

Señales que la diferencian de una congestión mamaria simple: _(completar)_

Umbral que escala: _(completar)_

Acción sugerida: _(completar)_

### §5.2 Dificultad en lactancia
Cuándo deja de ser apoyo y pasa a ser alerta: _(completar)_

## §6. Evento tromboembólico

Ventana de riesgo: _(completar)_

Señales: _(completar)_

**Nota:** cualquier señal acá escala directo a alto. Confirmar.

## §7. Salud mental perinatal

### §7.1 Tamizaje
Instrumento: _(completar — ¿EPDS? ¿en qué días del puerperio se aplica? ¿punto de corte
vigente en Chile?)_

### §7.2 Ideación autolítica
Cualquier señal de ideación escala a **alto** de forma inmediata, en cualquier día y sin
importar el resto de los hallazgos. Esta regla está codificada en el agente y no admite
excepción.

Acción sugerida y vía de derivación: _(completar — esto tiene que ser explícito, es lo más
delicado del sistema)_

## §8. Factores que modifican el riesgo basal

Qué antecedentes hacen que una misma señal pese más:

- Cesárea vs parto vaginal: _(completar)_
- Edad ≥35: _(completar)_
- Trastorno hipertensivo del embarazo: _(completar)_
- Diabetes gestacional: _(completar)_
- Otros: _(completar)_

## §9. Calendario de contacto

Qué pregunta el agente y en qué día. Marcar los días en que el contacto es obligatorio aunque
no haya señales previas.

| Día | Foco de la pregunta | Obligatorio |
|---|---|---|
| 1–3 | _(completar)_ | |
| 4–7 | _(completar)_ | |
| 8–14 | _(completar)_ | |
| 15–28 | _(completar)_ | |
| 29–42 | _(completar)_ | |

## §10. Lo que el sistema nunca hace

- No indica tratamiento, fármaco ni dosis.
- No afirma un diagnóstico.
- No contacta servicios de urgencia por su cuenta.
- No reemplaza el control de puerperio ni el control de díada.

_(Vale: agregar lo que falte acá. Esta sección es la que nos protege.)_
