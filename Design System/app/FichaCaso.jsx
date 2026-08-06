const { Tarjeta, Etiqueta, Franja42 } = window.MatriaDesignSystem_d05994;

const ETIQUETA_RIESGO = { alto: "Requiere escalamiento", medio: "Revisar hoy", bajo: "Seguimiento normal" };

function Dato({ etiqueta, valor }) {
  return (
    <div style={{ display: "flex", minWidth: 0, flexDirection: "column", gap: 2 }}>
      <dt className="etiqueta-tenue">{etiqueta}</dt>
      <dd className={valor ? "" : "tenue"} style={{ margin: 0, fontSize: 13.5, lineHeight: 1.35, overflowWrap: "break-word" }}>
        {valor || "No preguntado"}
      </dd>
    </div>
  );
}

/** Ficha del caso abierto: lo que el agente está ponderando, leído por la matrona. */
function Ficha({ caso }) {
  const campos = Object.entries(caso.ficha);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: 12, rowGap: 4 }}>
        <h2 className="titulo" style={{ margin: 0 }}>{caso.nombre}</h2>
        <span className="tabular suave" style={{ fontSize: 13 }}>día {caso.dia} de 42</span>
        <span style={{ marginLeft: "auto" }}><Etiqueta nivel={caso.nivel}>{ETIQUETA_RIESGO[caso.nivel]}</Etiqueta></span>
      </div>

      {caso.razonamiento && (
        <Tarjeta titulo="Última evaluación">
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, textWrap: "pretty" }}>{caso.razonamiento}</p>
          <p className="tabular tenue" style={{ margin: 0, fontSize: 12 }}>Día {caso.dia} · {ETIQUETA_RIESGO[caso.nivel]} · Protocolo {caso.cita}</p>
        </Tarjeta>
      )}

      <Tarjeta titulo="Franja del puerperio">
        <Franja42 franja={caso.franja} diaActual={caso.dia} />
      </Tarjeta>

      <Tarjeta>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: 10 }}>
          <h3 className="subtitulo" style={{ margin: 0 }}>{caso.nombre}</h3>
          <span className="tabular tenue" style={{ fontSize: 11 }} translate="no">{caso.codigo}</span>
          <span className="tabular tenue" style={{ marginLeft: "auto", fontSize: 11 }}>día {caso.dia} de 42</span>
        </div>
        <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 24, rowGap: 12, margin: 0 }}>
          <Dato etiqueta="Edad" valor={caso.edad ? `${caso.edad} años` : ""} />
          <Dato etiqueta="Tipo de parto" valor={caso.tipoParto} />
          <Dato etiqueta="Fecha del parto" valor={caso.fechaParto} />
          <Dato etiqueta="Establecimiento" valor={caso.establecimiento} />
          <Dato etiqueta="Región" valor={caso.region} />
          <Dato etiqueta="Ficha de ingreso" valor={campos.length ? "Completada" : ""} />
        </dl>
      </Tarjeta>

      {caso.factores.length > 0 && (
        <Tarjeta titulo="Factores que modifican el riesgo basal · §8" ayuda="No cambian la categoría del hallazgo: priorizan dentro de ella. Esto es lo que el agente pondera en cada mensaje.">
          <ul style={{ display: "flex", flexDirection: "column", gap: 6, listStyle: "none", margin: 0, padding: 0 }}>
            {caso.factores.map((n) => (
              <li key={n} style={{ borderLeft: "2px solid var(--color-border)", paddingLeft: 10, fontSize: 13, lineHeight: 1.6, textWrap: "pretty" }}>{n}</li>
            ))}
          </ul>
        </Tarjeta>
      )}

      {campos.length === 0 ? (
        <p className="tenue" style={{ margin: 0, borderRadius: "var(--radius-lg)", border: "1px dashed var(--color-border)", padding: 16, fontSize: 13, lineHeight: 1.6, textWrap: "pretty" }}>
          Sin ficha de ingreso. Esta puérpera viene de la cohorte sembrada y nadie la entrevistó: el agente la evalúa solo con la ficha básica.
        </p>
      ) : (
        <Tarjeta titulo="Ficha de ingreso">
          <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 24, rowGap: 12, margin: 0 }}>
            {campos.map(([k, v]) => <Dato key={k} etiqueta={k} valor={v} />)}
          </dl>
        </Tarjeta>
      )}
    </div>
  );
}

Object.assign(window, { Ficha, Dato });
