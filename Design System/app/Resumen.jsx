const { Cifra, Tarjeta, BarraRiesgo, TarjetaAlerta, Boton } = window.MatriaDesignSystem_d05994;

const ENCABEZADO = { alto: "Escalar ahora", medio: "Revisar hoy", bajo: "Seguimiento" };

/** Franja de la cohorte: las señales de todas repartidas en los 42 días de la ventana. */
function FranjaCohorte({ casos }) {
  const dias = Array.from({ length: 42 }, () => ({ alto: 0, medio: 0 }));
  casos.forEach((c) => c.franja.forEach((n, i) => { if (n === "alto" || n === "medio") dias[i][n] += 1; }));
  const mayor = Math.max(1, ...dias.map((d) => d.alto + d.medio));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", height: 96, alignItems: "flex-end", gap: 1, borderBottom: "1px solid var(--color-border)", paddingBottom: 1 }}>
        {dias.map((d, i) => (
          <div key={i} title={`Día ${i + 1}: ${d.alto} de riesgo alto, ${d.medio} de riesgo medio`}
            style={{ display: "flex", height: "100%", minWidth: 0, flex: 1, flexDirection: "column", justifyContent: "flex-end", marginRight: (i + 1) % 7 === 0 && i + 1 !== 42 ? 6 : 0 }}>
            {d.medio > 0 && <div style={{ height: `${(d.medio / mayor) * 100}%`, background: "var(--riesgo-medio)", borderRadius: "1.5px 1.5px 0 0" }} />}
            {d.alto > 0 && <div style={{ height: `${(d.alto / mayor) * 100}%`, background: "var(--riesgo-alto)" }} />}
            {d.alto + d.medio === 0 && <div style={{ height: 2, background: "var(--color-linea)" }} />}
          </div>
        ))}
      </div>
      <div className="tabular tenue" style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
        <span>día 1</span><span>semana 1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>día 42</span>
      </div>
    </div>
  );
}

function Resumen({ casos, onAbrirCaso }) {
  const porNivel = { alto: 0, medio: 0, bajo: 0 };
  casos.forEach((c) => { porNivel[c.nivel] += 1; });
  const conAlerta = casos.filter((c) => c.alertas.length > 0);
  const pendientes = conAlerta.reduce((s, c) => s + c.alertas.length, 0);
  const silenciosas = casos.filter((c) => c.silencio);
  const primeraSemana = casos.filter((c) => c.dia <= 7).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <Cifra etiqueta="En cola" valor={pendientes} nota={`${porNivel.alto} para escalar · ${porNivel.medio} para revisar`} color={pendientes > 0 ? "var(--riesgo-alto)" : undefined} />
        <Cifra etiqueta="Espera más larga" valor="2 h" nota="Mónica P." />
        <Cifra etiqueta="Riesgo alto" valor={porNivel.alto} nota={`de ${casos.length} puérperas en seguimiento`} color={porNivel.alto > 0 ? "var(--riesgo-alto)" : undefined} />
      </div>

      <div className="card" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
        <Cifra tamano="chica" valor={primeraSemana} etiqueta="En la primera semana" nota="días 1 a 7, el tramo más denso" />
        <Cifra tamano="chica" valor={silenciosas.length} etiqueta="En silencio hace 3 días o más" nota="una ausencia también es señal" />
        <Cifra tamano="chica" valor={38} unidad="%" etiqueta="Contactaron en su día de hoy" nota={`${Math.round(casos.length * 0.38)} de ${casos.length}`} />
        <Cifra tamano="chica" valor={57} unidad="%" etiqueta="Con ficha de ingreso completa" nota={`4 de ${casos.length}`} />
      </div>

      <Tarjeta titulo="Cola de hoy" ayuda="Ordenada por gravedad y, dentro de la gravedad, por lo que lleva más rato esperando.">
        <ul style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, listStyle: "none", margin: 0, padding: 0 }}>
          {conAlerta.map((c) => (
            <li key={c.id}>
              <TarjetaAlerta nivel={c.alertas[0].nivel} encabezado={ENCABEZADO[c.alertas[0].nivel]} at={c.alertas[0].at}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: 10 }}>
                  <span className="subtitulo">{c.nombre}</span>
                  <span className="tabular tenue" style={{ fontSize: 11 }} translate="no">{c.codigo}</span>
                  <span className="tabular suave" style={{ fontSize: 12 }}>día {c.dia}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, textWrap: "pretty" }}>{c.alertas[0].titulo}</p>
                <p className="suave" style={{ margin: 0, fontSize: 13, lineHeight: 1.6, textWrap: "pretty" }}>{c.alertas[0].accion}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 2 }}>
                  <span className="tabular tenue" style={{ fontSize: 11 }}>Protocolo {c.alertas[0].cita}</span>
                  <span style={{ marginLeft: "auto" }}><Boton variante="secondary" onClick={() => onAbrirCaso(c.id)}>Abrir el caso</Boton></span>
                </div>
              </TarjetaAlerta>
            </li>
          ))}
          {conAlerta.length === 0 && <li className="sin-datos" style={{ gridColumn: "1 / -1" }}>No hay alertas pendientes. La cola está al día.</li>}
        </ul>
      </Tarjeta>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Tarjeta titulo="Reparto por riesgo"><BarraRiesgo porNivel={porNivel} /></Tarjeta>
        <Tarjeta titulo="Dejaron de escribir" ayuda="Nadie sabe nada de ellas hace días. No es una alerta del agente: es una ausencia.">
          <ul style={{ display: "flex", flexDirection: "column", listStyle: "none", margin: 0, padding: 0 }}>
            {silenciosas.map((c, i) => (
              <li key={c.id} style={{ borderTop: i > 0 ? "1px solid var(--color-linea)" : "none" }}>
                <button type="button" onClick={() => onAbrirCaso(c.id)}
                  style={{ display: "flex", width: "100%", alignItems: "baseline", gap: 10, padding: "8px 0", textAlign: "left", background: "none", border: "none", fontSize: 13, color: "inherit", cursor: "pointer" }}>
                  <span style={{ flex: 1, minWidth: 0, fontWeight: 500 }}>{c.nombre}</span>
                  <span className="tabular tenue" style={{ fontSize: 11 }} translate="no">{c.codigo}</span>
                  <span className="tabular suave" style={{ fontSize: 12 }}>día {c.dia}</span>
                  <span className="tabular tenue" style={{ width: 112, textAlign: "right", fontSize: 11 }}>{c.silencio}</span>
                </button>
              </li>
            ))}
            {silenciosas.length === 0 && <li className="sin-datos">Todas escribieron en los últimos 3 días.</li>}
          </ul>
        </Tarjeta>
      </div>

      <Tarjeta titulo="Dónde se complica el puerperio" ayuda="Señales de alarma de toda la cohorte repartidas en los 42 días de la ventana.">
        <FranjaCohorte casos={casos} />
      </Tarjeta>
    </div>
  );
}

Object.assign(window, { Resumen, FranjaCohorte });
