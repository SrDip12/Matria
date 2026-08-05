"use client";

import { useState } from "react";
import { ETIQUETA_PARTO } from "@/lib/formato";
import type { Mensaje, Puerpera } from "@/lib/types";

interface ConversacionProps {
  puerpera: Puerpera | null;
  mensajes: Mensaje[];
  enviando: boolean;
  onEnviar: (texto: string) => void;
}

export function Conversacion({ puerpera, mensajes, enviando, onEnviar }: ConversacionProps) {
  const [texto, setTexto] = useState("");

  function enviar() {
    const limpio = texto.trim();
    if (!limpio || enviando) return;
    onEnviar(limpio);
    setTexto("");
  }

  if (!puerpera) {
    return <div className="p-4 opacity-60">Selecciona una puérpera del panel.</div>;
  }

  return (
    <section className="flex h-full flex-col">
      <header className="border-b p-4" style={{ borderColor: "var(--color-divider)" }}>
        <h2 className="font-medium">
          {puerpera.nombre} · día {puerpera.dia_puerperio}
        </h2>
        <p className="tabular text-sm opacity-60">
          {ETIQUETA_PARTO[puerpera.tipo_parto]} · {puerpera.edad} años
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {mensajes.map((mensaje) => (
          <div
            key={mensaje.id}
            className={
              mensaje.autor === "puerpera"
                ? "max-w-[80%] self-start rounded-lg px-3 py-2 text-sm"
                : "max-w-[80%] self-end rounded-lg px-3 py-2 text-sm"
            }
            style={{
              background:
                mensaje.autor === "puerpera"
                  ? "var(--color-surface)"
                  : "color-mix(in srgb, var(--color-accent) 20%, transparent)",
            }}
          >
            {mensaje.texto}
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-t p-4" style={{ borderColor: "var(--color-divider)" }}>
        <input
          className="input flex-1"
          placeholder={`escribir como ${puerpera.nombre}`}
          value={texto}
          disabled={enviando}
          onChange={(evento) => setTexto(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === "Enter") enviar();
          }}
        />
        <button className="btn" disabled={enviando} onClick={enviar}>
          {enviando ? "evaluando…" : "Enviar"}
        </button>
      </div>
    </section>
  );
}
