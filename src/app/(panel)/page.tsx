"use client";

import { useEffect, useState } from "react";
import { Conversacion } from "@/components/Conversacion";
import { FichaIngreso } from "@/components/FichaIngreso";
import { IconoAviso, IconoChat, IconoFicha, IconoFranja } from "@/components/Iconos";
import { Inicio, type Demo } from "@/components/Inicio";
import { MiEvolucion } from "@/components/MiEvolucion";
import { Notificaciones } from "@/components/Notificaciones";
import { PanelMatrona } from "@/components/PanelMatrona";
import { PerfilPaciente } from "@/components/PerfilPaciente";
import { TabBar } from "@/components/TabBar";
import { useConversacion } from "@/lib/hooks/useConversacion";
import { usePanel } from "@/lib/hooks/usePanel";
import type { Puerpera } from "@/lib/types";

/**
 * Lado de la matrona. El panel ocupa la pantalla completa: la pantalla dividida aparece dentro
 * del caso abierto, que es el único momento en que hay una conversación concreta que mirar.
 */
function Dashboard() {
  const { filas, refrescar, resolverAlerta } = usePanel();
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);

  useEffect(() => {
    if (!seleccionadaId && filas.length > 0) setSeleccionadaId(filas[0].puerpera.id);
  }, [filas, seleccionadaId]);

  const puerpera = filas.find((fila) => fila.puerpera.id === seleccionadaId)?.puerpera ?? null;
  const { mensajes, enviando, error, enviar } = useConversacion(seleccionadaId, refrescar);

  return (
    <div className="flex min-h-0 flex-1">
      <PanelMatrona
        filas={filas}
        seleccionadaId={seleccionadaId}
        onSeleccionar={setSeleccionadaId}
        onResolverAlerta={resolverAlerta}
        conversacion={
          <Conversacion
            puerpera={puerpera}
            mensajes={mensajes}
            enviando={enviando}
            error={error}
            onEnviar={enviar}
          />
        }
      />
    </div>
  );
}

/**
 * Demo de la puérpera. Una cosa a la vez, en una columna centrada: ella abre esto con una guagua
 * en brazos y dos paneles simultáneos la sobrecargan. Las pestañas son su recorrido —conversar,
 * ver qué pasó con lo que contó, ver cómo ha estado, ver su ficha— y el chat es la que abre por
 * defecto.
 *
 * El lado de la matrona (Dashboard) mantiene la pantalla dividida, que es donde el jurado tiene
 * que ver el mensaje entrar y la alerta salir sin cambiar de contexto.
 */
const PESTANAS = [
  { id: "chat", etiqueta: "Chat", Icono: IconoChat },
  { id: "avisos", etiqueta: "Mis avisos", Icono: IconoAviso },
  { id: "evolucion", etiqueta: "Cómo he estado", Icono: IconoFranja },
  { id: "perfil", etiqueta: "Mi ficha", Icono: IconoFicha },
] as const;

type Pestana = (typeof PESTANAS)[number]["id"];

function DemoPaciente({ onVolverInicio }: { onVolverInicio: () => void }) {
  const { filas, refrescar } = usePanel();
  const [puerpera, setPuerpera] = useState<Puerpera | null>(null);
  const [pestana, setPestana] = useState<Pestana>("chat");
  const { mensajes, enviando, error, enviar } = useConversacion(puerpera?.id ?? null, refrescar);

  if (!puerpera) return <FichaIngreso onListo={setPuerpera} onVolverInicio={onVolverInicio} />;

  // Se relee del panel para que el día de puerperio, la ficha y los avisos sigan al día tras
  // cada poll. Mientras el primer poll no vuelve, se muestra lo que devolvió el onboarding.
  const fila = filas.find((f) => f.puerpera.id === puerpera.id) ?? null;
  const actual = fila?.puerpera ?? puerpera;
  const pendientes = fila?.alertas_pendientes.length ?? 0;

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col overflow-hidden">
      <nav
        className="flex shrink-0 flex-wrap gap-1 border-b px-4 py-3 sm:px-6"
        role="tablist"
        aria-label="Mi seguimiento"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        {PESTANAS.map(({ id, etiqueta, Icono }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={pestana === id}
            aria-controls={`panel-${id}`}
            onClick={() => setPestana(id)}
            className="chip"
          >
            <Icono size={14} />
            {etiqueta}
            {id === "avisos" && pendientes > 0 && <span className="chip-cifra">{pendientes}</span>}
          </button>
        ))}
      </nav>

      {pestana === "chat" ? (
        <div
          role="tabpanel"
          id="panel-chat"
          aria-labelledby="tab-chat"
          className="flex min-h-0 flex-1 flex-col"
        >
          <Conversacion
            puerpera={actual}
            mensajes={mensajes}
            enviando={enviando}
            error={error}
            onEnviar={enviar}
            contexto="mia"
            franja={fila?.franja}
          />
        </div>
      ) : (
        <div
          key={pestana}
          role="tabpanel"
          id={`panel-${pestana}`}
          aria-labelledby={`tab-${pestana}`}
          className="vista-entra min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6"
        >
          {pestana === "avisos" && <Notificaciones fila={fila} />}
          {pestana === "evolucion" && <MiEvolucion fila={fila} mensajes={mensajes} />}
          {pestana === "perfil" && (
            <div className="flex flex-col gap-3">
              <p className="text-xs tenue">
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

  // La barra superior está siempre, también en la puerta: es el chrome del producto, no de una
  // vista. Sin demo elegida no nombra ninguna ni ofrece cambiarla.
  return (
    <main className="flex h-screen flex-col">
      <TabBar demo={demo} onVolver={() => setDemo(null)} />
      {demo === null && <Inicio onElegir={setDemo} />}
      {demo === "matrona" && <Dashboard />}
      {demo === "paciente" && <DemoPaciente onVolverInicio={() => setDemo(null)} />}
    </main>
  );
}
