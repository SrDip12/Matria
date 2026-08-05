"use client";

import { useMemo, useState } from "react";
import { FilaPuerpera } from "@/components/FilaPuerpera";
import { PerfilPaciente } from "@/components/PerfilPaciente";
import { ETIQUETA_RIESGO, type FilaPanel, type NivelRiesgo } from "@/lib/types";

interface PanelMatronaProps {
  filas: FilaPanel[];
  seleccionadaId: string | null;
  onSeleccionar: (puerperaId: string) => void;
  onResolverAlerta: (alertaId: string) => void;
}

type Vista = "lista" | "resumen";

const NIVELES: NivelRiesgo[] = ["alto", "medio", "bajo"];

const claseChip = "rounded-[var(--radius-md)] border px-2.5 py-1 text-xs";

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

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return filas.filter((fila) => {
      if (niveles.size && !niveles.has(fila.nivel_riesgo)) return false;
      if (soloPendientes && fila.alertas_pendientes.length === 0) return false;
      if (texto && !fila.puerpera.nombre.toLowerCase().includes(texto)) return false;
      return true;
    });
  }, [filas, niveles, soloPendientes, busqueda]);

  const pendientes = filas.reduce((total, fila) => total + fila.alertas_pendientes.length, 0);
  const seleccionada = filas.find((fila) => fila.puerpera.id === seleccionadaId) ?? null;

  const alternar = (nivel: NivelRiesgo) =>
    setNiveles((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(nivel)) siguiente.delete(nivel);
      else siguiente.add(nivel);
      return siguiente;
    });

  const chip = (activo: boolean) => ({
    borderColor: activo ? "var(--marca-900)" : "var(--color-border)",
    background: activo ? "var(--marca-900)" : "transparent",
    color: activo ? "#ffffff" : "var(--color-text)",
  });

  return (
    <section className="flex h-full flex-col gap-3 overflow-y-auto p-4">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="tabular text-lg font-medium">
          {filas.length} puérperas en seguimiento · {pendientes} pendientes
        </h1>
        <nav className="ml-auto flex gap-1">
          {(["lista", "resumen"] as Vista[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVista(v)}
              disabled={v === "resumen" && !seleccionada}
              className={claseChip}
              style={chip(vista === v)}
            >
              {v === "lista" ? "Lista" : "Resumen"}
            </button>
          ))}
        </nav>
      </header>

      {vista === "lista" ? (
        <>
          <div className="flex flex-wrap items-center gap-1.5">
            {NIVELES.map((nivel) => (
              <button
                key={nivel}
                type="button"
                onClick={() => alternar(nivel)}
                className={claseChip}
                style={chip(niveles.has(nivel))}
              >
                {ETIQUETA_RIESGO[nivel]}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSoloPendientes((v) => !v)}
              className={claseChip}
              style={chip(soloPendientes)}
            >
              Con alerta pendiente
            </button>
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre"
              className="ml-auto rounded-[var(--radius-md)] border px-2.5 py-1 text-xs outline-none"
              style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
            />
          </div>

          {visibles.length !== filas.length && (
            <p className="text-xs" style={{ color: "var(--color-text-suave)" }}>
              Mostrando {visibles.length} de {filas.length}
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
              <p className="py-6 text-center text-sm" style={{ color: "var(--color-text-suave)" }}>
                Ninguna puérpera calza con estos filtros.
              </p>
            )}
          </div>
        </>
      ) : (
        seleccionada && (
          <>
            {seleccionada.ultima_evaluacion && (
              <section
                className="rounded-[var(--radius-md)] border p-3"
                style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
              >
                <h3 className="mb-1 text-sm font-medium">Última evaluación</h3>
                <p className="text-sm">{seleccionada.ultima_evaluacion.razonamiento}</p>
                <p className="mt-1 text-xs" style={{ color: "var(--color-text-suave)" }}>
                  Día {seleccionada.ultima_evaluacion.dia_puerperio} ·{" "}
                  {ETIQUETA_RIESGO[seleccionada.ultima_evaluacion.nivel_riesgo]} ·{" "}
                  {seleccionada.ultima_evaluacion.cita_protocolo}
                </p>
              </section>
            )}
            <PerfilPaciente puerpera={seleccionada.puerpera} clinico />
          </>
        )
      )}
    </section>
  );
}
