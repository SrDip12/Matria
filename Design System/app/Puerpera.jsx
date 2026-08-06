const { Chip } = window.MatriaDesignSystem_d05994;

/**
 * Lado de la puérpera: una columna centrada y una cosa a la vez. Las pestañas son su recorrido y
 * el chat es la que abre por defecto, recién salida de la ficha de ingreso.
 */
const PESTANAS = [
  { id: "chat", etiqueta: "Chat" },
  { id: "avisos", etiqueta: "Mis avisos" },
  { id: "evolucion", etiqueta: "Cómo he estado" },
  { id: "perfil", etiqueta: "Mi ficha" },
];

function Puerpera({ caso, enviando, onEnviar }) {
  const [pestana, setPestana] = React.useState("chat");
  return (
    <div style={{ margin: "0 auto", display: "flex", minHeight: 0, width: "100%", maxWidth: 672, flex: 1, flexDirection: "column", overflow: "hidden", background: "var(--color-bg)" }}>
      <nav style={{ display: "flex", flexShrink: 0, flexWrap: "wrap", gap: 4, padding: "12px 24px", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}
        role="tablist" aria-label="Mi seguimiento">
        {PESTANAS.map(({ id, etiqueta }) => (
          <Chip key={id} comoPestana activo={pestana === id} onClick={() => setPestana(id)}
            cifra={id === "avisos" && caso.alertas.length > 0 ? caso.alertas.length : undefined}>
            {etiqueta}
          </Chip>
        ))}
      </nav>

      {pestana === "chat" ? (
        <div style={{ display: "flex", minHeight: 0, flex: 1, flexDirection: "column" }}>
          <Hilo caso={caso} mensajes={caso.mensajes} enviando={enviando} onEnviar={onEnviar} contexto="mia" />
        </div>
      ) : (
        <div style={{ minHeight: 0, flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {pestana === "avisos" && <Avisos caso={caso} />}
          {pestana === "evolucion" && <Evolucion caso={caso} />}
          {pestana === "perfil" && <MiFicha caso={caso} />}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Puerpera });
