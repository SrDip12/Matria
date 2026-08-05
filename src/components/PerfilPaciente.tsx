"use client";

import { ETIQUETA_HABITO, imc, type Puerpera } from "@/lib/types";
import { factoresRiesgo, antecedentesRelevantes } from "@/lib/factores";

/**
 * Lee la ficha completa de una puérpera: la básica y todo el onboarding.
 *
 * Lo usan las dos vistas —"mi perfil" de la paciente y el resumen por paciente de la matrona—
 * porque son la misma información leída por dos personas distintas. `clinico` cambia lo que se
 * muestra: la matrona ve además los factores de §8 que el agente está ponderando.
 *
 * Un campo sin responder se muestra como "no preguntado", nunca como "no". Es la misma regla
 * que rige los hallazgos del agente y acá importa igual: la matrona no puede leer un blanco
 * como un descarte.
 */

const SIN_DATO = "No preguntado";

function Dato({ etiqueta, valor }: { etiqueta: string; valor: React.ReactNode }) {
  const vacio =
    valor === null || valor === undefined || valor === "" || (Array.isArray(valor) && !valor.length);
  return (
    <div className="flex flex-col gap-0.5 py-1">
      <span className="text-xs" style={{ color: "var(--color-text-suave)" }}>
        {etiqueta}
      </span>
      <span className="text-sm" style={vacio ? { color: "var(--color-text-suave)" } : undefined}>
        {vacio ? SIN_DATO : Array.isArray(valor) ? valor.join(", ") : valor}
      </span>
    </div>
  );
}

const siNo = (v: boolean | null) => (v === null ? null : v ? "Sí" : "No");

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-[var(--radius-md)] border p-3"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <h3 className="mb-1 text-sm font-medium">{titulo}</h3>
      <div className="grid gap-x-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function PerfilPaciente({
  puerpera,
  clinico = false,
}: {
  puerpera: Puerpera;
  clinico?: boolean;
}) {
  const f = puerpera.ficha_extendida;
  const indice = imc(f);
  const factores = clinico ? factoresRiesgo(puerpera) : [];
  const otros = clinico ? antecedentesRelevantes(puerpera) : [];

  return (
    <div className="flex flex-col gap-3">
      <Bloque titulo="Ficha básica">
        <Dato etiqueta="Nombre" valor={puerpera.nombre} />
        <Dato etiqueta="Edad" valor={`${puerpera.edad} años`} />
        <Dato etiqueta="Día de puerperio" valor={`Día ${puerpera.dia_puerperio} de 42`} />
        <Dato
          etiqueta="Tipo de parto"
          valor={puerpera.tipo_parto === "cesarea" ? "Cesárea" : "Vaginal"}
        />
        <Dato etiqueta="Fecha del parto" valor={puerpera.fecha_parto} />
        <Dato etiqueta="Establecimiento" valor={puerpera.establecimiento} />
      </Bloque>

      {!f ? (
        <p
          className="rounded-[var(--radius-md)] border border-dashed p-3 text-sm"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-suave)" }}
        >
          Sin ficha de ingreso. Esta puérpera viene de la cohorte sembrada y nadie la entrevistó:
          el agente la evalúa solo con la ficha básica.
        </p>
      ) : (
        <>
          {clinico && factores.length > 0 && (
            <section
              className="rounded-[var(--radius-md)] border p-3"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
            >
              <h3 className="mb-1 text-sm font-medium">
                Factores que modifican el riesgo basal (§8)
              </h3>
              <p className="mb-2 text-xs" style={{ color: "var(--color-text-suave)" }}>
                No cambian la categoría del hallazgo: priorizan dentro de ella. Esto es lo que el
                agente pondera en cada mensaje.
              </p>
              <ul className="flex flex-col gap-1">
                {factores.map((factor) => (
                  <li key={factor} className="text-sm">
                    · {factor}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Bloque titulo="Salud general">
            <Dato etiqueta="Peso" valor={f.peso_kg ? `${f.peso_kg} kg` : null} />
            <Dato etiqueta="Talla" valor={f.talla_cm ? `${f.talla_cm} cm` : null} />
            <Dato etiqueta="IMC" valor={indice} />
            <Dato etiqueta="Enfermedades crónicas" valor={f.enfermedades_cronicas} />
            <Dato etiqueta="Enfermedades del embarazo" valor={f.enfermedades_embarazo} />
            <Dato etiqueta="Antecedentes familiares" valor={f.antecedentes_familiares} />
            <Dato etiqueta="Medicamentos habituales" valor={f.medicamentos_habituales} />
          </Bloque>

          <Bloque titulo="Hábitos">
            <Dato etiqueta="Tabaco" valor={f.tabaco && ETIQUETA_HABITO[f.tabaco]} />
            <Dato etiqueta="Alcohol" valor={f.alcohol && ETIQUETA_HABITO[f.alcohol]} />
            <Dato etiqueta="Drogas" valor={f.drogas && ETIQUETA_HABITO[f.drogas]} />
          </Bloque>

          <Bloque titulo="Antecedentes ginecológicos">
            <Dato etiqueta="Antecedentes" valor={f.antecedentes_ginecologicos} />
            <Dato etiqueta="Fecha de última regla" valor={f.fecha_ultima_regla} />
            <Dato etiqueta="Partos previos" valor={f.paridad} />
          </Bloque>

          <Bloque titulo="El parto">
            <Dato etiqueta="Semanas de gestación" valor={f.semanas_gestacion} />
            <Dato
              etiqueta="Trabajo de parto"
              valor={f.horas_trabajo_parto !== null ? `${f.horas_trabajo_parto} h` : null}
            />
            <Dato etiqueta="Embarazo múltiple" valor={siNo(f.embarazo_multiple)} />
            <Dato etiqueta="Anestesia" valor={siNo(f.uso_anestesia)} />
            <Dato etiqueta="Tipo de anestesia" valor={f.tipo_anestesia} />
            <Dato etiqueta="Complicaciones" valor={f.complicaciones_parto} />
            {puerpera.tipo_parto === "vaginal" && (
              <Dato etiqueta="Episiotomía" valor={siNo(f.episiotomia)} />
            )}
            <Dato etiqueta="Apego inmediato" valor={siNo(f.apego_inmediato)} />
            <Dato etiqueta="Inicio de lactancia" valor={f.fecha_inicio_lactancia} />
          </Bloque>

          <Bloque titulo="Contacto de emergencia">
            <Dato etiqueta="Nombre" valor={f.contacto_emergencia_nombre} />
            <Dato etiqueta="Relación" valor={f.contacto_emergencia_relacion} />
            <Dato etiqueta="Teléfono" valor={f.contacto_emergencia_telefono} />
          </Bloque>

          {clinico && otros.length > 0 && (
            <Bloque titulo="Otros antecedentes que el agente considera">
              <div className="sm:col-span-2">
                <ul className="flex flex-col gap-1">
                  {otros.map((nota) => (
                    <li key={nota} className="text-sm">
                      · {nota}
                    </li>
                  ))}
                </ul>
              </div>
            </Bloque>
          )}
        </>
      )}
    </div>
  );
}
