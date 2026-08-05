/**
 * Cohorte sintética. Ninguna persona es real: nombres de lista, sin RUT ni teléfono.
 * Distribuciones replican DEIS (ver docs/DATOS_DEIS.md). Idempotente: borra y repuebla.
 *
 * Correr con: pnpm db:seed
 */
import { createClient } from "@supabase/supabase-js";
// import type: se borra en tiempo de ejecución, así el alias @/ no necesita resolverse en Node.
import type { Hallazgos, NivelRiesgo, Prevision, Sospecha, TipoParto } from "@/lib/types";

const cliente = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const N_PUERPERAS = 200;

// PRNG con semilla fija: la misma cohorte en cada corrida.
let estado = 20260805;
const rnd = () => {
  estado = (estado + 0x6d2b79f5) | 0;
  let t = estado;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const entre = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1));
const uno = <T,>(xs: readonly T[]) => xs[Math.floor(rnd() * xs.length)];
const pesado = <T,>(xs: readonly (readonly [T, number])[]): T => {
  const total = xs.reduce((s, [, p]) => s + p, 0);
  let r = rnd() * total;
  for (const [v, p] of xs) if ((r -= p) < 0) return v;
  return xs[xs.length - 1][0];
};

// ---------------------------------------------------------------- distribuciones

/**
 * Regiones: glosa oficial DEIS. Peso = proporción de defunciones de mujeres de 15 a 49 años
 * por región (DEIS, defunciones 2024–2026, corte 04-08-2026, n=8.921), usada como proxy de
 * la distribución regional de mujeres en edad fértil. Establecimientos: nombre oficial del
 * Anexo 4 "Establecimientos de procedencia" del Esquema de Registros DEIS 2026.
 */
const REGIONES = [
  {
    nombre: "De Arica y Parinacota",
    peso: 0.0167,
    publicos: ["Hospital Regional Dr. Juan Noé Crevani (Arica)"],
    privados: ["Clínica San José"],
  },
  {
    nombre: "De Tarapacá",
    peso: 0.0225,
    publicos: ["Hospital Dr. Ernesto Torres Galdames (Iquique)", "Hospital de Alto Hospicio"],
    privados: ["Clínica Iquique"],
  },
  {
    nombre: "De Antofagasta",
    peso: 0.0378,
    publicos: ["Hospital Dr. Leonardo Guzmán (Antofagasta)", "Hospital Dr. Carlos Cisternas (Calama)"],
    privados: ["Clínica Bupa Antofagasta"],
  },
  {
    nombre: "De Atacama",
    peso: 0.0166,
    publicos: [
      "Hospital San José del Carmen (Copiapó)",
      "Hospital Provincial del Huasco Monseñor Fernando Ariztía Ruiz (Vallenar)",
    ],
    privados: ["Clínica San Lorenzo"],
  },
  {
    nombre: "De Coquimbo",
    peso: 0.0447,
    publicos: [
      "Hospital San Juan de Dios (La Serena)",
      "Hospital San Pablo (Coquimbo)",
      "Hospital Dr. Antonio Tirado Lanas de Ovalle",
    ],
    privados: ["Clínica Regional Elqui"],
  },
  {
    nombre: "De Valparaíso",
    peso: 0.1057,
    publicos: [
      "Hospital Carlos Van Buren (Valparaíso)",
      "Hospital Dr. Gustavo Fricke (Viña del Mar)",
      "Hospital Biprovincial Quillota Petorca",
      "Hospital Claudio Vicuña ( San Antonio)",
    ],
    privados: ["Clínica Reñaca", "Clínica Valparaíso"],
  },
  {
    nombre: "Metropolitana de Santiago",
    peso: 0.3743,
    publicos: [
      "Hospital Clínico San Borja Arriarán",
      "Complejo Hospitalario San José (Santiago, Independencia)",
      "Hospital San Juan de Dios (Santiago)",
      "Hospital Clínico Metropolitano El Carmen Doctor Luis Valentín Ferrada",
      "Hospital  Félix Bulnes Cerda",
      "Hospital San José (Melipilla)",
    ],
    privados: ["Clínica Dávila", "Clínica Santa María", "Clínica Indisa", "Clínica Alemana"],
  },
  {
    nombre: "Del Libertador B. O'Higgins",
    peso: 0.0587,
    publicos: ["Hospital Dr. Franco Ravera Zunino", "Hospital San Juan de Dios de San Fernando"],
    privados: ["Clínica Isamedica"],
  },
  {
    nombre: "Del Maule",
    peso: 0.0658,
    publicos: [
      "Hospital Dr. César Garavagno Burotto (Talca)",
      "Hospital San Juan de Dios (Curicó)",
      "Hospital Presidente Carlos Ibáñez del Campo (Linares)",
    ],
    privados: ["Clínica Universidad Católica Del Maule"],
  },
  {
    nombre: "De Ñuble",
    peso: 0.0272,
    publicos: ["Hospital Clínico Herminda Martín (Chillán)", "Hospital de San Carlos"],
    privados: ["Clinica Andes Salud Chillan"],
  },
  {
    nombre: "Del Bíobío",
    peso: 0.0854,
    publicos: [
      "Hospital Clínico Regional Dr. Guillermo Grant Benavente (Concepción)",
      "Hospital Las Higueras (Talcahuano)",
      "Complejo Asistencial Dr. Víctor Ríos Ruiz (Los Ángeles)",
    ],
    privados: ["Clínica de la Mujer Sanatorio Alemán", "Clínica Andes Salud Concepción"],
  },
  {
    nombre: "De La Araucanía",
    peso: 0.0576,
    publicos: [
      "Hospital Dr. Hernán Henríquez Aravena (Temuco)",
      "Hospital Intercultural de Nueva Imperial",
      "Hospital de Villarrica",
    ],
    privados: ["Clínica Alemana de Temuco"],
  },
  {
    nombre: "De Los Ríos",
    peso: 0.0224,
    publicos: ["Hospital Base Valdivia", "Hospital Juan Morey (La Unión)"],
    privados: ["Clínica Alemana Valdivia"],
  },
  {
    nombre: "De Los Lagos",
    peso: 0.0494,
    publicos: ["Hospital de Puerto Montt", "Hospital Base San José de Osorno"],
    privados: ["Clínica Puerto Montt"],
  },
  {
    nombre: "De Aisén del Gral. C. Ibáñez del Campo",
    peso: 0.0046,
    publicos: ["Hospital Regional de Coyhaique", "Hospital de Puerto Aysén"],
    privados: [],
  },
  {
    nombre: "De Magallanes y de La Antártica Chilena",
    peso: 0.01,
    publicos: ["Hospital Clínico de Magallanes Dr. Lautaro Navarro Avaria"],
    privados: ["Clínica Magallanes"],
  },
] as const;

/** INE, Estadísticas Vitales 2023 provisional: modal 30–34 (29,4%), ≥35 años 23,9%. */
const TRAMOS_EDAD = [
  [[15, 19], 0.065],
  [[20, 24], 0.16],
  [[25, 29], 0.242],
  [[30, 34], 0.294],
  [[35, 39], 0.179],
  [[40, 44], 0.055],
  [[45, 49], 0.005],
] as const;

/** Supuesto del equipo: no hay desglose de previsión por tramo en los datasets entregados. */
const PREVISIONES = [
  ["fonasa_a", 0.22],
  ["fonasa_b", 0.26],
  ["fonasa_c", 0.14],
  ["fonasa_d", 0.2],
  ["isapre", 0.18],
] as const;

/** Probabilidad de atenderse en establecimiento privado, por previsión. Supuesto del equipo. */
const P_PRIVADO: Record<Prevision, number> = {
  fonasa_a: 0.02,
  fonasa_b: 0.03,
  fonasa_c: 0.08,
  fonasa_d: 0.15,
  isapre: 0.85,
};

/** Cesáreas por dependencia del establecimiento: 49% público, 73% privado (DEIS 2021 vía OVO/CIPER). */
const P_CESAREA = { publico: 0.49, privado: 0.73 };

/** Categorías CIE-10 de la lista de Vale. Prevalencias: supuesto del equipo. */
const COMORBILIDADES = [
  ["Síndrome hipertensivo del embarazo", 0.1], // O10–O16
  ["Diabetes gestacional", 0.12], // O24
  ["Parto prematuro", 0.07], // O60
] as const;

const NOMBRES = [
  "Antonia", "Javiera", "Catalina", "Valentina", "Isidora", "Emilia", "Florencia", "Constanza",
  "Josefa", "Martina", "Fernanda", "Camila", "Daniela", "Paula", "Carolina", "Rocío",
  "Bárbara", "Macarena", "Millaray", "Ayelén", "Rayen", "Antonella", "Trinidad", "Amanda",
  "Ignacia", "Magdalena", "Pía", "Almendra", "Belén", "Karen", "Nayaret", "Yasna",
  "Marisol", "Solange", "Nicole", "Génesis", "Aracely", "Damaris", "Ninoska", "Elizabeth",
] as const;

const APELLIDOS = [
  "Muñoz", "Rojas", "Fuentes", "Sepúlveda", "Contreras", "Cárdenas", "Vergara", "Aguilera",
  "Riquelme", "Espinoza", "Cortés", "Norambuena", "Painemal", "Huenchual", "Curihual", "Manquepi",
  "Villarroel", "Barría", "Ojeda", "Alarcón", "Bustos", "Zúñiga", "Quintana", "Pizarro",
  "Valdebenito", "Sandoval", "Lagos", "Vera", "Ibáñez", "Chandía", "Millán", "Ancán",
] as const;

// ---------------------------------------------------------------- escenarios clínicos

type Escenario = {
  sospecha: Sospecha;
  cita: string;
  dias: [number, number];
  soloCesarea?: boolean;
  hallazgos: Partial<Hallazgos>;
  textos: readonly string[];
  razonamiento: string;
  accion: string;
};

/** Los § son los identificadores de docs/PROTOCOLO_CLINICO.md. No se renumeran. */
const ESCENARIOS: readonly Escenario[] = [
  {
    sospecha: "endometritis",
    cita: "§3.1",
    dias: [2, 12],
    hallazgos: { fiebre_referida: true, temperatura_c: 38.4, dolor_abdominal: true, loquios_mal_olor: true },
    textos: [
      "Anoche tuve fiebre, me tomé la temperatura y tenía 38.4. Me duele la guata abajo y el sangrado tiene un olor raro, feo.",
      "Tengo escalofríos desde ayer, 38 y algo de fiebre. Los loquios huelen mal y me duele el vientre cuando aprieto.",
    ],
    razonamiento:
      "Refiere fiebre 38,4 °C, dolor hipogástrico y loquios de mal olor en la ventana de infección puerperal. Hallazgos compatibles con endometritis, se escala para evaluación presencial.",
    accion: "Contactar hoy y coordinar evaluación clínica presencial con control de signos vitales.",
  },
  {
    sospecha: "preeclampsia_postparto",
    cita: "§2",
    dias: [1, 14],
    hallazgos: { cefalea_intensa: true, alteracion_visual: true, dolor_epigastrico: true },
    textos: [
      "Tengo un dolor de cabeza que no se me pasa con nada desde ayer, y veo como lucecitas. También me duele acá arriba de la guata.",
      "Me duele mucho la cabeza, no me alivia nada, y de repente veo borroso. Me siento hinchada.",
    ],
    razonamiento:
      "Cefalea persistente que no cede, alteración visual y dolor epigástrico en el puerperio. Señal de alarma para preeclampsia postparto, requiere control de presión arterial.",
    accion: "Contactar hoy para control de presión arterial y evaluación por matrona o médico.",
  },
  {
    sospecha: "hemorragia_tardia",
    cita: "§4",
    dias: [1, 16],
    hallazgos: { sangrado_aumentado: true, dolor_abdominal: true },
    textos: [
      "Me aumentó harto el sangrado, estoy cambiando la toalla cada una hora y salieron coágulos grandes.",
      "El sangrado había bajado y hoy volvió fuerte, con coágulos. Me siento mareada cuando me paro.",
    ],
    razonamiento:
      "Aumento del sangrado con recambio de apósito por hora y coágulos, posterior a disminución previa. Hallazgos compatibles con hemorragia postparto tardía.",
    accion: "Contactar hoy, cuantificar apósitos y evaluar derivación según protocolo del establecimiento.",
  },
  {
    sospecha: "mastitis",
    cita: "§5.1",
    dias: [5, 30],
    hallazgos: { mastalgia: true, mastalgia_unilateral: true, eritema_mamario: true, fiebre_referida: true, temperatura_c: 38.1 },
    textos: [
      "Tengo la pechuga derecha durísima, roja y caliente, me duele mucho al amamantar. Y tengo 38 de fiebre.",
      "Me salió una zona roja en un pecho, muy sensible, con fiebre y me siento como con gripe.",
    ],
    razonamiento:
      "Mastalgia unilateral con eritema mamario y fiebre referida, cuadro que excede una congestión mamaria simple. Hallazgos compatibles con mastitis puerperal.",
    accion: "Contactar dentro de 24 h, evaluar técnica de lactancia y derivar a control clínico.",
  },
  {
    sospecha: "infeccion_herida_operatoria",
    cita: "§3.2",
    dias: [3, 20],
    soloCesarea: true,
    hallazgos: { dolor_herida: true, secrecion_herida: true, fiebre_referida: true, temperatura_c: 37.9 },
    textos: [
      "La herida de la cesárea está botando un líquido amarillo y está roja alrededor. Me duele más que los primeros días.",
      "Se me abrió un poquito la herida, está húmeda y con mal olor. Ayer tuve algo de fiebre.",
    ],
    razonamiento:
      "Dolor creciente en herida operatoria con secreción y fiebre referida. Hallazgos compatibles con infección de herida de cesárea.",
    accion: "Contactar dentro de 24 h y coordinar curación y evaluación de la herida.",
  },
  {
    sospecha: "tromboembolismo",
    cita: "§6",
    dias: [1, 42],
    hallazgos: { dolor_pantorrilla_unilateral: true, disnea: true },
    textos: [
      "Tengo la pierna izquierda hinchada y me duele la pantorrilla al pisar. Además me falta el aire al subir la escala.",
      "Me duele mucho una pantorrilla, está más gruesa que la otra y caliente. Me canso mucho al respirar.",
    ],
    razonamiento:
      "Dolor de pantorrilla unilateral con aumento de volumen y disnea de esfuerzo. Señal de alarma para evento tromboembólico, escala directo a riesgo alto.",
    accion: "Contactar de inmediato y coordinar evaluación médica urgente según vía de derivación del establecimiento.",
  },
  {
    sospecha: "depresion_postparto",
    cita: "§7.1",
    dias: [10, 42],
    hallazgos: { animo_bajo: true, anhedonia: true },
    textos: [
      "Llevo como dos semanas llorando todos los días, no tengo ganas de nada, ni de las cosas que me gustaban. Me siento vacía.",
      "No puedo dormir aunque la guagua duerma, ando triste todo el día y siento que no lo estoy haciendo bien.",
    ],
    razonamiento:
      "Ánimo bajo persistente y anhedonia por más de dos semanas. Corresponde aplicar tamizaje de salud mental perinatal.",
    accion: "Contactar dentro de 48 h y aplicar tamizaje según §7.1.",
  },
  {
    sospecha: "depresion_postparto",
    cita: "§7.2",
    dias: [7, 42],
    hallazgos: { animo_bajo: true, anhedonia: true, ideacion_autolitica: true },
    textos: [
      "A veces pienso que sería mejor no estar, que ellos estarían mejor sin mí. No se lo he dicho a nadie.",
      "Estoy muy mal, he pensado en hacerme daño. Me da miedo decirlo.",
    ],
    razonamiento:
      "Refiere ideación autolítica. Según §7.2 escala a riesgo alto de forma inmediata, sin importar el resto de los hallazgos.",
    accion: "Contactar de inmediato y activar la vía de derivación de salud mental del establecimiento.",
  },
  {
    sospecha: "dificultad_lactancia",
    cita: "§5.2",
    dias: [2, 25],
    hallazgos: { dificultad_lactancia: true, mastalgia: true },
    textos: [
      "Me duelen mucho los pezones, están agrietados y la guagua no se prende bien. Estoy pensando en darle relleno.",
      "Siento que no tengo leche suficiente, la guagua llora después de mamar y yo quedo con dolor.",
    ],
    razonamiento:
      "Dificultad de acople con grietas y dolor mantenido, con riesgo de destete precoz. No hay señales de infección.",
    accion: "Agendar apoyo en lactancia dentro de 48 h.",
  },
];

const TEXTOS_BENIGNOS = [
  "Hoy me sentí bastante mejor, dormí un par de horas seguidas.",
  "Todo bien por acá, el sangrado va bajando de a poco.",
  "Estoy cansada pero sin dolores. La guagua está mamando bien.",
  "Me duele un poco la espalda, nada más. Sin fiebre.",
  "Ando con sueño no más, pero tranquila. Sin sangrado raro.",
  "La herida se ve bien, seca y sin dolor.",
  "Un poco sensible de ánimo, pero nada grave. Con apoyo en la casa.",
];

const PREGUNTAS_SISTEMA = [
  "Buenos días. ¿Cómo se ha sentido hoy? ¿Ha tenido fiebre, dolor o cambios en el sangrado?",
  "Hola. ¿Cómo va la lactancia y cómo está su ánimo estos días?",
  "Buenas tardes. ¿Ha notado algún cambio en el sangrado o en la herida?",
  "Hola. ¿Cómo durmió y cómo se siente hoy?",
];

// ---------------------------------------------------------------- generación

const HALLAZGOS_VACIOS: Hallazgos = {
  fiebre_referida: null,
  temperatura_c: null,
  dolor_abdominal: null,
  sangrado_aumentado: null,
  loquios_mal_olor: null,
  cefalea_intensa: null,
  alteracion_visual: null,
  dolor_epigastrico: null,
  mastalgia: null,
  mastalgia_unilateral: null,
  eritema_mamario: null,
  dolor_herida: null,
  secrecion_herida: null,
  dolor_pantorrilla_unilateral: null,
  disnea: null,
  animo_bajo: null,
  anhedonia: null,
  ideacion_autolitica: null,
  dificultad_lactancia: null,
  texto_relevante: null,
};

const hoy = new Date();
hoy.setHours(0, 0, 0, 0);

const fechaMenosDias = (dias: number) => new Date(hoy.getTime() - dias * 86400000);
const isoDia = (d: Date) => d.toISOString().slice(0, 10);

type Fila = Record<string, unknown>;

function generar() {
  const puerperas: Fila[] = [];
  const mensajes: Fila[] = [];
  const evaluaciones: Fila[] = [];
  const alertas: Fila[] = [];

  for (let i = 0; i < N_PUERPERAS; i++) {
    const region = pesado(REGIONES.map((r) => [r, r.peso] as const));
    const prevision = pesado(PREVISIONES) as Prevision;
    const privado = region.privados.length > 0 && rnd() < P_PRIVADO[prevision];
    const establecimiento = uno(privado ? region.privados : region.publicos);
    const tipo_parto: TipoParto =
      rnd() < (privado ? P_CESAREA.privado : P_CESAREA.publico) ? "cesarea" : "vaginal";

    const [min, max] = pesado(TRAMOS_EDAD.map(([t, p]) => [t, p] as const));
    const edad = entre(min, max);

    // Días 1 a 42 repartidos: el día del puerperio es 1 el mismo día del parto.
    const diaActual = entre(1, 42);
    const fecha_parto = fechaMenosDias(diaActual - 1);

    const comorbilidades = COMORBILIDADES.filter(([, p]) => rnd() < p).map(([c]) => c);

    const id = crypto.randomUUID();
    puerperas.push({
      id,
      nombre: `${uno(NOMBRES)} ${uno(APELLIDOS)} ${uno(APELLIDOS)}`,
      edad,
      tipo_parto,
      fecha_parto: isoDia(fecha_parto),
      prevision,
      region: region.nombre,
      establecimiento,
      comorbilidades,
    });

    // Perfil de evolución: la mayoría cursa un puerperio sin señales de alarma.
    const perfil = pesado([
      ["sano", 0.72],
      ["medio", 0.2],
      ["alto", 0.08],
    ] as const);

    const disponibles = ESCENARIOS.filter(
      (e) => (!e.soloCesarea || tipo_parto === "cesarea") && e.dias[0] <= diaActual
    );
    const escenario = perfil === "sano" || disponibles.length === 0 ? null : uno(disponibles);
    // El cuadro puede persistir en más de un contacto: la franja necesita más de una celda marcada.
    const diasEvento = new Set<number>();
    if (escenario) {
      const hasta = Math.min(escenario.dias[1], diaActual);
      const primero = entre(escenario.dias[0], hasta);
      diasEvento.add(primero);
      for (let k = 1; k <= 2; k++)
        if (rnd() < 0.45 - 0.15 * k && primero + k <= hasta) diasEvento.add(primero + k);
    }

    for (let dia = 1; dia <= diaActual; dia++) {
      const esEvento = diasEvento.has(dia);
      if (!esEvento && rnd() > 0.42) continue;

      const ts = new Date(fecha_parto.getTime() + (dia - 1) * 86400000 + entre(8, 21) * 3600000);
      const at = ts.toISOString();

      mensajes.push({
        id: crypto.randomUUID(),
        puerpera_id: id,
        autor: "sistema",
        texto: uno(PREGUNTAS_SISTEMA),
        dia_puerperio: dia,
        created_at: new Date(ts.getTime() - 1800000).toISOString(),
      });

      const mensaje_id = crypto.randomUUID();
      const texto = esEvento && escenario ? uno(escenario.textos) : uno(TEXTOS_BENIGNOS);
      mensajes.push({
        id: mensaje_id,
        puerpera_id: id,
        autor: "puerpera",
        texto,
        dia_puerperio: dia,
        created_at: at,
      });

      const nivel: NivelRiesgo = !esEvento
        ? "bajo"
        : escenario!.hallazgos.ideacion_autolitica || perfil === "alto"
          ? "alto"
          : "medio";

      const evaluacion_id = crypto.randomUUID();
      evaluaciones.push({
        id: evaluacion_id,
        puerpera_id: id,
        mensaje_id,
        dia_puerperio: dia,
        hallazgos: esEvento
          ? { ...HALLAZGOS_VACIOS, ...escenario!.hallazgos, texto_relevante: texto }
          : { ...HALLAZGOS_VACIOS, texto_relevante: texto },
        nivel_riesgo: nivel,
        sospechas: esEvento ? [escenario!.sospecha] : ["sin_hallazgos"],
        cita_protocolo: esEvento ? escenario!.cita : "§1.1",
        razonamiento: esEvento
          ? escenario!.razonamiento
          : "Sin señales de alarma en el relato. Continúa seguimiento habitual.",
        created_at: at,
      });

      if (nivel === "bajo") continue;

      // Lo viejo ya fue atendido; lo de los últimos 3 días sigue esperando a la matrona.
      const antiguedad = diaActual - dia;
      const estado =
        antiguedad <= 2 ? "pendiente" : antiguedad <= 5 ? (rnd() < 0.5 ? "vista" : "resuelta") : "resuelta";

      alertas.push({
        id: crypto.randomUUID(),
        puerpera_id: id,
        evaluacion_id,
        nivel,
        titulo: `Sospecha de ${ETIQUETA_TITULO[escenario!.sospecha]}, día ${dia}`,
        accion_sugerida: escenario!.accion,
        cita_protocolo: escenario!.cita,
        estado,
        created_at: at,
        resuelta_at:
          estado === "resuelta" ? new Date(ts.getTime() + entre(2, 30) * 3600000).toISOString() : null,
      });
    }
  }

  return { puerperas, mensajes, evaluaciones, alertas };
}

/** Titular de la fila del panel. Nunca afirma un diagnóstico. */
const ETIQUETA_TITULO: Record<Sospecha, string> = {
  preeclampsia_postparto: "preeclampsia postparto",
  hemorragia_tardia: "hemorragia postparto tardía",
  endometritis: "endometritis puerperal",
  mastitis: "mastitis puerperal",
  infeccion_herida_operatoria: "infección de herida operatoria",
  tromboembolismo: "evento tromboembólico",
  depresion_postparto: "sintomatología depresiva",
  dificultad_lactancia: "dificultad en lactancia",
  sin_hallazgos: "seguimiento",
};

async function insertar(supabase: ReturnType<typeof cliente>, tabla: string, filas: Fila[]) {
  for (let i = 0; i < filas.length; i += 500) {
    const { error } = await supabase.from(tabla).insert(filas.slice(i, i + 500));
    if (error) throw new Error(`${tabla}: ${error.message}`);
  }
  console.log(`  ${tabla}: ${filas.length}`);
}

async function seed() {
  const seco = process.argv.includes("--dry"); // genera y resume sin tocar la base
  if (!seco && !process.env.NEXT_PUBLIC_SUPABASE_URL)
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL en .env.local");

  const datos = generar();

  if (!seco) {
    const supabase = cliente();
    // Idempotencia: puerperas cascadea a mensajes, evaluaciones y alertas.
    const { error } = await supabase.from("puerperas").delete().gte("edad", 0);
    if (error) throw new Error(`borrado: ${error.message}`);

    console.log("Sembrando:");
    await insertar(supabase, "puerperas", datos.puerperas);
    await insertar(supabase, "mensajes", datos.mensajes);
    await insertar(supabase, "evaluaciones", datos.evaluaciones);
    await insertar(supabase, "alertas", datos.alertas);
  } else {
    console.log(
      `dry run — puerperas ${datos.puerperas.length}, mensajes ${datos.mensajes.length}, ` +
        `evaluaciones ${datos.evaluaciones.length}, alertas ${datos.alertas.length}`
    );
  }

  const cesareas = datos.puerperas.filter((p) => p.tipo_parto === "cesarea").length;
  const pendientes = datos.alertas.filter((a) => a.estado === "pendiente").length;
  console.log(
    `\nCesáreas: ${((cesareas / datos.puerperas.length) * 100).toFixed(1)}% · ` +
      `alertas pendientes: ${pendientes} · edad promedio: ` +
      `${(datos.puerperas.reduce((s, p) => s + (p.edad as number), 0) / datos.puerperas.length).toFixed(1)}`
  );
}

seed().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  }
);
