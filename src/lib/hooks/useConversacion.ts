"use client";

import { useCallback, useEffect, useState } from "react";
import type { Mensaje } from "@/lib/types";

export function useConversacion(puerperaId: string | null, onEvaluado?: () => void) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [enviando, setEnviando] = useState(false);

  const refrescar = useCallback(async () => {
    if (!puerperaId) {
      setMensajes([]);
      return;
    }
    const respuesta = await fetch(`/api/conversacion/${puerperaId}`);
    const { mensajes } = (await respuesta.json()) as { mensajes: Mensaje[] };
    setMensajes(mensajes);
  }, [puerperaId]);

  useEffect(() => {
    refrescar();
  }, [refrescar]);

  const enviar = useCallback(
    async (texto: string) => {
      if (!puerperaId) return;
      setEnviando(true);
      await fetch("/api/evaluar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ puerpera_id: puerperaId, texto }),
      });
      await refrescar();
      setEnviando(false);
      onEvaluado?.();
    },
    [puerperaId, refrescar, onEvaluado]
  );

  return { mensajes, enviando, enviar };
}
