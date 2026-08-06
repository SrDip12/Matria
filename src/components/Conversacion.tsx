"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { ETIQUETA_PARTO, fechaHora, hora, partirEtiqueta } from "@/lib/formato";
import { DIAS_PUERPERIO, type Mensaje, type Puerpera } from "@/lib/types";

/**
 * Burbuja del hilo. La usa esta pantalla y también la ficha de ingreso, que es una conversación:
 * si la ficha se ve distinta al chat, la puérpera cree que son dos productos.
 *
 * Ella en el rojo apagado del sistema y el acompañamiento sobre superficie blanca con borde:
 * de un vistazo se ve quién dijo qué, sin que un hilo largo de burbujas rojas plenas compita
 * con las alertas, que son lo único que debería gritar en esta pantalla.
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
          ? { background: "var(--burbuja-suya)", color: "#ffffff" }
          : { background: "var(--color-surface-alta)", borderColor: "var(--color-border)" }
      }
    >
      {children}
    </div>
  );
}

/**
 * Corte entre días del puerperio. El hilo de una puérpera cubre semanas, así que sin esto los
 * mensajes del día 3 y los de hoy se leen como una sola conversación seguida.
 */
function CorteDeDia({ etiqueta }: { etiqueta: string }) {
  return (
    <p className="etiqueta-tenue flex items-center gap-2.5">
      <span className="h-px flex-1" style={{ background: "var(--color-linea)" }} aria-hidden />
      {etiqueta}
      <span className="h-px flex-1" style={{ background: "var(--color-linea)" }} aria-hidden />
    </p>
  );
}

/** Un mensaje del hilo: la burbuja y, debajo, la hora del lado de quien habló. */
function MensajeHilo({ mensaje }: { mensaje: Mensaje }) {
  const suya = mensaje.autor === "puerpera";
  return (
    <div className={`msj flex flex-col gap-0.5 ${suya ? "items-end" : "items-start"}`}>
      <div className={`flex w-full ${suya ? "justify-end" : "justify-start"}`}>
        <Burbuja de={mensaje.autor} title={fechaHora(mensaje.created_at)}>
          {mensaje.texto}
        </Burbuja>
      </div>
      <span className="tabular px-1 text-[10.5px] tenue">{hora(mensaje.created_at)}</span>
    </div>
  );
}

const corte = (mensaje: Mensaje, puerpera: Puerpera) =>
  mensaje.dia_puerperio === puerpera.dia_puerperio ? "Hoy" : `Día ${mensaje.dia_puerperio}`;

/** Arranques para que el jurado no tenga que inventar un relato en vivo. */
const SUGERENCIAS = [
  "estamos bien las dos, cansada nomás",
  "me está bajando harto y me salió un coágulo grande",
  "ando afiebrada y me huele feo abajo",
];

interface ConversacionProps {
  puerpera: Puerpera | null;
  mensajes: Mensaje[];
  enviando: boolean;
  error?: string | null;
  onEnviar: (texto: string) => void;
  /**
   * Quién está mirando el hilo. La matrona lee el canal de otra persona: ve el nombre, el código
   * de caso y los antecedentes. Ella lee el suyo: ve su franja de 42 días y cómo pedirle ayuda.
   */
  contexto?: "matrona" | "mia";
}

export function Conversacion({
  puerpera,
  mensajes,
  enviando,
  error,
  onEnviar,
  contexto = "matrona",
}: ConversacionProps) {
  const [texto, setTexto] = useState("");
  // Lo que acaba de escribir, mientras el agente lo evalúa. Sin esto su mensaje desaparece
  // durante toda la llamada y parece que no se envió.
  const [pendiente, setPendiente] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const mia = contexto === "mia";

  // Sin esto el mensaje recién enviado queda fuera de pantalla y parece que no pasó nada.
  useEffect(() => {
    const c = scroller.current;
    if (c) c.scrollTop = c.scrollHeight;
  }, [mensajes.length, enviando, pendiente, puerpera?.id]);

  // El refresco ya trae el mensaje real: el provisional se retira cuando la evaluación termina.
  useEffect(() => {
    if (!enviando) setPendiente(null);
  }, [enviando]);

  function enviar(valor = texto) {
    const limpio = valor.trim();
    if (!limpio || enviando) return;
    setPendiente(limpio);
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
  const nombrePila = etiqueta.split(" ")[0];

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col">
      <header
        className={`flex shrink-0 flex-col gap-1.5 border-b px-5 ${mia ? "py-5" : "py-4"}`}
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        <p className="etiqueta">{mia ? "Tu conversación" : "Canal de la puérpera"}</p>
        {mia ? (
          /* Sin la franja de 42 celdas: acá era decoración y ella la tiene completa, con su
             leyenda y sus cifras, en "Cómo he estado". El día se lleva la jerarquía. */
          <h2 className="flex flex-wrap items-baseline gap-x-3">
            <span className="subtitulo">Cuéntame cómo estás</span>
            <span
              className="tabular text-[15px] font-medium"
              style={{ color: "var(--accion-tinta)" }}
            >
              Día {puerpera.dia_puerperio}
            </span>
            <span className="tabular text-xs suave">de {DIAS_PUERPERIO}</span>
          </h2>
        ) : (
          <h2 className="flex flex-wrap items-baseline gap-x-2.5">
            <span className="subtitulo truncate">{etiqueta}</span>
            {codigo && (
              <span className="tabular text-[11px] tenue" translate="no">
                {codigo}
              </span>
            )}
            <span className="tabular text-xs font-normal suave">
              <span className="capitalize">{ETIQUETA_PARTO[puerpera.tipo_parto]}</span> ·{" "}
              {puerpera.edad} años · día {puerpera.dia_puerperio} de {DIAS_PUERPERIO}
            </span>
          </h2>
        )}
      </header>

      <div ref={scroller} className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4">
        {/* El hilo se apoya abajo: una conversación de dos mensajes no puede quedar flotando
            arriba con media pantalla en blanco debajo. */}
        <div className="mt-auto flex flex-col gap-2.5">
          {mensajes.length === 0 && !enviando && (
            <div className="msj flex flex-col gap-3">
              <Burbuja de="sistema">
                {mia
                  ? `Hola ${nombrePila}. Te voy a acompañar los 42 días después del parto y hoy es tu día ${puerpera.dia_puerperio}. Cuéntame con tus palabras cómo estás: yo lo interpreto y lo que encuentre le llega a tu matrona.`
                  : "Todavía no hay mensajes en este canal. Cuando ella escriba, la evaluación aparece priorizada en el panel."}
              </Burbuja>
              <div className="flex flex-col items-end gap-1.5">
                {/* La etiqueta va en la tinta secundaria y no en la tenue: es una instrucción,
                    no un metadato, y tiene que leerse. */}
                <span className="etiqueta">Puedes empezar por acá</span>
                {SUGERENCIAS.map((sugerencia) => (
                  <button
                    key={sugerencia}
                    type="button"
                    onClick={() => enviar(sugerencia)}
                    className="chip max-w-full !rounded-[var(--radius-pill)] !px-3.5 !py-2 text-left !text-[13px] !whitespace-normal"
                    style={{
                      background: "var(--color-surface-alta)",
                      color: "var(--color-text)",
                    }}
                  >
                    {sugerencia}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mensajes.length > 0 && <CorteDeDia etiqueta={corte(mensajes[0], puerpera)} />}

          {mensajes.map((mensaje, i) => (
            <Fragment key={mensaje.id}>
              {i > 0 && mensaje.dia_puerperio !== mensajes[i - 1].dia_puerperio && (
                <CorteDeDia etiqueta={corte(mensaje, puerpera)} />
              )}
              <MensajeHilo mensaje={mensaje} />
            </Fragment>
          ))}

          {pendiente && (
            <div className="msj flex justify-end">
              <Burbuja de="puerpera">{pendiente}</Burbuja>
            </div>
          )}

          {enviando && (
            <div className="msj flex justify-start">
              <Burbuja de="sistema">
                <span className="escribiendo inline-flex items-center gap-2 tenue">
                  Leyendo lo que me contaste
                  <span className="inline-flex gap-[3px]" aria-hidden>
                    <b />
                    <b />
                    <b />
                  </span>
                </span>
              </Burbuja>
            </div>
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
        </div>
      </div>

      <form
        className="flex shrink-0 flex-col gap-2 border-t px-5 py-4"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        onSubmit={(evento) => {
          evento.preventDefault();
          enviar();
        }}
      >
        <div className="flex items-end gap-2">
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
        </div>
        {mia && (
          <p className="text-[12px] leading-normal text-pretty suave">
            Escríbelo con tus palabras, no tienes que usar términos médicos. Si aparece una señal
            de alarma, tu matrona la ve al momento.
          </p>
        )}
      </form>
    </section>
  );
}
