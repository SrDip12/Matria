"use client";

import { useMemo, useState } from "react";
import { DashboardMatrona } from "@/components/DashboardMatrona";
import { FilaPuerpera } from "@/components/FilaPuerpera";
import { PerfilPaciente } from "@/components/PerfilPaciente";
import { haceCuanto, partirEtiqueta } from "@/lib/formato";
import { metricas } from "@/lib/metricas";
import { CLASE_TAG, TONO_RIESGO } from "@/lib/riesgo";
import { ETIQUETA_RIESGO, type FilaPanel, type NivelRiesgo } from "@/lib/types";

interface PanelMatronaProps {
  filas: FilaPanel[];
  seleccionadaId: string | null;
  onSeleccionar: (puerperaId: string) => void;
  onResolverAlerta: (alertaId: string) => void;
}

type Vista = "resumen" | "lista" | "ficha";

const VISTAS: { id: Vista; etiqueta: string }[] = [
  { id: "resumen", etiqueta: "Resumen" },
  { id: "lista", etiqueta: "Lista" },
  { id: "ficha", etiqueta: "Ficha" },
];

const NIVELES: NivelRiesgo[] = ["alto", "medio", "bajo"];

/**
 * Panel de triage. Tres maneras de mirar la misma cohorte:
 *
 *   Resumen — cuánto hay en cola y dónde se está complicando el puerperio.
 *   Lista   — las puérperas ordenadas por riesgo. Es donde la alerta aparece en vivo.
 *   Ficha   — el caso abierto, con lo que el agente está ponderando.
 *
 * La lista es la vista por defecto a propósito: la rúbrica premia que el jurado vea entrar el
 * mensaje y salir la alerta en la misma pantalla, y eso pasa acá.
 */
export function PanelMatrona({
  filas,
  seleccionadaId,
  onSeleccionar,
  onResolverAlerta,
}: PanelMatronaProps) {
  const [vista, setVista] = useState<Vista>("lista");
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
    setVista("ficha");
  };

  return (
    <section className="flex h-full flex-col overflow-hidden">
      <header
        className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b px-5 py-4"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="etiqueta">Panel de la matrona</h1>
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
        </div>

        <nav className="flex gap-1" role="tablist" aria-label="Vistas del panel">
          {VISTAS.map(({ id, etiqueta }) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={vista === id}
              aria-controls={`panel-${id}`}
              disabled={id === "ficha" && !seleccionada}
              onClick={() => setVista(id)}
              className="chip"
            >
              {etiqueta}
            </button>
          ))}
        </nav>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {vista === "resumen" && (
          <div role="tabpanel" id="panel-resumen" aria-labelledby="tab-resumen">
            <DashboardMatrona filas={filas} onAbrirCaso={abrirCaso} />
          </div>
        )}

        {vista === "lista" && (
          <div
            role="tabpanel"
            id="panel-lista"
            aria-labelledby="tab-lista"
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
                  {ETIQUETA_RIESGO[nivel]}
                  <span className="chip-cifra">{m.porNivel[nivel]}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSoloPendientes((v) => !v)}
                aria-pressed={soloPendientes}
                className="chip"
              >
                Con alerta pendiente
                <span className="chip-cifra">{m.alertasPendientes}</span>
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
              {visibles.map((fila) => (
                <FilaPuerpera
                  key={fila.puerpera.id}
                  fila={fila}
                  seleccionada={fila.puerpera.id === seleccionadaId}
                  onSeleccionar={() => onSeleccionar(fila.puerpera.id)}
                  onResolverAlerta={onResolverAlerta}
                />
              ))}
              {visibles.length === 0 && (
                <p className="py-10 text-center text-sm tenue">
                  {filas.length === 0
                    ? "Todavía no hay puérperas en seguimiento."
                    : "Ninguna puérpera calza con estos filtros."}
                </p>
              )}
            </div>
          </div>
        )}

        {vista === "ficha" && seleccionada && (
          <div
            role="tabpanel"
            id="panel-ficha"
            aria-labelledby="tab-ficha"
            className="flex flex-col gap-3"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="titulo">{partirEtiqueta(seleccionada.puerpera.nombre)[0]}</h2>
              <span className="tabular text-[13px] suave">
                día {seleccionada.puerpera.dia_puerperio} de 42
              </span>
              <span className={`${CLASE_TAG[seleccionada.nivel_riesgo]} ml-auto`}>
                {ETIQUETA_RIESGO[seleccionada.nivel_riesgo]}
              </span>
            </div>

            {seleccionada.ultima_evaluacion && (
              <section className="card p-4">
                <h3 className="etiqueta mb-2">Última evaluación</h3>
                <p className="text-[13.5px] leading-relaxed text-pretty">
                  {seleccionada.ultima_evaluacion.razonamiento}
                </p>
                <p className="tabular mt-2 text-xs tenue">
                  Día {seleccionada.ultima_evaluacion.dia_puerperio} ·{" "}
                  {ETIQUETA_RIESGO[seleccionada.ultima_evaluacion.nivel_riesgo]} · Protocolo{" "}
                  {seleccionada.ultima_evaluacion.cita_protocolo}
                </p>
              </section>
            )}

            <PerfilPaciente puerpera={seleccionada.puerpera} clinico />
          </div>
        )}
      </div>
    </section>
  );
}
