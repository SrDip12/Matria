import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Hay un package-lock.json suelto en C:\Users\Asus que Next elige como raíz del workspace por
   * ser el ancestro común. Con la raíz mal puesta, las rutas de outputFileTracingIncludes se
   * resuelven contra esa carpeta y el protocolo no entra al bundle.
   */
  outputFileTracingRoot: __dirname,

  /**
   * El agente lee el protocolo del disco en runtime (src/lib/agente/prompt.ts lo carga con
   * fs.readFileSync sobre process.cwd()). El tracer de Next solo empaqueta lo que ve importado,
   * y un archivo leído por ruta no se ve: sin esto la función serverless queda sin el .md,
   * prompt.ts lanza al importarse y /api/evaluar responde 500 en producción.
   */
  outputFileTracingIncludes: {
    "/api/**": ["./docs/PROTOCOLO_CLINICO.md"],
  },
};

export default nextConfig;
