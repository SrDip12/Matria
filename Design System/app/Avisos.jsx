const { TarjetaAlerta, Tarjeta } = window.MatriaDesignSystem_d05994;

/**
 * Avisos de la puérpera: lo que el sistema hizo con lo que ella contó. Nunca aparece el nombre de
 * una sospecha ni un nivel de riesgo. A ella se le dice qué hacer, no qué tiene.
 */
const SENALES = [
  "Dolor de cabeza que no se te pasa, ver borroso o zumbido en los oídos",
  "Fiebre, o sentir que tienes fiebre aunque no la puedas medir",
  "Sangrado que aumenta en vez de ir bajando",
  "Loquios con mal olor",
  "Dolor fuerte en la guata o en la herida, o que la herida se ponga roja o supure",
  "Hinchazón o dolor en una sola pierna, o que te falte el aire",
  "Ganas de no seguir, o pensamientos de hacerte daño",
];

function Avisos({ caso }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ol style={{ display: "flex", flexDirection: "column", gap: 8, listStyle: "none", margin: 0, padding: 0 }} aria-live="polite">
        {caso.alertas.map((a) => {
          const esAlto = a.nivel === "alto";
          return (
            <li key={a.id}>
              <TarjetaAlerta nivel={a.nivel} encabezado={esAlto ? "Atención inmediata" : "Tu matrona ya sabe"} at={a.at}>
                <p className="subtitulo" style={{ margin: 0 }}>{esAlto ? "Anda a urgencias ahora" : "Te va a contactar hoy"}</p>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, textWrap: "pretty" }}>
                  {esAlto
                    ? "Por lo que contaste, esto no puede esperar. Tu matrona ya fue avisada y te va a llamar mientras tanto."
                    : "Le llegó lo que escribiste y va a revisar tu caso durante el día. Si algo cambia antes, escríbelo acá."}
                </p>
                <p className="tabular tenue" style={{ margin: 0, fontSize: 11 }}>Protocolo {a.cita}</p>
              </TarjetaAlerta>
            </li>
          );
        })}
        <li className="card" style={{ display: "flex", flexDirection: "column", gap: 6, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
            <h3 className="etiqueta" style={{ margin: 0 }}>Seguimiento</h3>
            <span className="tabular tenue" style={{ flexShrink: 0, fontSize: 11 }}>hace {caso.dia} d</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--color-titulo)" }}>Vas en el día {caso.dia} de 42</p>
          <p className="suave" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, textWrap: "pretty" }}>
            Te vamos a acompañar los 42 días posteriores al parto del {caso.fechaParto}.
          </p>
        </li>
      </ol>

      <Tarjeta titulo="Escríbelo apenas lo notes" ayuda="No esperes a que te toque la pregunta del día. Si te pasa algo de esto, cuéntalo en el chat: tu matrona lo ve al momento.">
        <ul style={{ display: "flex", flexDirection: "column", gap: 6, listStyle: "none", margin: 0, padding: 0 }}>
          {SENALES.map((s) => (
            <li key={s} style={{ borderLeft: "2px solid var(--marca-200)", paddingLeft: 10, fontSize: 13, lineHeight: 1.6, textWrap: "pretty" }}>{s}</li>
          ))}
        </ul>
        <p className="tabular tenue" style={{ margin: 0, fontSize: 11 }}>Protocolo §2 y §3</p>
      </Tarjeta>
    </div>
  );
}

Object.assign(window, { Avisos });
