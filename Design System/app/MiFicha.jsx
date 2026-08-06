const { Tarjeta } = window.MatriaDesignSystem_d05994;

/** "Mi ficha": lo que el sistema sabe de ella, tal como lo lee su matrona. Sin los factores §8. */
function MiFicha({ caso }) {
  const campos = Object.entries(caso.ficha);
  const Dato = ({ etiqueta, valor }) => (
    <div style={{ display: "flex", minWidth: 0, flexDirection: "column", gap: 2 }}>
      <dt className="etiqueta-tenue">{etiqueta}</dt>
      <dd className={valor ? "" : "tenue"} style={{ margin: 0, fontSize: 13.5, lineHeight: 1.35 }}>{valor || "No preguntado"}</dd>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p className="tenue" style={{ margin: 0, fontSize: 12 }}>Lo que el sistema sabe de ti, tal como lo lee tu matrona.</p>
      <Tarjeta>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: 10 }}>
          <h3 className="subtitulo" style={{ margin: 0 }}>{caso.nombre}</h3>
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
      {campos.length === 0 ? (
        <p className="tenue" style={{ margin: 0, borderRadius: "var(--radius-lg)", border: "1px dashed var(--color-border)", padding: 16, fontSize: 13, lineHeight: 1.6 }}>
          Todavía no completaste la ficha de ingreso. Sin ella el acompañamiento funciona igual, pero con menos contexto de tu caso.
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

Object.assign(window, { MiFicha });
