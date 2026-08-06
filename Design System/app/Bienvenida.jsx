const { LogoMatria, Boton, Campo } = window.MatriaDesignSystem_d05994;

/** Entrada de la demo: se elige el lado desde el que se va a mirar el mismo caso. */
function TarjetaVista({ zona, titulo, descripcion, detalle, onEntrar }) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10, padding: 20 }}>
      <p className="etiqueta" style={{ margin: 0 }}>{zona}</p>
      <h2 className="subtitulo" style={{ margin: 0 }}>{titulo}</h2>
      <p className="suave" style={{ margin: 0, flex: 1, fontSize: 13.5, lineHeight: 1.6, textWrap: "pretty" }}>{descripcion}</p>
      <ul style={{ display: "flex", flexDirection: "column", gap: 6, listStyle: "none", margin: 0, padding: 0 }}>
        {detalle.map((d) => (
          <li key={d} className="tenue" style={{ borderLeft: "2px solid var(--color-border)", paddingLeft: 10, fontSize: 12.5, lineHeight: 1.5, textWrap: "pretty" }}>{d}</li>
        ))}
      </ul>
      <div style={{ paddingTop: 4 }}><Boton variante="primary" onClick={onEntrar}>Entrar →</Boton></div>
    </div>
  );
}

function Bienvenida({ onElegir }) {
  return (
    <div style={{ display: "flex", minHeight: 0, flex: 1, flexDirection: "column", overflowY: "auto" }}>
      <div style={{ margin: "0 auto", display: "flex", width: "100%", maxWidth: 860, flexDirection: "column", gap: 28, padding: "56px 24px 40px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <LogoMatria fill="var(--marca-500)" size={44} />
          <h1 className="display" style={{ margin: 0 }}>Acompañamiento longitudinal del puerperio</h1>
          <p className="suave" style={{ margin: 0, maxWidth: 560, fontSize: 15, lineHeight: 1.6, textWrap: "pretty" }}>
            Los 42 días que el sistema de salud no mira. Matria sigue a la puérpera desde su teléfono, interpreta lo que ella cuenta y entrega al equipo clínico una cola priorizada.
          </p>
        </div>

        <div>
          <p className="etiqueta" style={{ margin: "0 0 12px" }}>Elige desde dónde mirar</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TarjetaVista
              zona="Seguimiento de la puérpera"
              titulo="Soy la puérpera"
              descripcion="Completas tu ficha de ingreso, empiezas a conversar con el agente y ves cómo has estado día a día."
              detalle={["Ficha de ingreso en tres pasos", "Chat con el agente", "Mis avisos y cómo he estado"]}
              onEntrar={() => onElegir("puerpera")}
            />
            <TarjetaVista
              zona="Panel de la matrona"
              titulo="Soy la matrona"
              descripcion="Partes en el resumen de tu cohorte y desde ahí entras a la ficha de cada puérpera y a su conversación."
              detalle={["Resumen de las 42 semanas de la cohorte", "Lista priorizada por gravedad", "Ficha del caso con su conversación"]}
              onEntrar={() => onElegir("matrona")}
            />
          </div>
        </div>

        <p className="tenue" style={{ margin: 0, fontSize: 12, lineHeight: 1.6, textWrap: "pretty" }}>
          Demo con datos sintéticos: ninguna puérpera de estas pantallas es real. El sistema no diagnostica: detecta, prioriza y escala al profesional.
        </p>
      </div>
    </div>
  );
}

/** Primer paso de la puérpera: solo su nombre, sin cuenta ni identificación. */
function Nombre({ valor, onCambiar, onContinuar, onVolver }) {
  return (
    <div style={{ margin: "0 auto", display: "flex", width: "100%", maxWidth: 520, flexDirection: "column", gap: 20, padding: "56px 24px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <p className="etiqueta" style={{ margin: 0 }}>Empecemos</p>
        <h1 className="titulo" style={{ margin: 0 }}>¿Cómo te llamas?</h1>
        <p className="suave" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, textWrap: "pretty" }}>
          Con tu nombre basta. No te vamos a pedir clave ni ningún dato para identificarte.
        </p>
      </div>
      <form style={{ display: "flex", flexDirection: "column", gap: 16 }} onSubmit={(e) => { e.preventDefault(); if (valor.trim()) onContinuar(); }}>
        <Campo etiqueta="Tu nombre" placeholder="Camila" value={valor} onChange={(e) => onCambiar(e.target.value)} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Boton type="submit" variante="primary" disabled={!valor.trim()}>Continuar →</Boton>
          <Boton variante="ghost" onClick={onVolver}>Volver al inicio</Boton>
        </div>
      </form>
    </div>
  );
}

Object.assign(window, { Bienvenida, Nombre });
