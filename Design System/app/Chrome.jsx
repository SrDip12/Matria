const { LogoMatria, Boton } = window.MatriaDesignSystem_d05994;

/** Barra superior del producto: marca sobre rojo 900 y el nombre de la vista en versalitas. */
function BarraSuperior({ vista, onCambiar }) {
  return (
    <header style={{ display: "flex", flexShrink: 0, alignItems: "center", gap: 16, padding: "12px 20px", background: "var(--marca-900)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <LogoMatria fill="var(--marca-300)" size={24} punto={null} />
        <span style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em", color: "#ffffff" }}>Matria</span>
      </div>
      {vista && <span aria-hidden style={{ width: 1, height: 16, background: "color-mix(in srgb, #ffffff 22%, transparent)" }} />}
      {vista && <span className="etiqueta" style={{ color: "color-mix(in srgb, var(--marca-100) 85%, transparent)" }}>{vista}</span>}
      {onCambiar && (
        <span style={{ marginLeft: "auto" }}>
          <Boton variante="ghost" onClick={onCambiar} style={{ color: "#ffffff", background: "color-mix(in srgb, #ffffff 12%, transparent)", border: "1px solid color-mix(in srgb, #ffffff 18%, transparent)" }}>
            Cambiar de vista
          </Boton>
        </span>
      )}
    </header>
  );
}

Object.assign(window, { BarraSuperior });
