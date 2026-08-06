const { Burbuja, Campo, Boton, Franja42 } = window.MatriaDesignSystem_d05994;

/** Un mensaje del hilo: la burbuja del sistema y la hora debajo, del lado de quien habló. */
function Mensaje({ mensaje }) {
  const suya = mensaje.de === "puerpera";
  return (
    <div className="msj" style={{ display: "flex", flexDirection: "column", alignItems: suya ? "flex-end" : "flex-start", gap: 3 }}>
      <div style={{ display: "flex", width: "100%", justifyContent: suya ? "flex-end" : "flex-start" }}>
        <Burbuja de={mensaje.de}>{mensaje.texto}</Burbuja>
      </div>
      {mensaje.hora && <span className="tabular tenue" style={{ padding: "0 4px", fontSize: 10.5 }}>{mensaje.hora}</span>}
    </div>
  );
}

/** Canal de la puérpera: aspecto de mensajería y no de formulario. */
function Hilo({ caso, mensajes, enviando, onEnviar, contexto = "matrona" }) {
  const [texto, setTexto] = React.useState("");
  const scroller = React.useRef(null);
  const mia = contexto === "mia";
  React.useEffect(() => {
    const c = scroller.current;
    if (c) c.scrollTop = c.scrollHeight;
  }, [mensajes.length, enviando, caso?.id]);

  const enviar = (valor) => {
    const limpio = (valor ?? texto).trim();
    if (!limpio || enviando) return;
    onEnviar(limpio);
    setTexto("");
  };

  if (!caso) return <div className="sin-datos" style={{ padding: 20 }}>Selecciona una puérpera del panel para ver su conversación.</div>;

  const nombrePila = caso.nombre.split(" ")[0];

  return (
    <section style={{ display: "flex", height: "100%", minHeight: 0, flexDirection: "column" }}>
      <header style={{ display: "flex", flexDirection: "column", gap: 4, padding: "16px 20px", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        <p className="etiqueta" style={{ margin: 0 }}>{mia ? "Tu conversación" : "Canal de la puérpera"}</p>
        {mia ? (
          <React.Fragment>
            <h2 style={{ margin: 0, display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: 10 }}>
              <span className="subtitulo">Cuéntame cómo estás</span>
              <span className="tabular suave" style={{ fontSize: 12, fontWeight: 400 }}>día {caso.dia} de 42</span>
            </h2>
            <div style={{ paddingTop: 8 }}><Franja42 franja={caso.franja} diaActual={caso.dia} /></div>
          </React.Fragment>
        ) : (
          <h2 style={{ margin: 0, display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: 10 }}>
            <span className="subtitulo">{caso.nombre}</span>
            <span className="tabular tenue" style={{ fontSize: 11 }} translate="no">{caso.codigo}</span>
            <span className="tabular suave" style={{ fontSize: 12, fontWeight: 400 }}>{caso.tipoParto} · {caso.edad} años · día {caso.dia} de 42</span>
          </h2>
        )}
      </header>

      <div ref={scroller} style={{ display: "flex", minHeight: 0, flex: 1, flexDirection: "column", overflowY: "auto", padding: "16px 20px" }}>
        <div style={{ display: "flex", marginTop: "auto", flexDirection: "column", gap: 10 }}>
          <p className="etiqueta-tenue" style={{ display: "flex", alignItems: "center", gap: 10, margin: 0 }}>
            <span aria-hidden style={{ height: 1, flex: 1, background: "var(--color-linea)" }} />
            Hoy
            <span aria-hidden style={{ height: 1, flex: 1, background: "var(--color-linea)" }} />
          </p>

          {mensajes.length === 0 && (
            <div className="msj" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Burbuja de="sistema">
                {mia
                  ? `Hola ${nombrePila}. Te voy a acompañar los 42 días después del parto y hoy es tu día ${caso.dia}. Cuéntame con tus palabras cómo estás: yo lo interpreto y lo que encuentre le llega a tu matrona.`
                  : "Todavía no hay mensajes en este canal. Cuando ella escriba, la evaluación aparece priorizada en el panel."}
              </Burbuja>
              {mia && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <span className="etiqueta-tenue">Puedes empezar por acá</span>
                  {window.MATRIA.SUGERENCIAS.map((s) => (
                    <button key={s} type="button" className="chip" style={{ borderRadius: "var(--radius-pill)", textAlign: "left", whiteSpace: "normal" }} onClick={() => enviar(s)}>{s}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          {mensajes.map((m, i) => <Mensaje key={i} mensaje={m} />)}

          {enviando && (
            <div className="msj" style={{ display: "flex", justifyContent: "flex-start" }}>
              <Burbuja de="sistema">
                <span className="tenue escribiendo" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  Leyendo lo que me contaste
                  <span aria-hidden style={{ display: "inline-flex", gap: 3 }}><b /><b /><b /></span>
                </span>
              </Burbuja>
            </div>
          )}
        </div>
      </div>

      <form
        style={{ display: "flex", flexDirection: "column", gap: 8, padding: "16px 20px", borderTop: "1px solid var(--color-border)", background: "var(--color-surface)" }}
        onSubmit={(e) => { e.preventDefault(); enviar(); }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <Campo placeholder="Cuéntame cómo estás hoy…" value={texto} onChange={(e) => setTexto(e.target.value)} />
          </div>
          <Boton type="submit" variante="primary" disabled={enviando || !texto.trim()}>{enviando ? "Evaluando…" : "Enviar"}</Boton>
        </div>
        {mia && (
          <p className="tenue" style={{ margin: 0, fontSize: 11.5, lineHeight: 1.5, textWrap: "pretty" }}>
            Escríbelo con tus palabras, no tienes que usar términos médicos. Si aparece una señal de alarma, tu matrona la ve al momento.
          </p>
        )}
      </form>
    </section>
  );
}

Object.assign(window, { Hilo, Mensaje });
