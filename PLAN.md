# Plan de las 8 horas

8 horas de reloj son unas 6 de código real. Con tres personas construyendo son ~18
horas-persona. No alcanza para lo que uno cree que alcanza.

**La última hora no se programa.** Se congela y se ensaya el pitch tres veces.

**La demo se ejecuta en vivo.** La rúbrica premia que corra en el momento, no un video. El
video queda solo como seguro contra desastre total; la meta es que funcione en escena.
Lleven hotspot del teléfono y prueben la demo desde red móvil antes de subir, porque el wifi
de un venue con 50 equipos es un desastre.

---

## Hora 0 — Antes de escribir una línea

- [ ] Repo creado, todos con acceso, primer commit
- [ ] Proyecto Supabase creado, `schema.sql` aplicado
- [ ] `.env.local` funcionando en las tres máquinas
- [ ] Confirmar de dónde salen los créditos de la API. Quedarse sin créditos a la hora 6
      sería un final ridículo para un proyecto bueno
- [ ] Todos leyeron `CLAUDE.md` y su archivo de rol

## Hora 1 — Desplegar antes de construir

**Meta única: una URL de producción viva.** Puede decir "hola mundo". Da lo mismo. Equipo
que despliega a la hora 7 es equipo que no presenta.

En paralelo, Pip cierra `docs/ENTREGABLE.md`. Son 24% de la nota en campos de texto y no
requieren código. La mayoría de los equipos va a llegar corriendo a llenarlos mal al final.

| Rol | Tarea |
|---|---|
| Rodo | Schema aplicado, seed corriendo con 20 puérperas |
| Senler | Layout de dos columnas montado sobre el deploy de Rodo |
| Pip | Primera llamada a Claude con `tool_use` devolviendo un objeto válido, y `ENTREGABLE.md` |
| Vale | §2 a §5 del protocolo completos, y los campos clínicos del entregable |

Al final de esta hora, `types.ts` y `schema.sql` **quedan congelados**.

## Checkpoint del mentor — 16% de la nota

El mentor evalúa **por observación directa en el venue**, no por lo que se suba. Dos cosas
mira: que vio el agente funcionando aunque sea parcialmente, y que Claude sea el motor y no
un adorno.

**No van a venir solos.** Apenas haya una extracción funcionando, aunque el panel esté feo,
alguien va a buscar al mentor y se la muestra. Esto es responsabilidad de Pip y no se delega.

Qué mostrarle: un mensaje coloquial y ambiguo entrando, y los hallazgos clínicos
estructurados saliendo. Ese contraste es toda la demostración de que sin Claude no hay
producto.

## Horas 2–3 — Las dos mitades en paralelo

| Rol | Tarea |
|---|---|
| Rodo | Cohorte completa: ~200 puérperas con distribuciones DEIS, evaluaciones y alertas históricas sembradas. Endpoints en pie |
| Senler | Lista de puérperas ordenada por riesgo, con la franja de 42 días funcionando contra el seed |
| Pip | Extracción con `tool_use` estable y entregada a Rodo como función |
| Vale | Protocolo terminado. Empieza a redactar los 6 casos del demo |

## Hora 4 — Encuentro

Las dos mitades se conectan. El panel deja de leer solo el seed y empieza a reaccionar a
mensajes reales que pasan por Claude.

Si acá algo no calza, alguien rompió el contrato. Se arregla ahora, no después.

## Hora 5 — **Corte de alcance**

Paren todos y respondan una sola pregunta: **¿qué se muestra en el escenario?**

Lo que no aparezca en esos 3 minutos se abandona, aunque esté a medias y aunque duela.
Escriban la lista de lo abandonado, sirve para el "qué sigue" del pitch.

Decisión de esta hora: si el Agent SDK para el loop de seguimiento no está estable, se
degrada a reglas determinísticas. El pitch no cambia.

## Horas 6–7 — Pulir y guionar

| Rol | Tarea |
|---|---|
| Rodo | Cifras DEIS listas y verificadas para el deck |
| Senler | Detalle visual, estados vacíos, que la franja de 42 días se vea impecable |
| Pip | Los 6 casos del demo corren sin fallar, diez veces seguidas |
| Vale | Pitch escrito y ensayado |

Si sobra tiempo real acá, y solo acá, se agrega el servidor MCP.

## Hora 8 — Congelar

- [ ] Último deploy, verificado en la URL de producción desde otro computador
- [ ] **Demo probada desde el hotspot del teléfono**, no solo desde el wifi del venue
- [ ] Video de respaldo grabado, solo como seguro contra desastre total
- [ ] `docs/ENTREGABLE.md` completo, con todas las URLs abiertas y verificadas
- [ ] Deck cerrado, sin una cifra sin fuente
- [ ] Pitch ensayado tres veces cronometrado, incluyendo los 2 minutos de Q&A
- [ ] Nadie toca el código

---

## Los 6 casos del demo

Vale los escribe, el equipo los prueba hasta que no fallen. Este es el guion, no una
sugerencia.

1. **Puérpera sin hallazgos** — día 5, todo bien. Muestra que el sistema no grita por gritar.
2. **Mastitis, día 12** — el caso que el sistema de salud no ve nunca. Aquí se conecta con la
   frase del punto ciego estadístico.
3. **Endometritis, día 9** — relato ambiguo y coloquial, el agente extrae fiebre, dolor y mal
   olor de los loquios. Este es el caso que demuestra la capacidad de interpretación.
4. **Preeclampsia postparto, día 8** — cefalea y alteración visual. Riesgo alto. El caso que
   mata si se pasa por alto.
5. **Sintomatología depresiva, día 21** — muestra que el seguimiento cubre las 6 semanas
   completas, no solo la primera.
6. **Ideación autolítica** — escala a alto de forma inmediata. Se muestra al final: es la
   regla dura que demuestra que el diseño clínico es serio.

## Criterios de corte, en orden de sacrificio

Si falta tiempo, se cae en este orden:

1. Servidor MCP
2. Agent SDK para el loop → reglas determinísticas
3. Preguntas programadas del día siguiente
4. Panel de detalle de una puérpera
5. Franja de 42 días → _no se sacrifica, es el elemento firma_
6. Extracción con `tool_use` → _no se sacrifica nunca, es el producto_
