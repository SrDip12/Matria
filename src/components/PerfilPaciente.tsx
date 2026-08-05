"use client";

import { fecha, ETIQUETA_PARTO, partirEtiqueta } from "@/lib/formato";
import { ETIQUETA_HABITO, imc, type Puerpera } from "@/lib/types";
import { factoresRiesgo, antecedentesRelevantes } from "@/lib/factores";

/**
 * Lee la ficha completa de una puérpera: la básica y todo el onboarding.
 *
 * Lo usan las dos vistas —"mi ficha" de la paciente y la ficha del caso de la matrona— porque
 * son la misma información leída por dos personas distintas. `clinico` cambia lo que se muestra:
 * la matrona ve además los factores de §8 que el agente está ponderando.
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
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="etiqueta-tenue">{etiqueta}</dt>
      <dd className={`text-[13.5px] leading-snug break-words text-pretty ${vacio ? "tenue" : ""}`}>
        {vacio ? SIN_DATO : Array.isArray(valor) ? valor.join(", ") : valor}
      </dd>
    </div>
  );
}

const siNo = (v: boolean | null) => (v === null ? null : v ? "Sí" : "No");

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="card p-4">
      <h3 className="etiqueta mb-3">{titulo}</h3>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

/** Lista de una línea por ítem. La usan los factores de §8 y los otros antecedentes. */
function Notas({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((nota) => (
        <li
          key={nota}
          className="border-l-2 pl-2.5 text-[13px] leading-relaxed text-pretty"
          style={{ borderColor: "var(--color-border)" }}
        >
          {nota}
        </li>
      ))}
    </ul>
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
  const [etiqueta, codigo] = partirEtiqueta(puerpera.nombre);

  return (
    <div className="flex flex-col gap-3">
      <section className="card p-4">
        <div className="mb-3 flex flex-wrap items-baseline gap-x-2.5">
          <h3 className="subtitulo truncate">{etiqueta}</h3>
          {codigo && (
            <span className="tabular text-[11px] tenue" translate="no">
              {codigo}
            </span>
          )}
          <span className="tabular ml-auto text-[11px] tenue">
            día {puerpera.dia_puerperio} de 42
          </span>
        </div>
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <Dato etiqueta="Edad" valor={`${puerpera.edad} años`} />
          <Dato
            etiqueta="Tipo de parto"
            valor={<span className="capitalize">{ETIQUETA_PARTO[puerpera.tipo_parto]}</span>}
          />
          <Dato etiqueta="Fecha del parto" valor={fecha(puerpera.fecha_parto)} />
          <Dato etiqueta="Establecimiento" valor={puerpera.establecimiento} />
          <Dato etiqueta="Región" valor={puerpera.region} />
          <Dato
            etiqueta="Ficha de ingreso"
            valor={f?.completada_at ? `Completada el ${fecha(f.completada_at)}` : null}
          />
        </dl>
      </section>

      {!f ? (
        <p
          className="rounded-[var(--radius-lg)] border border-dashed p-4 text-[13px] leading-relaxed text-pretty tenue"
          style={{ borderColor: "var(--color-border)" }}
        >
          Sin ficha de ingreso. Esta puérpera viene de la cohorte sembrada y nadie la entrevistó:
          el agente la evalúa solo con la ficha básica.
        </p>
      ) : (
        <>
          {clinico && factores.length > 0 && (
            <section className="card p-4">
              <h3 className="etiqueta">Factores que modifican el riesgo basal · §8</h3>
              <p className="mt-1.5 mb-3 text-xs leading-relaxed text-pretty tenue">
                No cambian la categoría del hallazgo: priorizan dentro de ella. Esto es lo que el
                agente pondera en cada mensaje.
              </p>
              <Notas items={factores} />
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
            <Dato etiqueta="Fecha de última regla" valor={fecha(f.fecha_ultima_regla)} />
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
            <Dato etiqueta="Inicio de lactancia" valor={fecha(f.fecha_inicio_lactancia)} />
          </Bloque>

          <Bloque titulo="Contacto de emergencia">
            <Dato etiqueta="Nombre" valor={f.contacto_emergencia_nombre} />
            <Dato etiqueta="Relación" valor={f.contacto_emergencia_relacion} />
            <Dato
              etiqueta="Teléfono"
              valor={
                f.contacto_emergencia_telefono ? (
                  <a
                    className="underline decoration-[var(--marca-200)] underline-offset-2 hover:decoration-[var(--marca-600)]"
                    href={`tel:${f.contacto_emergencia_telefono}`}
                  >
                    {f.contacto_emergencia_telefono}
                  </a>
                ) : null
              }
            />
          </Bloque>

          {clinico && otros.length > 0 && (
            <section className="card p-4">
              <h3 className="etiqueta mb-3">Otros antecedentes que el agente considera</h3>
              <Notas items={otros} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
