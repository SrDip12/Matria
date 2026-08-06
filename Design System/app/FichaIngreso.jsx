const { Campo, Chip, Boton, Tarjeta } = window.MatriaDesignSystem_d05994;

/**
 * Ficha de ingreso de la puérpera, en tres pasos. No es un cuestionario clínico: es el contexto
 * con el que el agente va a leer lo que ella cuente después.
 */
const PASOS = [
  {
    zona: "Paso 1 · Tu parto",
    titulo: "¿Cómo fue el parto?",
    ayuda: "Con esto el agente sabe en qué día del puerperio vas y qué mirar primero.",
    campos: [
      { k: "Edad", tipo: "texto", placeholder: "31" },
      { k: "Semanas de gestación", tipo: "texto", placeholder: "38" },
      { k: "Fecha del parto", tipo: "texto", placeholder: "05 ago 2026" },
      { k: "Trabajo de parto", tipo: "texto", placeholder: "6 h" },
      { k: "Tipo de parto", tipo: "opciones", opciones: ["vaginal", "cesárea"] },
      { k: "Anestesia", tipo: "opciones", opciones: ["Sí · raquídea", "Sí · epidural", "No"] },
    ],
  },
  {
    zona: "Paso 2 · Tu embarazo",
    titulo: "¿Cómo fue el embarazo?",
    ayuda: "Un antecedente del embarazo cambia la prioridad de una señal, no lo que significa.",
    campos: [
      { k: "Paridad", tipo: "opciones", opciones: ["Primer parto", "1 parto previo", "2 partos previos", "3 o más"] },
      { k: "Enfermedades del embarazo", tipo: "opciones", multi: true, opciones: ["Ninguna", "Síndrome hipertensivo del embarazo", "Diabetes gestacional", "Anemia"] },
      { k: "Tabaco", tipo: "opciones", opciones: ["No", "Ocasional", "Sí"] },
      { k: "IMC", tipo: "texto", placeholder: "29,4" },
    ],
  },
  {
    zona: "Paso 3 · Dónde te atendiste",
    titulo: "¿Dónde nació tu guagua?",
    ayuda: "Sirve para que tu matrona del CESFAM te ubique en su cohorte.",
    campos: [
      { k: "Establecimiento", tipo: "texto", placeholder: "Hospital San José" },
      { k: "Región", tipo: "opciones", opciones: ["Metropolitana", "Valparaíso", "Biobío", "Maule", "Araucanía", "Coquimbo", "Otra"] },
      { k: "Episiotomía", tipo: "opciones", opciones: ["Sí", "No", "No sé"] },
    ],
  },
];

function Avance({ paso }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", flex: 1, gap: 4 }}>
        {PASOS.map((_, i) => (
          <span key={i} aria-hidden style={{ height: 4, flex: 1, borderRadius: 1.5, background: i <= paso ? "var(--marca-500)" : "var(--color-linea)", transition: "background-color 120ms ease" }} />
        ))}
      </div>
      <span className="tabular tenue" style={{ fontSize: 11 }}>{paso + 1} de {PASOS.length}</span>
    </div>
  );
}

function CampoOpciones({ campo, valor, onElegir }) {
  const marcados = campo.multi ? String(valor || "").split(" · ").filter(Boolean) : [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span className="etiqueta-tenue">{campo.k}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {campo.opciones.map((o) => {
          const activo = campo.multi ? marcados.includes(o) : valor === o;
          return (
            <Chip key={o} activo={activo} onClick={() => {
              if (!campo.multi) return onElegir(activo ? "" : o);
              if (o === "Ninguna") return onElegir(activo ? "" : "Ninguna");
              const sin = marcados.filter((m) => m !== "Ninguna");
              onElegir((activo ? sin.filter((m) => m !== o) : [...sin, o]).join(" · "));
            }}>{o}</Chip>
          );
        })}
      </div>
    </div>
  );
}

function FichaIngreso({ nombre, respuestas, onCambiar, onTerminar, onVolverInicio }) {
  const [paso, setPaso] = React.useState(0);
  const actual = PASOS[paso];
  const textos = actual.campos.filter((c) => c.tipo === "texto");
  const opciones = actual.campos.filter((c) => c.tipo === "opciones");
  const contestados = Object.entries(respuestas).filter(([, v]) => v);
  const ultimo = paso === PASOS.length - 1;

  return (
    <div style={{ minHeight: 0, flex: 1, overflowY: "auto" }}>
      <div style={{ margin: "0 auto", display: "flex", width: "100%", maxWidth: 672, flexDirection: "column", gap: 20, padding: "28px 24px 40px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Avance paso={paso} />
          <p className="etiqueta" style={{ margin: 0 }}>{actual.zona}</p>
          <h1 className="titulo" style={{ margin: 0 }}>{actual.titulo}</h1>
          <p className="suave" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, textWrap: "pretty" }}>{actual.ayuda}</p>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
          {textos.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 16, rowGap: 12 }}>
              {textos.map((c) => (
                <Campo key={c.k} etiqueta={c.k} placeholder={c.placeholder} value={respuestas[c.k] || ""} onChange={(e) => onCambiar(c.k, e.target.value)} />
              ))}
            </div>
          )}
          {opciones.map((c) => (
            <CampoOpciones key={c.k} campo={c} valor={respuestas[c.k]} onElegir={(v) => onCambiar(c.k, v)} />
          ))}
          <p className="tenue" style={{ margin: 0, fontSize: 12, lineHeight: 1.6, textWrap: "pretty" }}>
            Lo que dejes en blanco tu matrona lo va a ver como "No preguntado". Puedes contestarlo más adelante desde tu ficha.
          </p>
        </div>

        {ultimo && (
          <Tarjeta titulo="Lo que va a ver tu matrona" ayuda={`${contestados.length} de ${PASOS.reduce((s, p) => s + p.campos.length, 0)} respuestas de tu ficha de ingreso.`}>
            <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 24, rowGap: 12, margin: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <dt className="etiqueta-tenue">Nombre</dt>
                <dd style={{ margin: 0, fontSize: 13.5, lineHeight: 1.35 }}>{nombre}</dd>
              </div>
              {contestados.map(([k, v]) => (
                <div key={k} style={{ display: "flex", minWidth: 0, flexDirection: "column", gap: 2 }}>
                  <dt className="etiqueta-tenue">{k}</dt>
                  <dd style={{ margin: 0, fontSize: 13.5, lineHeight: 1.35, overflowWrap: "break-word" }}>{v}</dd>
                </div>
              ))}
            </dl>
          </Tarjeta>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {ultimo
            ? <Boton variante="primary" onClick={onTerminar}>Empezar el acompañamiento →</Boton>
            : <Boton variante="primary" onClick={() => setPaso(paso + 1)}>Continuar →</Boton>}
          {paso > 0
            ? <Boton variante="ghost" onClick={() => setPaso(paso - 1)}>Volver al paso anterior</Boton>
            : <Boton variante="ghost" onClick={onVolverInicio}>Volver al inicio</Boton>}
          {!ultimo && <span style={{ marginLeft: "auto" }}><Boton variante="ghost" onClick={onTerminar}>Llenarla después</Boton></span>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FichaIngreso, PASOS_FICHA: PASOS });
