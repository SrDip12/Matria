"use client";

import { useEffect, useRef, useState } from "react";
import { ETIQUETA_PARTO, partirEtiqueta } from "@/lib/formato";
import type { Mensaje, Puerpera } from "@/lib/types";

interface ConversacionProps {
  puerpera: Puerpera | null;
  mensajes: Mensaje[];
  enviando: boolean;
  error?: string | null;
  onEnviar: (texto: string) => void;
}

/** Arranques para que el jurado no tenga que inventar un relato en vivo. */
const SUGERENCIAS = [
  "estamos bien las dos, cansada nomás",
  "me está bajando harto y me salió un coágulo grande",
  "ando afiebrada y me huele feo abajo",
];

export function Conversacion({ puerpera, mensajes, enviando, error, onEnviar }: ConversacionProps) {
  const [texto, setTexto] = useState("");
  const finDelHilo = useRef<HTMLDivElement>(null);

  // Sin esto el mensaje recién enviado queda fuera de pantalla y parece que no pasó nada.
  useEffect(() => {
    finDelHilo.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes.length, enviando]);

  function enviar(valor = texto) {
    const limpio = valor.trim();
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
            día {puerpera.dia_puerperio} de 42
          </span>
        </h2>
        <p className="tabular text-sm" style={{ color: "var(--color-text-suave)" }}>
          {codigo ? `${codigo} · ` : ""}
          {ETIQUETA_PARTO[puerpera.tipo_parto]} · {puerpera.edad} años
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {mensajes.length === 0 && !enviando && (
          <div className="flex flex-col gap-2 py-6">
            <p className="text-sm" style={{ color: "var(--color-text-suave)" }}>
              Todavía no hay mensajes. Cuenta cómo estás con tus palabras: el agente lo interpreta
              y lo que encuentre le llega a la matrona.
            </p>
            <div className="flex flex-col items-start gap-1.5">
              {SUGERENCIAS.map((sugerencia) => (
                <button
                  key={sugerencia}
                  type="button"
                  onClick={() => enviar(sugerencia)}
                  className="rounded-[var(--radius-pill)] border px-3 py-1.5 text-left text-sm"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                >
                  {sugerencia}
                </button>
              ))}
            </div>
          </div>
        )}

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

        {enviando && (
          <div
            className="max-w-[80%] self-start rounded-[12px_12px_12px_3px] border px-3.5 py-2.5 text-sm"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-suave)",
            }}
          >
            Interpretando lo que escribiste…
          </div>
        )}

        {error && (
          <p
            className="self-start rounded-[var(--radius-md)] border px-3.5 py-2.5 text-sm"
            style={{ borderColor: "#B3261E", color: "#B3261E" }}
          >
            El mensaje no quedó registrado: {error}. Vuelve a intentarlo.
          </p>
        )}

        <div ref={finDelHilo} />
      </div>

      <div className="flex gap-2 border-t p-4" style={{ borderColor: "var(--color-border)" }}>
        <input
          className="input flex-1"
          placeholder="Cuéntame cómo estás hoy"
          value={texto}
          disabled={enviando}
          onChange={(evento) => setTexto(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === "Enter") enviar();
          }}
        />
        <button className="btn btn-primary" disabled={enviando || !texto.trim()} onClick={() => enviar()}>
          {enviando ? "Evaluando…" : "Enviar"}
        </button>
      </div>
    </section>
  );
}
