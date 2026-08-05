"use client";

import { FilaPuerpera } from "@/components/FilaPuerpera";
import type { FilaPanel } from "@/lib/types";

interface PanelMatronaProps {
  filas: FilaPanel[];
  seleccionadaId: string | null;
  onSeleccionar: (puerperaId: string) => void;
  onResolverAlerta: (alertaId: string) => void;
}

export function PanelMatrona({ filas, seleccionadaId, onSeleccionar, onResolverAlerta }: PanelMatronaProps) {
  const pendientes = filas.reduce((total, fila) => total + fila.alertas_pendientes.length, 0);

  return (
    <section className="flex h-full flex-col gap-3 overflow-y-auto p-4">
      <h1 className="tabular text-lg font-medium">
        {filas.length} puérperas en seguimiento · {pendientes} pendientes
      </h1>
      <div className="flex flex-col gap-2">
        {filas.map((fila) => (
          <FilaPuerpera
            key={fila.puerpera.id}
            fila={fila}
            seleccionada={fila.puerpera.id === seleccionadaId}
            onSeleccionar={() => onSeleccionar(fila.puerpera.id)}
            onResolverAlerta={onResolverAlerta}
          />
        ))}
      </div>
    </section>
  );
}
