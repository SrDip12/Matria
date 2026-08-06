/* @ds-bundle: {"format":4,"namespace":"MatriaDesignSystem_d05994","components":[{"name":"Burbuja","sourcePath":"components/conversacion/Burbuja.jsx"},{"name":"Boton","sourcePath":"components/core/Boton.jsx"},{"name":"Campo","sourcePath":"components/core/Campo.jsx"},{"name":"Chip","sourcePath":"components/core/Chip.jsx"},{"name":"Etiqueta","sourcePath":"components/core/Etiqueta.jsx"},{"name":"LogoMatria","sourcePath":"components/core/LogoMatria.jsx"},{"name":"Tarjeta","sourcePath":"components/core/Tarjeta.jsx"},{"name":"BarraRiesgo","sourcePath":"components/panel/BarraRiesgo.jsx"},{"name":"Cifra","sourcePath":"components/panel/Cifra.jsx"},{"name":"FilaPuerpera","sourcePath":"components/panel/FilaPuerpera.jsx"},{"name":"Franja42","sourcePath":"components/panel/Franja42.jsx"},{"name":"TarjetaAlerta","sourcePath":"components/panel/TarjetaAlerta.jsx"}],"sourceHashes":{"components/conversacion/Burbuja.jsx":"3070b0341e83","components/core/Boton.jsx":"fb122f7a21fc","components/core/Campo.jsx":"471a202d3cd7","components/core/Chip.jsx":"12f0cdcf7c06","components/core/Etiqueta.jsx":"56a38c7bb8c5","components/core/LogoMatria.jsx":"3da9055e349b","components/core/Tarjeta.jsx":"7532b743229b","components/panel/BarraRiesgo.jsx":"d94568396e40","components/panel/Cifra.jsx":"9eedce082ad4","components/panel/FilaPuerpera.jsx":"476bfb260a7a","components/panel/Franja42.jsx":"2247e99fb5ed","components/panel/TarjetaAlerta.jsx":"0abf6dae018e","ui_kits/app_puerpera/Avisos.jsx":"967a6576d6c3","ui_kits/app_puerpera/Evolucion.jsx":"2d8f307c6780","ui_kits/app_puerpera/MiFicha.jsx":"e8b1c36ad3d6","ui_kits/app_puerpera/Seguimiento.jsx":"e6f6c57621d0","ui_kits/cohorte.js":"230c2c5ae57e","ui_kits/panel_matrona/Chrome.jsx":"e53cd6ed9048","ui_kits/panel_matrona/Ficha.jsx":"d44e5a4d19bf","ui_kits/panel_matrona/Hilo.jsx":"eaba9b2e818a","ui_kits/panel_matrona/Panel.jsx":"6811643db71c","ui_kits/panel_matrona/Pantalla.jsx":"89dfa9f3d8ce","ui_kits/panel_matrona/Resumen.jsx":"d453ee890999"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MatriaDesignSystem_d05994 = window.MatriaDesignSystem_d05994 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/conversacion/Burbuja.jsx
try { (() => {
/**
 * Burbuja del hilo. Ella en rojo 600, el acompañamiento sobre superficie blanca con borde: de un
 * vistazo se ve quién dijo qué. La ficha de ingreso usa la misma burbuja — si la ficha se ve
 * distinta al chat, la puérpera cree que son dos productos.
 */
function Burbuja({
  de = "sistema",
  title,
  children
}) {
  const suya = de === "puerpera";
  return /*#__PURE__*/React.createElement("div", {
    title: title,
    style: {
      maxWidth: "85%",
      alignSelf: suya ? "flex-end" : "flex-start",
      borderRadius: suya ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
      padding: "10px 14px",
      fontSize: 14,
      lineHeight: 1.6,
      textWrap: "pretty",
      overflowWrap: "break-word",
      background: suya ? "var(--marca-600)" : "var(--color-surface-alta)",
      color: suya ? "#ffffff" : "var(--color-text)",
      border: suya ? "none" : "1px solid var(--color-border)"
    }
  }, children);
}
Object.assign(__ds_scope, { Burbuja });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/conversacion/Burbuja.jsx", error: String((e && e.message) || e) }); }

// components/core/Boton.jsx
try { (() => {
const CLASE = {
  primary: "btn btn-primary",
  secondary: "btn btn-secondary",
  ghost: "btn btn-ghost"
};

/** Botón del panel. El primario es rojo 600; el secundario, contorno rosa; el fantasma, sin borde. */
function Boton({
  variante = "primary",
  type = "button",
  disabled,
  onClick,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    className: CLASE[variante] ?? CLASE.primary,
    disabled: disabled,
    onClick: onClick,
    style: style
  }, children);
}
Object.assign(__ds_scope, { Boton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Boton.jsx", error: String((e && e.message) || e) }); }

// components/core/Campo.jsx
try { (() => {
/** Campo de texto. La etiqueta va en versalitas tenues arriba; el placeholder nunca la reemplaza. */
function Campo({
  etiqueta,
  placeholder,
  value,
  onChange,
  type = "text",
  ancho,
  name
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      minWidth: 0,
      width: ancho
    }
  }, etiqueta && /*#__PURE__*/React.createElement("span", {
    className: "etiqueta-tenue"
  }, etiqueta), /*#__PURE__*/React.createElement("input", {
    className: "input",
    type: type,
    name: name,
    placeholder: placeholder,
    value: value,
    autoComplete: "off",
    onChange: onChange
  }));
}
Object.assign(__ds_scope, { Campo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Campo.jsx", error: String((e && e.message) || e) }); }

// components/core/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Chip de filtro y pestaña. El estado activo va en el atributo ARIA, no en una clase paralela:
 * así no hay manera de pintarlo activo y dejarlo mudo para un lector de pantalla.
 */
function Chip({
  activo = false,
  comoPestana = false,
  cifra,
  disabled,
  onClick,
  children
}) {
  const aria = comoPestana ? {
    role: "tab",
    "aria-selected": activo
  } : {
    "aria-pressed": activo
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: "chip",
    disabled: disabled,
    onClick: onClick
  }, aria), children, cifra !== undefined && cifra !== null && /*#__PURE__*/React.createElement("span", {
    className: "chip-cifra"
  }, cifra));
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Chip.jsx", error: String((e && e.message) || e) }); }

// components/core/Etiqueta.jsx
try { (() => {
const CLASE = {
  alto: "tag tag-alto",
  medio: "tag tag-medio",
  bajo: "tag tag-bajo"
};

/** Píldora. Con `nivel` toma el color del riesgo; sin nivel queda neutra. */
function Etiqueta({
  nivel,
  punto = false,
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: nivel ? CLASE[nivel] : "tag"
  }, punto && nivel && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: `var(--riesgo-${nivel})`
    }
  }), children);
}
Object.assign(__ds_scope, { Etiqueta });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Etiqueta.jsx", error: String((e && e.message) || e) }); }

// components/core/LogoMatria.jsx
try { (() => {
/** La silueta: mujer de perfil, guata, un punto adentro. Nunca rotada ni con contorno. */
function LogoMatria({
  fill = "var(--marca-500)",
  size = 32,
  punto
}) {
  const conPunto = punto !== undefined ? punto : size >= 32 ? "var(--color-surface)" : null;
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 120 120",
    fill: "none",
    "aria-hidden": true
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 58 34 C 68 40, 70 48, 66 56 C 82 60, 94 68, 92 82 C 90 98, 78 106, 66 108 L 42 108 C 34 86, 34 58, 44 36 Z",
    fill: fill
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "50",
    cy: "18",
    r: "12",
    fill: fill
  }), conPunto && /*#__PURE__*/React.createElement("circle", {
    cx: "76",
    cy: "80",
    r: "10",
    fill: conPunto
  }));
}
Object.assign(__ds_scope, { LogoMatria });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/LogoMatria.jsx", error: String((e && e.message) || e) }); }

// components/core/Tarjeta.jsx
try { (() => {
/** Superficie del sistema: borde de 1 px, radio 10, sin sombra. `alta` la lleva a blanco puro. */
function Tarjeta({
  alta = false,
  titulo,
  ayuda,
  padding = 16,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: alta ? "card-alta" : "card",
    style: {
      padding,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      ...style
    }
  }, (titulo || ayuda) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, titulo && /*#__PURE__*/React.createElement("h3", {
    className: "etiqueta",
    style: {
      margin: 0
    }
  }, titulo), ayuda && /*#__PURE__*/React.createElement("p", {
    className: "tenue",
    style: {
      margin: 0,
      fontSize: 12,
      lineHeight: 1.6
    }
  }, ayuda)), children);
}
Object.assign(__ds_scope, { Tarjeta });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tarjeta.jsx", error: String((e && e.message) || e) }); }

// components/panel/BarraRiesgo.jsx
try { (() => {
const NIVELES = ["alto", "medio", "bajo"];
const ETIQUETA = {
  alto: "Requiere escalamiento",
  medio: "Revisar hoy",
  bajo: "Seguimiento normal"
};

/** Reparto de la cohorte por nivel, en una sola barra. Es una proporción, no una serie. */
function BarraRiesgo({
  porNivel
}) {
  const total = NIVELES.reduce((s, n) => s + (porNivel[n] ?? 0), 0);
  if (total === 0) return /*#__PURE__*/React.createElement("p", {
    className: "sin-datos"
  }, "Sin pu\xE9rperas en seguimiento.");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: 10,
      gap: 1,
      overflow: "hidden",
      borderRadius: "var(--radius-pill)"
    },
    role: "img",
    "aria-label": NIVELES.map(n => `${ETIQUETA[n]}: ${porNivel[n] ?? 0}`).join(". ")
  }, NIVELES.filter(n => porNivel[n] > 0).map(n => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      background: `var(--riesgo-${n})`,
      flexGrow: porNivel[n]
    },
    title: `${ETIQUETA[n]}: ${porNivel[n]}`
  }))), /*#__PURE__*/React.createElement("ul", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      listStyle: "none",
      margin: 0,
      padding: 0
    }
  }, NIVELES.map(n => /*#__PURE__*/React.createElement("li", {
    key: n,
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 8,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      width: 8,
      height: 8,
      flexShrink: 0,
      borderRadius: "50%",
      background: `var(--riesgo-${n})`
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "tabular",
    style: {
      width: 32,
      fontWeight: 500,
      color: "var(--color-titulo)"
    }
  }, porNivel[n] ?? 0), /*#__PURE__*/React.createElement("span", {
    className: "suave",
    style: {
      flex: 1,
      minWidth: 0
    }
  }, ETIQUETA[n]), /*#__PURE__*/React.createElement("span", {
    className: "tabular tenue",
    style: {
      flexShrink: 0,
      fontSize: 11
    }
  }, Math.round((porNivel[n] ?? 0) / total * 100), " %")))));
}
Object.assign(__ds_scope, { BarraRiesgo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/panel/BarraRiesgo.jsx", error: String((e && e.message) || e) }); }

// components/panel/Cifra.jsx
try { (() => {
/** Cifra del resumen. `grande` va en tarjeta; `chica` es contexto y no lleva superficie propia. */
function Cifra({
  valor,
  unidad,
  etiqueta,
  nota,
  color,
  tamano = "grande"
}) {
  if (tamano === "chica") {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: "12px 16px",
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        display: "flex",
        alignItems: "baseline",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "tabular",
      style: {
        fontSize: 20,
        fontWeight: 500,
        color: "var(--color-titulo)"
      }
    }, valor), unidad && /*#__PURE__*/React.createElement("span", {
      className: "suave",
      style: {
        fontSize: 12,
        fontWeight: 500
      }
    }, unidad)), /*#__PURE__*/React.createElement("p", {
      className: "suave",
      style: {
        margin: 0,
        fontSize: 12,
        lineHeight: 1.35
      }
    }, etiqueta), nota && /*#__PURE__*/React.createElement("p", {
      className: "tabular tenue",
      style: {
        margin: 0,
        fontSize: 11
      }
    }, nota));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      padding: 16,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "etiqueta",
    style: {
      margin: 0
    }
  }, etiqueta), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      display: "flex",
      alignItems: "baseline",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "cifra",
    style: color ? {
      color
    } : undefined
  }, valor), unidad && /*#__PURE__*/React.createElement("span", {
    className: "suave",
    style: {
      fontSize: 16,
      fontWeight: 500
    }
  }, unidad)), nota && /*#__PURE__*/React.createElement("p", {
    className: "tabular tenue",
    style: {
      margin: 0,
      fontSize: 12
    }
  }, nota));
}
Object.assign(__ds_scope, { Cifra });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/panel/Cifra.jsx", error: String((e && e.message) || e) }); }

// components/panel/Franja42.jsx
try { (() => {
const DIAS = 42;

/**
 * Elemento firma: los 42 días del puerperio en una línea.
 *
 * Celda en color: hubo contacto y esa fue la señal más grave del día. Celda gris: el día pasó y
 * ella no escribió — una ausencia, no un "todo bien". Celda casi en blanco: el día no llega aún.
 * El corte de semana es un espacio, no una línea: la matrona razona en semanas.
 */
function Franja42({
  franja,
  diaActual
}) {
  const contactos = franja.filter(Boolean).length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 1
    },
    role: "img",
    "aria-label": `Franja del puerperio: día ${diaActual} de ${DIAS}, con ${contactos} días de contacto registrados.`
  }, franja.map((nivel, indice) => {
    const dia = indice + 1;
    const esActual = dia === diaActual;
    const futuro = dia > diaActual;
    return /*#__PURE__*/React.createElement("div", {
      key: dia,
      title: nivel ? `Día ${dia} — riesgo ${nivel}` : futuro ? `Día ${dia} — aún no llega` : `Día ${dia} — sin contacto`,
      style: {
        flex: 1,
        minWidth: 0,
        borderRadius: 1.5,
        height: esActual ? 16 : 12,
        outline: esActual ? "1px solid var(--marca-500)" : undefined,
        outlineOffset: esActual ? 1 : undefined,
        marginRight: dia % 7 === 0 && dia !== DIAS ? 6 : 0,
        background: nivel ? `var(--riesgo-${nivel})` : futuro ? "color-mix(in srgb, var(--color-linea) 55%, transparent)" : "var(--color-linea)"
      }
    });
  }));
}
Object.assign(__ds_scope, { Franja42 });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/panel/Franja42.jsx", error: String((e && e.message) || e) }); }

// components/panel/FilaPuerpera.jsx
try { (() => {
const ACCION = {
  alto: "Escalar",
  medio: "Revisar",
  bajo: "Normal"
};

/**
 * Una puérpera en el panel priorizado. Abre con el riel de riesgo de 4 px y cierra con la franja
 * de 42 días: el estado de ahora y la historia completa en la misma fila, sin abrir nada.
 */
function FilaPuerpera({
  nombre,
  codigo,
  edad,
  tipoParto,
  dia,
  nivel,
  razonamiento,
  cita,
  franja,
  silencio,
  seleccionada = false,
  onSeleccionar,
  children
}) {
  return /*#__PURE__*/React.createElement("article", {
    style: {
      display: "flex",
      overflow: "hidden",
      borderRadius: "var(--radius-lg)",
      border: "1px solid",
      transition: "background-color 120ms ease, border-color 120ms ease",
      borderColor: seleccionada ? "var(--marca-200)" : "var(--color-border)",
      background: seleccionada ? "var(--color-surface-alta)" : "var(--color-surface)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    className: "riel",
    style: {
      background: `var(--riesgo-${nivel})`,
      margin: "12px 0 12px 12px",
      alignSelf: "stretch"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      minWidth: 0,
      flex: 1,
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onSeleccionar,
    "aria-pressed": seleccionada,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      padding: 12,
      textAlign: "left",
      background: "none",
      border: "none",
      font: "inherit",
      color: "inherit",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "baseline",
      columnGap: 10,
      rowGap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "subtitulo"
  }, nombre), codigo && /*#__PURE__*/React.createElement("span", {
    className: "tabular tenue",
    style: {
      fontSize: 11
    },
    translate: "no"
  }, codigo), /*#__PURE__*/React.createElement("span", {
    className: "tabular suave",
    style: {
      fontSize: 12
    }
  }, edad, " a \xB7 ", tipoParto), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      display: "flex",
      flexShrink: 0,
      alignItems: "center",
      gap: 8
    }
  }, silencio && /*#__PURE__*/React.createElement("span", {
    className: "tabular tenue",
    style: {
      fontSize: 11
    }
  }, silencio), /*#__PURE__*/React.createElement(__ds_scope.Etiqueta, {
    nivel: nivel
  }, ACCION[nivel]))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 13.5,
      lineHeight: 1.6,
      textWrap: "pretty"
    }
  }, razonamiento, " ", cita && /*#__PURE__*/React.createElement("span", {
    className: "tabular tenue"
  }, cita)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Franja42, {
    franja: franja,
    diaActual: dia
  })), /*#__PURE__*/React.createElement("span", {
    className: "tabular tenue",
    style: {
      flexShrink: 0,
      fontSize: 11
    }
  }, "d\xEDa ", dia, " / 42"))), children && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      borderTop: "1px solid var(--color-linea)",
      padding: 12
    }
  }, children)));
}
Object.assign(__ds_scope, { FilaPuerpera });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/panel/FilaPuerpera.jsx", error: String((e && e.message) || e) }); }

// components/panel/TarjetaAlerta.jsx
try { (() => {
/**
 * Cabecera en el color del riesgo con la acción en versalitas y el tiempo de espera; cuerpo sobre
 * blanco. El riesgo medio usa la tinta oscura en vez del punto: el ámbar puro con texto blanco
 * queda bajo el contraste mínimo y esto se lee a un metro de distancia.
 */
function TarjetaAlerta({
  nivel,
  encabezado,
  at,
  children
}) {
  const fondo = nivel === "alto" ? `var(--riesgo-alto)` : `var(--riesgo-${nivel}-tinta)`;
  return /*#__PURE__*/React.createElement("div", {
    className: "card-alta",
    style: {
      overflow: "hidden",
      borderColor: `var(--riesgo-${nivel}-borde)`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "6px 12px",
      background: fondo
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "etiqueta",
    style: {
      color: "#ffffff",
      letterSpacing: "0.14em"
    }
  }, encabezado), /*#__PURE__*/React.createElement("span", {
    className: "tabular",
    style: {
      flexShrink: 0,
      fontSize: 11,
      color: "color-mix(in srgb, #ffffff 78%, transparent)"
    }
  }, "hace ", at)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      padding: 12
    }
  }, children));
}
Object.assign(__ds_scope, { TarjetaAlerta });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/panel/TarjetaAlerta.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app_puerpera/Avisos.jsx
try { (() => {
const {
  TarjetaAlerta,
  Tarjeta
} = window.MatriaDesignSystem_d05994;

/**
 * Avisos de la puérpera: lo que el sistema hizo con lo que ella contó. Nunca aparece el nombre de
 * una sospecha ni un nivel de riesgo. A ella se le dice qué hacer, no qué tiene.
 */
const SENALES = ["Dolor de cabeza que no se te pasa, ver borroso o zumbido en los oídos", "Fiebre, o sentir que tienes fiebre aunque no la puedas medir", "Sangrado que aumenta en vez de ir bajando", "Loquios con mal olor", "Dolor fuerte en la guata o en la herida, o que la herida se ponga roja o supure", "Hinchazón o dolor en una sola pierna, o que te falte el aire", "Ganas de no seguir, o pensamientos de hacerte daño"];
function Avisos({
  caso
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("ol", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      listStyle: "none",
      margin: 0,
      padding: 0
    },
    "aria-live": "polite"
  }, caso.alertas.map(a => {
    const esAlto = a.nivel === "alto";
    return /*#__PURE__*/React.createElement("li", {
      key: a.id
    }, /*#__PURE__*/React.createElement(TarjetaAlerta, {
      nivel: a.nivel,
      encabezado: esAlto ? "Atención inmediata" : "Tu matrona ya sabe",
      at: a.at
    }, /*#__PURE__*/React.createElement("p", {
      className: "subtitulo",
      style: {
        margin: 0
      }
    }, esAlto ? "Anda a urgencias ahora" : "Te va a contactar hoy"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 13.5,
        lineHeight: 1.6,
        textWrap: "pretty"
      }
    }, esAlto ? "Por lo que contaste, esto no puede esperar. Tu matrona ya fue avisada y te va a llamar mientras tanto." : "Le llegó lo que escribiste y va a revisar tu caso durante el día. Si algo cambia antes, escríbelo acá."), /*#__PURE__*/React.createElement("p", {
      className: "tabular tenue",
      style: {
        margin: 0,
        fontSize: 11
      }
    }, "Protocolo ", a.cita)));
  }), /*#__PURE__*/React.createElement("li", {
    className: "card",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "etiqueta",
    style: {
      margin: 0
    }
  }, "Seguimiento"), /*#__PURE__*/React.createElement("span", {
    className: "tabular tenue",
    style: {
      flexShrink: 0,
      fontSize: 11
    }
  }, "hace ", caso.dia, " d")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14,
      fontWeight: 500,
      color: "var(--color-titulo)"
    }
  }, "Vas en el d\xEDa ", caso.dia, " de 42"), /*#__PURE__*/React.createElement("p", {
    className: "suave",
    style: {
      margin: 0,
      fontSize: 13.5,
      lineHeight: 1.6,
      textWrap: "pretty"
    }
  }, "Te vamos a acompa\xF1ar los 42 d\xEDas posteriores al parto del ", caso.fechaParto, "."))), /*#__PURE__*/React.createElement(Tarjeta, {
    titulo: "Escr\xEDbelo apenas lo notes",
    ayuda: "No esperes a que te toque la pregunta del d\xEDa. Si te pasa algo de esto, cu\xE9ntalo en el chat: tu matrona lo ve al momento."
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      listStyle: "none",
      margin: 0,
      padding: 0
    }
  }, SENALES.map(s => /*#__PURE__*/React.createElement("li", {
    key: s,
    style: {
      borderLeft: "2px solid var(--marca-200)",
      paddingLeft: 10,
      fontSize: 13,
      lineHeight: 1.6,
      textWrap: "pretty"
    }
  }, s))), /*#__PURE__*/React.createElement("p", {
    className: "tabular tenue",
    style: {
      margin: 0,
      fontSize: 11
    }
  }, "Protocolo \xA72 y \xA73")));
}
Object.assign(window, {
  Avisos
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app_puerpera/Avisos.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app_puerpera/Evolucion.jsx
try { (() => {
const {
  Franja42,
  Etiqueta
} = window.MatriaDesignSystem_d05994;

/**
 * El mismo dato que la matrona ve en el panel —la franja de 42 días— leído desde el otro lado.
 * No muestra el razonamiento de la evaluación: ese texto está escrito para la matrona.
 */
const ETIQUETA_SUYA = {
  bajo: "Sin señales de alarma",
  medio: "Señal para tu matrona",
  alto: "Señal urgente, avisada"
};
function Evolucion({
  caso
}) {
  const conContacto = caso.franja.filter(Boolean).length;
  const conSenal = caso.franja.filter(n => n === "medio" || n === "alto").length;
  const dias = caso.franja.map((nivel, i) => ({
    dia: i + 1,
    nivel
  })).filter(d => d.nivel).reverse();
  const suyos = caso.mensajes.filter(m => m.de === "puerpera");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("section", {
    className: "card",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "etiqueta",
    style: {
      margin: 0
    }
  }, "C\xF3mo has estado"), /*#__PURE__*/React.createElement("span", {
    className: "tabular tenue",
    style: {
      fontSize: 12
    }
  }, "D\xEDa ", caso.dia, " de 42")), /*#__PURE__*/React.createElement(Franja42, {
    franja: caso.franja,
    diaActual: caso.dia
  }), /*#__PURE__*/React.createElement("div", {
    className: "suave",
    style: {
      display: "flex",
      flexWrap: "wrap",
      columnGap: 20,
      rowGap: 4,
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "tabular"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      color: "var(--color-titulo)"
    }
  }, conContacto), " d\xEDas en que me escribiste"), /*#__PURE__*/React.createElement("span", {
    className: "tabular"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      color: "var(--color-titulo)"
    }
  }, conSenal), " con alguna se\xF1al para tu matrona"))), dias.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "sin-datos",
    style: {
      lineHeight: 1.6,
      textWrap: "pretty"
    }
  }, "Todav\xEDa no hay d\xEDas registrados. Cu\xE9ntame en el chat c\xF3mo est\xE1s y ac\xE1 vas a ir viendo tu recorrido de estas semanas.") : /*#__PURE__*/React.createElement("ol", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      listStyle: "none",
      margin: 0,
      padding: 0
    }
  }, dias.map(({
    dia,
    nivel
  }) => {
    const dicho = suyos.at(-1);
    return /*#__PURE__*/React.createElement("li", {
      key: dia,
      className: "card",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "tabular",
      style: {
        fontSize: 13.5,
        fontWeight: 500
      }
    }, "D\xEDa ", dia), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: "auto"
      }
    }, /*#__PURE__*/React.createElement(Etiqueta, {
      nivel: nivel
    }, ETIQUETA_SUYA[nivel]))), dia === caso.dia && dicho && /*#__PURE__*/React.createElement("p", {
      className: "suave",
      style: {
        margin: 0,
        fontSize: 13,
        lineHeight: 1.6,
        textWrap: "pretty"
      }
    }, "\u201C", dicho.texto, "\u201D"));
  })));
}
Object.assign(window, {
  Evolucion
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app_puerpera/Evolucion.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app_puerpera/MiFicha.jsx
try { (() => {
const {
  Tarjeta
} = window.MatriaDesignSystem_d05994;

/** "Mi ficha": lo que el sistema sabe de ella, tal como lo lee su matrona. Sin los factores §8. */
function MiFicha({
  caso
}) {
  const campos = Object.entries(caso.ficha);
  const Dato = ({
    etiqueta,
    valor
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      minWidth: 0,
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("dt", {
    className: "etiqueta-tenue"
  }, etiqueta), /*#__PURE__*/React.createElement("dd", {
    className: valor ? "" : "tenue",
    style: {
      margin: 0,
      fontSize: 13.5,
      lineHeight: 1.35
    }
  }, valor || "No preguntado"));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "tenue",
    style: {
      margin: 0,
      fontSize: 12
    }
  }, "Lo que el sistema sabe de ti, tal como lo lee tu matrona."), /*#__PURE__*/React.createElement(Tarjeta, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "baseline",
      columnGap: 10
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "subtitulo",
    style: {
      margin: 0
    }
  }, caso.nombre), /*#__PURE__*/React.createElement("span", {
    className: "tabular tenue",
    style: {
      marginLeft: "auto",
      fontSize: 11
    }
  }, "d\xEDa ", caso.dia, " de 42")), /*#__PURE__*/React.createElement("dl", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      columnGap: 24,
      rowGap: 12,
      margin: 0
    }
  }, /*#__PURE__*/React.createElement(Dato, {
    etiqueta: "Edad",
    valor: `${caso.edad} años`
  }), /*#__PURE__*/React.createElement(Dato, {
    etiqueta: "Tipo de parto",
    valor: caso.tipoParto
  }), /*#__PURE__*/React.createElement(Dato, {
    etiqueta: "Fecha del parto",
    valor: caso.fechaParto
  }), /*#__PURE__*/React.createElement(Dato, {
    etiqueta: "Establecimiento",
    valor: caso.establecimiento
  }), /*#__PURE__*/React.createElement(Dato, {
    etiqueta: "Regi\xF3n",
    valor: caso.region
  }), /*#__PURE__*/React.createElement(Dato, {
    etiqueta: "Ficha de ingreso",
    valor: campos.length ? "Completada" : ""
  }))), campos.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "tenue",
    style: {
      margin: 0,
      borderRadius: "var(--radius-lg)",
      border: "1px dashed var(--color-border)",
      padding: 16,
      fontSize: 13,
      lineHeight: 1.6
    }
  }, "Todav\xEDa no completaste la ficha de ingreso. Sin ella el acompa\xF1amiento funciona igual, pero con menos contexto de tu caso.") : /*#__PURE__*/React.createElement(Tarjeta, {
    titulo: "Ficha de ingreso"
  }, /*#__PURE__*/React.createElement("dl", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      columnGap: 24,
      rowGap: 12,
      margin: 0
    }
  }, campos.map(([k, v]) => /*#__PURE__*/React.createElement(Dato, {
    key: k,
    etiqueta: k,
    valor: v
  })))));
}
Object.assign(window, {
  MiFicha
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app_puerpera/MiFicha.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app_puerpera/Seguimiento.jsx
try { (() => {
/**
 * Demo de la puérpera. Una cosa a la vez, en una columna centrada: ella abre esto con una guagua
 * en brazos y dos paneles simultáneos la sobrecargan. Las pestañas son su recorrido y el chat es
 * la que abre por defecto.
 */
const {
  Chip
} = window.MatriaDesignSystem_d05994;
const PESTANAS = [{
  id: "chat",
  etiqueta: "Chat"
}, {
  id: "avisos",
  etiqueta: "Mis avisos"
}, {
  id: "evolucion",
  etiqueta: "Cómo he estado"
}, {
  id: "perfil",
  etiqueta: "Mi ficha"
}];
function evaluarRelato(texto) {
  const t = texto.toLowerCase();
  if (["fiebre", "afiebrada", "huele", "borroso", "cabeza", "no seguir", "dañ", "pierna"].some(p => t.includes(p))) return {
    nivel: "alto",
    cita: "§2.1"
  };
  if (["sangr", "coágulo", "coagulo", "duele", "dolor", "pecho", "herida", "triste"].some(p => t.includes(p))) return {
    nivel: "medio",
    cita: "§3.2"
  };
  return null;
}
function AppPuerpera() {
  const [caso, setCaso] = React.useState(window.MATRIA.COHORTE[0]);
  const [pestana, setPestana] = React.useState("chat");
  const [enviando, setEnviando] = React.useState(false);
  const enviar = texto => {
    const hora = new Date().toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit"
    });
    setCaso(c => ({
      ...c,
      mensajes: [...c.mensajes, {
        de: "puerpera",
        texto,
        hora
      }]
    }));
    setEnviando(true);
    setTimeout(() => {
      const senal = evaluarRelato(texto);
      setCaso(c => {
        const franja = [...c.franja];
        franja[c.dia - 1] = senal ? senal.nivel : "bajo";
        const respuesta = senal ? senal.nivel === "alto" ? "Le avisé a tu matrona ahora mismo. Te va a contactar hoy; si algo empeora, anda a urgencias." : "Ya quedó registrado y tu matrona lo va a revisar hoy. Si cambia algo antes, escríbelo acá." : "Gracias por contarme. Mañana te vuelvo a preguntar cómo van las dos.";
        return {
          ...c,
          franja,
          nivel: senal ? senal.nivel : c.nivel,
          mensajes: [...c.mensajes, {
            de: "sistema",
            texto: respuesta,
            hora
          }],
          alertas: senal ? [{
            id: `n${Date.now()}`,
            nivel: senal.nivel,
            at: "recién",
            titulo: "",
            accion: "",
            cita: senal.cita
          }, ...c.alertas] : c.alertas
        };
      });
      setEnviando(false);
    }, 1400);
  };
  return /*#__PURE__*/React.createElement("main", {
    style: {
      display: "flex",
      height: "100%",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement(BarraSuperior, {
    vista: "Seguimiento de la pu\xE9rpera"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "0 auto",
      display: "flex",
      minHeight: 0,
      width: "100%",
      maxWidth: 672,
      flex: 1,
      flexDirection: "column",
      overflow: "hidden",
      background: "var(--color-bg)"
    }
  }, /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      flexShrink: 0,
      flexWrap: "wrap",
      gap: 4,
      padding: "12px 24px",
      borderBottom: "1px solid var(--color-border)",
      background: "var(--color-surface)"
    },
    role: "tablist",
    "aria-label": "Mi seguimiento"
  }, PESTANAS.map(({
    id,
    etiqueta
  }) => /*#__PURE__*/React.createElement(Chip, {
    key: id,
    comoPestana: true,
    activo: pestana === id,
    onClick: () => setPestana(id),
    cifra: id === "avisos" && caso.alertas.length > 0 ? caso.alertas.length : undefined
  }, etiqueta))), pestana === "chat" ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      minHeight: 0,
      flex: 1,
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement(Hilo, {
    caso: caso,
    mensajes: caso.mensajes,
    enviando: enviando,
    onEnviar: enviar
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: 0,
      flex: 1,
      overflowY: "auto",
      padding: "16px 24px"
    }
  }, pestana === "avisos" && /*#__PURE__*/React.createElement(Avisos, {
    caso: caso
  }), pestana === "evolucion" && /*#__PURE__*/React.createElement(Evolucion, {
    caso: caso
  }), pestana === "perfil" && /*#__PURE__*/React.createElement(MiFicha, {
    caso: caso
  }))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(AppPuerpera, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app_puerpera/Seguimiento.jsx", error: String((e && e.message) || e) }); }

// ui_kits/cohorte.js
try { (() => {
/* Cohorte sintética para las maquetas. Mismas formas que src/lib/types.ts del producto; ninguna
   persona es real y ningún dato viene de una ficha clínica. */
(function () {
  const franja = (marcas, hasta) => Array.from({
    length: 42
  }, (_, i) => i + 1 <= hasta ? marcas[i + 1] ?? null : null);
  const COHORTE = [{
    id: "camila",
    nombre: "Camila R.",
    codigo: "PM-042",
    edad: 31,
    tipoParto: "cesárea",
    dia: 9,
    nivel: "alto",
    region: "Metropolitana",
    establecimiento: "Hospital San José",
    fechaParto: "28 ago 2026",
    razonamiento: "Hallazgos compatibles con endometritis puerperal: fiebre referida, dolor uterino y loquios de mal olor al día 9. Sugiere evaluación presencial dentro del día.",
    cita: "§3.1",
    franja: franja({
      2: "bajo",
      3: "bajo",
      5: "bajo",
      7: "medio",
      8: "medio",
      9: "alto"
    }, 9),
    alertas: [{
      id: "a1",
      nivel: "alto",
      at: "14 min",
      titulo: "Fiebre referida con loquios de mal olor al día 9",
      accion: "Sugiere evaluación presencial en el CESFAM dentro del día. Contactar antes del mediodía.",
      cita: "§3.1"
    }],
    mensajes: [{
      de: "sistema",
      texto: "Hola Camila, vas en el día 9. ¿Cómo está la herida hoy?",
      hora: "09:12"
    }, {
      de: "puerpera",
      texto: "me duele la guata y me huele feo",
      hora: "11:40"
    }, {
      de: "sistema",
      texto: "¿Has tenido fiebre o escalofríos? Le voy a avisar a tu matrona.",
      hora: "11:40"
    }, {
      de: "puerpera",
      texto: "si, anoche andaba afiebrada y con frío",
      hora: "11:43"
    }],
    ficha: {
      "Semanas de gestación": "38",
      "Trabajo de parto": "6 h",
      Anestesia: "Sí · raquídea",
      "Enfermedades del embarazo": "Síndrome hipertensivo del embarazo",
      Paridad: "2 partos previos",
      Tabaco: "No",
      IMC: "29,4",
      "Contacto de emergencia": "Hermana · +56 9 XXXX XXXX"
    },
    factores: ["Antecedente de trastorno hipertensivo del embarazo: cualquier señal de §2 escala a alto sin esperar cifra de presión (§8, excepción única).", "Cesárea con IMC sobre 29: prioriza dentro de la categoría los hallazgos de herida operatoria."]
  }, {
    id: "monica",
    nombre: "Mónica P.",
    codigo: "PM-118",
    edad: 27,
    tipoParto: "vaginal",
    dia: 11,
    nivel: "medio",
    region: "Biobío",
    establecimiento: "Hospital Las Higueras",
    fechaParto: "26 ago 2026",
    razonamiento: "Dolor mamario unilateral sin fiebre ni compromiso general. Sugiere control de técnica de lactancia y reevaluar en 24 horas.",
    cita: "§4.2",
    franja: franja({
      2: "bajo",
      4: "bajo",
      6: "bajo",
      10: "medio",
      11: "medio"
    }, 11),
    alertas: [{
      id: "a2",
      nivel: "medio",
      at: "2 h",
      titulo: "Dolor mamario unilateral desde el día 10",
      accion: "Revisar hoy: control de técnica de lactancia. Reevaluar si aparece fiebre.",
      cita: "§4.2"
    }],
    mensajes: [{
      de: "sistema",
      texto: "Hola Mónica, día 11. ¿Cómo va la lactancia?",
      hora: "08:30"
    }, {
      de: "puerpera",
      texto: "me duele harto un pecho, el izquierdo",
      hora: "10:02"
    }],
    ficha: {
      "Semanas de gestación": "40",
      Episiotomía: "Sí",
      Paridad: "Primer parto",
      Tabaco: "No"
    },
    factores: ["Primer parto: la instalación de la lactancia concentra las consultas de la semana 2 (§4)."]
  }, {
    id: "javiera",
    nombre: "Javiera S.",
    codigo: "PM-007",
    edad: 34,
    tipoParto: "cesárea",
    dia: 28,
    nivel: "bajo",
    region: "Valparaíso",
    establecimiento: "Hospital Carlos Van Buren",
    fechaParto: "09 ago 2026",
    razonamiento: "",
    cita: "",
    franja: franja({
      3: "bajo",
      8: "bajo",
      15: "bajo",
      21: "bajo",
      27: "bajo",
      28: "bajo"
    }, 28),
    alertas: [],
    mensajes: [{
      de: "sistema",
      texto: "Día 28. ¿Cómo has estado esta semana?",
      hora: "09:00"
    }, {
      de: "puerpera",
      texto: "bien, cansada nomás pero bien",
      hora: "09:22"
    }],
    ficha: {
      "Semanas de gestación": "39",
      Anestesia: "Sí · raquídea",
      Paridad: "1 parto previo"
    },
    factores: []
  }, {
    id: "fernanda",
    nombre: "Fernanda A.",
    codigo: "PM-201",
    edad: 22,
    tipoParto: "vaginal",
    dia: 4,
    nivel: "medio",
    region: "Araucanía",
    establecimiento: "Hospital Hernán Henríquez",
    fechaParto: "02 sept 2026",
    razonamiento: "Sangrado que aumenta respecto de los días previos, sin cifras de presión ni compromiso hemodinámico referido. Sugiere control presencial hoy.",
    cita: "§2.3",
    franja: franja({
      1: "bajo",
      2: "bajo",
      4: "medio"
    }, 4),
    alertas: [{
      id: "a3",
      nivel: "medio",
      at: "35 min",
      titulo: "Aumento del sangrado al día 4",
      accion: "Revisar hoy. Consultar por número de apósitos y presencia de coágulos.",
      cita: "§2.3"
    }],
    mensajes: [{
      de: "puerpera",
      texto: "me está bajando harto y me salió un coágulo grande",
      hora: "12:15"
    }],
    ficha: {
      "Semanas de gestación": "37",
      Paridad: "Primer parto",
      Tabaco: "Ocasional"
    },
    factores: ["Primer parto y día 4: el tramo donde el protocolo concentra la hemorragia tardía (§2)."]
  }, {
    id: "rocio",
    nombre: "Rocío M.",
    codigo: "PM-090",
    edad: 29,
    tipoParto: "cesárea",
    dia: 17,
    nivel: "bajo",
    region: "Metropolitana",
    establecimiento: "Hospital Sótero del Río",
    fechaParto: "20 ago 2026",
    razonamiento: "",
    cita: "",
    franja: franja({
      2: "bajo",
      5: "bajo",
      9: "bajo"
    }, 17),
    alertas: [],
    mensajes: [],
    ficha: {},
    factores: [],
    silencio: "8 d en silencio"
  }, {
    id: "antonia",
    nombre: "Antonia M.",
    codigo: "PM-156",
    edad: 36,
    tipoParto: "vaginal",
    dia: 6,
    nivel: "bajo",
    region: "Maule",
    establecimiento: "Hospital de Talca",
    fechaParto: "31 ago 2026",
    razonamiento: "",
    cita: "",
    franja: franja({
      1: "bajo",
      2: "bajo",
      3: "bajo",
      5: "bajo",
      6: "bajo"
    }, 6),
    alertas: [],
    mensajes: [{
      de: "puerpera",
      texto: "estamos bien las dos, cansada nomás",
      hora: "10:10"
    }],
    ficha: {
      "Semanas de gestación": "40",
      Paridad: "3 partos previos"
    },
    factores: []
  }, {
    id: "valentina",
    nombre: "Valentina C.",
    codigo: "PM-033",
    edad: 25,
    tipoParto: "cesárea",
    dia: 34,
    nivel: "bajo",
    region: "Coquimbo",
    establecimiento: "Hospital de Ovalle",
    fechaParto: "03 ago 2026",
    razonamiento: "",
    cita: "",
    franja: franja({
      4: "bajo",
      12: "bajo",
      20: "bajo",
      30: "bajo"
    }, 34),
    alertas: [],
    mensajes: [],
    ficha: {},
    factores: [],
    silencio: "4 d en silencio"
  }];
  const SUGERENCIAS = ["estamos bien las dos, cansada nomás", "me está bajando harto y me salió un coágulo grande", "ando afiebrada y me huele feo abajo"];
  window.MATRIA = {
    COHORTE,
    SUGERENCIAS,
    ORDEN: {
      alto: 0,
      medio: 1,
      bajo: 2
    }
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/cohorte.js", error: String((e && e.message) || e) }); }

// ui_kits/panel_matrona/Chrome.jsx
try { (() => {
const {
  LogoMatria,
  Boton
} = window.MatriaDesignSystem_d05994;

/** Barra superior del producto: marca sobre rojo 900 y el nombre de la vista en versalitas. */
function BarraSuperior({
  vista
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      flexShrink: 0,
      alignItems: "center",
      gap: 16,
      padding: "12px 20px",
      background: "var(--marca-900)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(LogoMatria, {
    fill: "var(--marca-300)",
    size: 24,
    punto: null
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 17,
      fontWeight: 500,
      letterSpacing: "-0.01em",
      color: "#ffffff"
    }
  }, "Matria")), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      width: 1,
      height: 16,
      background: "color-mix(in srgb, #ffffff 22%, transparent)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "etiqueta",
    style: {
      color: "color-mix(in srgb, var(--marca-100) 85%, transparent)"
    }
  }, vista), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto"
    }
  }, /*#__PURE__*/React.createElement(Boton, {
    variante: "ghost",
    style: {
      color: "#ffffff",
      background: "color-mix(in srgb, #ffffff 12%, transparent)",
      border: "1px solid color-mix(in srgb, #ffffff 18%, transparent)"
    }
  }, "Cambiar de vista")));
}
Object.assign(window, {
  BarraSuperior
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/panel_matrona/Chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/panel_matrona/Ficha.jsx
try { (() => {
const {
  Tarjeta,
  Etiqueta,
  Franja42
} = window.MatriaDesignSystem_d05994;
const ETIQUETA_RIESGO = {
  alto: "Requiere escalamiento",
  medio: "Revisar hoy",
  bajo: "Seguimiento normal"
};
function Dato({
  etiqueta,
  valor
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      minWidth: 0,
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("dt", {
    className: "etiqueta-tenue"
  }, etiqueta), /*#__PURE__*/React.createElement("dd", {
    className: valor ? "" : "tenue",
    style: {
      margin: 0,
      fontSize: 13.5,
      lineHeight: 1.35,
      overflowWrap: "break-word"
    }
  }, valor || "No preguntado"));
}

/** Ficha del caso abierto: lo que el agente está ponderando, leído por la matrona. */
function Ficha({
  caso
}) {
  const campos = Object.entries(caso.ficha);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "baseline",
      columnGap: 12,
      rowGap: 4
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "titulo",
    style: {
      margin: 0
    }
  }, caso.nombre), /*#__PURE__*/React.createElement("span", {
    className: "tabular suave",
    style: {
      fontSize: 13
    }
  }, "d\xEDa ", caso.dia, " de 42"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto"
    }
  }, /*#__PURE__*/React.createElement(Etiqueta, {
    nivel: caso.nivel
  }, ETIQUETA_RIESGO[caso.nivel]))), caso.razonamiento && /*#__PURE__*/React.createElement(Tarjeta, {
    titulo: "\xDAltima evaluaci\xF3n"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 13.5,
      lineHeight: 1.6,
      textWrap: "pretty"
    }
  }, caso.razonamiento), /*#__PURE__*/React.createElement("p", {
    className: "tabular tenue",
    style: {
      margin: 0,
      fontSize: 12
    }
  }, "D\xEDa ", caso.dia, " \xB7 ", ETIQUETA_RIESGO[caso.nivel], " \xB7 Protocolo ", caso.cita)), /*#__PURE__*/React.createElement(Tarjeta, {
    titulo: "Franja del puerperio"
  }, /*#__PURE__*/React.createElement(Franja42, {
    franja: caso.franja,
    diaActual: caso.dia
  })), /*#__PURE__*/React.createElement(Tarjeta, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "baseline",
      columnGap: 10
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "subtitulo",
    style: {
      margin: 0
    }
  }, caso.nombre), /*#__PURE__*/React.createElement("span", {
    className: "tabular tenue",
    style: {
      fontSize: 11
    },
    translate: "no"
  }, caso.codigo), /*#__PURE__*/React.createElement("span", {
    className: "tabular tenue",
    style: {
      marginLeft: "auto",
      fontSize: 11
    }
  }, "d\xEDa ", caso.dia, " de 42")), /*#__PURE__*/React.createElement("dl", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      columnGap: 24,
      rowGap: 12,
      margin: 0
    }
  }, /*#__PURE__*/React.createElement(Dato, {
    etiqueta: "Edad",
    valor: `${caso.edad} años`
  }), /*#__PURE__*/React.createElement(Dato, {
    etiqueta: "Tipo de parto",
    valor: caso.tipoParto
  }), /*#__PURE__*/React.createElement(Dato, {
    etiqueta: "Fecha del parto",
    valor: caso.fechaParto
  }), /*#__PURE__*/React.createElement(Dato, {
    etiqueta: "Establecimiento",
    valor: caso.establecimiento
  }), /*#__PURE__*/React.createElement(Dato, {
    etiqueta: "Regi\xF3n",
    valor: caso.region
  }), /*#__PURE__*/React.createElement(Dato, {
    etiqueta: "Ficha de ingreso",
    valor: campos.length ? "Completada" : ""
  }))), caso.factores.length > 0 && /*#__PURE__*/React.createElement(Tarjeta, {
    titulo: "Factores que modifican el riesgo basal \xB7 \xA78",
    ayuda: "No cambian la categor\xEDa del hallazgo: priorizan dentro de ella. Esto es lo que el agente pondera en cada mensaje."
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      listStyle: "none",
      margin: 0,
      padding: 0
    }
  }, caso.factores.map(n => /*#__PURE__*/React.createElement("li", {
    key: n,
    style: {
      borderLeft: "2px solid var(--color-border)",
      paddingLeft: 10,
      fontSize: 13,
      lineHeight: 1.6,
      textWrap: "pretty"
    }
  }, n)))), campos.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "tenue",
    style: {
      margin: 0,
      borderRadius: "var(--radius-lg)",
      border: "1px dashed var(--color-border)",
      padding: 16,
      fontSize: 13,
      lineHeight: 1.6,
      textWrap: "pretty"
    }
  }, "Sin ficha de ingreso. Esta pu\xE9rpera viene de la cohorte sembrada y nadie la entrevist\xF3: el agente la eval\xFAa solo con la ficha b\xE1sica.") : /*#__PURE__*/React.createElement(Tarjeta, {
    titulo: "Ficha de ingreso"
  }, /*#__PURE__*/React.createElement("dl", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      columnGap: 24,
      rowGap: 12,
      margin: 0
    }
  }, campos.map(([k, v]) => /*#__PURE__*/React.createElement(Dato, {
    key: k,
    etiqueta: k,
    valor: v
  })))));
}
Object.assign(window, {
  Ficha,
  Dato
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/panel_matrona/Ficha.jsx", error: String((e && e.message) || e) }); }

// ui_kits/panel_matrona/Hilo.jsx
try { (() => {
const {
  Burbuja,
  Campo,
  Boton,
  Chip
} = window.MatriaDesignSystem_d05994;

/** Canal de la puérpera: 35% de la pantalla, con aspecto de mensajería y no de formulario. */
function Hilo({
  caso,
  mensajes,
  enviando,
  onEnviar
}) {
  const [texto, setTexto] = React.useState("");
  const fin = React.useRef(null);
  React.useEffect(() => {
    const c = fin.current?.parentElement;
    if (c) c.scrollTop = c.scrollHeight;
  }, [mensajes.length, enviando]);
  const enviar = valor => {
    const limpio = (valor ?? texto).trim();
    if (!limpio || enviando) return;
    onEnviar(limpio);
    setTexto("");
  };
  if (!caso) return /*#__PURE__*/React.createElement("div", {
    className: "sin-datos",
    style: {
      padding: 20
    }
  }, "Selecciona una pu\xE9rpera del panel para ver su conversaci\xF3n.");
  return /*#__PURE__*/React.createElement("section", {
    style: {
      display: "flex",
      height: "100%",
      minHeight: 0,
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      padding: "16px 20px",
      borderBottom: "1px solid var(--color-border)",
      background: "var(--color-surface)"
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "etiqueta",
    style: {
      margin: 0
    }
  }, "Canal de la pu\xE9rpera"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      display: "flex",
      flexWrap: "wrap",
      alignItems: "baseline",
      columnGap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "subtitulo"
  }, caso.nombre), /*#__PURE__*/React.createElement("span", {
    className: "tabular tenue",
    style: {
      fontSize: 11
    },
    translate: "no"
  }, caso.codigo), /*#__PURE__*/React.createElement("span", {
    className: "tabular suave",
    style: {
      fontSize: 12,
      fontWeight: 400
    }
  }, caso.tipoParto, " \xB7 ", caso.edad, " a\xF1os \xB7 d\xEDa ", caso.dia, " de 42"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      minHeight: 0,
      flex: 1,
      flexDirection: "column",
      gap: 10,
      overflowY: "auto",
      padding: "16px 20px"
    }
  }, mensajes.length === 0 && !enviando && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      paddingBottom: 8
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "suave",
    style: {
      margin: 0,
      fontSize: 13,
      lineHeight: 1.6,
      textWrap: "pretty"
    }
  }, "Todav\xEDa no hay mensajes. Cuenta c\xF3mo est\xE1s con tus palabras: el agente lo interpreta y lo que encuentre le llega a la matrona."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 6
    }
  }, window.MATRIA.SUGERENCIAS.map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    type: "button",
    className: "chip",
    style: {
      borderRadius: "var(--radius-pill)",
      textAlign: "left"
    },
    onClick: () => enviar(s)
  }, s)))), mensajes.map((m, i) => /*#__PURE__*/React.createElement(Burbuja, {
    key: i,
    de: m.de,
    title: m.hora ? `Hoy ${m.hora}` : undefined
  }, m.texto)), enviando && /*#__PURE__*/React.createElement(Burbuja, {
    de: "sistema"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tenue"
  }, "Leyendo lo que me contaste\u2026")), /*#__PURE__*/React.createElement("div", {
    ref: fin
  })), /*#__PURE__*/React.createElement("form", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 8,
      padding: "16px 20px",
      borderTop: "1px solid var(--color-border)",
      background: "var(--color-surface)"
    },
    onSubmit: e => {
      e.preventDefault();
      enviar();
    }
  }, /*#__PURE__*/React.createElement(Campo, {
    placeholder: "Cu\xE9ntame c\xF3mo est\xE1s hoy\u2026",
    value: texto,
    onChange: e => setTexto(e.target.value)
  }), /*#__PURE__*/React.createElement(Boton, {
    type: "submit",
    variante: "primary",
    disabled: enviando || !texto.trim()
  }, enviando ? "Evaluando…" : "Enviar")));
}
Object.assign(window, {
  Hilo
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/panel_matrona/Hilo.jsx", error: String((e && e.message) || e) }); }

// ui_kits/panel_matrona/Panel.jsx
try { (() => {
const {
  Chip,
  Campo,
  Boton,
  FilaPuerpera,
  TarjetaAlerta
} = window.MatriaDesignSystem_d05994;
const VISTAS = [{
  id: "resumen",
  etiqueta: "Resumen"
}, {
  id: "lista",
  etiqueta: "Lista"
}, {
  id: "ficha",
  etiqueta: "Ficha"
}];
const NIVELES = ["alto", "medio", "bajo"];
const ETIQUETA_RIESGO_N = {
  alto: "Requiere escalamiento",
  medio: "Revisar hoy",
  bajo: "Seguimiento normal"
};
const ENCABEZADO_ALERTA = {
  alto: "Escalar ahora",
  medio: "Revisar hoy",
  bajo: "Seguimiento"
};

/** Panel de triage: tres maneras de mirar la misma cohorte. La lista es la vista por defecto. */
function Panel({
  casos,
  seleccionadaId,
  onSeleccionar,
  onResolver
}) {
  const [vista, setVista] = React.useState("lista");
  const [niveles, setNiveles] = React.useState([]);
  const [soloPendientes, setSoloPendientes] = React.useState(false);
  const [busqueda, setBusqueda] = React.useState("");
  const seleccionada = casos.find(c => c.id === seleccionadaId) ?? null;
  const pendientes = casos.reduce((s, c) => s + c.alertas.length, 0);
  const porNivel = {
    alto: 0,
    medio: 0,
    bajo: 0
  };
  casos.forEach(c => {
    porNivel[c.nivel] += 1;
  });
  const texto = busqueda.trim().toLowerCase();
  const visibles = casos.filter(c => {
    if (niveles.length && !niveles.includes(c.nivel)) return false;
    if (soloPendientes && c.alertas.length === 0) return false;
    if (texto && !c.nombre.toLowerCase().includes(texto)) return false;
    return true;
  });
  const filtrando = niveles.length > 0 || soloPendientes || texto !== "";
  const abrirCaso = id => {
    onSeleccionar(id);
    setVista("ficha");
  };
  return /*#__PURE__*/React.createElement("section", {
    style: {
      display: "flex",
      height: "100%",
      flexDirection: "column",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "flex-end",
      justifyContent: "space-between",
      columnGap: 24,
      rowGap: 12,
      padding: "16px 20px",
      borderBottom: "1px solid var(--color-border)",
      background: "var(--color-surface)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      minWidth: 0,
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("h1", {
    className: "etiqueta",
    style: {
      margin: 0
    }
  }, "Panel de la matrona"), /*#__PURE__*/React.createElement("p", {
    className: "tabular",
    style: {
      margin: 0,
      fontSize: 15,
      lineHeight: 1.35
    },
    "aria-live": "polite"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      color: "var(--color-titulo)"
    }
  }, casos.length), " ", /*#__PURE__*/React.createElement("span", {
    className: "suave"
  }, "en seguimiento"), /*#__PURE__*/React.createElement("span", {
    className: "tenue"
  }, " \xB7 "), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      color: pendientes > 0 ? "var(--riesgo-alto)" : "var(--color-titulo)"
    }
  }, pendientes), " ", /*#__PURE__*/React.createElement("span", {
    className: "suave"
  }, pendientes === 1 ? "alerta pendiente" : "alertas pendientes"), /*#__PURE__*/React.createElement("span", {
    className: "tenue"
  }, " \xB7 "), /*#__PURE__*/React.createElement("span", {
    className: "tenue",
    style: {
      fontSize: 13
    }
  }, "la m\xE1s antigua espera 2 h"))), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      gap: 4
    },
    role: "tablist",
    "aria-label": "Vistas del panel"
  }, VISTAS.map(({
    id,
    etiqueta
  }) => /*#__PURE__*/React.createElement(Chip, {
    key: id,
    comoPestana: true,
    activo: vista === id,
    disabled: id === "ficha" && !seleccionada,
    onClick: () => setVista(id)
  }, etiqueta)))), /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: 0,
      flex: 1,
      overflowY: "auto",
      padding: "16px 20px"
    }
  }, vista === "resumen" && /*#__PURE__*/React.createElement(Resumen, {
    casos: casos,
    onAbrirCaso: abrirCaso
  }), vista === "lista" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 6
    }
  }, NIVELES.map(n => /*#__PURE__*/React.createElement(Chip, {
    key: n,
    activo: niveles.includes(n),
    cifra: porNivel[n],
    onClick: () => setNiveles(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])
  }, ETIQUETA_RIESGO_N[n])), /*#__PURE__*/React.createElement(Chip, {
    activo: soloPendientes,
    cifra: pendientes,
    onClick: () => setSoloPendientes(v => !v)
  }, "Con alerta pendiente"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto"
    }
  }, /*#__PURE__*/React.createElement(Campo, {
    type: "search",
    placeholder: "Buscar por nombre\u2026",
    ancho: "208px",
    value: busqueda,
    onChange: e => setBusqueda(e.target.value)
  }))), filtrando && /*#__PURE__*/React.createElement("p", {
    className: "tabular tenue",
    style: {
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: 12
    }
  }, "Mostrando ", visibles.length, " de ", casos.length, /*#__PURE__*/React.createElement(Boton, {
    variante: "ghost",
    onClick: () => {
      setNiveles([]);
      setSoloPendientes(false);
      setBusqueda("");
    },
    style: {
      padding: "2px 8px"
    }
  }, "Quitar filtros")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, visibles.map(c => /*#__PURE__*/React.createElement(FilaPuerpera, {
    key: c.id,
    nombre: c.nombre,
    codigo: c.codigo,
    edad: c.edad,
    tipoParto: c.tipoParto,
    dia: c.dia,
    nivel: c.nivel,
    cita: c.cita,
    silencio: c.silencio,
    razonamiento: c.razonamiento || "Sin señales de alarma en las últimas 24 horas.",
    franja: c.franja,
    seleccionada: c.id === seleccionadaId,
    onSeleccionar: () => onSeleccionar(c.id)
  }, c.alertas.map(a => /*#__PURE__*/React.createElement(TarjetaAlerta, {
    key: a.id,
    nivel: a.nivel,
    encabezado: ENCABEZADO_ALERTA[a.nivel],
    at: a.at
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 13.5,
      fontWeight: 500,
      textWrap: "pretty"
    }
  }, a.titulo), /*#__PURE__*/React.createElement("p", {
    className: "suave",
    style: {
      margin: 0,
      fontSize: 13,
      lineHeight: 1.6,
      textWrap: "pretty"
    }
  }, a.accion), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 8,
      paddingTop: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "tabular tenue",
    style: {
      fontSize: 11
    }
  }, "Protocolo ", a.cita), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto"
    }
  }, /*#__PURE__*/React.createElement(Boton, {
    variante: "secondary",
    onClick: () => onResolver(c.id, a.id)
  }, "Marcar resuelta"))))))), visibles.length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "tenue",
    style: {
      padding: "40px 0",
      textAlign: "center",
      fontSize: 14
    }
  }, "Ninguna pu\xE9rpera calza con estos filtros."))), vista === "ficha" && seleccionada && /*#__PURE__*/React.createElement(Ficha, {
    caso: seleccionada
  })));
}
Object.assign(window, {
  Panel
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/panel_matrona/Panel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/panel_matrona/Pantalla.jsx
try { (() => {
/**
 * Pantalla dividida del producto: el canal de la puérpera a la izquierda (35%) y el panel de
 * triage a la derecha (65%). El recorrido completo ocurre sin cambiar de pantalla: se escribe a
 * la izquierda y la alerta aparece priorizada a la derecha.
 *
 * Maqueta: la evaluación es simulada con un temporizador; el producto llama a Claude.
 */
const {
  ORDEN
} = window.MATRIA;

/** Regla de la maqueta: qué señal deja un mensaje. Espeja lo que el agente extrae en el producto. */
function evaluar(texto) {
  const t = texto.toLowerCase();
  const alto = ["fiebre", "afiebrada", "huele", "borroso", "cabeza", "no seguir", "dañ", "ahogo", "pierna"];
  const medio = ["sangr", "coágulo", "coagulo", "duele", "dolor", "pecho", "herida", "triste"];
  if (alto.some(p => t.includes(p))) return {
    nivel: "alto",
    titulo: "Señal de alarma referida en el relato de hoy",
    accion: "Sugiere evaluación presencial dentro del día. Contactar ahora.",
    cita: "§2.1",
    razonamiento: "Hallazgos referidos por la puérpera compatibles con una señal de alarma de §2. Sugiere evaluación presencial dentro del día."
  };
  if (medio.some(p => t.includes(p))) return {
    nivel: "medio",
    titulo: "Molestia referida que conviene revisar hoy",
    accion: "Revisar durante el día y reevaluar en 24 horas.",
    cita: "§3.2",
    razonamiento: "Molestia referida sin criterios de escalamiento inmediato. Sugiere revisar durante el día y reevaluar en 24 horas."
  };
  return null;
}
function PantallaDividida() {
  const [casos, setCasos] = React.useState(window.MATRIA.COHORTE);
  const [seleccionadaId, setSeleccionadaId] = React.useState("camila");
  const [enviando, setEnviando] = React.useState(false);
  const ordenados = [...casos].sort((a, b) => ORDEN[a.nivel] - ORDEN[b.nivel] || b.alertas.length - a.alertas.length);
  const caso = casos.find(c => c.id === seleccionadaId) ?? null;
  const enviar = texto => {
    const hora = new Date().toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit"
    });
    setCasos(prev => prev.map(c => c.id === seleccionadaId ? {
      ...c,
      mensajes: [...c.mensajes, {
        de: "puerpera",
        texto,
        hora
      }]
    } : c));
    setEnviando(true);
    setTimeout(() => {
      const senal = evaluar(texto);
      setCasos(prev => prev.map(c => {
        if (c.id !== seleccionadaId) return c;
        const franja = [...c.franja];
        franja[c.dia - 1] = senal ? senal.nivel : "bajo";
        const respuesta = senal ? senal.nivel === "alto" ? "Le avisé a tu matrona ahora mismo. Te va a contactar hoy; si algo empeora, anda a urgencias." : "Ya quedó registrado y tu matrona lo va a revisar hoy. Si cambia algo antes, escríbelo acá." : "Gracias por contarme. Mañana te vuelvo a preguntar cómo van las dos.";
        return {
          ...c,
          franja,
          nivel: senal ? senal.nivel : c.nivel,
          razonamiento: senal ? senal.razonamiento : c.razonamiento,
          cita: senal ? senal.cita : c.cita,
          mensajes: [...c.mensajes, {
            de: "sistema",
            texto: respuesta,
            hora
          }],
          alertas: senal ? [{
            id: `n${Date.now()}`,
            nivel: senal.nivel,
            at: "recién",
            titulo: senal.titulo,
            accion: senal.accion,
            cita: senal.cita
          }, ...c.alertas] : c.alertas
        };
      }));
      setEnviando(false);
    }, 1400);
  };
  const resolver = (casoId, alertaId) => setCasos(prev => prev.map(c => c.id === casoId ? {
    ...c,
    alertas: c.alertas.filter(a => a.id !== alertaId)
  } : c));
  return /*#__PURE__*/React.createElement("main", {
    style: {
      display: "flex",
      height: "100%",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement(BarraSuperior, {
    vista: "Panel de la matrona"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      minHeight: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "35%",
      borderRight: "1px solid var(--color-border)",
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(Hilo, {
    caso: caso,
    mensajes: caso ? caso.mensajes : [],
    enviando: enviando,
    onEnviar: enviar
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "65%",
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    casos: ordenados,
    seleccionadaId: seleccionadaId,
    onSeleccionar: setSeleccionadaId,
    onResolver: resolver
  }))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(PantallaDividida, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/panel_matrona/Pantalla.jsx", error: String((e && e.message) || e) }); }

// ui_kits/panel_matrona/Resumen.jsx
try { (() => {
const {
  Cifra,
  Tarjeta,
  BarraRiesgo,
  TarjetaAlerta,
  Boton
} = window.MatriaDesignSystem_d05994;
const ENCABEZADO = {
  alto: "Escalar ahora",
  medio: "Revisar hoy",
  bajo: "Seguimiento"
};

/** Franja de la cohorte: las señales de todas repartidas en los 42 días de la ventana. */
function FranjaCohorte({
  casos
}) {
  const dias = Array.from({
    length: 42
  }, () => ({
    alto: 0,
    medio: 0
  }));
  casos.forEach(c => c.franja.forEach((n, i) => {
    if (n === "alto" || n === "medio") dias[i][n] += 1;
  }));
  const mayor = Math.max(1, ...dias.map(d => d.alto + d.medio));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: 96,
      alignItems: "flex-end",
      gap: 1,
      borderBottom: "1px solid var(--color-border)",
      paddingBottom: 1
    }
  }, dias.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    title: `Día ${i + 1}: ${d.alto} de riesgo alto, ${d.medio} de riesgo medio`,
    style: {
      display: "flex",
      height: "100%",
      minWidth: 0,
      flex: 1,
      flexDirection: "column",
      justifyContent: "flex-end",
      marginRight: (i + 1) % 7 === 0 && i + 1 !== 42 ? 6 : 0
    }
  }, d.medio > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      height: `${d.medio / mayor * 100}%`,
      background: "var(--riesgo-medio)",
      borderRadius: "1.5px 1.5px 0 0"
    }
  }), d.alto > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      height: `${d.alto / mayor * 100}%`,
      background: "var(--riesgo-alto)"
    }
  }), d.alto + d.medio === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      height: 2,
      background: "var(--color-linea)"
    }
  })))), /*#__PURE__*/React.createElement("div", {
    className: "tabular tenue",
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 10
    }
  }, /*#__PURE__*/React.createElement("span", null, "d\xEDa 1"), /*#__PURE__*/React.createElement("span", null, "semana 1"), /*#__PURE__*/React.createElement("span", null, "2"), /*#__PURE__*/React.createElement("span", null, "3"), /*#__PURE__*/React.createElement("span", null, "4"), /*#__PURE__*/React.createElement("span", null, "5"), /*#__PURE__*/React.createElement("span", null, "d\xEDa 42")));
}
function Resumen({
  casos,
  onAbrirCaso
}) {
  const porNivel = {
    alto: 0,
    medio: 0,
    bajo: 0
  };
  casos.forEach(c => {
    porNivel[c.nivel] += 1;
  });
  const conAlerta = casos.filter(c => c.alertas.length > 0);
  const pendientes = conAlerta.reduce((s, c) => s + c.alertas.length, 0);
  const silenciosas = casos.filter(c => c.silencio);
  const primeraSemana = casos.filter(c => c.dia <= 7).length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Cifra, {
    etiqueta: "En cola",
    valor: pendientes,
    nota: `${porNivel.alto} para escalar · ${porNivel.medio} para revisar`,
    color: pendientes > 0 ? "var(--riesgo-alto)" : undefined
  }), /*#__PURE__*/React.createElement(Cifra, {
    etiqueta: "Espera m\xE1s larga",
    valor: "2 h",
    nota: "M\xF3nica P."
  }), /*#__PURE__*/React.createElement(Cifra, {
    etiqueta: "Riesgo alto",
    valor: porNivel.alto,
    nota: `de ${casos.length} puérperas en seguimiento`,
    color: porNivel.alto > 0 ? "var(--riesgo-alto)" : undefined
  })), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)"
    }
  }, /*#__PURE__*/React.createElement(Cifra, {
    tamano: "chica",
    valor: primeraSemana,
    etiqueta: "En la primera semana",
    nota: "d\xEDas 1 a 7, el tramo m\xE1s denso"
  }), /*#__PURE__*/React.createElement(Cifra, {
    tamano: "chica",
    valor: silenciosas.length,
    etiqueta: "En silencio hace 3 d\xEDas o m\xE1s",
    nota: "una ausencia tambi\xE9n es se\xF1al"
  }), /*#__PURE__*/React.createElement(Cifra, {
    tamano: "chica",
    valor: 38,
    unidad: "%",
    etiqueta: "Contactaron en su d\xEDa de hoy",
    nota: `${Math.round(casos.length * 0.38)} de ${casos.length}`
  }), /*#__PURE__*/React.createElement(Cifra, {
    tamano: "chica",
    valor: 57,
    unidad: "%",
    etiqueta: "Con ficha de ingreso completa",
    nota: `4 de ${casos.length}`
  })), /*#__PURE__*/React.createElement(Tarjeta, {
    titulo: "Cola de hoy",
    ayuda: "Ordenada por gravedad y, dentro de la gravedad, por lo que lleva m\xE1s rato esperando."
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      listStyle: "none",
      margin: 0,
      padding: 0
    }
  }, conAlerta.map(c => /*#__PURE__*/React.createElement("li", {
    key: c.id
  }, /*#__PURE__*/React.createElement(TarjetaAlerta, {
    nivel: c.alertas[0].nivel,
    encabezado: ENCABEZADO[c.alertas[0].nivel],
    at: c.alertas[0].at
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "baseline",
      columnGap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "subtitulo"
  }, c.nombre), /*#__PURE__*/React.createElement("span", {
    className: "tabular tenue",
    style: {
      fontSize: 11
    },
    translate: "no"
  }, c.codigo), /*#__PURE__*/React.createElement("span", {
    className: "tabular suave",
    style: {
      fontSize: 12
    }
  }, "d\xEDa ", c.dia)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 13.5,
      fontWeight: 500,
      textWrap: "pretty"
    }
  }, c.alertas[0].titulo), /*#__PURE__*/React.createElement("p", {
    className: "suave",
    style: {
      margin: 0,
      fontSize: 13,
      lineHeight: 1.6,
      textWrap: "pretty"
    }
  }, c.alertas[0].accion), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      paddingTop: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "tabular tenue",
    style: {
      fontSize: 11
    }
  }, "Protocolo ", c.alertas[0].cita), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto"
    }
  }, /*#__PURE__*/React.createElement(Boton, {
    variante: "secondary",
    onClick: () => onAbrirCaso(c.id)
  }, "Abrir el caso")))))), conAlerta.length === 0 && /*#__PURE__*/React.createElement("li", {
    className: "sin-datos"
  }, "No hay alertas pendientes. La cola est\xE1 al d\xEDa."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Tarjeta, {
    titulo: "Reparto por riesgo"
  }, /*#__PURE__*/React.createElement(BarraRiesgo, {
    porNivel: porNivel
  })), /*#__PURE__*/React.createElement(Tarjeta, {
    titulo: "Dejaron de escribir",
    ayuda: "Nadie sabe nada de ellas hace d\xEDas. No es una alerta del agente: es una ausencia."
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      display: "flex",
      flexDirection: "column",
      listStyle: "none",
      margin: 0,
      padding: 0
    }
  }, silenciosas.map((c, i) => /*#__PURE__*/React.createElement("li", {
    key: c.id,
    style: {
      borderTop: i > 0 ? "1px solid var(--color-linea)" : "none"
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onAbrirCaso(c.id),
    style: {
      display: "flex",
      width: "100%",
      alignItems: "baseline",
      gap: 10,
      padding: "8px 0",
      textAlign: "left",
      background: "none",
      border: "none",
      fontSize: 13,
      color: "inherit",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      fontWeight: 500
    }
  }, c.nombre), /*#__PURE__*/React.createElement("span", {
    className: "tabular tenue",
    style: {
      fontSize: 11
    },
    translate: "no"
  }, c.codigo), /*#__PURE__*/React.createElement("span", {
    className: "tabular suave",
    style: {
      fontSize: 12
    }
  }, "d\xEDa ", c.dia), /*#__PURE__*/React.createElement("span", {
    className: "tabular tenue",
    style: {
      width: 112,
      textAlign: "right",
      fontSize: 11
    }
  }, c.silencio)))), silenciosas.length === 0 && /*#__PURE__*/React.createElement("li", {
    className: "sin-datos"
  }, "Todas escribieron en los \xFAltimos 3 d\xEDas.")))), /*#__PURE__*/React.createElement(Tarjeta, {
    titulo: "D\xF3nde se complica el puerperio",
    ayuda: "Se\xF1ales de alarma de toda la cohorte repartidas en los 42 d\xEDas de la ventana."
  }, /*#__PURE__*/React.createElement(FranjaCohorte, {
    casos: casos
  })));
}
Object.assign(window, {
  Resumen,
  FranjaCohorte
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/panel_matrona/Resumen.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Burbuja = __ds_scope.Burbuja;

__ds_ns.Boton = __ds_scope.Boton;

__ds_ns.Campo = __ds_scope.Campo;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.Etiqueta = __ds_scope.Etiqueta;

__ds_ns.LogoMatria = __ds_scope.LogoMatria;

__ds_ns.Tarjeta = __ds_scope.Tarjeta;

__ds_ns.BarraRiesgo = __ds_scope.BarraRiesgo;

__ds_ns.Cifra = __ds_scope.Cifra;

__ds_ns.FilaPuerpera = __ds_scope.FilaPuerpera;

__ds_ns.Franja42 = __ds_scope.Franja42;

__ds_ns.TarjetaAlerta = __ds_scope.TarjetaAlerta;

})();
