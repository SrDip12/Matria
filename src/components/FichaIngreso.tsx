"use client";

import { useRef, useState } from "react";
import {
  FICHA_VACIA,
  type FichaExtendida,
  type Habito,
  type Puerpera,
  type TipoParto,
} from "@/lib/types";

/**
 * Ficha de ingreso, en cuatro pasos.
 *
 * No es un cuestionario clínico: es el contexto con el que el agente va a leer lo que ella
 * cuente después. Recoge la ficha extendida completa —la misma que la matrona lee en el caso—,
 * así que si acá falta un campo, en la ficha del caso sale "No preguntado" para siempre.
 *
 * Solo nombre, edad, fecha y tipo de parto son obligatorios. Todo lo demás se puede saltar y
 * queda en null: un campo sin responder no es un "no", es un dato que nadie preguntó.
 *
 * Cada campo de acá alimenta un factor de §8 (`src/lib/factores.ts`) o un antecedente que la
 * matrona necesita ver junto al caso. Si se saca uno, se pierde el factor.
 */

type Respuestas = Record<string, string>;
type Errores = Record<string, string>;

interface Campo {
  k: string;
  etiqueta: string;
  /** `lista` es un desplegable nativo: para dieciséis opciones los chips no dan. */
  tipo: "texto" | "numero" | "fecha" | "telefono" | "opciones" | "lista";
  placeholder?: string;
  ayuda?: string;
  opciones?: string[];
  multi?: boolean;
  /** El texto se guarda como arreglo, separando por comas. */
  comoLista?: boolean;
  obligatorio?: boolean;
  /** Campos que solo tienen sentido según lo ya respondido. */
  si?: (r: Respuestas) => boolean;
  /** Devuelve el mensaje de error, o null si el valor sirve. Solo corre si hay valor. */
  validar?: (v: string, r: Respuestas) => string | null;
}

interface Paso {
  zona: string;
  titulo: string;
  ayuda: string;
  campos: Campo[];
}

/** Las dieciséis, de norte a sur. Con siete chips la mitad del país no aparecía. */
const REGIONES = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana de Santiago",
  "Libertador General Bernardo O’Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "La Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén del General Carlos Ibáñez del Campo",
  "Magallanes y de la Antártica Chilena",
];

/**
 * Patologías del embarazo ordenadas por prevalencia, no alfabéticamente: lo que le pasa a más
 * mujeres se ve primero. La colestasia intrahepática entra porque Chile tiene una de las
 * prevalencias más altas del mundo y el listado genérico la deja fuera.
 */
const DEL_EMBARAZO = [
  "Ninguna",
  "Anemia",
  "Diabetes gestacional",
  "Síndrome hipertensivo del embarazo",
  "Infección urinaria",
  "Colestasia intrahepática",
  "Hipotiroidismo",
  "Amenaza de parto prematuro",
  "Otra",
];

const DE_ANTES = [
  "Ninguna",
  "Hipertensión",
  "Diabetes",
  "Obesidad",
  "Hipotiroidismo",
  "Asma",
  "Depresión o ansiedad",
  "Otra",
];

const HOY = () => new Date().toISOString().slice(0, 10);

const rango = (min: number, max: number, unidad: string) => (v: string) => {
  const n = Number(v.replace(",", "."));
  if (Number.isNaN(n)) return "Escríbelo solo con números.";
  return n < min || n > max ? `Tiene que estar entre ${min} y ${max} ${unidad}.` : null;
};

const PASOS: Paso[] = [
  {
    zona: "Paso 1 · Tu parto",
    titulo: "¿Cómo fue el parto?",
    ayuda: "Con esto el agente sabe en qué día del puerperio vas y qué mirar primero.",
    campos: [
      {
        k: "edad",
        etiqueta: "Edad",
        tipo: "numero",
        placeholder: "31",
        obligatorio: true,
        validar: rango(12, 60, "años"),
      },
      {
        k: "fecha_parto",
        etiqueta: "Fecha del parto",
        tipo: "fecha",
        obligatorio: true,
        validar: (v) => {
          if (v > HOY()) return "La fecha del parto no puede ser en el futuro.";
          const dias = Math.floor((Date.parse(HOY()) - Date.parse(v)) / 86_400_000);
          if (dias > 42) return "Pasaron más de 42 días: el puerperio de este parto ya terminó.";
          return null;
        },
      },
      {
        k: "semanas_gestacion",
        etiqueta: "Semanas de gestación",
        tipo: "numero",
        placeholder: "38",
        validar: rango(20, 45, "semanas"),
      },
      {
        k: "horas_trabajo_parto",
        etiqueta: "Horas de trabajo de parto",
        tipo: "numero",
        placeholder: "6",
        validar: rango(0, 72, "horas"),
      },
      {
        k: "tipo_parto",
        etiqueta: "Tipo de parto",
        tipo: "opciones",
        opciones: ["Vaginal", "Cesárea"],
        obligatorio: true,
      },
      {
        k: "anestesia",
        etiqueta: "Anestesia",
        tipo: "opciones",
        opciones: ["Sí · raquídea", "Sí · epidural", "Sí · general", "No", "No sé"],
      },
      {
        k: "embarazo_multiple",
        etiqueta: "Embarazo múltiple",
        tipo: "opciones",
        opciones: ["No", "Sí, gemelar o más"],
        ayuda: "Si nació más de una guagua en este parto.",
      },
      {
        k: "episiotomia",
        etiqueta: "Episiotomía",
        tipo: "opciones",
        opciones: ["Sí", "No", "No sé"],
        ayuda: "El corte que a veces se hace para ayudar a que salga la guagua.",
        si: (r) => r.tipo_parto === "Vaginal",
      },
      {
        k: "complicaciones_parto",
        etiqueta: "Complicaciones del parto",
        tipo: "texto",
        comoLista: true,
        placeholder: "desgarro, hemorragia",
        ayuda: "Si fueron varias, sepáralas con coma.",
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
        k: "fecha_ultima_regla",
        etiqueta: "Fecha de la última regla",
        tipo: "fecha",
        ayuda: "La anterior al embarazo. Si no te acuerdas, sáltala.",
        validar: (v) => (v > HOY() ? "No puede ser una fecha futura." : null),
      },
      {
        k: "enfermedades_embarazo",
        etiqueta: "Enfermedades del embarazo",
        tipo: "opciones",
        multi: true,
        opciones: DEL_EMBARAZO,
      },
      {
        k: "antecedentes_ginecologicos",
        etiqueta: "Antecedentes ginecológicos",
        tipo: "texto",
        comoLista: true,
        placeholder: "quiste ovárico, cesárea anterior",
        ayuda: "Si son varios, sepáralos con coma.",
      },
    ],
  },
  {
    zona: "Paso 3 · Tu salud",
    titulo: "¿Cómo estás tú?",
    ayuda: "Lo de antes del embarazo también pesa en cómo se lee lo que cuentes estos días.",
    campos: [
      {
        k: "peso_kg",
        etiqueta: "Peso hoy (kg)",
        tipo: "numero",
        placeholder: "68",
        validar: rango(30, 250, "kg"),
      },
      {
        k: "talla_cm",
        etiqueta: "Talla (cm)",
        tipo: "numero",
        placeholder: "162",
        validar: rango(100, 220, "cm"),
      },
      {
        k: "enfermedades_cronicas",
        etiqueta: "Enfermedades de antes del embarazo",
        tipo: "opciones",
        multi: true,
        opciones: DE_ANTES,
      },
      {
        k: "medicamentos_habituales",
        etiqueta: "Medicamentos que tomas seguido",
        tipo: "texto",
        comoLista: true,
        placeholder: "ácido fólico, fierro",
        ayuda: "Si son varios, sepáralos con coma.",
      },
      {
        k: "antecedentes_familiares",
        etiqueta: "Enfermedades en tu familia directa",
        tipo: "texto",
        comoLista: true,
        placeholder: "madre con hipertensión",
        ayuda: "Mamá, papá, hermanas. Sepáralos con coma.",
      },
      { k: "tabaco", etiqueta: "Tabaco", tipo: "opciones", opciones: ["No", "A veces", "Seguido"] },
      { k: "alcohol", etiqueta: "Alcohol", tipo: "opciones", opciones: ["No", "A veces", "Seguido"] },
      {
        k: "drogas",
        etiqueta: "Otras drogas",
        tipo: "opciones",
        opciones: ["No", "A veces", "Seguido"],
        ayuda: "Te lo preguntamos para cuidarte mejor. Acá nadie te va a retar.",
      },
    ],
  },
  {
    zona: "Paso 4 · Dónde te atendiste y tu red",
    titulo: "¿Dónde nació tu guagua?",
    ayuda: "Sirve para que tu matrona del CESFAM te ubique en su cohorte y sepa a quién llamar.",
    campos: [
      {
        k: "establecimiento",
        etiqueta: "Establecimiento",
        tipo: "texto",
        placeholder: "Hospital San José",
      },
      { k: "region", etiqueta: "Región", tipo: "lista", opciones: REGIONES },
      {
        k: "apego_inmediato",
        etiqueta: "Apego inmediato",
        tipo: "opciones",
        opciones: ["Sí", "No", "No sé"],
        ayuda: "Si te la pusieron en el pecho apenas nació.",
      },
      {
        k: "fecha_inicio_lactancia",
        etiqueta: "Inicio de la lactancia",
        tipo: "fecha",
        validar: (v, r) => {
          if (v > HOY()) return "No puede ser una fecha futura.";
          if (r.fecha_parto && v < r.fecha_parto) return "No puede ser antes del parto.";
          return null;
        },
      },
      {
        k: "contacto_emergencia_nombre",
        etiqueta: "¿A quién llamamos si no te ubicamos?",
        tipo: "texto",
        placeholder: "Carolina Pérez",
      },
      {
        k: "contacto_emergencia_relacion",
        etiqueta: "¿Qué es tuya?",
        tipo: "texto",
        placeholder: "pareja",
        si: (r) => !!r.contacto_emergencia_nombre?.trim(),
      },
      {
        k: "contacto_emergencia_telefono",
        etiqueta: "Su teléfono",
        tipo: "telefono",
        placeholder: "+56 9 8765 4321",
        si: (r) => !!r.contacto_emergencia_nombre?.trim(),
        validar: (v) =>
          v.replace(/\D/g, "").length < 8 ? "Faltan dígitos para que sea un teléfono." : null,
      },
    ],
  },
];

const TOTAL_CAMPOS = PASOS.reduce((s, p) => s + p.campos.length, 0);
const TODOS = PASOS.flatMap((p) => p.campos);

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

const porComas = (v?: string) =>
  (v ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

/** Barra de avance segmentada: un tramo por paso. */
function Avance({ paso }: { paso: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {PASOS.map((_, i) => (
          <span
            key={i}
            aria-hidden
            className="h-1 flex-1 rounded-[1.5px] transition-colors duration-200"
            style={{ background: i <= paso ? "var(--accion)" : "var(--color-linea)" }}
          />
        ))}
      </div>
      <span className="tabular text-[11px] tenue">
        {paso + 1} de {PASOS.length}
      </span>
    </div>
  );
}

/** El mensaje bajo un campo con problema. Nunca solo el borde rojo: el color no es el mensaje. */
function MensajeError({ mensaje }: { mensaje?: string }) {
  if (!mensaje) return null;
  return (
    <span
      role="alert"
      className="text-[12px] leading-normal text-pretty"
      style={{ color: "var(--riesgo-alto-tinta)" }}
    >
      {mensaje}
    </span>
  );
}

function CampoOpciones({
  campo,
  valor,
  error,
  onElegir,
}: {
  campo: Campo;
  valor?: string;
  error?: string;
  onElegir: (v: string) => void;
}) {
  const marcados = campo.multi ? listaDe(valor) : [];

  return (
    <div className="flex flex-col gap-1.5" id={`campo-${campo.k}`}>
      <span className="etiqueta-tenue">
        {campo.etiqueta}
        {campo.obligatorio && <span aria-hidden> ·</span>}
      </span>
      {campo.ayuda && <span className="text-[12px] tenue">{campo.ayuda}</span>}
      <div className="flex flex-wrap gap-1.5">
        {campo.opciones!.map((o) => {
          const activo = campo.multi ? marcados.includes(o) || valor === o : valor === o;
          return (
            <button
              key={o}
              type="button"
              className="chip"
              aria-pressed={activo}
              style={error ? { borderColor: "var(--riesgo-alto)" } : undefined}
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
      <MensajeError mensaje={error} />
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
    <div className="vista-entra mx-auto flex w-full max-w-[520px] flex-col gap-5 overflow-y-auto px-6 py-14">
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
  const [errores, setErrores] = useState<Errores>({});
  const [paso, setPaso] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  /** Al corregir se limpia el error de ese campo: dejarlo rojo mientras escribe es castigarla. */
  const cambiar = (k: string, v: string) => {
    setR((prev) => ({ ...prev, [k]: v }));
    setErrores((prev) => {
      if (!prev[k]) return prev;
      const resto = { ...prev };
      delete resto[k];
      return resto;
    });
  };

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
  const textos = campos.filter((c) => c.tipo !== "opciones" && c.tipo !== "lista");
  const listas = campos.filter((c) => c.tipo === "lista");
  const opciones = campos.filter((c) => c.tipo === "opciones");
  const ultimo = paso === PASOS.length - 1;
  const contestados = Object.entries(r).filter(([, v]) => v);

  /**
   * Revisa los campos visibles del paso. Devuelve el primero con problema para poder llevarla
   * hasta ahí: un formulario que dice "hay un error" sin decir dónde es peor que no decir nada.
   */
  function revisar(indice: number): string | null {
    const nuevos: Errores = {};
    for (const c of PASOS[indice].campos) {
      if (c.si && !c.si(r)) continue;
      const v = (r[c.k] ?? "").trim();
      if (!v) {
        if (c.obligatorio) nuevos[c.k] = "Necesito este dato para poder acompañarte.";
        continue;
      }
      const malo = c.validar?.(v, r);
      if (malo) nuevos[c.k] = malo;
    }
    setErrores(nuevos);
    const primero = PASOS[indice].campos.find((c) => nuevos[c.k]);
    return primero?.k ?? null;
  }

  function irA(k: string) {
    const el = document.getElementById(`campo-${k}`);
    if (!el) return;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: quieto ? "auto" : "smooth", block: "center" });
    el.querySelector<HTMLElement>("input, select, button")?.focus({ preventScroll: true });
  }

  function avanzar() {
    const falla = revisar(paso);
    if (falla) return irA(falla);
    setPaso(paso + 1);
    scroller.current?.scrollTo({ top: 0 });
  }

  async function registrar() {
    // Los obligatorios viven en el paso 1, así que se revisa entero antes de mandar nada.
    for (let i = 0; i < PASOS.length; i++) {
      const falla = revisar(i);
      if (falla) {
        setPaso(i);
        setTimeout(() => irA(falla), 60);
        return;
      }
    }

    setEnviando(true);
    setError(null);

    const cronicas = listaDe(r.enfermedades_cronicas);
    const ficha: Partial<FichaExtendida> = {
      peso_kg: numero(r.peso_kg),
      talla_cm: numero(r.talla_cm),
      semanas_gestacion: numero(r.semanas_gestacion),
      horas_trabajo_parto: numero(r.horas_trabajo_parto),
      paridad: r.paridad ? PARIDAD[r.paridad] : null,
      fecha_ultima_regla: r.fecha_ultima_regla || null,
      enfermedades_embarazo: listaDe(r.enfermedades_embarazo),
      enfermedades_cronicas: cronicas,
      antecedentes_familiares: porComas(r.antecedentes_familiares),
      antecedentes_ginecologicos: porComas(r.antecedentes_ginecologicos),
      medicamentos_habituales: porComas(r.medicamentos_habituales),
      complicaciones_parto: porComas(r.complicaciones_parto),
      embarazo_multiple: r.embarazo_multiple ? r.embarazo_multiple.startsWith("Sí") : null,
      // "No sé" no es un no: queda sin responder, igual que un campo en blanco.
      uso_anestesia: r.anestesia?.startsWith("Sí") ? true : r.anestesia === "No" ? false : null,
      tipo_anestesia: r.anestesia?.startsWith("Sí") ? r.anestesia.split(" · ")[1] : null,
      episiotomia: siNo(r.episiotomia),
      apego_inmediato: siNo(r.apego_inmediato),
      fecha_inicio_lactancia: r.fecha_inicio_lactancia || null,
      tabaco: r.tabaco ? HABITO[r.tabaco] : null,
      alcohol: r.alcohol ? HABITO[r.alcohol] : null,
      drogas: r.drogas ? HABITO[r.drogas] : null,
      contacto_emergencia_nombre: r.contacto_emergencia_nombre || null,
      contacto_emergencia_relacion: r.contacto_emergencia_relacion || null,
      contacto_emergencia_telefono: r.contacto_emergencia_telefono || null,
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

  const conError = Object.keys(errores).length;

  return (
    <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto">
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
                <label
                  key={c.k}
                  id={`campo-${c.k}`}
                  className={`flex min-w-0 flex-col gap-1.5 ${c.comoLista || c.ayuda ? "sm:col-span-2" : ""}`}
                >
                  <span className="etiqueta-tenue">
                    {c.etiqueta}
                    {c.obligatorio && <span aria-hidden> ·</span>}
                  </span>
                  {c.ayuda && <span className="text-[12px] tenue">{c.ayuda}</span>}
                  <input
                    className="input"
                    name={c.k}
                    autoComplete="off"
                    spellCheck={false}
                    aria-invalid={!!errores[c.k]}
                    type={
                      c.tipo === "fecha"
                        ? "date"
                        : c.tipo === "numero"
                          ? "number"
                          : c.tipo === "telefono"
                            ? "tel"
                            : "text"
                    }
                    inputMode={c.tipo === "numero" ? "decimal" : undefined}
                    max={c.tipo === "fecha" ? HOY() : undefined}
                    placeholder={c.placeholder}
                    value={r[c.k] ?? ""}
                    onChange={(e) => cambiar(c.k, e.target.value)}
                    style={
                      errores[c.k]
                        ? { borderColor: "var(--riesgo-alto)", background: "var(--riesgo-alto-fondo)" }
                        : undefined
                    }
                  />
                  <MensajeError mensaje={errores[c.k]} />
                </label>
              ))}
            </div>
          )}

          {listas.map((c) => (
            <label
              key={c.k}
              id={`campo-${c.k}`}
              className="flex min-w-0 flex-col gap-1.5 sm:max-w-[380px]"
            >
              <span className="etiqueta-tenue">{c.etiqueta}</span>
              <select
                className="input select"
                name={c.k}
                value={r[c.k] ?? ""}
                onChange={(e) => cambiar(c.k, e.target.value)}
              >
                <option value="">Seleccionar región</option>
                {c.opciones!.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
          ))}

          {opciones.map((c) => (
            <CampoOpciones
              key={c.k}
              campo={c}
              valor={r[c.k]}
              error={errores[c.k]}
              onElegir={(v) => cambiar(c.k, v)}
            />
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
                  <dt className="etiqueta-tenue">{TODOS.find((c) => c.k === k)?.etiqueta ?? k}</dt>
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

        {conError > 0 && (
          <p
            role="status"
            className="text-[13px] leading-relaxed text-pretty"
            style={{ color: "var(--riesgo-alto-tinta)" }}
          >
            {conError === 1
              ? "Hay un dato que necesito que revises, está marcado más arriba."
              : `Hay ${conError} datos que necesito que revises, están marcados más arriba.`}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {ultimo ? (
            <button
              type="button"
              className="btn btn-primary"
              disabled={enviando}
              onClick={registrar}
            >
              {enviando ? "Guardando…" : "Empezar el acompañamiento →"}
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={avanzar}>
              Continuar →
            </button>
          )}

          {paso > 0 ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setErrores({});
                setPaso(paso - 1);
              }}
            >
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
              onClick={() => {
                setErrores({});
                setPaso(PASOS.length - 1);
              }}
            >
              Llenarla después
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
