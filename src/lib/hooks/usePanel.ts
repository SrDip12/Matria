"use client";

import { useCallback, useEffect, useState } from "react";
import type { FilaPanel } from "@/lib/types";

const INTERVALO_MS = 3000;

export function usePanel() {
  const [filas, setFilas] = useState<FilaPanel[]>([]);
  const [cargando, setCargando] = useState(true);

  const refrescar = useCallback(async () => {
    const respuesta = await fetch("/api/panel");
    const { filas } = (await respuesta.json()) as { filas: FilaPanel[] };
    setFilas(filas);
    setCargando(false);
  }, []);

  useEffect(() => {
    refrescar();
    const id = setInterval(refrescar, INTERVALO_MS);
    return () => clearInterval(id);
  }, [refrescar]);

  const resolverAlerta = useCallback(
    async (alertaId: string) => {
      await fetch(`/api/alertas/${alertaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "resuelta" }),
      });
      await refrescar();
    },
    [refrescar]
  );

  return { filas, cargando, refrescar, resolverAlerta };
}
