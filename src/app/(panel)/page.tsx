"use client";

import { useEffect, useState } from "react";
import { ChatbotPaciente } from "@/components/ChatbotPaciente";
import { Conversacion } from "@/components/Conversacion";
import { FichaOnboarding } from "@/components/FichaOnboarding";
import { Inicio, type Demo } from "@/components/Inicio";
import { PanelMatrona } from "@/components/PanelMatrona";
import { PerfilPaciente } from "@/components/PerfilPaciente";
import { TabBar } from "@/components/TabBar";
import { useConversacion } from "@/lib/hooks/useConversacion";
import { usePanel } from "@/lib/hooks/usePanel";
import type { Puerpera } from "@/lib/types";

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
        <Conversacion
          puerpera={puerpera}
          mensajes={mensajes}
          enviando={enviando}
          onEnviar={enviar}
        />
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

/**
 * Demo de la puérpera: ficha de ingreso, y después su conversación con el perfil al lado.
 *
 * El input y el output quedan en la misma pantalla a propósito: ella escribe a la izquierda y
 * lo que el sistema entendió de ella se ve a la derecha. La ficha de ingreso es la única
 * pantalla que ocupa todo el ancho, y aparece una sola vez.
 */
function DemoPaciente() {
  const { filas, refrescar } = usePanel();
  const [puerpera, setPuerpera] = useState<Puerpera | null>(null);
  const [panel, setPanel] = useState<"chat" | "perfil">("chat");
  const { mensajes, enviando, enviar } = useConversacion(puerpera?.id ?? null, refrescar);

  if (!puerpera) return <FichaOnboarding onListo={setPuerpera} />;

  // Se relee del panel para que el día de puerperio y la ficha sigan al día tras cada poll.
  const actual = filas.find((f) => f.puerpera.id === puerpera.id)?.puerpera ?? puerpera;

  return (
    <div className="flex flex-1">
      <div className="w-[55%] border-r" style={{ borderColor: "var(--color-border)" }}>
        <Conversacion
          puerpera={actual}
          mensajes={mensajes}
          enviando={enviando}
          onEnviar={enviar}
        />
      </div>
      <div className="flex w-[45%] flex-col gap-3 overflow-y-auto p-4">
        <nav className="flex gap-1">
          {(["chat", "perfil"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPanel(p)}
              className="rounded-[var(--radius-md)] border px-2.5 py-1 text-xs"
              style={{
                borderColor: panel === p ? "var(--marca-900)" : "var(--color-border)",
                background: panel === p ? "var(--marca-900)" : "transparent",
                color: panel === p ? "#ffffff" : "var(--color-text)",
              }}
            >
              {p === "chat" ? "Mi seguimiento" : "Mi perfil"}
            </button>
          ))}
        </nav>
        {panel === "perfil" ? (
          <PerfilPaciente puerpera={actual} />
        ) : (
          <ChatbotPaciente filas={filas} refrescarPanel={refrescar} />
        )}
      </div>
    </div>
  );
}

export default function PanelPage() {
  const [demo, setDemo] = useState<Demo | null>(null);

  if (!demo) return <Inicio onElegir={setDemo} />;

  return (
    <main className="flex h-screen flex-col">
      <TabBar demo={demo} onVolver={() => setDemo(null)} />
      {demo === "matrona" ? <Dashboard /> : <DemoPaciente />}
    </main>
  );
}
