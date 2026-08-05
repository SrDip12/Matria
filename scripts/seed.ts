/**
 * Cohorte sintética. Ninguna persona es real: nombres de lista, sin RUT ni teléfono.
 * Distribuciones replican DEIS (ver docs/DATOS_DEIS.md). Idempotente: borra y repuebla.
 *
 * Correr con: pnpm db:seed
 */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function seed() {
  // TODO hora 2: ~200 puérperas repartidas en los 42 días, con evaluaciones y alertas históricas.
}

seed().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  }
);
