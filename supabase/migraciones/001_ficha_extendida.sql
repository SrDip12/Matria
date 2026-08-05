-- Onboarding de la puérpera: una sola columna jsonb en vez de trece columnas.
--
-- Es un formulario que se llena una vez y se lee entero, no algo que se consulte campo por
-- campo, así que jsonb paga. Además deja intacto el seed de las 200 puérperas de la cohorte:
-- para ellas la ficha queda en null, que es lo honesto — nadie las entrevistó.
--
-- La forma la manda src/lib/types.ts → FichaExtendida.
--
-- Correr una vez sobre la base ya creada. schema.sql ya incluye esto para instalaciones nuevas.

alter table puerperas
  add column if not exists ficha_extendida jsonb;

-- La vista se arma con `p.*`, que se expande al crearla: la columna nueva no aparece sola.
-- Y `create or replace` no sirve acá, porque ficha_extendida entra antes de dia_puerperio y
-- eso cambia el orden de las columnas. Hay que rehacerla.
drop view if exists puerperas_activas;

create view puerperas_activas as
select
  p.*,
  least(42, greatest(1, (current_date - p.fecha_parto)::int + 1)) as dia_puerperio
from puerperas p
where current_date - p.fecha_parto between 0 and 41;
