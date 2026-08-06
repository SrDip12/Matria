"use client";

import { useEffect, useRef, useState } from "react";
import { Burbuja } from "@/components/Conversacion";
import {
  FICHA_VACIA,
  type FichaExtendida,
  type Prevision,
  type Puerpera,
  type TipoParto,
} from "@/lib/types";

/**
 * Ficha de ingreso, hecha conversando. Antes era un formulario de treinta campos en una sola
 * pantalla: se veía como un trámite y ella lo abandonaba a la mitad. Las preguntas son las
 * mismas y el dato que sale es el mismo, pero llegan de a una y con las palabras de ella.
 *
 * Las preguntas están escritas acá y no las genera el modelo: son campos conocidos con forma
 * conocida, así que un guion determinístico entrega el mismo dato estructurado sin una llamada
 * más ni una interpretación que se pueda equivocar. El agente clínico sigue siendo el de
 * src/lib/agente, que evalúa relatos, no el que llena fichas.
 *
 * Solo nombre, edad, fecha y tipo de parto son obligatorios. Todo lo demás se puede saltar y
 * queda en null: un campo sin responder no es un "no", es un dato que nadie preguntó.
 */

type Valor = string | number | boolean | string[] | null;
type Respuestas = Record<string, Valor>;

type Tipo = "texto" | "numero" | "fecha" | "lista" | "opciones" | "siNo";

interface Pregunta {
  id: string;
  destino: "base" | "ficha";
  tipo: Tipo;
  /** Lo que dice el agente. */
  texto: string;
  ejemplo?: string;
  opciones?: { id: string; etiqueta: string }[];
  obligatoria?: boolean;
  /** Preguntas que solo tienen sentido según lo ya respondido. */
  si?: (r: Respuestas) => boolean;
}

const PREVISIONES = [
  { id: "fonasa_a", etiqueta: "Fonasa A" },
  { id: "fonasa_b", etiqueta: "Fonasa B" },
  { id: "fonasa_c", etiqueta: "Fonasa C" },
  { id: "fonasa_d", etiqueta: "Fonasa D" },
  { id: "isapre", etiqueta: "Isapre" },
];

const HABITOS = [
  { id: "no", etiqueta: "No" },
  { id: "ocasional", etiqueta: "A veces" },
  { id: "habitual", etiqueta: "Seguido" },
];

const SI_NO = [
  { id: "si", etiqueta: "Sí" },
  { id: "no", etiqueta: "No" },
];

const PREGUNTAS: Pregunta[] = [
  // Quién es
  {
    id: "nombre",
    destino: "base",
    tipo: "texto",
    texto: "Para partir, ¿cómo te llamas? Con tu nombre de pila me basta.",
    ejemplo: "María José",
    obligatoria: true,
  },
  {
    id: "edad",
    destino: "base",
    tipo: "numero",
    texto: "¿Cuántos años tienes?",
    ejemplo: "28",
    obligatoria: true,
  },

  // El parto
  {
    id: "fecha_parto",
    destino: "base",
    tipo: "fecha",
    texto: "¿Qué día nació tu guagua?",
    obligatoria: true,
  },
  {
    id: "tipo_parto",
    destino: "base",
    tipo: "opciones",
    texto: "¿Fue parto vaginal o cesárea?",
    opciones: [
      { id: "vaginal", etiqueta: "Vaginal" },
      { id: "cesarea", etiqueta: "Cesárea" },
    ],
    obligatoria: true,
  },
  {
    id: "semanas_gestacion",
    destino: "ficha",
    tipo: "numero",
    texto: "¿Con cuántas semanas nació? Si no te acuerdas exacto, ponle lo más cercano.",
    ejemplo: "39",
  },
  {
    id: "horas_trabajo_parto",
    destino: "ficha",
    tipo: "numero",
    texto: "¿Cuántas horas estuviste en trabajo de parto, más o menos?",
    ejemplo: "8",
  },
  {
    id: "embarazo_multiple",
    destino: "ficha",
    tipo: "siNo",
    texto: "¿Venían dos o más? (mellizos, trillizos)",
  },
  {
    id: "uso_anestesia",
    destino: "ficha",
    tipo: "siNo",
    texto: "¿Te pusieron anestesia? Por ejemplo, la inyección en la espalda.",
  },
  {
    id: "tipo_anestesia",
    destino: "ficha",
    tipo: "texto",
    texto: "¿Sabes cuál te pusieron? Si no te acuerdas, sáltala tranquila.",
    ejemplo: "peridural",
    si: (r) => r.uso_anestesia === true,
  },
  {
    id: "episiotomia",
    destino: "ficha",
    tipo: "siNo",
    texto: "¿Te hicieron el corte para ayudar a que saliera la guagua? Se llama episiotomía.",
    si: (r) => r.tipo_parto === "vaginal",
  },
  {
    id: "complicaciones_parto",
    destino: "ficha",
    tipo: "lista",
    texto: "¿Hubo alguna complicación en el parto? Si fueron varias, sepáralas con coma.",
    ejemplo: "desgarro, hemorragia",
  },
  {
    id: "apego_inmediato",
    destino: "ficha",
    tipo: "siNo",
    texto: "¿Te la pusieron en el pecho apenas nació?",
  },
  {
    id: "fecha_inicio_lactancia",
    destino: "ficha",
    tipo: "fecha",
    texto: "¿Qué día empezaste a darle pecho?",
  },

  // Su salud
  {
    id: "peso_kg",
    destino: "ficha",
    tipo: "numero",
    texto: "Ahora unas cosas de ti. ¿Cuánto pesas hoy, más o menos? En kilos.",
    ejemplo: "68.5",
  },
  {
    id: "talla_cm",
    destino: "ficha",
    tipo: "numero",
    texto: "¿Y cuánto mides, en centímetros?",
    ejemplo: "162",
  },
  {
    id: "enfermedades_cronicas",
    destino: "ficha",
    tipo: "lista",
    texto: "¿Tienes alguna enfermedad de antes del embarazo? Sepáralas con coma.",
    ejemplo: "hipertensión, diabetes",
  },
  {
    id: "enfermedades_embarazo",
    destino: "ficha",
    tipo: "lista",
    texto: "¿Y durante el embarazo, te dijeron que tenías algo?",
    ejemplo: "diabetes gestacional, preeclampsia",
  },
  {
    id: "medicamentos_habituales",
    destino: "ficha",
    tipo: "lista",
    texto: "¿Tomas algún remedio seguido?",
    ejemplo: "ácido fólico, fierro",
  },
  {
    id: "antecedentes_familiares",
    destino: "ficha",
    tipo: "lista",
    texto: "¿Sabes de enfermedades en tu familia directa? Mamá, papá, hermanas.",
    ejemplo: "madre con hipertensión",
  },
  {
    id: "antecedentes_ginecologicos",
    destino: "ficha",
    tipo: "lista",
    texto: "¿Algún antecedente ginecológico que te hayan dicho?",
    ejemplo: "quiste ovárico, cesárea anterior",
  },
  {
    id: "paridad",
    destino: "ficha",
    tipo: "numero",
    texto: "¿Cuántos partos tuviste antes de este?",
    ejemplo: "1",
  },
  {
    id: "fecha_ultima_regla",
    destino: "ficha",
    tipo: "fecha",
    texto: "¿Te acuerdas de la fecha de tu última regla antes del embarazo?",
  },
  {
    id: "tabaco",
    destino: "ficha",
    tipo: "opciones",
    texto:
      "Durante el embarazo, ¿fumaste? Te lo pregunto para cuidarte mejor, acá nadie te va a retar.",
    opciones: HABITOS,
  },
  {
    id: "alcohol",
    destino: "ficha",
    tipo: "opciones",
    texto: "¿Y tomaste alcohol durante el embarazo?",
    opciones: HABITOS,
  },
  {
    id: "drogas",
    destino: "ficha",
    tipo: "opciones",
    texto: "¿Consumiste alguna droga durante el embarazo?",
    opciones: HABITOS,
  },

  // Dónde y con quién
  {
    id: "prevision",
    destino: "base",
    tipo: "opciones",
    texto: "¿Qué previsión tienes? Sale en tu carnet.",
    opciones: PREVISIONES,
  },
  {
    id: "region",
    destino: "base",
    tipo: "texto",
    texto: "¿En qué región vives?",
    ejemplo: "Metropolitana",
  },
  {
    id: "establecimiento",
    destino: "base",
    tipo: "texto",
    texto: "¿Dónde tuviste a tu guagua?",
    ejemplo: "Hospital San José",
  },
  {
    id: "contacto_emergencia_nombre",
    destino: "ficha",
    tipo: "texto",
    texto: "Última parte. Si alguna vez no te ubicamos, ¿a quién llamamos?",
    ejemplo: "Carolina Pérez",
  },
  {
    id: "contacto_emergencia_relacion",
    destino: "ficha",
    tipo: "texto",
    texto: "¿Qué es tuya?",
    ejemplo: "pareja",
    si: (r) => typeof r.contacto_emergencia_nombre === "string",
  },
  {
    id: "contacto_emergencia_telefono",
    destino: "ficha",
    tipo: "texto",
    texto: "¿Y su teléfono?",
    ejemplo: "+56 9 8765 4321",
    si: (r) => typeof r.contacto_emergencia_nombre === "string",
  },
];

const SALUDO =
  "Hola, soy Matria. Te voy a acompañar estos 42 días después del parto: tú me cuentas cómo " +
  "estás y yo aviso a tu matrona cuando algo necesite que ella lo mire.";
const SALUDO_2 =
  "Antes de empezar te voy a hacer unas preguntas. Son varias, pero cortas, y todas menos las " +
  "primeras las puedes saltar. Lo que no me contestes queda como no preguntado, nunca como un no.";

const lista = (texto: string) =>
  texto
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

/** Cómo se ve la respuesta de ella en el hilo. */
function comoTexto(pregunta: Pregunta, valor: Valor): string {
  if (valor === null) return "Prefiero no responder";
  if (Array.isArray(valor)) return valor.join(", ");
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  const opcion = pregunta.opciones?.find((o) => o.id === valor);
  return opcion ? opcion.etiqueta : String(valor);
}

interface Props {
  onListo: (puerpera: Puerpera) => void;
}

export function FichaOnboarding({ onListo }: Props) {
  const [respuestas, setRespuestas] = useState<Respuestas>({});
  const [hechas, setHechas] = useState<Pregunta[]>([]);
  const [indice, setIndice] = useState(0);
  const [borrador, setBorrador] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finDelHilo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    finDelHilo.current?.scrollIntoView({ behavior: quieto ? "auto" : "smooth", block: "end" });
  }, [hechas.length, enviando]);

  /** La siguiente pregunta que corresponde hacer, saltando las que no aplican. */
  const siguiente = (desde: number, r: Respuestas) => {
    let i = desde;
    while (i < PREGUNTAS.length && PREGUNTAS[i].si && !PREGUNTAS[i].si!(r)) i += 1;
    return i;
  };

  const actual = indice < PREGUNTAS.length ? PREGUNTAS[indice] : null;
  const faltanObligatorias = PREGUNTAS.some(
    (p) => p.obligatoria && respuestas[p.id] === undefined
  );

  function responder(valor: Valor) {
    if (!actual) return;
    const r = { ...respuestas, [actual.id]: valor };
    setRespuestas(r);
    setHechas((prev) => [...prev, actual]);
    setBorrador("");
    setIndice(siguiente(indice + 1, r));
  }

  function responderTexto() {
    if (!actual) return;
    const limpio = borrador.trim();
    if (!limpio) return;
    if (actual.tipo === "numero") return responder(Number(limpio));
    if (actual.tipo === "lista") return responder(lista(limpio));
    responder(limpio);
  }

  async function registrar() {
    setEnviando(true);
    setError(null);
    const ficha: Record<string, Valor> = {};
    for (const p of PREGUNTAS) {
      const v = respuestas[p.id];
      if (p.destino === "ficha" && v !== undefined && v !== null) ficha[p.id] = v;
    }
    try {
      const res = await fetch("/api/puerperas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base: {
            nombre: respuestas.nombre,
            edad: Number(respuestas.edad),
            tipo_parto: (respuestas.tipo_parto ?? "vaginal") as TipoParto,
            fecha_parto: respuestas.fecha_parto,
            // La base exige estos tres y ella los puede saltar: se guarda que no los indicó,
            // no un valor inventado que la matrona leería como respuesta.
            prevision: (respuestas.prevision ?? "fonasa_b") as Prevision,
            region: (respuestas.region as string) || "No indicada",
            establecimiento: (respuestas.establecimiento as string) || "No indicado",
            comorbilidades: (ficha.enfermedades_cronicas as string[]) ?? [],
            ficha_extendida: null,
          },
          ficha: { ...FICHA_VACIA, ...(ficha as Partial<FichaExtendida>) },
        }),
      });
      const cuerpo = await res.json();
      if (!res.ok) throw new Error(cuerpo.error ?? "no se pudo registrar");
      onListo(cuerpo.puerpera as Puerpera);
    } catch (e) {
      setError(e instanceof Error ? e.message : "no se pudo registrar");
      setEnviando(false);
    }
  }

  // Solo las que de verdad le van a llegar: las condicionales que no aplican no cuentan.
  const restantes = PREGUNTAS.slice(indice).filter((p) => !p.si || p.si(respuestas)).length;

  return (
    <section className="mx-auto flex h-full min-h-0 w-full max-w-2xl flex-col">
      <header
        className="flex shrink-0 flex-col gap-2 border-b px-4 py-4 sm:px-6"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        <div className="flex flex-wrap items-baseline gap-x-3">
          <p className="etiqueta">Ficha de ingreso</p>
          <h1 className="subtitulo">Antes de empezar</h1>
          <span className="tabular ml-auto text-xs tenue">
            {actual ? `${hechas.length + 1} de ${PREGUNTAS.length}` : "Listo"}
          </span>
        </div>
        <div
          className="h-1 overflow-hidden rounded-[var(--radius-pill)]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={PREGUNTAS.length}
          aria-valuenow={hechas.length}
          aria-label="Avance de la ficha de ingreso"
          style={{ background: "var(--color-linea)" }}
        >
          <div
            className="h-full rounded-[var(--radius-pill)] transition-[width] duration-200"
            style={{
              width: `${Math.round((hechas.length / PREGUNTAS.length) * 100)}%`,
              background: "var(--marca-600)",
            }}
          />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6">
        {/* Apoyado abajo, como el chat: la primera pregunta no puede quedar arriba con media
            pantalla en blanco debajo. */}
        <div className="mt-auto flex flex-col gap-2.5">
          <Burbuja de="sistema">{SALUDO}</Burbuja>
          <Burbuja de="sistema">{SALUDO_2}</Burbuja>

          {hechas.map((pregunta, i) => (
            <div key={`${pregunta.id}-${i}`} className="contents">
              <Burbuja de="sistema">{pregunta.texto}</Burbuja>
              <Burbuja de="puerpera">{comoTexto(pregunta, respuestas[pregunta.id])}</Burbuja>
            </div>
          ))}

          {actual && (
            <div className="msj flex flex-col">
              <Burbuja de="sistema">{actual.texto}</Burbuja>
            </div>
          )}

          {!actual && !enviando && (
            <Burbuja de="sistema">
              Gracias, {String(respuestas.nombre ?? "")}. Con esto ya te puedo acompañar.
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
              No pude guardar tu ficha: {error}.
            </p>
          )}

          <div ref={finDelHilo} />
        </div>
      </div>

      <div
        className="flex shrink-0 flex-col gap-2.5 border-t px-4 py-4 sm:px-6"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        {actual ? (
          <>
            {actual.tipo === "opciones" || actual.tipo === "siNo" ? (
              <div className="flex flex-wrap gap-1.5">
                {(actual.tipo === "siNo" ? SI_NO : actual.opciones ?? []).map((opcion) => (
                  <button
                    key={opcion.id}
                    type="button"
                    onClick={() =>
                      responder(actual.tipo === "siNo" ? opcion.id === "si" : opcion.id)
                    }
                    className="chip !rounded-[var(--radius-pill)] !px-3.5 !py-2 !text-[13.5px]"
                  >
                    {opcion.etiqueta}
                  </button>
                ))}
              </div>
            ) : (
              <form
                className="flex items-end gap-2"
                autoComplete="off"
                onSubmit={(e) => {
                  e.preventDefault();
                  responderTexto();
                }}
              >
                <label className="min-w-0 flex-1">
                  <span className="sr-only">{actual.texto}</span>
                  <input
                    autoFocus
                    key={actual.id}
                    className="input"
                    name={actual.id}
                    autoComplete="off"
                    spellCheck={false}
                    inputMode={actual.tipo === "numero" ? "decimal" : undefined}
                    type={
                      actual.tipo === "numero"
                        ? "number"
                        : actual.tipo === "fecha"
                          ? "date"
                          : "text"
                    }
                    step={actual.id === "peso_kg" ? "0.1" : undefined}
                    placeholder={actual.ejemplo ? `Por ejemplo: ${actual.ejemplo}…` : undefined}
                    value={borrador}
                    onChange={(e) => setBorrador(e.target.value)}
                  />
                </label>
                <button type="submit" className="btn btn-primary" disabled={!borrador.trim()}>
                  Enviar
                </button>
              </form>
            )}

            {!actual.obligatoria && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <button
                  type="button"
                  onClick={() => responder(null)}
                  className="text-[11px] underline decoration-[var(--color-border)] underline-offset-2 tenue hover:decoration-[var(--marca-600)]"
                >
                  Prefiero no responder
                </button>
                {!faltanObligatorias && restantes > 1 && (
                  <button
                    type="button"
                    onClick={() => setIndice(PREGUNTAS.length)}
                    className="text-[11px] underline decoration-[var(--color-border)] underline-offset-2 tenue hover:decoration-[var(--marca-600)]"
                  >
                    Saltar las {restantes} que quedan y empezar
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <button className="btn btn-primary w-full" disabled={enviando} onClick={registrar}>
            {enviando ? "Guardando…" : "Empezar mi seguimiento"}
          </button>
        )}
      </div>
    </section>
  );
}
