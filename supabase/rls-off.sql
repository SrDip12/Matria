-- Supabase deja RLS activo por defecto en las tablas nuevas. El proyecto va sin RLS y sin auth
-- (CLAUDE.md §3): son datos sintéticos y no hay nada que proteger. Sin esto, el seed y los
-- endpoints fallan con "new row violates row-level security policy".
--
-- Pegar en el SQL editor del proyecto. No toca schema.sql, que está congelado.

alter table puerperas             disable row level security;
alter table mensajes              disable row level security;
alter table evaluaciones          disable row level security;
alter table alertas               disable row level security;
alter table preguntas_programadas disable row level security;
