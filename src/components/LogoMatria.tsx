interface LogoMatriaProps {
  fill: string;
  size?: number;
  /** El punto de adentro. Se cae bajo 32 px, donde deja de leerse y ensucia la silueta. */
  punto?: string | null;
}

/** La silueta: mujer de perfil, guata, un punto adentro. Nunca rotada ni con contorno. */
export function LogoMatria({ fill, size = 32, punto }: LogoMatriaProps) {
  const conPunto = punto !== undefined ? punto : size >= 32 ? "var(--color-surface)" : null;

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden>
      <path
        d="M 58 34 C 68 40, 70 48, 66 56 C 82 60, 94 68, 92 82 C 90 98, 78 106, 66 108 L 42 108 C 34 86, 34 58, 44 36 Z"
        fill={fill}
      />
      <circle cx="50" cy="18" r="12" fill={fill} />
      {conPunto && <circle cx="76" cy="80" r="10" fill={conPunto} />}
    </svg>
  );
}
