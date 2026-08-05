"use client";

import { useEffect, useState } from "react";
import { Conversacion } from "@/components/Conversacion";
import { PanelMatrona } from "@/components/PanelMatrona";
import { useConversacion } from "@/lib/hooks/useConversacion";
import { usePanel } from "@/lib/hooks/usePanel";

export default function PanelPage() {
  const { filas, refrescar, resolverAlerta } = usePanel();
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);

  useEffect(() => {
    if (!seleccionadaId && filas.length > 0) setSeleccionadaId(filas[0].puerpera.id);
  }, [filas, seleccionadaId]);

  const puerpera = filas.find((fila) => fila.puerpera.id === seleccionadaId)?.puerpera ?? null;
  const { mensajes, enviando, enviar } = useConversacion(seleccionadaId, refrescar);

  return (
    <main className="flex h-screen">
      <div className="w-[35%] border-r" style={{ borderColor: "var(--color-divider)" }}>
        <Conversacion puerpera={puerpera} mensajes={mensajes} enviando={enviando} onEnviar={enviar} />
      </div>
      <div className="w-[65%]">
        <PanelMatrona
          filas={filas}
          seleccionadaId={seleccionadaId}
          onSeleccionar={setSeleccionadaId}
          onResolverAlerta={resolverAlerta}
        />
      </div>
    </main>
  );
}
