const { Franja42, Etiqueta } = window.MatriaDesignSystem_d05994;

/**
 * El mismo dato que la matrona ve en el panel —la franja de 42 días— leído desde el otro lado.
 * No muestra el razonamiento de la evaluación: ese texto está escrito para la matrona.
 */
const ETIQUETA_SUYA = { bajo: "Sin señales de alarma", medio: "Señal para tu matrona", alto: "Señal urgente, avisada" };

function Evolucion({ caso }) {
  const conContacto = caso.franja.filter(Boolean).length;
  const conSenal = caso.franja.filter((n) => n === "medio" || n === "alto").length;
  const dias = caso.franja.map((nivel, i) => ({ dia: i + 1, nivel })).filter((d) => d.nivel).reverse();
  const suyos = caso.mensajes.filter((m) => m.de === "puerpera");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <section className="card" style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <h2 className="etiqueta" style={{ margin: 0 }}>Cómo has estado</h2>
          <span className="tabular tenue" style={{ fontSize: 12 }}>Día {caso.dia} de 42</span>
        </div>
        <Franja42 franja={caso.franja} diaActual={caso.dia} />
        <div className="suave" style={{ display: "flex", flexWrap: "wrap", columnGap: 20, rowGap: 4, fontSize: 12 }}>
          <span className="tabular"><span style={{ fontWeight: 500, color: "var(--color-titulo)" }}>{conContacto}</span> días en que me escribiste</span>
          <span className="tabular"><span style={{ fontWeight: 500, color: "var(--color-titulo)" }}>{conSenal}</span> con alguna señal para tu matrona</span>
        </div>
      </section>

      {dias.length === 0 ? (
        <p className="sin-datos" style={{ lineHeight: 1.6, textWrap: "pretty" }}>
          Todavía no hay días registrados. Cuéntame en el chat cómo estás y acá vas a ir viendo tu recorrido de estas semanas.
        </p>
      ) : (
        <ol style={{ display: "flex", flexDirection: "column", gap: 8, listStyle: "none", margin: 0, padding: 0 }}>
          {dias.map(({ dia, nivel }) => {
            const dicho = suyos.at(-1);
            return (
              <li key={dia} className="card" style={{ display: "flex", flexDirection: "column", gap: 8, padding: 14 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                  <span className="tabular" style={{ fontSize: 13.5, fontWeight: 500 }}>Día {dia}</span>
                  <span style={{ marginLeft: "auto" }}><Etiqueta nivel={nivel}>{ETIQUETA_SUYA[nivel]}</Etiqueta></span>
                </div>
                {dia === caso.dia && dicho && (
                  <p className="suave" style={{ margin: 0, fontSize: 13, lineHeight: 1.6, textWrap: "pretty" }}>“{dicho.texto}”</p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

Object.assign(window, { Evolucion });
