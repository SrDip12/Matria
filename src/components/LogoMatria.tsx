interface LogoMatriaProps {
  fill: string;
  size?: number;
  /** El hueco que separa a la guagua del cuerpo de la madre. Se cae bajo 32 px, donde deja de leerse y ensucia la silueta. */
  punto?: string | null;
}

/** La silueta: madre con la guagua en brazos, cabeza y cuerpo cada una. Nunca rotada ni con contorno. */
export function LogoMatria({ fill, size = 32, punto }: LogoMatriaProps) {
  const conPunto = punto !== undefined ? punto : size >= 32 ? "var(--color-surface)" : null;

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden>
      <circle cx="42" cy="27" r="15" fill={fill} />
      <path
        d="M 28 44 C 22 66, 24 90, 34 108 L 58 108 C 62 92, 60 72, 52 58 C 47 49, 38 44, 28 44 Z"
        fill={fill}
      />
      <circle cx="80" cy="82" r="21" fill={fill} />
      {conPunto && <circle cx="80" cy="82" r="12" fill={conPunto} />}
      <circle cx="70" cy="68" r="12" fill={fill} />
    </svg>
  );
}
