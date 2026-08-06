const { Chip, Campo, Boton, Etiqueta, FilaPuerpera, TarjetaAlerta } = window.MatriaDesignSystem_d05994;

/**
 * Lado de la matrona: parte en el resumen de la cohorte, sigue en la lista priorizada y termina en
 * la ficha de una puérpera con su conversación al lado. Una sola vista, sin rutas.
 */
const NIVELES = ["alto", "medio", "bajo"];
const ETIQUETA_RIESGO_M = { alto: "Requiere escalamiento", medio: "Revisar hoy", bajo: "Seguimiento normal" };
const ENCABEZADO_M = { alto: "Escalar ahora", medio: "Revisar hoy", bajo: "Seguimiento" };

function Lista({ casos, seleccionadaId, onAbrir, onResolver }) {
  const [niveles, setNiveles] = React.useState([]);
  const [soloPendientes, setSoloPendientes] = React.useState(false);
  const [busqueda, setBusqueda] = React.useState("");

  const pendientes = casos.reduce((s, c) => s + c.alertas.length, 0);
  const porNivel = { alto: 0, medio: 0, bajo: 0 };
  casos.forEach((c) => { porNivel[c.nivel] += 1; });

  const texto = busqueda.trim().toLowerCase();
  const visibles = casos.filter((c) => {
    if (niveles.length && !niveles.includes(c.nivel)) return false;
    if (soloPendientes && c.alertas.length === 0) return false;
    if (texto && !c.nombre.toLowerCase().includes(texto)) return false;
    return true;
  });
  const filtrando = niveles.length > 0 || soloPendientes || texto !== "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
        {NIVELES.map((n) => (
          <Chip key={n} activo={niveles.includes(n)} cifra={porNivel[n]}
            onClick={() => setNiveles((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]))}>
            {ETIQUETA_RIESGO_M[n]}
          </Chip>
        ))}
        <Chip activo={soloPendientes} cifra={pendientes} onClick={() => setSoloPendientes((v) => !v)}>Con alerta pendiente</Chip>
        <span style={{ marginLeft: "auto" }}>
          <Campo type="search" placeholder="Buscar por nombre…" ancho="208px" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </span>
      </div>

      {filtrando && (
        <p className="tabular tenue" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
          Mostrando {visibles.length} de {casos.length}
          <Boton variante="ghost" onClick={() => { setNiveles([]); setSoloPendientes(false); setBusqueda(""); }} style={{ padding: "2px 8px" }}>Quitar filtros</Boton>
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {visibles.map((c) => (
          <FilaPuerpera key={c.id} nombre={c.nombre} codigo={c.codigo} edad={c.edad} tipoParto={c.tipoParto} dia={c.dia}
            nivel={c.nivel} cita={c.cita} silencio={c.silencio}
            razonamiento={c.razonamiento || "Sin señales de alarma en las últimas 24 horas."}
            franja={c.franja} seleccionada={c.id === seleccionadaId} onSeleccionar={() => onAbrir(c.id)}>
            {c.alertas.map((a) => (
              <TarjetaAlerta key={a.id} nivel={a.nivel} encabezado={ENCABEZADO_M[a.nivel]} at={a.at}>
                <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, textWrap: "pretty" }}>{a.titulo}</p>
                <p className="suave" style={{ margin: 0, fontSize: 13, lineHeight: 1.6, textWrap: "pretty" }}>{a.accion}</p>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, paddingTop: 2 }}>
                  <span className="tabular tenue" style={{ fontSize: 11 }}>Protocolo {a.cita}</span>
                  <span style={{ display: "flex", marginLeft: "auto", gap: 6 }}>
                    <Boton variante="ghost" onClick={() => onResolver(c.id, a.id)}>Marcar resuelta</Boton>
                    <Boton variante="secondary" onClick={() => onAbrir(c.id)}>Abrir el caso</Boton>
                  </span>
                </div>
              </TarjetaAlerta>
            ))}
          </FilaPuerpera>
        ))}
        {visibles.length === 0 && <p className="tenue" style={{ padding: "40px 0", textAlign: "center", fontSize: 14 }}>Ninguna puérpera calza con estos filtros.</p>}
      </div>
    </div>
  );
}

/** Caso abierto: la conversación a la izquierda y la ficha a la derecha, sin cambiar de pantalla. */
function Caso({ caso, enviando, onEnviar, onResolver, onVolver }) {
  return (
    <section style={{ display: "flex", minHeight: 0, flex: 1, flexDirection: "column" }}>
      <header style={{ display: "flex", flexShrink: 0, flexWrap: "wrap", alignItems: "center", columnGap: 12, rowGap: 8, padding: "12px 20px", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        <Boton variante="ghost" onClick={onVolver}>← Volver a la lista</Boton>
        <span className="subtitulo">{caso.nombre}</span>
        <span className="tabular tenue" style={{ fontSize: 11 }} translate="no">{caso.codigo}</span>
        <span className="tabular suave" style={{ fontSize: 12 }}>día {caso.dia} de 42</span>
        <span style={{ marginLeft: "auto" }}><Etiqueta nivel={caso.nivel} punto>{ETIQUETA_RIESGO_M[caso.nivel]}</Etiqueta></span>
      </header>
      <div style={{ display: "flex", minHeight: 0, flex: 1 }}>
        <div style={{ width: "35%", minHeight: 0, borderRight: "1px solid var(--color-border)" }}>
          <Hilo caso={caso} mensajes={caso.mensajes} enviando={enviando} onEnviar={onEnviar} />
        </div>
        <div style={{ minHeight: 0, width: "65%", overflowY: "auto", padding: "16px 20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {caso.alertas.length > 0 && (
              <ul style={{ display: "flex", flexDirection: "column", gap: 8, listStyle: "none", margin: 0, padding: 0 }}>
                {caso.alertas.map((a) => (
                  <li key={a.id}>
                    <TarjetaAlerta nivel={a.nivel} encabezado={ENCABEZADO_M[a.nivel]} at={a.at}>
                      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, textWrap: "pretty" }}>{a.titulo}</p>
                      <p className="suave" style={{ margin: 0, fontSize: 13, lineHeight: 1.6, textWrap: "pretty" }}>{a.accion}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 2 }}>
                        <span className="tabular tenue" style={{ fontSize: 11 }}>Protocolo {a.cita}</span>
                        <span style={{ marginLeft: "auto" }}><Boton variante="secondary" onClick={() => onResolver(caso.id, a.id)}>Marcar como resuelta</Boton></span>
                      </div>
                    </TarjetaAlerta>
                  </li>
                ))}
              </ul>
            )}
            <Ficha caso={caso} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Matrona({ casos, seleccionadaId, enviando, onSeleccionar, onResolver, onEnviar }) {
  const [vista, setVista] = React.useState("resumen");
  const seleccionada = casos.find((c) => c.id === seleccionadaId) ?? null;
  const pendientes = casos.reduce((s, c) => s + c.alertas.length, 0);
  const abrir = (id) => { onSeleccionar(id); setVista("caso"); };

  if (vista === "caso" && seleccionada) {
    return <Caso caso={seleccionada} enviando={enviando} onEnviar={onEnviar} onResolver={onResolver} onVolver={() => setVista("pacientes")} />;
  }

  return (
    <section style={{ display: "flex", minHeight: 0, flex: 1, flexDirection: "column", overflow: "hidden" }}>
      <header style={{ display: "flex", flexShrink: 0, flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", columnGap: 24, rowGap: 12, padding: "16px 20px", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        <div style={{ display: "flex", minWidth: 0, flexDirection: "column", gap: 6 }}>
          <h1 className="etiqueta" style={{ margin: 0 }}>Panel de la matrona</h1>
          <p className="tabular" style={{ margin: 0, fontSize: 15, lineHeight: 1.35 }} aria-live="polite">
            <span style={{ fontWeight: 500, color: "var(--color-titulo)" }}>{casos.length}</span> <span className="suave">en seguimiento</span>
            <span className="tenue"> · </span>
            <span style={{ fontWeight: 500, color: pendientes > 0 ? "var(--riesgo-alto)" : "var(--color-titulo)" }}>{pendientes}</span>{" "}
            <span className="suave">{pendientes === 1 ? "alerta pendiente" : "alertas pendientes"}</span>
            <span className="tenue"> · </span>
            <span className="tenue" style={{ fontSize: 13 }}>la más antigua espera 2 h</span>
          </p>
        </div>
        <nav style={{ display: "flex", gap: 4 }} role="tablist" aria-label="Vistas del panel">
          <Chip comoPestana activo={vista === "resumen"} onClick={() => setVista("resumen")}>Resumen de la cohorte</Chip>
          <Chip comoPestana activo={vista === "pacientes"} cifra={casos.length} onClick={() => setVista("pacientes")}>Mis pacientes</Chip>
        </nav>
      </header>
      <div style={{ minHeight: 0, flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {vista === "resumen" && <Resumen casos={casos} onAbrirCaso={abrir} />}
        {vista === "pacientes" && <Lista casos={casos} seleccionadaId={seleccionadaId} onAbrir={abrir} onResolver={onResolver} />}
      </div>
    </section>
  );
}

Object.assign(window, { Matrona });
