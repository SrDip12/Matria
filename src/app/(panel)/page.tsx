"use client";

import { useEffect, useState } from "react";
import { ChatbotPaciente } from "@/components/ChatbotPaciente";
import { Conversacion } from "@/components/Conversacion";
import { PanelMatrona } from "@/components/PanelMatrona";
import { TabBar, type Tab } from "@/components/TabBar";
import { useConversacion } from "@/lib/hooks/useConversacion";
import { usePanel } from "@/lib/hooks/usePanel";

function Dashboard() {
  const { filas, refrescar, resolverAlerta } = usePanel();
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);

  useEffect(() => {
    if (!seleccionadaId && filas.length > 0) setSeleccionadaId(filas[0].puerpera.id);
  }, [filas, seleccionadaId]);

  const puerpera = filas.find((fila) => fila.puerpera.id === seleccionadaId)?.puerpera ?? null;
  const { mensajes, enviando, enviar } = useConversacion(seleccionadaId, refrescar);

  return (
    <div className="flex flex-1">
      <div className="w-[35%] border-r" style={{ borderColor: "var(--color-border)" }}>
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
    </div>
  );
}

function Chatbot() {
  const { filas, refrescar } = usePanel();
  return (
    <div className="flex-1 overflow-y-auto">
      <ChatbotPaciente filas={filas} refrescarPanel={refrescar} />
    </div>
  );
}

export default function PanelPage() {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <main className="flex h-screen flex-col">
      <TabBar tab={tab} onCambiar={setTab} />
      {tab === "dashboard" ? <Dashboard /> : <Chatbot />}
    </main>
  );
}
