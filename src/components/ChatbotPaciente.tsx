"use client";

import { useEffect, useState } from "react";
import { Conversacion } from "@/components/Conversacion";
import { useConversacion } from "@/lib/hooks/useConversacion";
import type { FilaPanel } from "@/lib/types";

interface ChatbotPacienteProps {
  filas: FilaPanel[];
  refrescarPanel: () => Promise<void>;
}

export function ChatbotPaciente({ filas, refrescarPanel }: ChatbotPacienteProps) {
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);

  useEffect(() => {
    if (!seleccionadaId && filas.length > 0) setSeleccionadaId(filas[0].puerpera.id);
  }, [filas, seleccionadaId]);

  const puerpera = filas.find((fila) => fila.puerpera.id === seleccionadaId)?.puerpera ?? null;
  const { mensajes, enviando, enviar } = useConversacion(seleccionadaId, refrescarPanel);

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col">
      <div className="flex flex-col gap-1 p-4">
        <label className="text-xs uppercase tracking-wide" style={{ color: "var(--color-text-suave)" }}>
          Simular como
        </label>
        <select
          className="input"
          value={seleccionadaId ?? ""}
          onChange={(evento) => setSeleccionadaId(evento.target.value)}
        >
          {filas.map((fila) => (
            <option key={fila.puerpera.id} value={fila.puerpera.id}>
              {fila.puerpera.nombre} · día {fila.puerpera.dia_puerperio}
            </option>
          ))}
        </select>
      </div>
      <div className="min-h-0 flex-1">
        <Conversacion puerpera={puerpera} mensajes={mensajes} enviando={enviando} onEnviar={enviar} />
      </div>
    </div>
  );
}
