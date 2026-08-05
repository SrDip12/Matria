"use client";

import { useState } from "react";
import { ETIQUETA_PARTO, partirEtiqueta } from "@/lib/formato";
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
    return (
      <div className="p-4" style={{ color: "var(--color-text-suave)" }}>
        Selecciona una puérpera del panel.
      </div>
    );
  }

  const [etiqueta, codigo] = partirEtiqueta(puerpera.nombre);

  return (
    <section className="flex h-full flex-col">
      <header className="border-b p-4" style={{ borderColor: "var(--color-border)" }}>
        <h2 className="font-medium">
          {etiqueta}{" "}
          <span className="tabular" style={{ color: "var(--color-text-suave)" }}>
            día {puerpera.dia_puerperio}
          </span>
        </h2>
        <p className="tabular text-sm" style={{ color: "var(--color-text-suave)" }}>
          {codigo ? `${codigo} · ` : ""}
          {ETIQUETA_PARTO[puerpera.tipo_parto]} · {puerpera.edad} años
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {mensajes.map((mensaje) => {
          const esPuerpera = mensaje.autor === "puerpera";
          return (
            <div
              key={mensaje.id}
              className={
                esPuerpera
                  ? "max-w-[80%] self-end rounded-[12px_12px_3px_12px] px-3.5 py-2.5 text-sm"
                  : "max-w-[80%] self-start rounded-[12px_12px_12px_3px] border px-3.5 py-2.5 text-sm"
              }
              style={
                esPuerpera
                  ? { background: "var(--marca-600)", color: "#ffffff" }
                  : { background: "var(--color-surface)", borderColor: "var(--color-border)" }
              }
            >
              {mensaje.texto}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 border-t p-4" style={{ borderColor: "var(--color-border)" }}>
        <input
          className="input flex-1"
          placeholder={`escribir como ${etiqueta}`}
          value={texto}
          disabled={enviando}
          onChange={(evento) => setTexto(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === "Enter") enviar();
          }}
        />
        <button className="btn btn-primary" disabled={enviando} onClick={enviar}>
          {enviando ? "evaluando…" : "Enviar"}
        </button>
      </div>
    </section>
  );
}
