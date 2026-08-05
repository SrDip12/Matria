import { NextResponse } from "next/server";
import { crearPuerpera, guardarFichaExtendida } from "@/lib/db";
import { FICHA_VACIA, type FichaExtendida, type Puerpera } from "@/lib/types";

export const dynamic = "force-dynamic";

type Entrada = {
  base?: Omit<Puerpera, "id" | "dia_puerperio">;
  ficha?: Partial<FichaExtendida>;
};

/**
 * Alta de una puérpera desde el onboarding: crea la ficha básica y guarda la extendida.
 *
 * La ficha extendida se completa contra FICHA_VACIA, así que un formulario abandonado a la
 * mitad entra igual y los campos que nadie respondió quedan en null. Un dato ausente no es un
 * dato negativo: es la misma regla que rige los hallazgos del agente.
 */
export async function POST(req: Request) {
  const { base, ficha } = (await req.json()) as Entrada;

  if (!base?.nombre?.trim() || !base?.fecha_parto || !base?.tipo_parto)
    return NextResponse.json(
      { error: "nombre, fecha_parto y tipo_parto son obligatorios" },
      { status: 400 }
    );

  try {
    const puerpera = await crearPuerpera({
      ...base,
      nombre: base.nombre.trim(),
      comorbilidades: base.comorbilidades ?? [],
      ficha_extendida: null,
    });

    const completa: FichaExtendida = {
      ...FICHA_VACIA,
      ...ficha,
      completada_at: new Date().toISOString(),
    };

    return NextResponse.json({ puerpera: await guardarFichaExtendida(puerpera.id, completa) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "no se pudo registrar a la puérpera" },
      { status: 400 }
    );
  }
}
