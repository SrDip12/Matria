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
 * Solo nombre, fecha y tipo de parto son obligatorios. Todo lo demás puede quedar en blanco y
 * se guarda como null. Un campo sin responder no es un "no": es un dato que nadie preguntó, y
 * así lo va a leer la matrona.
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
  children,
}: {
  etiqueta: string;
  ancho?: boolean;
  ayuda?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 ${ancho ? "sm:col-span-2" : ""}`}>
      <span className="text-sm">{etiqueta}</span>
      {children}
      {ayuda && (
        <span className="text-xs" style={{ color: "var(--color-text-suave)" }}>
          {ayuda}
        </span>
      )}
    </label>
  );
}

const claseInput =
  "rounded-[var(--radius-md)] border px-2.5 py-1.5 text-sm outline-none focus:border-[var(--marca-900)]";
const estiloInput = { borderColor: "var(--color-border)", background: "var(--color-bg)" };

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

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const indice = imc(f);
  const completo = nombre.trim() !== "" && fechaParto !== "" && edad !== "";

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
          ficha: f,
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
          Esto lo lee la matrona que te va a acompañar estas semanas. Responde lo que puedas: lo
          que dejes en blanco queda como no preguntado, no como respuesta negativa.
        </p>
      </header>

      <Seccion titulo="Identificación">
        <Campo etiqueta="Nombre">
          <input
            className={claseInput}
            style={estiloInput}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </Campo>
        <Campo etiqueta="Edad">
          <input
            type="number"
            min={12}
            max={55}
            className={claseInput}
            style={estiloInput}
            value={edad}
            onChange={(e) => setEdad(e.target.value)}
          />
        </Campo>
        <Campo etiqueta="Previsión" ancho>
          <Opciones
            valor={prevision}
            opciones={PREVISIONES}
            onCambiar={(v) => v && setPrevision(v)}
          />
        </Campo>
        <Campo etiqueta="Región">
          <input
            className={claseInput}
            style={estiloInput}
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
        </Campo>
        <Campo etiqueta="Establecimiento">
          <input
            className={claseInput}
            style={estiloInput}
            value={establecimiento}
            onChange={(e) => setEstablecimiento(e.target.value)}
          />
        </Campo>
      </Seccion>

      <Seccion titulo="Salud general">
        <Campo etiqueta="Peso (kg)">
          <input
            type="number"
            step="0.1"
            className={claseInput}
            style={estiloInput}
            value={f.peso_kg ?? ""}
            onChange={(e) => set("peso_kg", e.target.value ? Number(e.target.value) : null)}
          />
        </Campo>
        <Campo
          etiqueta="Talla (cm)"
          ayuda={indice !== null ? `IMC ${indice}` : undefined}
        >
          <input
            type="number"
            className={claseInput}
            style={estiloInput}
            value={f.talla_cm ?? ""}
            onChange={(e) => set("talla_cm", e.target.value ? Number(e.target.value) : null)}
          />
        </Campo>
        <Campo etiqueta="Enfermedades crónicas" ancho ayuda="Separadas por coma">
          <input
            className={claseInput}
            style={estiloInput}
            placeholder="hipertensión, diabetes…"
            onChange={(e) => set("enfermedades_cronicas", lista(e.target.value))}
          />
        </Campo>
        <Campo etiqueta="Enfermedades durante el embarazo" ancho ayuda="Separadas por coma">
          <input
            className={claseInput}
            style={estiloInput}
            placeholder="diabetes gestacional, preeclampsia…"
            onChange={(e) => set("enfermedades_embarazo", lista(e.target.value))}
          />
        </Campo>
        <Campo etiqueta="Antecedentes familiares" ancho ayuda="Separados por coma">
          <input
            className={claseInput}
            style={estiloInput}
            onChange={(e) => set("antecedentes_familiares", lista(e.target.value))}
          />
        </Campo>
        <Campo etiqueta="Medicamentos de uso habitual" ancho ayuda="Separados por coma">
          <input
            className={claseInput}
            style={estiloInput}
            onChange={(e) => set("medicamentos_habituales", lista(e.target.value))}
          />
        </Campo>
      </Seccion>

      <Seccion titulo="Hábitos">
        <Campo etiqueta="Tabaco">
          <Opciones valor={f.tabaco} opciones={HABITOS} onCambiar={(v) => set("tabaco", v)} />
        </Campo>
        <Campo etiqueta="Alcohol">
          <Opciones valor={f.alcohol} opciones={HABITOS} onCambiar={(v) => set("alcohol", v)} />
        </Campo>
        <Campo etiqueta="Drogas">
          <Opciones valor={f.drogas} opciones={HABITOS} onCambiar={(v) => set("drogas", v)} />
        </Campo>
      </Seccion>

      <Seccion titulo="Antecedentes ginecológicos">
        <Campo etiqueta="Antecedentes" ancho ayuda="Separados por coma">
          <input
            className={claseInput}
            style={estiloInput}
            onChange={(e) => set("antecedentes_ginecologicos", lista(e.target.value))}
          />
        </Campo>
        <Campo etiqueta="Fecha de última regla">
          <input
            type="date"
            className={claseInput}
            style={estiloInput}
            value={f.fecha_ultima_regla ?? ""}
            onChange={(e) => set("fecha_ultima_regla", e.target.value || null)}
          />
        </Campo>
        <Campo etiqueta="Partos previos" ayuda="Sin contar este">
          <input
            type="number"
            min={0}
            className={claseInput}
            style={estiloInput}
            value={f.paridad ?? ""}
            onChange={(e) => set("paridad", e.target.value ? Number(e.target.value) : null)}
          />
        </Campo>
      </Seccion>

      <Seccion titulo="El parto">
        <Campo etiqueta="Fecha del parto">
          <input
            type="date"
            className={claseInput}
            style={estiloInput}
            value={fechaParto}
            onChange={(e) => setFechaParto(e.target.value)}
          />
        </Campo>
        <Campo etiqueta="Tipo de parto">
          <Opciones
            valor={tipoParto}
            opciones={[
              { id: "vaginal" as TipoParto, etiqueta: "Vaginal" },
              { id: "cesarea" as TipoParto, etiqueta: "Cesárea" },
            ]}
            onCambiar={(v) => v && setTipoParto(v)}
          />
        </Campo>
        <Campo etiqueta="Semanas de gestación">
          <input
            type="number"
            min={20}
            max={44}
            className={claseInput}
            style={estiloInput}
            value={f.semanas_gestacion ?? ""}
            onChange={(e) =>
              set("semanas_gestacion", e.target.value ? Number(e.target.value) : null)
            }
          />
        </Campo>
        <Campo etiqueta="Horas de trabajo de parto">
          <input
            type="number"
            min={0}
            className={claseInput}
            style={estiloInput}
            value={f.horas_trabajo_parto ?? ""}
            onChange={(e) =>
              set("horas_trabajo_parto", e.target.value ? Number(e.target.value) : null)
            }
          />
        </Campo>
        <Campo etiqueta="¿Embarazo múltiple?">
          <SiNo valor={f.embarazo_multiple} onCambiar={(v) => set("embarazo_multiple", v)} />
        </Campo>
        <Campo etiqueta="¿Se usó anestesia?">
          <SiNo valor={f.uso_anestesia} onCambiar={(v) => set("uso_anestesia", v)} />
        </Campo>
        {f.uso_anestesia === true && (
          <Campo etiqueta="Tipo de anestesia">
            <input
              className={claseInput}
              style={estiloInput}
              placeholder="peridural, raquídea…"
              value={f.tipo_anestesia ?? ""}
              onChange={(e) => set("tipo_anestesia", e.target.value || null)}
            />
          </Campo>
        )}
        <Campo etiqueta="Complicaciones del parto" ancho ayuda="Separadas por coma">
          <input
            className={claseInput}
            style={estiloInput}
            onChange={(e) => set("complicaciones_parto", lista(e.target.value))}
          />
        </Campo>
        {/* La episiotomía solo tiene sentido en parto vaginal. */}
        {tipoParto === "vaginal" && (
          <Campo etiqueta="¿Hubo episiotomía?">
            <SiNo valor={f.episiotomia} onCambiar={(v) => set("episiotomia", v)} />
          </Campo>
        )}
        <Campo etiqueta="¿Hubo apego inmediato?">
          <SiNo valor={f.apego_inmediato} onCambiar={(v) => set("apego_inmediato", v)} />
        </Campo>
        <Campo etiqueta="Inicio de la lactancia">
          <input
            type="date"
            className={claseInput}
            style={estiloInput}
            value={f.fecha_inicio_lactancia ?? ""}
            onChange={(e) => set("fecha_inicio_lactancia", e.target.value || null)}
          />
        </Campo>
      </Seccion>

      <Seccion titulo="Contacto de emergencia">
        <Campo etiqueta="Nombre">
          <input
            className={claseInput}
            style={estiloInput}
            value={f.contacto_emergencia_nombre ?? ""}
            onChange={(e) => set("contacto_emergencia_nombre", e.target.value || null)}
          />
        </Campo>
        <Campo etiqueta="Relación">
          <input
            className={claseInput}
            style={estiloInput}
            placeholder="pareja, madre, hermana…"
            value={f.contacto_emergencia_relacion ?? ""}
            onChange={(e) => set("contacto_emergencia_relacion", e.target.value || null)}
          />
        </Campo>
        <Campo etiqueta="Teléfono" ancho>
          <input
            className={claseInput}
            style={estiloInput}
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

      <button
        type="button"
        disabled={!completo || enviando}
        onClick={enviar}
        className="rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-medium"
        style={{
          background: completo ? "var(--marca-900)" : "var(--color-border)",
          color: completo ? "#ffffff" : "var(--color-text-suave)",
        }}
      >
        {enviando ? "Guardando…" : "Comenzar el seguimiento"}
      </button>
    </div>
  );
}
