"use client";

import { useState } from "react";
import {
  FICHA_VACIA,
  type FichaExtendida,
  type Habito,
  type Puerpera,
  type TipoParto,
} from "@/lib/types";

/**
 * Ficha de ingreso, en tres pasos.
 *
 * No es un cuestionario clínico: es el contexto con el que el agente va a leer lo que ella
 * cuente después. Antes esto era una conversación de treinta y una preguntas; el formulario de
 * tres pasos deja ver de una cuánto falta y se puede abandonar en cualquier punto.
 *
 * Solo nombre, edad, fecha y tipo de parto son obligatorios. Todo lo demás se puede saltar y
 * queda en null: un campo sin responder no es un "no", es un dato que nadie preguntó.
 *
 * Cada campo de acá alimenta un factor de §8 (`src/lib/factores.ts`). Si se saca uno, se pierde
 * el factor: peso y talla dan el IMC, las horas y la paridad dan el parto prolongado, y el
 * síndrome hipertensivo del embarazo es la excepción única de §8.
 */

type Respuestas = Record<string, string>;

interface Campo {
  k: string;
  etiqueta: string;
  tipo: "texto" | "numero" | "fecha" | "opciones";
  placeholder?: string;
  opciones?: string[];
  multi?: boolean;
  /** Campos que solo tienen sentido según lo ya respondido. */
  si?: (r: Respuestas) => boolean;
}

interface Paso {
  zona: string;
  titulo: string;
  ayuda: string;
  campos: Campo[];
}

const REGIONES = [
  "Metropolitana",
  "Valparaíso",
  "Biobío",
  "Maule",
  "Araucanía",
  "Coquimbo",
  "Otra",
];

const DEL_EMBARAZO = [
  "Ninguna",
  "Síndrome hipertensivo del embarazo",
  "Diabetes gestacional",
  "Anemia",
];

const DE_ANTES = ["Ninguna", "Hipertensión", "Diabetes", "Obesidad", "Tiroides"];

const PASOS: Paso[] = [
  {
    zona: "Paso 1 · Tu parto",
    titulo: "¿Cómo fue el parto?",
    ayuda: "Con esto el agente sabe en qué día del puerperio vas y qué mirar primero.",
    campos: [
      { k: "edad", etiqueta: "Edad", tipo: "numero", placeholder: "31" },
      { k: "fecha_parto", etiqueta: "Fecha del parto", tipo: "fecha" },
      { k: "semanas_gestacion", etiqueta: "Semanas de gestación", tipo: "numero", placeholder: "38" },
      {
        k: "horas_trabajo_parto",
        etiqueta: "Horas de trabajo de parto",
        tipo: "numero",
        placeholder: "6",
      },
      { k: "tipo_parto", etiqueta: "Tipo de parto", tipo: "opciones", opciones: ["Vaginal", "Cesárea"] },
      {
        k: "anestesia",
        etiqueta: "Anestesia",
        tipo: "opciones",
        opciones: ["Sí · raquídea", "Sí · epidural", "No", "No sé"],
      },
      {
        k: "embarazo_multiple",
        etiqueta: "¿Venían dos o más?",
        tipo: "opciones",
        opciones: ["No", "Sí"],
      },
    ],
  },
  {
    zona: "Paso 2 · Tu embarazo",
    titulo: "¿Cómo fue el embarazo?",
    ayuda: "Un antecedente del embarazo cambia la prioridad de una señal, no lo que significa.",
    campos: [
      {
        k: "paridad",
        etiqueta: "Partos anteriores a este",
        tipo: "opciones",
        opciones: ["Primer parto", "1 parto previo", "2 partos previos", "3 o más"],
      },
      {
        k: "enfermedades_embarazo",
        etiqueta: "Enfermedades del embarazo",
        tipo: "opciones",
        multi: true,
        opciones: DEL_EMBARAZO,
      },
      {
        k: "enfermedades_cronicas",
        etiqueta: "Enfermedades de antes del embarazo",
        tipo: "opciones",
        multi: true,
        opciones: DE_ANTES,
      },
      { k: "tabaco", etiqueta: "Tabaco", tipo: "opciones", opciones: ["No", "A veces", "Seguido"] },
      { k: "peso_kg", etiqueta: "Peso hoy (kg)", tipo: "numero", placeholder: "68" },
      { k: "talla_cm", etiqueta: "Talla (cm)", tipo: "numero", placeholder: "162" },
    ],
  },
  {
    zona: "Paso 3 · Dónde te atendiste",
    titulo: "¿Dónde nació tu guagua?",
    ayuda: "Sirve para que tu matrona del CESFAM te ubique en su cohorte.",
    campos: [
      {
        k: "establecimiento",
        etiqueta: "Establecimiento",
        tipo: "texto",
        placeholder: "Hospital San José",
      },
      { k: "region", etiqueta: "Región", tipo: "opciones", opciones: REGIONES },
      {
        k: "episiotomia",
        etiqueta: "Episiotomía",
        tipo: "opciones",
        opciones: ["Sí", "No", "No sé"],
        si: (r) => r.tipo_parto === "Vaginal",
      },
    ],
  },
];

const TOTAL_CAMPOS = PASOS.reduce((s, p) => s + p.campos.length, 0);

const HABITO: Record<string, Habito> = { No: "no", "A veces": "ocasional", Seguido: "habitual" };
const PARIDAD: Record<string, number> = {
  "Primer parto": 0,
  "1 parto previo": 1,
  "2 partos previos": 2,
  "3 o más": 3,
};

const numero = (v?: string) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return v && !Number.isNaN(n) ? n : null;
};

const siNo = (v?: string) => (v === "Sí" ? true : v === "No" ? false : null);

/** Las opciones múltiples se guardan unidas; "Ninguna" es una respuesta, no una lista vacía. */
const listaDe = (v?: string) =>
  !v || v === "Ninguna" ? [] : v.split(" · ").filter((x) => x && x !== "Ninguna");

/** Barra de avance segmentada: tres tramos, uno por paso. */
function Avance({ paso }: { paso: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {PASOS.map((_, i) => (
          <span
            key={i}
            aria-hidden
            className="h-1 flex-1 rounded-[1.5px] transition-colors duration-200"
            style={{ background: i <= paso ? "var(--marca-500)" : "var(--color-linea)" }}
          />
        ))}
      </div>
      <span className="tabular text-[11px] tenue">
        {paso + 1} de {PASOS.length}
      </span>
    </div>
  );
}

function CampoOpciones({
  campo,
  valor,
  onElegir,
}: {
  campo: Campo;
  valor?: string;
  onElegir: (v: string) => void;
}) {
  const marcados = campo.multi ? listaDe(valor) : [];

  return (
    <div className="flex flex-col gap-1.5">
      <span className="etiqueta-tenue">{campo.etiqueta}</span>
      <div className="flex flex-wrap gap-1.5">
        {campo.opciones!.map((o) => {
          const activo = campo.multi ? marcados.includes(o) || valor === o : valor === o;
          return (
            <button
              key={o}
              type="button"
              className="chip"
              aria-pressed={activo}
              onClick={() => {
                if (!campo.multi) return onElegir(activo ? "" : o);
                if (o === "Ninguna") return onElegir(activo ? "" : "Ninguna");
                const sin = marcados.filter((m) => m !== o);
                onElegir(activo ? sin.join(" · ") : [...marcados, o].join(" · "));
              }}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Primer paso, aparte: solo su nombre, sin cuenta ni identificación. */
function Nombre({
  valor,
  onCambiar,
  onContinuar,
  onVolver,
}: {
  valor: string;
  onCambiar: (v: string) => void;
  onContinuar: () => void;
  onVolver: () => void;
}) {
  return (
    <div className="vista-entra mx-auto flex w-full max-w-[520px] flex-col gap-5 px-6 py-14">
      <div className="flex flex-col gap-2">
        <p className="etiqueta">Empecemos</p>
        <h1 className="titulo">¿Cómo te llamas?</h1>
        <p className="text-[13.5px] leading-relaxed text-pretty suave">
          Con tu nombre basta. No te vamos a pedir clave ni ningún dato para identificarte.
        </p>
      </div>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (valor.trim()) onContinuar();
        }}
      >
        <label className="flex flex-col gap-1.5">
          <span className="etiqueta-tenue">Tu nombre</span>
          <input
            autoFocus
            className="input"
            name="nombre"
            autoComplete="off"
            placeholder="Camila"
            value={valor}
            onChange={(e) => onCambiar(e.target.value)}
          />
        </label>
        <div className="flex items-center gap-2">
          <button type="submit" className="btn btn-primary" disabled={!valor.trim()}>
            Continuar →
          </button>
          <button type="button" onClick={onVolver} className="btn btn-ghost">
            Volver al inicio
          </button>
        </div>
      </form>
    </div>
  );
}

export function FichaIngreso({
  onListo,
  onVolverInicio,
}: {
  onListo: (puerpera: Puerpera) => void;
  onVolverInicio: () => void;
}) {
  const [etapa, setEtapa] = useState<"nombre" | "pasos">("nombre");
  const [nombre, setNombre] = useState("");
  const [r, setR] = useState<Respuestas>({});
  const [paso, setPaso] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cambiar = (k: string, v: string) => setR((prev) => ({ ...prev, [k]: v }));

  if (etapa === "nombre") {
    return (
      <Nombre
        valor={nombre}
        onCambiar={setNombre}
        onVolver={onVolverInicio}
        onContinuar={() => setEtapa("pasos")}
      />
    );
  }

  const actual = PASOS[paso];
  const campos = actual.campos.filter((c) => !c.si || c.si(r));
  const textos = campos.filter((c) => c.tipo !== "opciones");
  const opciones = campos.filter((c) => c.tipo === "opciones");
  const ultimo = paso === PASOS.length - 1;
  const contestados = Object.entries(r).filter(([, v]) => v);
  const faltaObligatorio = !r.edad || !r.fecha_parto || !r.tipo_parto;

  async function registrar() {
    setEnviando(true);
    setError(null);

    const cronicas = listaDe(r.enfermedades_cronicas);
    const ficha: Partial<FichaExtendida> = {
      peso_kg: numero(r.peso_kg),
      talla_cm: numero(r.talla_cm),
      semanas_gestacion: numero(r.semanas_gestacion),
      horas_trabajo_parto: numero(r.horas_trabajo_parto),
      paridad: r.paridad ? PARIDAD[r.paridad] : null,
      enfermedades_embarazo: listaDe(r.enfermedades_embarazo),
      enfermedades_cronicas: cronicas,
      embarazo_multiple: siNo(r.embarazo_multiple),
      // "No sé" no es un no: queda sin responder, igual que un campo en blanco.
      uso_anestesia: r.anestesia?.startsWith("Sí") ? true : r.anestesia === "No" ? false : null,
      tipo_anestesia: r.anestesia?.startsWith("Sí") ? r.anestesia.split(" · ")[1] : null,
      episiotomia: siNo(r.episiotomia),
      tabaco: r.tabaco ? HABITO[r.tabaco] : null,
    };

    try {
      const res = await fetch("/api/puerperas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base: {
            nombre: nombre.trim(),
            edad: numero(r.edad) ?? 0,
            tipo_parto: (r.tipo_parto === "Cesárea" ? "cesarea" : "vaginal") as TipoParto,
            fecha_parto: r.fecha_parto,
            // La base exige estos tres y ella los puede saltar: se guarda que no los indicó,
            // no un valor inventado que la matrona leería como respuesta.
            prevision: "fonasa_b",
            region: r.region || "No indicada",
            establecimiento: r.establecimiento || "No indicado",
            comorbilidades: cronicas,
            ficha_extendida: null,
          },
          ficha: { ...FICHA_VACIA, ...ficha },
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

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[672px] flex-col gap-5 px-6 pt-7 pb-10">
        <div key={paso} className="vista-entra flex flex-col gap-2.5">
          <Avance paso={paso} />
          <p className="etiqueta">{actual.zona}</p>
          <h1 className="titulo">{actual.titulo}</h1>
          <p className="text-[13.5px] leading-relaxed text-pretty suave">{actual.ayuda}</p>
        </div>

        <div key={`campos-${paso}`} className="vista-entra card flex flex-col gap-4 p-4">
          {textos.length > 0 && (
            <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
              {textos.map((c) => (
                <label key={c.k} className="flex min-w-0 flex-col gap-1.5">
                  <span className="etiqueta-tenue">{c.etiqueta}</span>
                  <input
                    className="input"
                    name={c.k}
                    autoComplete="off"
                    spellCheck={false}
                    type={c.tipo === "fecha" ? "date" : c.tipo === "numero" ? "number" : "text"}
                    inputMode={c.tipo === "numero" ? "decimal" : undefined}
                    placeholder={c.placeholder}
                    value={r[c.k] ?? ""}
                    onChange={(e) => cambiar(c.k, e.target.value)}
                  />
                </label>
              ))}
            </div>
          )}

          {opciones.map((c) => (
            <CampoOpciones key={c.k} campo={c} valor={r[c.k]} onElegir={(v) => cambiar(c.k, v)} />
          ))}

          <p className="text-xs leading-relaxed text-pretty tenue">
            Lo que dejes en blanco tu matrona lo va a ver como “No preguntado”. Puedes contestarlo
            más adelante desde tu ficha.
          </p>
        </div>

        {ultimo && (
          <section className="vista-entra card flex flex-col gap-3 p-4">
            <div className="flex flex-col gap-1">
              <h3 className="etiqueta">Lo que va a ver tu matrona</h3>
              <p className="tabular text-xs leading-relaxed tenue">
                {contestados.length} de {TOTAL_CAMPOS} respuestas de tu ficha de ingreso.
              </p>
            </div>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <div className="flex flex-col gap-0.5">
                <dt className="etiqueta-tenue">Nombre</dt>
                <dd className="text-[13.5px] leading-snug">{nombre}</dd>
              </div>
              {contestados.map(([k, v]) => (
                <div key={k} className="flex min-w-0 flex-col gap-0.5">
                  <dt className="etiqueta-tenue">
                    {PASOS.flatMap((p) => p.campos).find((c) => c.k === k)?.etiqueta ?? k}
                  </dt>
                  <dd className="text-[13.5px] leading-snug break-words">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-[var(--radius-md)] border px-3.5 py-2.5 text-[13px] text-pretty"
            style={{
              borderColor: "var(--riesgo-alto-borde)",
              background: "var(--riesgo-alto-fondo)",
              color: "var(--riesgo-alto-tinta)",
            }}
          >
            No pude guardar tu ficha: {error}.
          </p>
        )}

        {ultimo && faltaObligatorio && (
          <p className="text-xs leading-relaxed text-pretty tenue">
            Falta tu edad, la fecha del parto o el tipo de parto. Son los tres únicos datos que
            necesito para poder acompañarte: están en el paso 1.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {ultimo ? (
            <button
              type="button"
              className="btn btn-primary"
              disabled={enviando || faltaObligatorio}
              onClick={registrar}
            >
              {enviando ? "Guardando…" : "Empezar el acompañamiento →"}
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setPaso(paso + 1)}>
              Continuar →
            </button>
          )}

          {paso > 0 ? (
            <button type="button" className="btn btn-ghost" onClick={() => setPaso(paso - 1)}>
              Volver al paso anterior
            </button>
          ) : (
            <button type="button" className="btn btn-ghost" onClick={() => setEtapa("nombre")}>
              Volver al inicio
            </button>
          )}

          {!ultimo && (
            <button
              type="button"
              className="btn btn-ghost ml-auto"
              onClick={() => setPaso(PASOS.length - 1)}
            >
              Llenarla después
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
