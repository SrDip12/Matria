/**
 * Set mínimo de iconos de línea.
 *
 * El design system no traía set propio y advierte que una familia inventada se lee como de otro
 * producto. Estos se dibujaron para Matria con una sola regla: trazo de 1.5, esquinas redondas,
 * `currentColor` y nada de relleno. Heredan la tinta de quien los contiene, así que **nunca
 * introducen color**: la regla de que el color es del riesgo queda intacta.
 *
 * Dónde sí van: navegación, cabeceras de zona y botones de la app de la puérpera.
 * Dónde no: dentro de una fila del panel priorizado, de una tarjeta de alerta o de una cifra
 * clínica. Ahí la atención es del riesgo y un icono compite con ella.
 */

interface IconoProps {
  size?: number;
  className?: string;
}

function Trazo({ size = 16, className, children }: IconoProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

/** Conversación. */
export function IconoChat(props: IconoProps) {
  return (
    <Trazo {...props}>
      <path d="M20 14a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" />
    </Trazo>
  );
}

/** Avisos. Campana, sin badge: la cifra la pone el chip. */
export function IconoAviso(props: IconoProps) {
  return (
    <Trazo {...props}>
      <path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" />
      <path d="M13.7 19a2 2 0 0 1-3.4 0" />
    </Trazo>
  );
}

/** Cómo he estado. Las celdas de la franja, en miniatura. */
export function IconoFranja(props: IconoProps) {
  return (
    <Trazo {...props}>
      <path d="M4 15V9M8 17V7M12 14v-4M16 18V6M20 15V9" />
    </Trazo>
  );
}

/** Ficha de la puérpera. */
export function IconoFicha(props: IconoProps) {
  return (
    <Trazo {...props}>
      <path d="M5 4h9l5 5v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1" />
      <path d="M14 4v5h5M8 13h6M8 17h4" />
    </Trazo>
  );
}

/** Resumen de la cohorte. */
export function IconoResumen(props: IconoProps) {
  return (
    <Trazo {...props}>
      <path d="M4 19h16" />
      <path d="M7 19v-6M12 19V6M17 19v-9" />
    </Trazo>
  );
}

/** Lista priorizada. */
export function IconoLista(props: IconoProps) {
  return (
    <Trazo {...props}>
      <path d="M4 7h1M4 12h1M4 17h1M9 7h11M9 12h11M9 17h7" />
    </Trazo>
  );
}

/** Volver. */
export function IconoVolver(props: IconoProps) {
  return (
    <Trazo {...props}>
      <path d="M15 5l-7 7 7 7" />
    </Trazo>
  );
}

/** Cambiar de vista. */
export function IconoCambiar(props: IconoProps) {
  return (
    <Trazo {...props}>
      <path d="M4 8h13l-3-3M20 16H7l3 3" />
    </Trazo>
  );
}

/**
 * El lazo de matrona: el nudo que acompaña sin apretar. Es la única licencia temática del
 * sistema y va tenue, en la cabecera de la app de ella. Nunca en el panel clínico.
 */
export function IconoLazo(props: IconoProps) {
  return (
    <Trazo {...props}>
      <path d="M12 13c-2.5-2-5-3.2-5-5.6A2.4 2.4 0 0 1 12 6a2.4 2.4 0 0 1 5 1.4c0 2.4-2.5 3.6-5 5.6" />
      <path d="M12 13v7M9.5 20h5" />
    </Trazo>
  );
}
