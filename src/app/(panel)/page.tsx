"use client";

import { useEffect, useState } from "react";
import { Conversacion } from "@/components/Conversacion";
import { FichaOnboarding } from "@/components/FichaOnboarding";
import { Inicio, type Demo } from "@/components/Inicio";
import { MiEvolucion } from "@/components/MiEvolucion";
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
  const { mensajes, enviando, error, enviar } = useConversacion(seleccionadaId, refrescar);

  return (
    <div className="flex flex-1">
      <div className="w-[35%] border-r" style={{ borderColor: "var(--color-border)" }}>
        <Conversacion
          puerpera={puerpera}
          mensajes={mensajes}
          enviando={enviando}
          error={error}
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
 * Demo de la puérpera. Una cosa a la vez, en una columna centrada: ella abre esto con una guagua
 * en brazos y dos paneles simultáneos la sobrecargan. Las tres pestañas son su recorrido —
 * conversar, ver cómo ha estado, ver su ficha— y el chat es la que abre por defecto.
 *
 * El lado de la matrona (Dashboard) mantiene la pantalla dividida, que es donde el jurado tiene
 * que ver el mensaje entrar y la alerta salir sin cambiar de contexto.
 */
const PESTANAS = [
  { id: "chat", etiqueta: "Chat" },
  { id: "evolucion", etiqueta: "Cómo he estado" },
  { id: "perfil", etiqueta: "Mi perfil" },
] as const;

type Pestana = (typeof PESTANAS)[number]["id"];

function DemoPaciente() {
  const { filas, refrescar } = usePanel();
  const [puerpera, setPuerpera] = useState<Puerpera | null>(null);
  const [pestana, setPestana] = useState<Pestana>("chat");
  const { mensajes, enviando, error, enviar } = useConversacion(puerpera?.id ?? null, refrescar);

  if (!puerpera) return <FichaOnboarding onListo={setPuerpera} />;

  // Se relee del panel para que el día de puerperio y la ficha sigan al día tras cada poll.
  const fila = filas.find((f) => f.puerpera.id === puerpera.id) ?? null;
  const actual = fila?.puerpera ?? puerpera;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-hidden">
      <nav
        className="flex gap-1 border-b px-4 py-2 sm:px-6"
        style={{ borderColor: "var(--color-border)" }}
      >
        {PESTANAS.map(({ id, etiqueta }) => (
          <button
            key={id}
            type="button"
            onClick={() => setPestana(id)}
            aria-current={pestana === id}
            className="rounded-[var(--radius-pill)] px-3 py-1.5 text-sm"
            style={{
              background: pestana === id ? "var(--marca-900)" : "transparent",
              color: pestana === id ? "#ffffff" : "var(--color-text-suave)",
            }}
          >
            {etiqueta}
          </button>
        ))}
      </nav>

      {pestana === "chat" ? (
        <Conversacion
          puerpera={actual}
          mensajes={mensajes}
          enviando={enviando}
          error={error}
          onEnviar={enviar}
        />
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {pestana === "evolucion" ? (
            <MiEvolucion fila={fila} mensajes={mensajes} />
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs" style={{ color: "var(--color-text-suave)" }}>
                Lo que el sistema sabe de ti, tal como lo lee tu matrona.
              </p>
              <PerfilPaciente puerpera={actual} />
            </div>
          )}
        </div>
      )}
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
