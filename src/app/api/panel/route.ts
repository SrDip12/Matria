import { NextResponse } from "next/server";
import { filasPanel } from "@/lib/db";

export const dynamic = "force-dynamic"; // el panel hace polling cada 3s

export async function GET() {
  const filas = await filasPanel();
  return NextResponse.json({ filas });
}
