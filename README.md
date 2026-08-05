# Matria

Acompañamiento longitudinal del puerperio. Los 42 días que el sistema de salud no mira.

> Impact Lab Longevidad — Bendita IA + Caja La Araucana
> Línea 03 — Continuidad y Medicina de Precisión

---

## El problema

En Chile más de la mitad de los partos son cesáreas. Es la cirugía mayor más frecuente del
país y la única de la que damos de alta a la paciente a las 48 horas, a cargo de un recién
nacido y sin ningún sistema de seguimiento.

El puerperio dura 42 días. En esa ventana se concentran la preeclampsia postparto, la
hemorragia tardía, la endometritis, la mastitis y la depresión postparto. Hoy el sistema
recién se entera cuando la mujer llega a urgencias.

Y hay un segundo problema, más silencioso: **esas complicaciones casi no existen en los
datos nacionales**, porque las estadísticas de egresos solo capturan lo que terminó
hospitalizado. Chile no sabe cuánta mastitis puerperal tiene. El puerperio es un punto ciego
del sistema de información.

## La solución

Un agente que sigue a la puérpera durante los 42 días con un protocolo escrito por matrona,
interpreta en lenguaje natural lo que ella responde, estratifica riesgo y entrega al equipo
clínico un panel priorizado.

No diagnostica. Detecta, prioriza y escala al profesional.

Como efecto secundario, genera el primer registro longitudinal de puerperio del país.

## Equipo y roles

| Rol | Persona | Responsabilidad | Instrucciones |
|---|---|---|---|
| Clínica | Vale | Protocolo, validación de las alertas, pitch | [`docs/roles/clinica.md`](docs/roles/clinica.md) |
| Agente | Pip | Motor de extracción y scoring, coordinación | [`docs/roles/agente.md`](docs/roles/agente.md) |
| Backend | Rodo | Base, endpoints, cohorte sintética, deploy | [`docs/roles/backend.md`](docs/roles/backend.md) |
| Frontend | Senler | Panel de la matrona y conversación | [`docs/roles/frontend.md`](docs/roles/frontend.md) |

**Pip piensa, Rodo conecta, Senler muestra, Vale valida.**

## Documentos

- [`CLAUDE.md`](CLAUDE.md) — **empieza acá.** Reglas duras, stack, propiedad de archivos, git.
- [`docs/PLAN.md`](docs/PLAN.md) — cronograma hora por hora y criterios de corte.
- [`docs/CONTRATOS.md`](docs/CONTRATOS.md) — interfaces congeladas entre Agente y Panel.
- [`docs/PROTOCOLO_CLINICO.md`](docs/PROTOCOLO_CLINICO.md) — fuente de verdad clínica.
- [`docs/ENTREGABLE.md`](docs/ENTREGABLE.md) — **campos exactos que evalúa la rúbrica.** 24% de la nota, sin código.
- [`docs/PITCH.md`](docs/PITCH.md) — estructura de los 3 minutos y el Q&A.
- [`docs/DATOS_DEIS.md`](docs/DATOS_DEIS.md) — de dónde sale cada cifra.

## Correr en local

```bash
pnpm install
cp .env.example .env.local   # completar con las claves reales
pnpm db:seed                 # genera la cohorte sintética
pnpm dev
```

Requiere Node 20+ y pnpm.

Sobre una base recién creada, además de `supabase/schema.sql`: correr
`supabase/rls-off.sql` (Supabase deja RLS activo por defecto y sin eso el seed falla con
`new row violates row level security policy`) y `supabase/migraciones/001_ficha_extendida.sql`.
`pnpm db:seed --dry` genera y verifica la cohorte sin tocar la base ni requerir credenciales.

## Enlaces

- Producción: _(pegar apenas exista, hora 1)_
- Supabase: [wdzvonsmouziuigfeklk](https://supabase.com/dashboard/project/wdzvonsmouziuigfeklk)
- Canal del equipo: _(pegar)_

## Deploy

Variables de entorno que hay que cargar en Vercel (las tres, en Production y Preview):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`.

## Fuentes oficiales y normativa clínica

- **DEIS — Datos Abiertos (Egresos hospitalarios):** [deis.minsal.cl/#datosabiertos](https://deis.minsal.cl/#datosabiertos)
- **INE — Estadísticas Vitales:** [ine.gob.cl — Estadísticas Vitales](https://www.ine.gob.cl/estadisticas-por-tema/demografia-y-poblacion/estadisticas-vitales)
- **MINSAL — Guía Perinatal (2015):** [PDF Guía Perinatal MINSAL](https://www.minsal.cl/wp-content/uploads/2015/10/GUIA-PERINATAL_2015.10.08_web.pdf-R.pdf)
- **MINSAL — Glosa 06 (1er Trimestre):** [PDF Glosa 06 MINSAL](https://www.minsal.cl/wp-content/uploads/2026/07/Glosa-06-letra-a-b-c-i-j-k-comun-a-la-partida-1er-trimestre-1.pdf)
- **MINSAL — Norma Técnica para la Atención Integral en el Puerperio:** [PDF Norma Técnica Puerperio MINSAL](https://www.minsal.cl/wp-content/uploads/2015/09/NORMA-TECNICA-PARA-LA-ATENCION-INTEGRAL-EN-EL-PUERPERIO_web.-08.10.2015-R.pdf)

## Nota sobre los datos

Toda la información de puérperas en este repositorio es **sintética**. Las distribuciones
(edad, tipo de parto, previsión, región) replican las del DEIS, pero ninguna persona es
real. No existe ni existió acceso a fichas clínicas.

