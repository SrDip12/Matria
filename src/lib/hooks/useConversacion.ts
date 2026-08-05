"use client";

import { useCallback, useEffect, useState } from "react";
import type { Mensaje } from "@/lib/types";

export function useConversacion(puerperaId: string | null, onEvaluado?: () => void) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [enviando, setEnviando] = useState(false);
  // El agente falla ruidoso y /api/evaluar devuelve 502 sin guardar nada. Sin esto la pantalla
  // se queda igual que antes de escribir y parece que no pasó nada.
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
      try {
        const respuesta = await fetch("/api/evaluar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ puerpera_id: puerperaId, texto }),
        });
        if (!respuesta.ok) {
          const cuerpo = await respuesta.json().catch(() => ({}));
          throw new Error(cuerpo.error ?? "el mensaje no se pudo interpretar");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "el mensaje no se pudo interpretar");
      }
      await refrescar();
      setEnviando(false);
      onEvaluado?.();
    },
    [puerperaId, refrescar, onEvaluado]
  );

  return { mensajes, enviando, error, enviar };
}
