/**
 * Recorrido de la demo: pantalla de entrada → se elige lado. La puérpera pasa por su nombre y la
 * ficha de ingreso antes de conversar; la matrona entra al resumen de su cohorte.
 *
 * Maqueta: la evaluación del relato es simulada con un temporizador; el producto llama a Claude.
 */
const { ORDEN } = window.MATRIA;

const CAMPOS_PROPIOS = ["Edad", "Tipo de parto", "Fecha del parto", "Establecimiento", "Región"];

function evaluar(texto) {
  const t = texto.toLowerCase();
  const alto = ["fiebre", "afiebrada", "huele", "borroso", "cabeza", "no seguir", "dañ", "ahogo", "pierna"];
  const medio = ["sangr", "coágulo", "coagulo", "duele", "dolor", "pecho", "herida", "triste"];
  if (alto.some((p) => t.includes(p)))
    return { nivel: "alto", titulo: "Señal de alarma referida en el relato de hoy", accion: "Sugiere evaluación presencial dentro del día. Contactar ahora.", cita: "§2.1", razonamiento: "Hallazgos referidos por la puérpera compatibles con una señal de alarma de §2. Sugiere evaluación presencial dentro del día." };
  if (medio.some((p) => t.includes(p)))
    return { nivel: "medio", titulo: "Molestia referida que conviene revisar hoy", accion: "Revisar durante el día y reevaluar en 24 horas.", cita: "§3.2", razonamiento: "Molestia referida sin criterios de escalamiento inmediato. Sugiere revisar durante el día y reevaluar en 24 horas." };
  return null;
}

const responder = (senal) =>
  senal
    ? senal.nivel === "alto"
      ? "Le avisé a tu matrona ahora mismo. Te va a contactar hoy; si algo empeora, anda a urgencias."
      : "Ya quedó registrado y tu matrona lo va a revisar hoy. Si cambia algo antes, escríbelo acá."
    : "Gracias por contarme. Mañana te vuelvo a preguntar cómo van las dos.";

function aplicarRelato(caso, texto, hora) {
  const senal = evaluar(texto);
  const franja = [...caso.franja];
  franja[caso.dia - 1] = senal ? senal.nivel : "bajo";
  return {
    ...caso,
    franja,
    nivel: senal ? senal.nivel : caso.nivel,
    razonamiento: senal ? senal.razonamiento : caso.razonamiento,
    cita: senal ? senal.cita : caso.cita,
    silencio: undefined,
    mensajes: [...caso.mensajes, { de: "sistema", texto: responder(senal), hora }],
    alertas: senal
      ? [{ id: `n${Date.now()}`, nivel: senal.nivel, at: "recién", titulo: senal.titulo, accion: senal.accion, cita: senal.cita }, ...caso.alertas]
      : caso.alertas,
  };
}

function crearCaso(nombre, respuestas) {
  const ficha = {};
  Object.entries(respuestas).forEach(([k, v]) => { if (v && !CAMPOS_PROPIOS.includes(k)) ficha[k] = v; });
  return {
    id: "yo",
    nombre: nombre.trim(),
    codigo: "PM-244",
    edad: respuestas["Edad"] || "",
    tipoParto: respuestas["Tipo de parto"] || "",
    dia: 1,
    nivel: "bajo",
    region: respuestas["Región"] || "",
    establecimiento: respuestas["Establecimiento"] || "",
    fechaParto: respuestas["Fecha del parto"] || "",
    razonamiento: "",
    cita: "",
    franja: Array.from({ length: 42 }, () => null),
    alertas: [],
    mensajes: [],
    ficha,
    factores: [],
  };
}

const VISTA = {
  bienvenida: null,
  nombre: "Ficha de ingreso",
  ficha: "Ficha de ingreso",
  puerpera: "Seguimiento de la puérpera",
  matrona: "Panel de la matrona",
};

function Demo() {
  const [etapa, setEtapa] = React.useState("bienvenida");
  const [nombre, setNombre] = React.useState("");
  const [respuestas, setRespuestas] = React.useState({});
  const [miCaso, setMiCaso] = React.useState(null);
  const [casos, setCasos] = React.useState(window.MATRIA.COHORTE);
  const [seleccionadaId, setSeleccionadaId] = React.useState("camila");
  const [enviando, setEnviando] = React.useState(false);

  const elegir = (lado) => {
    if (lado === "matrona") return setEtapa("matrona");
    setEtapa(miCaso ? "puerpera" : "nombre");
  };

  const enviarMio = (texto) => {
    const hora = new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false });
    setMiCaso((c) => ({ ...c, mensajes: [...c.mensajes, { de: "puerpera", texto, hora }] }));
    setEnviando(true);
    setTimeout(() => { setMiCaso((c) => aplicarRelato(c, texto, hora)); setEnviando(false); }, 1400);
  };

  const enviarCaso = (texto) => {
    const hora = new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false });
    setCasos((prev) => prev.map((c) => (c.id === seleccionadaId ? { ...c, mensajes: [...c.mensajes, { de: "puerpera", texto, hora }] } : c)));
    setEnviando(true);
    setTimeout(() => {
      setCasos((prev) => prev.map((c) => (c.id === seleccionadaId ? aplicarRelato(c, texto, hora) : c)));
      setEnviando(false);
    }, 1400);
  };

  const resolver = (casoId, alertaId) =>
    setCasos((prev) => prev.map((c) => (c.id === casoId ? { ...c, alertas: c.alertas.filter((a) => a.id !== alertaId) } : c)));

  const ordenados = [...casos].sort((a, b) => ORDEN[a.nivel] - ORDEN[b.nivel] || b.alertas.length - a.alertas.length);

  return (
    <main style={{ display: "flex", height: "100%", flexDirection: "column" }}>
      <BarraSuperior vista={VISTA[etapa]} onCambiar={etapa === "bienvenida" ? null : () => setEtapa("bienvenida")} />

      {etapa === "bienvenida" && <Bienvenida onElegir={elegir} />}

      {etapa === "nombre" && (
        <Nombre valor={nombre} onCambiar={setNombre} onVolver={() => setEtapa("bienvenida")} onContinuar={() => setEtapa("ficha")} />
      )}

      {etapa === "ficha" && (
        <FichaIngreso
          nombre={nombre}
          respuestas={respuestas}
          onCambiar={(k, v) => setRespuestas((r) => ({ ...r, [k]: v }))}
          onVolverInicio={() => setEtapa("nombre")}
          onTerminar={() => { setMiCaso(crearCaso(nombre, respuestas)); setEtapa("puerpera"); }}
        />
      )}

      {etapa === "puerpera" && miCaso && <Puerpera caso={miCaso} enviando={enviando} onEnviar={enviarMio} />}

      {etapa === "matrona" && (
        <Matrona casos={ordenados} seleccionadaId={seleccionadaId} enviando={enviando}
          onSeleccionar={setSeleccionadaId} onResolver={resolver} onEnviar={enviarCaso} />
      )}
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
