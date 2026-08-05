import { NextResponse } from "next/server";
import { conversacion } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ puerperaId: string }> }) {
  const { puerperaId } = await params;
  const mensajes = await conversacion(puerperaId);
  return NextResponse.json({ mensajes });
}
