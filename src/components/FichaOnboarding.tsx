"use client";

import { useState } from "react";
import {
  FICHA_VACIA,
  imc,
  type FichaExtendida,
  type Habito,
  type Prevision,
  type Puerpera,
  type TipoParto,
} from "@/lib/types";

/**
 * Onboarding de la puérpera. Un solo formulario por secciones, no un asistente por pasos:
 * ella lo llena una vez, con una guagua en brazos, y un asistente de seis pantallas la pierde
 * antes de la tercera.
 *
 * Solo nombre, edad y fecha del parto son obligatorios. Todo lo demás puede quedar en blanco y
 * se guarda como null. Un campo sin responder no es un "no": es un dato que nadie preguntó, y
 * así lo va a leer la matrona.
 *
 * Todo campo lleva un ejemplo. Media ficha en blanco no es que a ella no le importe: es que no
 * sabía qué se esperaba ahí. El ejemplo es lo que convierte "Antecedentes ginecológicos" en una
 * pregunta que se puede responder.
 */

const PREVISIONES: { id: Prevision; etiqueta: string }[] = [
  { id: "fonasa_a", etiqueta: "Fonasa A" },
  { id: "fonasa_b", etiqueta: "Fonasa B" },
  { id: "fonasa_c", etiqueta: "Fonasa C" },
  { id: "fonasa_d", etiqueta: "Fonasa D" },
  { id: "isapre", etiqueta: "Isapre" },
];

const HABITOS: { id: Habito; etiqueta: string }[] = [
  { id: "no", etiqueta: "No" },
  { id: "ocasional", etiqueta: "Ocasional" },
  { id: "habitual", etiqueta: "Habitual" },
];

const lista = (texto: string) =>
  texto
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <fieldset
      className="rounded-[var(--radius-md)] border p-4"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <legend className="px-2 text-sm font-medium" style={{ color: "var(--color-text-suave)" }}>
        {titulo}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Campo({
  etiqueta,
  ancho,
  ayuda,
  obligatorio,
  children,
}: {
  etiqueta: string;
  ancho?: boolean;
  ayuda?: string;
  obligatorio?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 ${ancho ? "sm:col-span-2" : ""}`}>
      <span className="text-sm">
        {etiqueta}
        {obligatorio && <span style={{ color: "var(--marca-600)" }}> *</span>}
      </span>
      {children}
      {ayuda && (
        <span className="text-xs" style={{ color: "var(--color-text-suave)" }}>
          {ayuda}
        </span>
      )}
    </label>
  );
}

function Opciones<T extends string>({
  valor,
  opciones,
  onCambiar,
}: {
  valor: T | null;
  opciones: { id: T; etiqueta: string }[];
  onCambiar: (v: T | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {opciones.map(({ id, etiqueta }) => (
        <button
          key={id}
          type="button"
          onClick={() => onCambiar(valor === id ? null : id)}
          className="rounded-[var(--radius-md)] border px-2.5 py-1 text-sm"
          style={{
            borderColor: valor === id ? "var(--marca-900)" : "var(--color-border)",
            background: valor === id ? "var(--marca-900)" : "var(--color-bg)",
            color: valor === id ? "#ffffff" : "var(--color-text)",
          }}
        >
          {etiqueta}
        </button>
      ))}
    </div>
  );
}

const SiNo = ({
  valor,
  onCambiar,
}: {
  valor: boolean | null;
  onCambiar: (v: boolean | null) => void;
}) => (
  <Opciones
    valor={valor === null ? null : valor ? "si" : "no"}
    opciones={[
      { id: "si", etiqueta: "Sí" },
      { id: "no", etiqueta: "No" },
    ]}
    onCambiar={(v) => onCambiar(v === null ? null : v === "si")}
  />
);

/** Campos de lista separada por comas. El texto crudo vive acá para que se vea lo que escribió. */
type ClaveLista =
  | "enfermedades_cronicas"
  | "enfermedades_embarazo"
  | "antecedentes_familiares"
  | "medicamentos_habituales"
  | "antecedentes_ginecologicos"
  | "complicaciones_parto";

export interface DatosOnboarding {
  base: Omit<Puerpera, "id" | "dia_puerperio">;
  ficha: FichaExtendida;
}

interface Props {
  onListo: (puerpera: Puerpera) => void;
}

export function FichaOnboarding({ onListo }: Props) {
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [prevision, setPrevision] = useState<Prevision>("fonasa_b");
  const [region, setRegion] = useState("Metropolitana");
  const [establecimiento, setEstablecimiento] = useState("");
  const [fechaParto, setFechaParto] = useState("");
  const [tipoParto, setTipoParto] = useState<TipoParto>("vaginal");

  const [f, setF] = useState<FichaExtendida>(FICHA_VACIA);
  const set = <K extends keyof FichaExtendida>(k: K, v: FichaExtendida[K]) =>
    setF((prev) => ({ ...prev, [k]: v }));

  const [textos, setTextos] = useState<Record<ClaveLista, string>>({
    enfermedades_cronicas: "",
    enfermedades_embarazo: "",
    antecedentes_familiares: "",
    medicamentos_habituales: "",
    antecedentes_ginecologicos: "",
    complicaciones_parto: "",
  });
  const setLista = (k: ClaveLista, texto: string) => {
    setTextos((prev) => ({ ...prev, [k]: texto }));
    set(k, lista(texto));
  };
  const campoLista = (k: ClaveLista, ejemplo: string) => (
    <input
      className="input"
      placeholder={ejemplo}
      value={textos[k]}
      onChange={(e) => setLista(k, e.target.value)}
    />
  );

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const indice = imc(f);
  const faltan = [
    nombre.trim() === "" && "tu nombre",
    edad === "" && "tu edad",
    fechaParto === "" && "la fecha del parto",
  ].filter(Boolean) as string[];
  const completo = faltan.length === 0;

  async function enviar() {
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/puerperas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base: {
            nombre,
            edad: Number(edad),
            tipo_parto: tipoParto,
            fecha_parto: fechaParto,
            prevision,
            region,
            establecimiento: establecimiento || "No indicado",
            comorbilidades: f.enfermedades_cronicas,
            ficha_extendida: null,
          },
          ficha: f, // `completada_at` lo pone /api/puerperas, no acá.
        }),
      });
      const cuerpo = await res.json();
      if (!res.ok) throw new Error(cuerpo.error ?? "no se pudo registrar");
      onListo(cuerpo.puerpera as Puerpera);
    } catch (e) {
      setError(e instanceof Error ? e.message : "no se pudo registrar");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <header>
        <h1 className="text-2xl" style={{ fontFamily: "var(--font-titulo, inherit)" }}>
          Antes de empezar
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-suave)" }}>
          Esto lo lee la matrona que te va a acompañar estas semanas. Solo los campos con{" "}
          <span style={{ color: "var(--marca-600)" }}>*</span> son obligatorios: responde el resto
          si lo sabes, y lo que dejes en blanco queda como no preguntado, no como respuesta
          negativa. En cada campo hay un ejemplo de lo que se espera.
        </p>
      </header>

      <Seccion titulo="Identificación">
        <Campo etiqueta="Nombre" obligatorio ayuda="Ejemplo: María José">
          <input
            className="input"
            placeholder="María José"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </Campo>
        <Campo etiqueta="Edad" obligatorio ayuda="En años. Ejemplo: 28">
          <input
            type="number"
            min={12}
            max={55}
            className="input"
            placeholder="28"
            value={edad}
            onChange={(e) => setEdad(e.target.value)}
          />
        </Campo>
        <Campo etiqueta="Previsión" ancho ayuda="La que dice tu carnet. Ejemplo: Fonasa B">
          <Opciones
            valor={prevision}
            opciones={PREVISIONES}
            onCambiar={(v) => v && setPrevision(v)}
          />
        </Campo>
        <Campo etiqueta="Región" ayuda="Ejemplo: Metropolitana">
          <input
            className="input"
            placeholder="Metropolitana"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
        </Campo>
        <Campo etiqueta="Establecimiento" ayuda="Dónde tuviste a tu guagua. Ejemplo: Hospital San José">
          <input
            className="input"
            placeholder="Hospital San José"
            value={establecimiento}
            onChange={(e) => setEstablecimiento(e.target.value)}
          />
        </Campo>
      </Seccion>

      <Seccion titulo="Salud general">
        <Campo etiqueta="Peso (kg)" ayuda="El de ahora. Ejemplo: 68,5">
          <input
            type="number"
            step="0.1"
            className="input"
            placeholder="68.5"
            value={f.peso_kg ?? ""}
            onChange={(e) => set("peso_kg", e.target.value ? Number(e.target.value) : null)}
          />
        </Campo>
        <Campo
          etiqueta="Talla (cm)"
          ayuda={indice !== null ? `IMC ${indice}` : "Ejemplo: 162"}
        >
          <input
            type="number"
            className="input"
            placeholder="162"
            value={f.talla_cm ?? ""}
            onChange={(e) => set("talla_cm", e.target.value ? Number(e.target.value) : null)}
          />
        </Campo>
        <Campo
          etiqueta="Enfermedades crónicas"
          ancho
          ayuda="Las que tenías antes del embarazo, separadas por coma. Ejemplo: hipertensión, diabetes"
        >
          {campoLista("enfermedades_cronicas", "hipertensión, diabetes")}
        </Campo>
        <Campo
          etiqueta="Enfermedades durante el embarazo"
          ancho
          ayuda="Separadas por coma. Ejemplo: diabetes gestacional, preeclampsia"
        >
          {campoLista("enfermedades_embarazo", "diabetes gestacional, preeclampsia")}
        </Campo>
        <Campo
          etiqueta="Antecedentes familiares"
          ancho
          ayuda="Enfermedades de tu familia directa. Ejemplo: madre con hipertensión, hermana con diabetes"
        >
          {campoLista("antecedentes_familiares", "madre con hipertensión, hermana con diabetes")}
        </Campo>
        <Campo
          etiqueta="Medicamentos de uso habitual"
          ancho
          ayuda="Los que tomas seguido, separados por coma. Ejemplo: ácido fólico, fierro"
        >
          {campoLista("medicamentos_habituales", "ácido fólico, fierro")}
        </Campo>
      </Seccion>

      <Seccion titulo="Hábitos">
        <Campo etiqueta="Tabaco" ayuda="Durante el embarazo. Ejemplo: fumabas a veces → Ocasional">
          <Opciones valor={f.tabaco} opciones={HABITOS} onCambiar={(v) => set("tabaco", v)} />
        </Campo>
        <Campo etiqueta="Alcohol" ayuda="Durante el embarazo. Ejemplo: una copa en un cumpleaños → Ocasional">
          <Opciones valor={f.alcohol} opciones={HABITOS} onCambiar={(v) => set("alcohol", v)} />
        </Campo>
        <Campo etiqueta="Drogas" ayuda="Durante el embarazo. Ejemplo: nunca → No">
          <Opciones valor={f.drogas} opciones={HABITOS} onCambiar={(v) => set("drogas", v)} />
        </Campo>
      </Seccion>

      <Seccion titulo="Antecedentes ginecológicos">
        <Campo
          etiqueta="Antecedentes"
          ancho
          ayuda="Separados por coma. Ejemplo: quiste ovárico, endometriosis, cesárea anterior"
        >
          {campoLista("antecedentes_ginecologicos", "quiste ovárico, endometriosis")}
        </Campo>
        <Campo etiqueta="Fecha de última regla" ayuda="La última antes de este embarazo, si la recuerdas">
          <input
            type="date"
            className="input"
            value={f.fecha_ultima_regla ?? ""}
            onChange={(e) => set("fecha_ultima_regla", e.target.value || null)}
          />
        </Campo>
        <Campo etiqueta="Partos previos" ayuda="Sin contar este. Ejemplo: 1">
          <input
            type="number"
            min={0}
            className="input"
            placeholder="1"
            value={f.paridad ?? ""}
            onChange={(e) => set("paridad", e.target.value ? Number(e.target.value) : null)}
          />
        </Campo>
      </Seccion>

      <Seccion titulo="El parto">
        <Campo etiqueta="Fecha del parto" obligatorio ayuda="El día que nació tu guagua">
          <input
            type="date"
            className="input"
            value={fechaParto}
            onChange={(e) => setFechaParto(e.target.value)}
          />
        </Campo>
        <Campo etiqueta="Tipo de parto" ayuda="Ejemplo: si te operaron, es Cesárea">
          <Opciones
            valor={tipoParto}
            opciones={[
              { id: "vaginal" as TipoParto, etiqueta: "Vaginal" },
              { id: "cesarea" as TipoParto, etiqueta: "Cesárea" },
            ]}
            onCambiar={(v) => v && setTipoParto(v)}
          />
        </Campo>
        <Campo etiqueta="Semanas de gestación" ayuda="Con cuántas semanas nació. Ejemplo: 39">
          <input
            type="number"
            min={20}
            max={44}
            className="input"
            placeholder="39"
            value={f.semanas_gestacion ?? ""}
            onChange={(e) =>
              set("semanas_gestacion", e.target.value ? Number(e.target.value) : null)
            }
          />
        </Campo>
        <Campo etiqueta="Horas de trabajo de parto" ayuda="Desde las contracciones hasta el parto. Ejemplo: 8">
          <input
            type="number"
            min={0}
            className="input"
            placeholder="8"
            value={f.horas_trabajo_parto ?? ""}
            onChange={(e) =>
              set("horas_trabajo_parto", e.target.value ? Number(e.target.value) : null)
            }
          />
        </Campo>
        <Campo etiqueta="¿Embarazo múltiple?" ayuda="Ejemplo: mellizos o más → Sí">
          <SiNo valor={f.embarazo_multiple} onCambiar={(v) => set("embarazo_multiple", v)} />
        </Campo>
        <Campo etiqueta="¿Se usó anestesia?" ayuda="Ejemplo: te pusieron la inyección en la espalda → Sí">
          <SiNo valor={f.uso_anestesia} onCambiar={(v) => set("uso_anestesia", v)} />
        </Campo>
        {f.uso_anestesia === true && (
          <Campo etiqueta="Tipo de anestesia" ayuda="Ejemplo: peridural, raquídea, general">
            <input
              className="input"
              placeholder="peridural"
              value={f.tipo_anestesia ?? ""}
              onChange={(e) => set("tipo_anestesia", e.target.value || null)}
            />
          </Campo>
        )}
        <Campo
          etiqueta="Complicaciones del parto"
          ancho
          ayuda="Separadas por coma. Ejemplo: desgarro, hemorragia, fórceps"
        >
          {campoLista("complicaciones_parto", "desgarro, hemorragia")}
        </Campo>
        {/* La episiotomía solo tiene sentido en parto vaginal. */}
        {tipoParto === "vaginal" && (
          <Campo etiqueta="¿Hubo episiotomía?" ayuda="El corte para ayudar a que saliera la guagua">
            <SiNo valor={f.episiotomia} onCambiar={(v) => set("episiotomia", v)} />
          </Campo>
        )}
        <Campo etiqueta="¿Hubo apego inmediato?" ayuda="Si te pusieron a la guagua en el pecho al nacer">
          <SiNo valor={f.apego_inmediato} onCambiar={(v) => set("apego_inmediato", v)} />
        </Campo>
        <Campo etiqueta="Inicio de la lactancia" ayuda="El día que empezaste a darle pecho">
          <input
            type="date"
            className="input"
            value={f.fecha_inicio_lactancia ?? ""}
            onChange={(e) => set("fecha_inicio_lactancia", e.target.value || null)}
          />
        </Campo>
      </Seccion>

      <Seccion titulo="Contacto de emergencia">
        <Campo etiqueta="Nombre" ayuda="A quién llamamos si no te ubicamos. Ejemplo: Carolina Pérez">
          <input
            className="input"
            placeholder="Carolina Pérez"
            value={f.contacto_emergencia_nombre ?? ""}
            onChange={(e) => set("contacto_emergencia_nombre", e.target.value || null)}
          />
        </Campo>
        <Campo etiqueta="Relación" ayuda="Ejemplo: pareja, madre, hermana, vecina">
          <input
            className="input"
            placeholder="pareja"
            value={f.contacto_emergencia_relacion ?? ""}
            onChange={(e) => set("contacto_emergencia_relacion", e.target.value || null)}
          />
        </Campo>
        <Campo etiqueta="Teléfono" ancho ayuda="Ejemplo: +56 9 8765 4321">
          <input
            className="input"
            placeholder="+56 9 8765 4321"
            value={f.contacto_emergencia_telefono ?? ""}
            onChange={(e) => set("contacto_emergencia_telefono", e.target.value || null)}
          />
        </Campo>
      </Seccion>

      {error && (
        <p className="text-sm" style={{ color: "var(--riesgo-alto, #B3261E)" }}>
          {error}
        </p>
      )}

      {/* Pegado abajo: el formulario es largo y el botón no se busca con una guagua en brazos. */}
      <div
        className="sticky bottom-0 flex flex-col gap-1 py-3"
        style={{ background: "var(--color-bg)" }}
      >
        <button
          type="button"
          disabled={!completo || enviando}
          onClick={enviar}
          className="btn btn-primary w-full"
        >
          {enviando ? "Guardando…" : "Comenzar el seguimiento"}
        </button>
        {!completo && (
          <span className="text-xs" style={{ color: "var(--color-text-suave)" }}>
            Falta {faltan.join(" y ")} para poder empezar.
          </span>
        )}
      </div>
    </div>
  );
}
