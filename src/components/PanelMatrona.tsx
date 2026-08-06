"use client";

import { useMemo, useState } from "react";
import { DashboardMatrona } from "@/components/DashboardMatrona";
import { FilaPuerpera } from "@/components/FilaPuerpera";
import { Franja42 } from "@/components/Franja42";
import { IconoLista, IconoResumen, IconoVolver } from "@/components/Iconos";
import { PerfilPaciente } from "@/components/PerfilPaciente";
import { TarjetaAlerta } from "@/components/TarjetaAlerta";
import { haceCuanto, partirEtiqueta } from "@/lib/formato";
import { metricas } from "@/lib/metricas";
import { CLASE_TAG, ENCABEZADO_ALERTA, ETIQUETA_ACCION, TONO_RIESGO } from "@/lib/riesgo";
import { DIAS_PUERPERIO, type FilaPanel, type NivelRiesgo } from "@/lib/types";

interface PanelMatronaProps {
  filas: FilaPanel[];
  /** El primer poll todavía no vuelve. No es lo mismo que una cohorte vacía. */
  cargando: boolean;
  seleccionadaId: string | null;
  onSeleccionar: (puerperaId: string) => void;
  onResolverAlerta: (alertaId: string) => void;
  /**
   * El canal de la puérpera. Se monta solo dentro del caso abierto: en la cohorte de doscientas
   * no hay ninguna conversación que mirar todavía, y tenerla ahí a la izquierda le comía un
   * tercio de la pantalla a la lista sin decir nada.
   */
  conversacion: React.ReactNode;
}

type Vista = "resumen" | "pacientes";

const VISTAS: { id: Vista; etiqueta: string; Icono: typeof IconoResumen }[] = [
  { id: "resumen", etiqueta: "Resumen de la cohorte", Icono: IconoResumen },
  { id: "pacientes", etiqueta: "Mis pacientes", Icono: IconoLista },
];

const NIVELES: NivelRiesgo[] = ["alto", "medio", "bajo"];

/** La forma del resumen mientras la cohorte no llega: tres cifras y dos tarjetas. */
function ResumenEsqueleto() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="card flex flex-col gap-2 p-4"
            style={{ background: "var(--color-surface)" }}
          >
            <span className="esqueleto h-3 w-20" />
            <span className="esqueleto h-7 w-16" />
            <span className="esqueleto h-3 w-32" />
          </div>
        ))}
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="card flex flex-col gap-3 p-4">
          <span className="esqueleto h-3 w-28" />
          <span className="esqueleto h-3 w-full" />
          <span className="esqueleto h-20 w-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * La forma que va a tener la lista, mientras la cohorte no llega. Cinco filas: las que caben en
 * pantalla. Más sería prometer un largo que todavía no se sabe.
 */
function FilasEsqueleto() {
  return (
    <div className="flex flex-col gap-2" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <article
          key={i}
          className="flex gap-3 rounded-[var(--radius-lg)] border p-3"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <span className="esqueleto w-1 self-stretch" />
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <span className="esqueleto h-4 w-32" />
              <span className="esqueleto h-3 w-14" />
              <span className="esqueleto ml-auto h-5 w-16 rounded-[var(--radius-pill)]" />
            </div>
            <span className="esqueleto h-3 w-full" />
            <span className="esqueleto h-3" style={{ width: `${72 - i * 6}%` }} />
            <span className="esqueleto h-3 w-full" />
          </div>
        </article>
      ))}
    </div>
  );
}

/**
 * Panel de triage. Dos maneras de mirar la misma cohorte y una tercera pantalla que no es una
 * pestaña sino un destino:
 *
 *   Resumen de la cohorte — cuánto hay en cola y dónde se está complicando el puerperio.
 *   Mis pacientes         — las puérperas ordenadas por riesgo. Es donde la alerta aparece en vivo.
 *   El caso abierto       — la pantalla dividida: su conversación a la izquierda y lo que el
 *                           agente está ponderando a la derecha.
 *
 * El caso se abre encima de la lista y vuelve con "Volver a la lista": una ficha no es una manera
 * de mirar la cohorte, es haber salido de ella. La pantalla dividida vive ahí y solo ahí — es el
 * único momento en que hay una conversación concreta que mirar, y es donde el mensaje entra y la
 * alerta sale sin cambiar de contexto.
 */
export function PanelMatrona({
  filas,
  cargando,
  seleccionadaId,
  onSeleccionar,
  onResolverAlerta,
  conversacion,
}: PanelMatronaProps) {
  const [vista, setVista] = useState<Vista>("pacientes");
  const [caso, setCaso] = useState(false);
  const [niveles, setNiveles] = useState<Set<NivelRiesgo>>(new Set());
  const [soloPendientes, setSoloPendientes] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const m = useMemo(() => metricas(filas), [filas]);

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return filas.filter((fila) => {
      if (niveles.size && !niveles.has(fila.nivel_riesgo)) return false;
      if (soloPendientes && fila.alertas_pendientes.length === 0) return false;
      if (texto && !fila.puerpera.nombre.toLowerCase().includes(texto)) return false;
      return true;
    });
  }, [filas, niveles, soloPendientes, busqueda]);

  const seleccionada = filas.find((fila) => fila.puerpera.id === seleccionadaId) ?? null;
  const filtrando = niveles.size > 0 || soloPendientes || busqueda.trim() !== "";

  const alternar = (nivel: NivelRiesgo) =>
    setNiveles((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(nivel)) siguiente.delete(nivel);
      else siguiente.add(nivel);
      return siguiente;
    });

  const limpiar = () => {
    setNiveles(new Set());
    setSoloPendientes(false);
    setBusqueda("");
  };

  const abrirCaso = (puerperaId: string) => {
    onSeleccionar(puerperaId);
    setCaso(true);
  };

  if (caso && seleccionada) {
    return (
      <Caso
        fila={seleccionada}
        conversacion={conversacion}
        onResolverAlerta={onResolverAlerta}
        onVolver={() => setCaso(false)}
      />
    );
  }

  return (
    /* `flex-1 min-w-0`: es hijo de un flex y sin eso se encogía al ancho de su contenido — la
       lista terminaba a media pantalla y el resto quedaba en blanco a la derecha. */
    <section className="vista-entra flex h-full min-w-0 flex-1 flex-col overflow-hidden">
      <header
        className="flex shrink-0 flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b px-5 py-4"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="etiqueta">Panel de la matrona</h1>
          {cargando ? (
            <p className="flex items-center gap-2 text-[15px] leading-snug" aria-live="polite">
              <span className="esqueleto h-4 w-56" aria-hidden />
              <span className="sr-only">Cargando la cohorte</span>
            </p>
          ) : (
          <p className="tabular text-[15px] leading-snug" aria-live="polite">
            <span className="font-medium" style={{ color: "var(--color-titulo)" }}>
              {m.total}
            </span>{" "}
            <span className="suave">en seguimiento</span>
            <span className="tenue"> · </span>
            <span
              className="font-medium"
              style={{
                color: m.alertasPendientes > 0 ? TONO_RIESGO.alto.punto : "var(--color-titulo)",
              }}
            >
              {m.alertasPendientes}
            </span>{" "}
            <span className="suave">
              {m.alertasPendientes === 1 ? "alerta pendiente" : "alertas pendientes"}
            </span>
            {m.esperaMasLarga && (
              <>
                <span className="tenue"> · </span>
                <span className="text-[13px] tenue">
                  la más antigua espera {haceCuanto(m.esperaMasLarga.creadaAt)}
                </span>
              </>
            )}
          </p>
          )}
        </div>

        <nav className="flex gap-1" role="tablist" aria-label="Vistas del panel">
          {VISTAS.map(({ id, etiqueta, Icono }) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={vista === id}
              aria-controls={`panel-${id}`}
              onClick={() => setVista(id)}
              className="chip"
            >
              <Icono size={14} />
              {etiqueta}
              {id === "pacientes" && !cargando && <span className="chip-cifra">{m.total}</span>}
            </button>
          ))}
        </nav>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {vista === "resumen" && (
          <div role="tabpanel" id="panel-resumen" aria-labelledby="tab-resumen">
            {cargando && filas.length === 0 ? (
              <ResumenEsqueleto />
            ) : (
              <DashboardMatrona filas={filas} onAbrirCaso={abrirCaso} />
            )}
          </div>
        )}

        {vista === "pacientes" && (
          <div
            role="tabpanel"
            id="panel-pacientes"
            aria-labelledby="tab-pacientes"
            className="flex flex-col gap-3"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              {NIVELES.map((nivel) => (
                <button
                  key={nivel}
                  type="button"
                  onClick={() => alternar(nivel)}
                  aria-pressed={niveles.has(nivel)}
                  className="chip"
                >
                  {ETIQUETA_ACCION[nivel]}
                  {!cargando && <span className="chip-cifra">{m.porNivel[nivel]}</span>}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSoloPendientes((v) => !v)}
                aria-pressed={soloPendientes}
                className="chip"
              >
                Con alerta pendiente
                {!cargando && <span className="chip-cifra">{m.alertasPendientes}</span>}
              </button>

              <label className="ml-auto flex items-center gap-2">
                <span className="sr-only">Buscar puérpera por nombre</span>
                <input
                  type="search"
                  name="buscar-puerpera"
                  autoComplete="off"
                  spellCheck={false}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre…"
                  className="input w-52"
                />
              </label>
            </div>

            {filtrando && (
              <p className="tabular flex items-center gap-2 text-xs tenue">
                Mostrando {visibles.length} de {filas.length}
                <button type="button" onClick={limpiar} className="btn btn-ghost !px-2 !py-0.5">
                  Quitar filtros
                </button>
              </p>
            )}

            <div className="flex flex-col gap-2">
              {cargando && filas.length === 0 && <FilasEsqueleto />}

              {visibles.map((fila) => (
                <FilaPuerpera
                  key={fila.puerpera.id}
                  fila={fila}
                  seleccionada={fila.puerpera.id === seleccionadaId}
                  onAbrirCaso={() => abrirCaso(fila.puerpera.id)}
                  onResolverAlerta={onResolverAlerta}
                />
              ))}

              {!cargando && visibles.length === 0 && (
                <p className="py-10 text-center text-sm tenue">
                  {filas.length === 0
                    ? "Todavía no hay puérperas en seguimiento."
                    : "Ninguna puérpera calza con estos filtros."}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * El caso abierto: la pantalla dividida. Su conversación a la izquierda (35 %) y a la derecha
 * (65 %) lo que está pendiente, la última evaluación, la franja y la ficha completa.
 *
 * Es acá y no en la lista donde el jurado ve el recorrido entero sin cambiar de contexto: entra
 * el mensaje por la izquierda, el agente lo interpreta y la alerta sale a la derecha.
 */
function Caso({
  fila,
  conversacion,
  onResolverAlerta,
  onVolver,
}: {
  fila: FilaPanel;
  conversacion: React.ReactNode;
  onResolverAlerta: (alertaId: string) => void;
  onVolver: () => void;
}) {
  const { puerpera, ultima_evaluacion, alertas_pendientes, nivel_riesgo, franja } = fila;
  const [etiqueta, codigo] = partirEtiqueta(puerpera.nombre);

  return (
    <section className="vista-entra flex h-full min-w-0 flex-1 flex-col overflow-hidden">
      <header
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b px-5 py-3"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        {/* Secundario y no fantasma: es la única salida de esta pantalla y tiene que verse. */}
        <button type="button" onClick={onVolver} className="btn btn-secondary">
          <IconoVolver size={15} />
          Volver a la lista
        </button>
        <span className="subtitulo truncate">{etiqueta}</span>
        {codigo && (
          <span className="tabular text-[11px] tenue" translate="no">
            {codigo}
          </span>
        )}
        <span className="tabular text-xs suave">
          día {puerpera.dia_puerperio} de {DIAS_PUERPERIO}
        </span>
        <span className={`${CLASE_TAG[nivel_riesgo]} ml-auto`}>
          <span
            aria-hidden
            className="h-[7px] w-[7px] rounded-full"
            style={{ background: `var(--riesgo-${nivel_riesgo})` }}
          />
          {ETIQUETA_ACCION[nivel_riesgo]}
        </span>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Fondo plano y sin el motivo: el canal es lo que ella escribió, y una textura detrás de
            sus palabras las convierte en decoración. Es la única zona que se salva del patrón. */}
        <div
          className="min-h-0 w-[35%] border-r"
          style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
        >
          {conversacion}
        </div>

        <div className="min-h-0 w-[65%] overflow-y-auto px-5 py-4">
        <div className="flex flex-col gap-3">
          {alertas_pendientes.length > 0 && (
            <ul className="flex flex-col gap-2">
              {alertas_pendientes.map((alerta) => (
                <li key={alerta.id} className="alerta-entra">
                  <TarjetaAlerta
                    nivel={alerta.nivel}
                    encabezado={ENCABEZADO_ALERTA[alerta.nivel]}
                    at={alerta.created_at}
                  >
                    <p className="text-[13.5px] font-medium text-pretty">{alerta.titulo}</p>
                    <p className="text-[13px] leading-relaxed text-pretty suave">
                      {alerta.accion_sugerida}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <span className="tabular text-[11px] tenue">
                        Protocolo {alerta.cita_protocolo}
                      </span>
                      <button
                        type="button"
                        onClick={() => onResolverAlerta(alerta.id)}
                        className="btn btn-secondary ml-auto"
                        aria-label={`Marcar como resuelta la alerta: ${alerta.titulo}`}
                      >
                        Marcar como resuelta
                      </button>
                    </div>
                  </TarjetaAlerta>
                </li>
              ))}
            </ul>
          )}

          {ultima_evaluacion && (
            <section className="card p-4">
              <h3 className="etiqueta mb-2">Última evaluación</h3>
              <p className="text-[13.5px] leading-relaxed text-pretty">
                {ultima_evaluacion.razonamiento}
              </p>
              <p className="tabular mt-2 text-xs tenue">
                Día {ultima_evaluacion.dia_puerperio} · {ETIQUETA_ACCION[ultima_evaluacion.nivel_riesgo]}{" "}
                · Protocolo {ultima_evaluacion.cita_protocolo}
              </p>
            </section>
          )}

          <section className="card flex flex-col gap-3 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="etiqueta">Franja del puerperio</h3>
              <span className="tabular text-xs suave">
                día {puerpera.dia_puerperio} de {DIAS_PUERPERIO}
              </span>
            </div>
            <Franja42 franja={franja} diaActual={puerpera.dia_puerperio} />
          </section>

          <PerfilPaciente puerpera={puerpera} clinico />
          </div>
        </div>
      </div>
    </section>
  );
}
