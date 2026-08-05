import { NextResponse } from "next/server";
import { cambiarEstadoAlerta } from "@/lib/db";
import type { EstadoAlerta } from "@/lib/types";

const ESTADOS: EstadoAlerta[] = ["pendiente", "vista", "resuelta"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { estado } = (await req.json()) as { estado?: EstadoAlerta };

  if (!estado || !ESTADOS.includes(estado))
    return NextResponse.json({ error: "estado inválido" }, { status: 400 });

  const alerta = await cambiarEstadoAlerta(id, estado);
  return NextResponse.json({ alerta });
}
