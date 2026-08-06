"use client";

import { useMemo } from "react";
import { TarjetaAlerta } from "@/components/TarjetaAlerta";
import { haceCuanto, partirEtiqueta } from "@/lib/formato";
import { DIAS_SILENCIO, diasSinContacto, metricas, porcentaje } from "@/lib/metricas";
import { ENCABEZADO_ALERTA, ETIQUETA_ACCION, NIVEL_COLOR, TONO_RIESGO } from "@/lib/riesgo";
import {
  DIAS_PUERPERIO,
  ETIQUETA_SOSPECHA,
  type FilaPanel,
  type NivelRiesgo,
  type Sospecha,
} from "@/lib/types";

/**
 * Lo que la matrona mira a las ocho de la mañana antes de abrir un caso: cuánto hay en cola,
 * qué lleva más rato esperando, quién dejó de escribir y en qué días del puerperio se está
 * complicando la cohorte.
 *
 * No hay ninguna consulta nueva detrás: todo se deriva de las filas que el panel ya trae en
 * cada poll (`src/lib/metricas.ts`), así que estas cifras y la lista nunca se contradicen.
 *
 * Tres cifras grandes arriba y cuatro razones de contexto abajo. La jerarquía es del tamaño:
 * lo que decide a quién llamar primero se lee de lejos, el resto se consulta.
 */

interface DashboardMatronaProps {
  filas: FilaPanel[];
  onAbrirCaso: (puerperaId: string) => void;
}

const NIVELES: NivelRiesgo[] = ["alto", "medio", "bajo"];

function Tarjeta({
  titulo,
  ayuda,
  children,
}: {
  titulo: string;
  ayuda?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card flex flex-col gap-3 p-4">
      <div className="flex flex-col gap-1">
        <h3 className="etiqueta">{titulo}</h3>
        {ayuda && <p className="text-xs leading-relaxed text-pretty tenue">{ayuda}</p>}
      </div>
      {children}
    </section>
  );
}

/** Cifra grande. Toma el color del riesgo solo cuando la cifra misma comunica riesgo. */
function CifraGrande({
  valor,
  unidad,
  etiqueta,
  nota,
  color,
}: {
  valor: number | string;
  unidad?: string;
  etiqueta: string;
  nota?: string;
  color?: string;
}) {
  return (
    <div className="card flex min-w-0 flex-col gap-1.5 p-4">
      <h3 className="etiqueta">{etiqueta}</h3>
      <p className="flex items-baseline gap-1">
        <span className="cifra" style={color ? { color } : undefined}>
          {valor}
        </span>
        {unidad && <span className="text-base font-medium suave">{unidad}</span>}
      </p>
      {nota && <p className="tabular text-xs tenue">{nota}</p>}
    </div>
  );
}

/** Cifra de contexto. Misma información, un peso visual menos. */
function CifraChica({
  valor,
  unidad,
  etiqueta,
  nota,
}: {
  valor: number | string;
  unidad?: string;
  etiqueta: string;
  nota?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 px-4 py-3">
      <p className="flex items-baseline gap-1">
        <span className="tabular text-xl font-medium" style={{ color: "var(--color-titulo)" }}>
          {valor}
        </span>
        {unidad && <span className="text-xs font-medium suave">{unidad}</span>}
      </p>
      <p className="text-xs leading-snug text-pretty suave">{etiqueta}</p>
      {nota && <p className="tabular text-[11px] tenue">{nota}</p>}
    </div>
  );
}

/** Reparto de la cohorte por nivel, en una sola barra. Es una proporción, no una serie. */
function BarraRiesgo({ porNivel, total }: { porNivel: Record<NivelRiesgo, number>; total: number }) {
  if (total === 0) return <p className="sin-datos">Sin puérperas en seguimiento.</p>;

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex h-2.5 gap-px overflow-hidden rounded-[var(--radius-pill)]"
        role="img"
        aria-label={NIVELES.map((n) => `${ETIQUETA_ACCION[n]}: ${porNivel[n]}`).join(". ")}
      >
        {NIVELES.map((nivel) =>
          porNivel[nivel] > 0 ? (
            <div
              key={nivel}
              style={{ background: NIVEL_COLOR[nivel], flexGrow: porNivel[nivel] }}
              title={`${ETIQUETA_ACCION[nivel]}: ${porNivel[nivel]}`}
            />
          ) : null
        )}
      </div>
      <ul className="flex flex-col gap-1.5">
        {NIVELES.map((nivel) => (
          <li key={nivel} className="flex items-baseline gap-2 text-[13px]">
            <span
              className="h-2 w-2 shrink-0 translate-y-[-1px] rounded-full"
              style={{ background: NIVEL_COLOR[nivel] }}
              aria-hidden
            />
            <span className="tabular w-8 font-medium" style={{ color: "var(--color-titulo)" }}>
              {porNivel[nivel]}
            </span>
            <span className="min-w-0 flex-1 truncate suave">{ETIQUETA_ACCION[nivel]}</span>
            <span className="tabular shrink-0 text-[11px] tenue">
              {porcentaje(porNivel[nivel], total)} %
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Señales activas de la cohorte, de la más repetida a la menos. Sospechas, nunca diagnósticos. */
function Senales({ sospechas }: { sospechas: { sospecha: Sospecha; total: number }[] }) {
  if (sospechas.length === 0)
    return <p className="sin-datos">Ninguna señal de alarma activa en este momento.</p>;

  const mayor = sospechas[0].total;

  return (
    <ul className="flex flex-col gap-2">
      {sospechas.slice(0, 6).map(({ sospecha, total }) => (
        <li key={sospecha} className="flex items-center gap-3 text-[13px]">
          <span className="w-40 shrink-0 truncate suave" title={ETIQUETA_SOSPECHA[sospecha]}>
            {ETIQUETA_SOSPECHA[sospecha]}
          </span>
          <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-[var(--radius-pill)]" style={{ background: "var(--color-linea)" }}>
            <span
              className="block h-full rounded-[var(--radius-pill)]"
              style={{
                width: `${Math.round((total / mayor) * 100)}%`,
                background: "var(--marca-600)",
              }}
            />
          </span>
          <span
            className="tabular w-6 shrink-0 text-right font-medium"
            style={{ color: "var(--color-titulo)" }}
          >
            {total}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * La franja de 42 días, pero de toda la cohorte: cuántas señales cayeron en cada día del
 * puerperio. Es el mismo elemento firma de la fila leído una escala más arriba — muestra en
 * qué tramo de la ventana se concentra el riesgo, que es la pregunta que la lista no responde.
 */
function FranjaCohorte({
  alertasPorDia,
  puerperasPorDia,
}: {
  alertasPorDia: { alto: number; medio: number }[];
  puerperasPorDia: number[];
}) {
  const mayor = Math.max(1, ...alertasPorDia.map((d) => d.alto + d.medio));
  const total = alertasPorDia.reduce((suma, d) => suma + d.alto + d.medio, 0);

  if (total === 0)
    return <p className="sin-datos">Todavía no hay señales registradas en la cohorte.</p>;

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex h-24 items-end gap-px border-b pb-px"
        style={{ borderColor: "var(--color-border)" }}
        role="img"
        aria-label={`Señales de alarma por día del puerperio: ${total} en total, repartidas en los ${DIAS_PUERPERIO} días.`}
      >
        {alertasPorDia.map((dia, indice) => {
          const suma = dia.alto + dia.medio;
          return (
            <div
              key={indice}
              className={`flex h-full min-w-0 flex-1 flex-col justify-end ${(indice + 1) % 7 === 0 && indice + 1 !== DIAS_PUERPERIO ? "mr-1.5" : ""}`}
              title={`Día ${indice + 1}: ${dia.alto} de riesgo alto, ${dia.medio} de riesgo medio · ${puerperasPorDia[indice]} puérperas hoy en este día`}
            >
              {dia.medio > 0 && (
                <div
                  className="rounded-t-[1.5px]"
                  style={{
                    height: `${(dia.medio / mayor) * 100}%`,
                    background: TONO_RIESGO.medio.punto,
                  }}
                />
              )}
              {dia.alto > 0 && (
                <div
                  className={dia.medio === 0 ? "rounded-t-[1.5px]" : ""}
                  style={{
                    height: `${(dia.alto / mayor) * 100}%`,
                    background: TONO_RIESGO.alto.punto,
                  }}
                />
              )}
              {suma === 0 && <div className="h-0.5" style={{ background: "var(--color-linea)" }} />}
            </div>
          );
        })}
      </div>
      <div className="tabular flex justify-between text-[10px] tenue" aria-hidden>
        <span>día 1</span>
        <span>semana 1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
        <span>día 42</span>
      </div>
    </div>
  );
}

/** Las primeras de la cola, con el motivo y lo que lleva esperando. Un clic abre el caso. */
function Cola({
  filas,
  onAbrirCaso,
}: {
  filas: FilaPanel[];
  onAbrirCaso: (puerperaId: string) => void;
}) {
  // Seis y no la cola entera: es lo que se llama antes del almuerzo. El resto vive en la lista.
  const conAlerta = filas.filter((fila) => fila.alertas_pendientes.length > 0).slice(0, 6);

  if (conAlerta.length === 0)
    return <p className="sin-datos">No hay alertas pendientes. La cola está al día.</p>;

  return (
    <ul className="grid gap-2 xl:grid-cols-2">
      {conAlerta.map((fila) => {
        const alerta = fila.alertas_pendientes[0];
        const [etiqueta, codigo] = partirEtiqueta(fila.puerpera.nombre);
        const restantes = fila.alertas_pendientes.length - 1;
        return (
          <li key={fila.puerpera.id}>
            <TarjetaAlerta
              nivel={alerta.nivel}
              encabezado={ENCABEZADO_ALERTA[alerta.nivel]}
              at={alerta.created_at}
            >
              <div className="flex flex-wrap items-baseline gap-x-2.5">
                <span className="subtitulo truncate">{etiqueta}</span>
                {codigo && (
                  <span className="tabular text-[11px] tenue" translate="no">
                    {codigo}
                  </span>
                )}
                <span className="tabular text-xs suave">día {fila.puerpera.dia_puerperio}</span>
              </div>
              <p className="text-[13.5px] font-medium text-pretty">{alerta.titulo}</p>
              <p className="text-[13px] leading-relaxed text-pretty suave">
                {alerta.accion_sugerida}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="tabular text-[11px] tenue">
                  Protocolo {alerta.cita_protocolo}
                  {restantes > 0 && ` · ${restantes} alerta${restantes > 1 ? "s" : ""} más`}
                </span>
                <button
                  type="button"
                  onClick={() => onAbrirCaso(fila.puerpera.id)}
                  className="btn btn-secondary ml-auto"
                >
                  Abrir el caso
                </button>
              </div>
            </TarjetaAlerta>
          </li>
        );
      })}
    </ul>
  );
}

export function DashboardMatrona({ filas, onAbrirCaso }: DashboardMatronaProps) {
  const m = useMemo(() => metricas(filas), [filas]);

  const silenciosas = useMemo(
    () =>
      filas
        .map((fila) => ({ fila, dias: diasSinContacto(fila) }))
        .filter(({ dias }) => dias === null || dias >= DIAS_SILENCIO)
        .sort((a, b) => (b.dias ?? 99) - (a.dias ?? 99))
        .slice(0, 5),
    [filas]
  );

  const cobertura = porcentaje(m.contactadasHoy, m.total);
  const fichas = porcentaje(m.fichasCompletas, m.total);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <CifraGrande
          etiqueta="En cola"
          valor={m.alertasPendientes}
          nota={`${m.alertasPorNivel.alto} para escalar · ${m.alertasPorNivel.medio} para revisar`}
          color={m.alertasPendientes > 0 ? TONO_RIESGO.alto.punto : undefined}
        />
        <CifraGrande
          etiqueta="Espera más larga"
          valor={m.esperaMasLarga ? haceCuanto(m.esperaMasLarga.creadaAt) : "—"}
          nota={
            m.esperaMasLarga
              ? partirEtiqueta(m.esperaMasLarga.fila.puerpera.nombre)[0]
              : "Nada sin resolver"
          }
        />
        <CifraGrande
          etiqueta="Riesgo alto"
          valor={m.porNivel.alto}
          nota={`de ${m.total} puérperas en seguimiento`}
          color={m.porNivel.alto > 0 ? TONO_RIESGO.alto.punto : undefined}
        />
      </div>

      <div
        className="card grid divide-y sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4"
        style={{ borderColor: "var(--color-border)" }}
      >
        <CifraChica
          valor={m.primeraSemana}
          etiqueta="En la primera semana"
          nota="días 1 a 7, el tramo más denso"
        />
        <CifraChica
          valor={m.sinContacto}
          etiqueta={`En silencio hace ${DIAS_SILENCIO} días o más`}
          nota="una ausencia también es señal"
        />
        <CifraChica
          valor={cobertura ?? "—"}
          unidad={cobertura === null ? undefined : "%"}
          etiqueta="Contactaron en su día de hoy"
          nota={`${m.contactadasHoy} de ${m.total}`}
        />
        <CifraChica
          valor={fichas ?? "—"}
          unidad={fichas === null ? undefined : "%"}
          etiqueta="Con ficha de ingreso completa"
          nota={`${m.fichasCompletas} de ${m.total}`}
        />
      </div>

      <Tarjeta
        titulo="Cola de hoy"
        ayuda="Ordenada por gravedad y, dentro de la gravedad, por lo que lleva más rato esperando."
      >
        <Cola filas={filas} onAbrirCaso={onAbrirCaso} />
      </Tarjeta>

      <div className="grid gap-3 xl:grid-cols-2">
        <Tarjeta titulo="Reparto por riesgo">
          <BarraRiesgo porNivel={m.porNivel} total={m.total} />
        </Tarjeta>

        <Tarjeta
          titulo="Dejaron de escribir"
          ayuda="Nadie sabe nada de ellas hace días. No es una alerta del agente: es una ausencia."
        >
          {silenciosas.length === 0 ? (
            <p className="sin-datos">Todas escribieron en los últimos {DIAS_SILENCIO} días.</p>
          ) : (
            <ul className="flex flex-col">
              {silenciosas.map(({ fila, dias }, indice) => {
                const [etiqueta, codigo] = partirEtiqueta(fila.puerpera.nombre);
                return (
                  <li
                    key={fila.puerpera.id}
                    className={indice > 0 ? "border-t" : ""}
                    style={indice > 0 ? { borderColor: "var(--color-linea)" } : undefined}
                  >
                    <button
                      type="button"
                      onClick={() => onAbrirCaso(fila.puerpera.id)}
                      className="flex w-full items-baseline gap-2.5 rounded-[var(--radius-sm)] py-2 text-left text-[13px] transition-colors hover:bg-[var(--color-hover)]"
                    >
                      <span className="min-w-0 flex-1 truncate font-medium">{etiqueta}</span>
                      {codigo && (
                        <span className="tabular shrink-0 text-[11px] tenue" translate="no">
                          {codigo}
                        </span>
                      )}
                      <span className="tabular shrink-0 text-xs suave">
                        día {fila.puerpera.dia_puerperio}
                      </span>
                      <span className="tabular w-28 shrink-0 text-right text-[11px] tenue">
                        {dias === null ? "nunca escribió" : `${dias} d en silencio`}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Tarjeta>
      </div>

      <Tarjeta
        titulo="Dónde se complica el puerperio"
        ayuda="Señales de alarma de toda la cohorte repartidas en los 42 días de la ventana."
      >
        <FranjaCohorte alertasPorDia={m.alertasPorDia} puerperasPorDia={m.puerperasPorDia} />
      </Tarjeta>

      <Tarjeta
        titulo="Señales activas"
        ayuda="Sospechas de la última evaluación de cada puérpera con riesgo vigente."
      >
        <Senales sospechas={m.sospechas} />
      </Tarjeta>
    </div>
  );
}
