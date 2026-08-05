-- Matria — esquema congelado desde la hora 1.
-- Cualquier cambio se avisa en voz alta al equipo antes de aplicarlo.
-- Sin RLS y sin auth: es un demo con datos sintéticos, no hay nada que proteger.

drop table if exists alertas cascade;
drop table if exists evaluaciones cascade;
drop table if exists mensajes cascade;
drop table if exists preguntas_programadas cascade;
drop table if exists puerperas cascade;

drop type if exists tipo_parto cascade;
drop type if exists nivel_riesgo cascade;
drop type if exists estado_alerta cascade;
drop type if exists autor_mensaje cascade;
drop type if exists prevision cascade;

create type tipo_parto      as enum ('vaginal', 'cesarea');
create type nivel_riesgo    as enum ('bajo', 'medio', 'alto');
create type estado_alerta   as enum ('pendiente', 'vista', 'resuelta');
create type autor_mensaje   as enum ('puerpera', 'sistema');
create type prevision       as enum ('fonasa_a', 'fonasa_b', 'fonasa_c', 'fonasa_d', 'isapre');

-- Población sintética. Las distribuciones replican DEIS; ninguna persona es real.
create table puerperas (
  id              uuid primary key default gen_random_uuid(),
  nombre          text        not null,
  edad            int         not null check (edad between 12 and 55),
  tipo_parto      tipo_parto  not null,
  fecha_parto     date        not null,
  prevision       prevision   not null,
  region          text        not null,
  establecimiento text        not null,
  comorbilidades  text[]      not null default '{}',
  created_at      timestamptz not null default now()
);

-- Conversación. El canal es simulado en el navegador.
create table mensajes (
  id             uuid          primary key default gen_random_uuid(),
  puerpera_id    uuid          not null references puerperas(id) on delete cascade,
  autor          autor_mensaje not null,
  texto          text          not null,
  dia_puerperio  int           not null check (dia_puerperio between 1 and 42),
  created_at     timestamptz   not null default now()
);

-- Salida estructurada de Claude. hallazgos sigue la interfaz Hallazgos de src/lib/types.ts.
create table evaluaciones (
  id              uuid         primary key default gen_random_uuid(),
  puerpera_id     uuid         not null references puerperas(id) on delete cascade,
  mensaje_id      uuid         not null references mensajes(id) on delete cascade,
  dia_puerperio   int          not null check (dia_puerperio between 1 and 42),
  hallazgos       jsonb        not null,
  nivel_riesgo    nivel_riesgo not null,
  sospechas       text[]       not null default '{}',
  cita_protocolo  text         not null,
  razonamiento    text         not null,
  created_at      timestamptz  not null default now()
);

-- Lo que ve la matrona. Una alerta nunca indica tratamiento, solo sugiere una acción.
create table alertas (
  id              uuid          primary key default gen_random_uuid(),
  puerpera_id     uuid          not null references puerperas(id) on delete cascade,
  evaluacion_id   uuid          not null references evaluaciones(id) on delete cascade,
  nivel           nivel_riesgo  not null,
  titulo          text          not null,
  accion_sugerida text          not null,
  cita_protocolo  text          not null,
  estado          estado_alerta not null default 'pendiente',
  created_at      timestamptz   not null default now(),
  resuelta_at     timestamptz
);

-- Lo que el agente decidió preguntar mañana.
create table preguntas_programadas (
  id            uuid        primary key default gen_random_uuid(),
  puerpera_id   uuid        not null references puerperas(id) on delete cascade,
  dia_puerperio int         not null check (dia_puerperio between 1 and 42),
  texto         text        not null,
  enviada       boolean     not null default false,
  created_at    timestamptz not null default now()
);

create index on mensajes      (puerpera_id, created_at desc);
create index on evaluaciones  (puerpera_id, created_at desc);
create index on alertas       (estado, nivel, created_at desc);
create index on alertas       (puerpera_id);

-- Vista de apoyo para el panel: día actual del puerperio por puérpera.
create or replace view puerperas_activas as
select
  p.*,
  least(42, greatest(1, (current_date - p.fecha_parto)::int + 1)) as dia_puerperio
from puerperas p
where current_date - p.fecha_parto between 0 and 41;
