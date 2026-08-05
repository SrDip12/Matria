"use client";

import { useEffect, useRef, useState } from "react";
import { ETIQUETA_PARTO, fechaHora, partirEtiqueta } from "@/lib/formato";
import type { Mensaje, Puerpera } from "@/lib/types";

interface ConversacionProps {
  puerpera: Puerpera | null;
  mensajes: Mensaje[];
  enviando: boolean;
  error?: string | null;
  onEnviar: (texto: string) => void;
}

/**
 * Burbuja del hilo. La usa esta pantalla y también la ficha de ingreso, que ahora es una
 * conversación: si la ficha se ve distinta al chat, la puérpera cree que son dos productos.
 *
 * Ella en rojo 600 y el acompañamiento sobre superficie blanca con borde: es la regla del
 * design system y sirve para que, de un vistazo, se vea quién dijo qué.
 */
export function Burbuja({
  de,
  title,
  children,
}: {
  de: "puerpera" | "sistema";
  title?: string;
  children: React.ReactNode;
}) {
  const suya = de === "puerpera";
  return (
    <div
      title={title}
      className={
        suya
          ? "max-w-[85%] self-end rounded-[14px_14px_4px_14px] px-3.5 py-2.5 text-[14px] leading-relaxed text-pretty break-words"
          : "max-w-[85%] self-start rounded-[14px_14px_14px_4px] border px-3.5 py-2.5 text-[14px] leading-relaxed text-pretty break-words"
      }
      style={
        suya
          ? { background: "var(--marca-600)", color: "#ffffff" }
          : { background: "var(--color-surface-alta)", borderColor: "var(--color-border)" }
      }
    >
      {children}
    </div>
  );
}

/** Arranques para que el jurado no tenga que inventar un relato en vivo. */
const SUGERENCIAS = [
  "estamos bien las dos, cansada nomás",
  "me está bajando harto y me salió un coágulo grande",
  "ando afiebrada y me huele feo abajo",
];

export function Conversacion({
  puerpera,
  mensajes,
  enviando,
  error,
  onEnviar,
}: ConversacionProps) {
  const [texto, setTexto] = useState("");
  const finDelHilo = useRef<HTMLDivElement>(null);

  // Sin esto el mensaje recién enviado queda fuera de pantalla y parece que no pasó nada.
  useEffect(() => {
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    finDelHilo.current?.scrollIntoView({ behavior: quieto ? "auto" : "smooth", block: "end" });
  }, [mensajes.length, enviando]);

  function enviar(valor = texto) {
    const limpio = valor.trim();
    if (!limpio || enviando) return;
    onEnviar(limpio);
    setTexto("");
  }

  if (!puerpera) {
    return (
      <div className="sin-datos p-5">
        Selecciona una puérpera del panel para ver su conversación.
      </div>
    );
  }

  const [etiqueta, codigo] = partirEtiqueta(puerpera.nombre);

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col">
      <header
        className="flex flex-col gap-1 border-b px-5 py-4"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        <p className="etiqueta">Canal de la puérpera</p>
        <h2 className="flex flex-wrap items-baseline gap-x-2.5">
          <span className="subtitulo truncate">{etiqueta}</span>
          {codigo && (
            <span className="tabular text-[11px] tenue" translate="no">
              {codigo}
            </span>
          )}
          <span className="tabular text-xs suave">
            <span className="capitalize">{ETIQUETA_PARTO[puerpera.tipo_parto]}</span> ·{" "}
            {puerpera.edad} años · día {puerpera.dia_puerperio} de 42
          </span>
        </h2>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-5 py-4">
        {mensajes.length === 0 && !enviando && (
          <div className="flex flex-col gap-3 py-4">
            <p className="text-[13px] leading-relaxed text-pretty suave">
              Todavía no hay mensajes. Cuenta cómo estás con tus palabras: el agente lo interpreta
              y lo que encuentre le llega a la matrona.
            </p>
            <div className="flex flex-col items-start gap-1.5">
              {SUGERENCIAS.map((sugerencia) => (
                <button
                  key={sugerencia}
                  type="button"
                  onClick={() => enviar(sugerencia)}
                  className="chip max-w-full !rounded-[var(--radius-pill)] text-left"
                >
                  <span className="truncate">{sugerencia}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {mensajes.map((mensaje) => (
          <Burbuja key={mensaje.id} de={mensaje.autor} title={fechaHora(mensaje.created_at)}>
            {mensaje.texto}
          </Burbuja>
        ))}

        {enviando && (
          <Burbuja de="sistema">
            <span className="tenue">Leyendo lo que me contaste…</span>
          </Burbuja>
        )}

        {error && (
          <p
            role="alert"
            className="self-start rounded-[var(--radius-md)] border px-3.5 py-2.5 text-[13px] text-pretty"
            style={{
              borderColor: "var(--riesgo-alto-borde)",
              background: "var(--riesgo-alto-fondo)",
              color: "var(--riesgo-alto-tinta)",
            }}
          >
            El mensaje no quedó registrado: {error}. Vuelve a intentarlo.
          </p>
        )}

        <div ref={finDelHilo} />
      </div>

      <form
        className="flex items-end gap-2 border-t px-5 py-4"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        onSubmit={(evento) => {
          evento.preventDefault();
          enviar();
        }}
      >
        <label className="min-w-0 flex-1">
          <span className="sr-only">Contar cómo estás hoy</span>
          <input
            className="input"
            name="mensaje"
            autoComplete="off"
            placeholder="Cuéntame cómo estás hoy…"
            value={texto}
            disabled={enviando}
            onChange={(evento) => setTexto(evento.target.value)}
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={enviando || !texto.trim()}>
          {enviando ? "Evaluando…" : "Enviar"}
        </button>
      </form>
    </section>
  );
}
