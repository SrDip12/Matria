/**
 * Cohorte sintética. Ninguna persona es real: los nombres se arman combinando dos listas, y no
 * hay RUT, teléfono ni ficha en ningún campo. Idempotente: borra y repuebla las cinco tablas.
 *
 * Todas las distribuciones salen de los datasets de `Datos/`, con la trazabilidad en
 * docs/DATOS_DEIS.md. Lo que aporta cada archivo:
 *   - `EGR_DATOS_ABIERTO_2025.csv` (DEIS, egresos): región, tipo de parto, previsión, sector,
 *     comorbilidades y la mezcla relativa de cuadros puerperales. n = 80.654 partos de 2025.
 *   - `series-vitales-mensuales-2024p-2026p.xlsx` (INE): edad de la madre, año 2025 completo.
 *   - `Esquema_Registros_2026.xlsx` (Anexo 4 DEIS): nombre oficial de cada establecimiento.
 *   - `NORMA-TECNICA-...-PUERPERIO...pdf` y `GUIA-PERINATAL_2015...pdf` (MINSAL): etapas del
 *     puerperio, días de control y ventanas temporales de las complicaciones.
 * `DEFUNCIONES_FUENTE_DEIS_2024_2026_04082026.csv` ya no alimenta el seed: se usaba como proxy
 * de la distribución regional y quedó reemplazado por los partos reales del archivo de egresos.
 *
 * Correr con: pnpm db:seed · revisar sin tocar la base ni instalar nada: node scripts/seed.ts --dry
 */
// import type: se borra en tiempo de ejecución, así el alias @/ no necesita resolverse en Node.
import type { Hallazgos, NivelRiesgo, Prevision, Sospecha, TipoParto } from "@/lib/types";

// Import dinámico a propósito: así `--dry` corre sin node_modules y cualquiera puede revisar
// las distribuciones de la cohorte sin instalar nada ni tener credenciales.
const cliente = async () => {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

const N_PUERPERAS = 200;

// Copia local de la constante de src/lib/types.ts: el alias @/ no se resuelve corriendo en Node
// y la importación de arriba es solo de tipos. Si cambia allá, cambia acá.
const DIAS_PUERPERIO = 42;

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
 * Regiones: glosa oficial DEIS, escrita igual que en `GLOSA_REGION_RESIDENCIA` del archivo de
 * egresos. Peso = proporción real de egresos por parto (DIAG1 en O80–O84) de
 * `Datos/EGR_DATOS_ABIERTO_2025.csv`, sobre los 72.983 partos con región identificada, de
 * 80.654 totales. Quedan fuera del denominador 6.772 filas suprimidas por DEIS, 693 "Ignorada"
 * y 206 "Extranjero". Reemplaza el proxy anterior por defunciones de mujeres en edad fértil.
 *
 * Los Ríos queda en 0,67% con n=491, por debajo de Aisén (n=672) pese a tener el triple de
 * población. Es lo que trae el archivo; se deja tal cual porque el dato es real y trazable, no
 * se corrige a ojo. La variable es región de *residencia*, no del establecimiento.
 *
 * Establecimientos: `Nombre Oficial` del Anexo 4 "Establecimientos de procedencia" del Esquema
 * de Registros DEIS 2026, verificado byte a byte. Las rarezas de escritura son del anexo y no
 * se normalizan: doble espacio en "Hospital  Félix Bulnes Cerda", espacio tras el paréntesis en
 * "Hospital Claudio Vicuña ( San Antonio)", "Clinica Andes Salud Chillan" sin tildes.
 * Única excepción: el anexo guarda "Hospital de Alto Hospicio " con un espacio final, que acá
 * va sin él porque el nombre se muestra en el panel.
 */
const REGIONES = [
  {
    nombre: "De Arica y Parinacota",
    peso: 0.0245, // 1.788 partos
    publicos: ["Hospital Regional Dr. Juan Noé Crevani (Arica)"],
    privados: ["Clínica San José"],
  },
  {
    nombre: "De Tarapacá",
    peso: 0.0231, // 1.683 partos
    publicos: ["Hospital Dr. Ernesto Torres Galdames (Iquique)", "Hospital de Alto Hospicio"],
    privados: ["Clínica Iquique"],
  },
  {
    nombre: "De Antofagasta",
    peso: 0.0543, // 3.960 partos
    publicos: ["Hospital Dr. Leonardo Guzmán (Antofagasta)", "Hospital Dr. Carlos Cisternas (Calama)"],
    privados: ["Clínica Bupa Antofagasta"],
  },
  {
    nombre: "De Atacama",
    peso: 0.0255, // 1.861 partos
    publicos: [
      "Hospital San José del Carmen (Copiapó)",
      "Hospital Provincial del Huasco Monseñor Fernando Ariztía Ruiz (Vallenar)",
    ],
    privados: ["Clínica San Lorenzo"],
  },
  {
    nombre: "De Coquimbo",
    peso: 0.069, // 5.032 partos
    publicos: [
      "Hospital San Juan de Dios (La Serena)",
      "Hospital San Pablo (Coquimbo)",
      "Hospital Dr. Antonio Tirado Lanas de Ovalle",
    ],
    privados: ["Clínica Regional Elqui"],
  },
  {
    nombre: "De Valparaíso",
    peso: 0.1023, // 7.464 partos
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
    peso: 0.3676, // 26.831 partos
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
    peso: 0.0482, // 3.514 partos
    publicos: ["Hospital Dr. Franco Ravera Zunino", "Hospital San Juan de Dios de San Fernando"],
    privados: ["Clínica Isamedica"],
  },
  {
    nombre: "Del Maule",
    peso: 0.0624, // 4.552 partos
    publicos: [
      "Hospital Dr. César Garavagno Burotto (Talca)",
      "Hospital San Juan de Dios (Curicó)",
      "Hospital Presidente Carlos Ibáñez del Campo (Linares)",
    ],
    privados: ["Clínica Universidad Católica Del Maule"],
  },
  {
    nombre: "De Ñuble",
    peso: 0.0338, // 2.467 partos
    publicos: ["Hospital Clínico Herminda Martín (Chillán)", "Hospital de San Carlos"],
    privados: ["Clinica Andes Salud Chillan"],
  },
  {
    // La glosa del archivo de egresos es "Del Biobío"; antes acá decía "Del Bíobío".
    nombre: "Del Biobío",
    peso: 0.1065, // 7.773 partos
    publicos: [
      "Hospital Clínico Regional Dr. Guillermo Grant Benavente (Concepción)",
      "Hospital Las Higueras (Talcahuano)",
      "Complejo Asistencial Dr. Víctor Ríos Ruiz (Los Ángeles)",
    ],
    privados: ["Clínica de la Mujer Sanatorio Alemán", "Clínica Andes Salud Concepción"],
  },
  {
    nombre: "De La Araucanía",
    peso: 0.0307, // 2.237 partos
    publicos: [
      "Hospital Dr. Hernán Henríquez Aravena (Temuco)",
      "Hospital Intercultural de Nueva Imperial",
      "Hospital de Villarrica",
    ],
    privados: ["Clínica Alemana de Temuco"],
  },
  {
    nombre: "De Los Ríos",
    peso: 0.0067, // 491 partos — ver nota sobre el subregistro en el bloque de arriba
    publicos: ["Hospital Base Valdivia", "Hospital Juan Morey (La Unión)"],
    privados: ["Clínica Alemana Valdivia"],
  },
  {
    nombre: "De Los Lagos",
    peso: 0.0294, // 2.147 partos
    publicos: ["Hospital de Puerto Montt", "Hospital Base San José de Osorno"],
    privados: ["Clínica Puerto Montt"],
  },
  {
    nombre: "De Aisén del Gral. C. Ibáñez del Campo",
    peso: 0.0092, // 672 partos
    publicos: ["Hospital Regional de Coyhaique", "Hospital de Puerto Aysén"],
    // Sin privados a propósito: el único no perteneciente al SNSS de la región en el Anexo 4 es
    // la Clínica de Trabajador AChS, mutual de accidentes laborales, que no atiende partos.
    // Calza con el dato: 2 de 672 partos de la región fueron fuera del SNSS (0,3%).
    privados: [],
  },
  {
    nombre: "De Magallanes y de La Antártica Chilena",
    peso: 0.007, // 511 partos
    publicos: [
      "Hospital Clínico de Magallanes Dr. Lautaro Navarro Avaria",
      "Hospital Dr. Augusto Essmann Burgos ( Natales)",
    ],
    privados: ["Clínica Magallanes"],
  },
] as const;

/**
 * Edad de la madre. INE, series vitales mensuales, año 2025 provisional completo
 * (`Datos/series-vitales-mensuales-2024p-2026p.xlsx`, hoja Nacimientos, Total País).
 * n = 146.161 nacimientos con edad de la madre especificada, de 146.446 totales; las 285
 * de edad no especificada se excluyen del denominador. Modal 30–34 (29,6%), ≥35 años 25,8%.
 * El esquema acota edad a 12–55, por eso "menos de 15" se genera en 12–14 y "50 y más" en 50–54.
 */
const TRAMOS_EDAD = [
  [[12, 14], 0.00106], // 155
  [[15, 19], 0.03448], // 5.039
  [[20, 24], 0.15616], // 22.825
  [[25, 29], 0.25362], // 37.070
  [[30, 34], 0.29644], // 43.327
  [[35, 39], 0.20233], // 29.573
  [[40, 44], 0.0524], // 7.659
  [[45, 49], 0.00332], // 485
  [[50, 54], 0.00019], // 28
] as const;

/**
 * FONASA 90,7% · ISAPRE 9,3%, sobre los 73.215 partos DEIS 2025 con previsión FONASA o ISAPRE
 * (66.409 y 6.806). Quedan fuera 667 partos de DIPRECA, CAPREDENA, SISA, NINGUNA y DESCONOCIDO,
 * que el enum `Prevision` no representa, y 6.772 con la fila suprimida por DEIS.
 * El desglose de FONASA en tramos A/B/C/D **sigue siendo supuesto del equipo**: el dataset trae
 * "FONASA" sin tramo. Se reparte 26,8 / 31,7 / 17,1 / 24,4 dentro del 90,7%.
 */
const PREVISIONES = [
  ["fonasa_a", 0.2431],
  ["fonasa_b", 0.2875],
  ["fonasa_c", 0.1551],
  ["fonasa_d", 0.2213],
  ["isapre", 0.093],
] as const;

/**
 * Probabilidad de atenderse en establecimiento no perteneciente al SNSS, por previsión.
 * DEIS 2025, cruce GLOSA_PREVISION × PERTENENCIA sobre los 80.654 partos: FONASA 19.091/66.409,
 * ISAPRE 6.708/6.806. El dato es por previsión, no por tramo, así que los cuatro tramos FONASA
 * comparten el mismo valor en vez de inventarles una gradiente.
 */
const P_PRIVADO: Record<Prevision, number> = {
  fonasa_a: 0.2875,
  fonasa_b: 0.2875,
  fonasa_c: 0.2875,
  fonasa_d: 0.2875,
  isapre: 0.9856,
};

/**
 * Cesáreas por dependencia del establecimiento. DEIS 2025, egresos con DIAG1 en O82 sobre
 * egresos con DIAG1 en O80–O84: SNSS 20.042/47.665 = 42,1%; no SNSS 19.658/26.217 = 75,0%.
 * Global observado 43.830/80.654 = 54,3%. Reemplaza la cifra 2021 de OVO/CIPER (49% / 73%).
 */
const P_CESAREA = { publico: 0.4205, privado: 0.7498 };

/**
 * Categorías CIE-10 de la lista de Vale, con prevalencia observada en DEIS 2025: egresos con
 * ese DIAG1 sobre los 80.654 egresos por parto (O80–O84) del mismo año.
 * Advertencia metodológica: DIAG2 viene vacío en 99,9% del archivo, así que un egreso por parto
 * no puede portar comorbilidad codificada. Estas son razones de egresos por patología sobre
 * egresos por parto, no prevalencias intra-parto. Ver docs/DATOS_DEIS.md, cifra 7.
 */
const COMORBILIDADES = [
  ["Síndrome hipertensivo del embarazo", 0.1072], // O10–O16, 8.646 egresos
  ["Diabetes gestacional", 0.1281], // O24, 10.334 egresos
  ["Parto prematuro", 0.0676], // O60, 5.451 egresos
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
  /**
   * Peso relativo del cuadro en la mezcla de eventos, en casos por 1.000 puérperas seguidas.
   *
   * Ojo con la unidad: DEIS mide hospitalizaciones y Matria mira el puerperio en la casa, que
   * es mucho más ancho. Mezclar tasas de egreso con supuestos ambulatorios en la misma escala
   * deja la cohorte deformada. Por eso los pesos observados son **la tasa DEIS multiplicada por
   * un factor único de subregistro de 10×**, aplicado igual a todos para no alterar la mezcla
   * relativa entre cuadros, que es la parte con fuente. El factor está anclado en el único
   * cuadro donde se puede contrastar: mastitis da 0,47% en egresos DEIS 2025 contra un 3%–33%
   * de la literatura clínica, o sea un factor de entre 6 y 70. Se toma 10, el extremo prudente.
   * Cada escenario deja el conteo DEIS crudo en su comentario para que se pueda rehacer.
   */
  peso: number;
  hallazgos: Partial<Hallazgos>;
  textos: readonly string[];
  razonamiento: string;
  accion: string;
};

/**
 * Los § son los identificadores de docs/PROTOCOLO_CLINICO.md. No se renumeran.
 *
 * Sobre los pesos: DEIS solo ve lo que se hospitaliza. Los cuadros somáticos tienen conteo
 * propio en el archivo de egresos y su peso es observado. Los dos que se manejan de forma
 * ambulatoria no lo tienen, y el vacío es en sí mismo un hallazgo del proyecto:
 *   - Salud mental: **F53 aparece 0 veces en los 199.473 egresos obstétricos de 2025**, en
 *     DIAG1 y en DIAG2. El único proxy es O99.3 (968), que mezcla todo trastorno mental y
 *     neurológico del embarazo, parto y puerperio y no es separable. Peso: supuesto del equipo.
 *   - Dificultad de lactancia: O92 existe pero con 71 egresos (0,88 por 1.000 partos), que es
 *     la lactancia que llegó a hospitalizarse, no la que se atiende en APS. Peso: supuesto.
 * Ver docs/DATOS_DEIS.md, sección "Hallazgos negativos".
 */
const ESCENARIOS: readonly Escenario[] = [
  {
    sospecha: "endometritis",
    cita: "§3.1",
    dias: [2, 12],
    // DEIS 2025: O85 sepsis puerperal 205 + O86.1 otras infecciones genitales 31 + O86.4 fiebre
    // puerperal 12 = 248 egresos / 80.654 partos.
    peso: 30.7,
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
    // DEIS 2025: O15.2 eclampsia en el puerperio, 24 egresos. Es el único código de O10–O16 con
    // temporalidad puerperal explícita; para preeclampsia postparto no existe código propio
    // (O14.0/1/2/9 codifican severidad, no momento), así que el peso está subestimado.
    peso: 3.0,
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
    // Ventana según la Norma Técnica del Puerperio (MINSAL 2015) p.58 y la Guía Perinatal 2015
    // p.367: la hemorragia secundaria o tardía es la que ocurre entre las 24 h y las 6 semanas
    // postparto. Antes acá decía [1, 16], que no venía de ninguna fuente.
    dias: [2, 42],
    // DEIS 2025: O72.2 hemorragia postparto tardía y secundaria, 237 egresos. Se usa solo ese
    // subcódigo: O72.0 y O72.1 son del alumbramiento y del postparto inmediato, no del puerperio
    // en casa, que es la ventana de Matria.
    peso: 29.4,
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
    // DEIS 2025: O91 infecciones de la mama asociadas al parto, 382 egresos.
    peso: 47.4,
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
    // Norma Técnica del Puerperio (MINSAL 2015) p.87: la infección de herida operatoria se
    // define dentro de los primeros 30 días posteriores a la cirugía. Antes acá decía [3, 20].
    dias: [3, 30],
    soloCesarea: true,
    // DEIS 2025: O86.0 infección de herida quirúrgica obstétrica, 361 egresos. Es el cuadro
    // puerperal infeccioso más frecuente del archivo, coherente con 54,3% de cesáreas.
    peso: 44.8,
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
    // DEIS 2025: O87 complicaciones venosas del puerperio 23 + O88 embolia obstétrica 19 = 42.
    // Poco frecuente y de letalidad alta: por eso el protocolo lo escala directo a alto.
    peso: 5.2,
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
    // Supuesto del equipo. DEIS no puede aportar: F53 tiene 0 casos en todo el archivo.
    peso: 40,
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
    // Supuesto del equipo, misma razón que §7.1. Se mantiene bajo respecto del tamizaje pero
    // presente: es la regla que escala a alto sin importar el resto de los hallazgos.
    peso: 6,
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
    // Supuesto del equipo. DEIS trae O92 con 71 egresos (0,88 por 1.000 partos), pero eso es
    // la lactancia que terminó hospitalizada; la que atiende una matrona en APS no se registra.
    peso: 25,
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
  // Decía "un poco sensible de ánimo": el agente lo leía como §7.1 y quedaba en medio, contra
  // el "bajo" que le pone el seed. Un relato etiquetado benigno no puede rozar salud mental.
  "Cansada por las noches, pero de buen ánimo. Con harto apoyo en la casa.",
];

const PREGUNTAS_SISTEMA = [
  "Buenos días. ¿Cómo se ha sentido hoy? ¿Ha tenido fiebre, dolor o cambios en el sangrado?",
  "Hola. ¿Cómo va la lactancia y cómo está su ánimo estos días?",
  "Buenas tardes. ¿Ha notado algún cambio en el sangrado o en la herida?",
  "Hola. ¿Cómo durmió y cómo se siente hoy?",
];

/**
 * Qué queda agendado para el próximo contacto. El foco sigue las etapas de la Norma General
 * Técnica para la Atención Integral en el Puerperio (MINSAL, 2015): puerperio inmediato hasta
 * las 24 h, mediato del 2° al 7° día, tardío del 7° al 42 (p.22). Los días 3 y 7 son los del
 * primer control en atención primaria — 3 a 7 días del alta en parto vaginal (p.40), a los 7
 * días con retiro de puntos en cesárea (p.41) — y entre el 15 y el 30 va el segundo control
 * (p.50). Orientar sobre el control es lo que pide la norma; el sistema no agenda nada.
 *
 * Placeholder deliberado: esto lo reemplaza el loop de seguimiento del agente cuando exista
 * (CLAUDE.md §9.B). Acá solo deja la agenda poblada para que el panel no abra en blanco.
 */
function preguntaSiguiente(dia: number, cesarea: boolean, alertaAbierta: boolean): string {
  if (alertaAbierta)
    return "Quiero saber cómo siguió desde ayer. ¿Lo que me contó se mantuvo igual, mejoró o empeoró?";
  if (dia === 3 || dia === 7 || dia === 15)
    return "Estos días le corresponde su control de puerperio en el centro de salud. ¿Sabe cuándo le toca? Cuénteme también cómo se ha sentido.";
  if (dia <= 7)
    return cesarea
      ? "¿Cómo está la herida de la cesárea: seca, con dolor o con alguna secreción? ¿Ha tenido fiebre?"
      : "¿Cómo está el sangrado y cómo siente el vientre? ¿Ha tenido fiebre de 38°C o más?";
  if (dia <= 30)
    return "¿Cómo va la lactancia y cómo siente los pechos? ¿Ha notado alguna zona roja, dura o dolorosa?";
  return "¿Cómo ha estado su ánimo esta semana? ¿Ha podido descansar y ha tenido con quién apoyarse?";
}

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

// Día de puerperio a partir de la fecha de parto, igual que la vista puerperas_activas.
// Se compara sobre las cadenas ISO, no sobre Date locales, para que no dependa del huso.
const diaDe = (fechaParto: string) =>
  Math.round((Date.parse(isoDia(hoy)) - Date.parse(fechaParto)) / 86400000) + 1;

type Fila = Record<string, unknown>;

function generar() {
  const puerperas: Fila[] = [];
  const mensajes: Fila[] = [];
  const evaluaciones: Fila[] = [];
  const alertas: Fila[] = [];
  const preguntas: Fila[] = [];

  for (let i = 0; i < N_PUERPERAS; i++) {
    /**
     * Cobertura garantizada. Las primeras 16 filas toman una región cada una y las primeras 9
     * un escenario clínico cada una; el resto se muestrea con las distribuciones reales.
     * Con 200 mujeres, Aisén (0,9%) y el tromboembolismo (0,5 por 1.000 partos) se caen del
     * muestreo en buena parte de las corridas, y la demo no puede depender del azar para que
     * el panel muestre las nueve señales del protocolo.
     */
    const region =
      i < REGIONES.length ? REGIONES[i] : pesado(REGIONES.map((r) => [r, r.peso] as const));
    const forzado = i < ESCENARIOS.length ? ESCENARIOS[i] : null;

    const prevision = pesado(PREVISIONES) as Prevision;
    const privado = region.privados.length > 0 && rnd() < P_PRIVADO[prevision];
    const establecimiento = uno(privado ? region.privados : region.publicos);
    const tipo_parto: TipoParto = forzado?.soloCesarea
      ? "cesarea"
      : rnd() < (privado ? P_CESAREA.privado : P_CESAREA.publico)
        ? "cesarea"
        : "vaginal";

    const [min, max] = pesado(TRAMOS_EDAD.map(([t, p]) => [t, p] as const));
    const edad = entre(min, max);

    // Días 1 a 42 repartidos: el día del puerperio es 1 el mismo día del parto.
    // Con escenario forzado el día actual cae dentro de la ventana del cuadro; si no, el
    // escenario no alcanza a dispararse y la fila de cobertura queda vacía.
    const diaActual = forzado ? entre(forzado.dias[0], Math.min(DIAS_PUERPERIO, forzado.dias[1])) : entre(1, 42);
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
    const escenario =
      forzado ??
      (perfil === "sano" || disponibles.length === 0
        ? null
        : pesado(disponibles.map((e) => [e, e.peso] as const)));
    // El cuadro puede persistir en más de un contacto: la franja necesita más de una celda marcada.
    const diasEvento = new Set<number>();
    if (escenario) {
      const hasta = Math.min(escenario.dias[1], diaActual);
      // Las filas de cobertura ponen el evento en el día actual: así la alerta queda pendiente
      // y la matrona la encuentra arriba en el panel apenas abre, sin tener que buscarla.
      const primero = forzado ? hasta : entre(escenario.dias[0], hasta);
      diasEvento.add(primero);
      for (let k = 1; k <= 2; k++)
        if (rnd() < 0.45 - 0.15 * k && primero + k <= hasta) diasEvento.add(primero + k);
    }

    for (let dia = 1; dia <= diaActual; dia++) {
      const esEvento = diasEvento.has(dia);
      // El día actual siempre tiene contacto: el panel se abre en la mañana y ninguna fila
      // puede quedar sin evaluación de hoy. El resto de los días se contactan al azar.
      if (dia !== diaActual && !esEvento && rnd() > 0.42) continue;

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

      // §5.2 es apoyo en lactancia, no urgencia: no puede subir a alto por evolución. Una
      // alerta de riesgo alto cuya acción es "agendar apoyo dentro de 48 h" no se sostiene.
      const puedeSerAlto = escenario?.sospecha !== "dificultad_lactancia";
      const nivel: NivelRiesgo = !esEvento
        ? "bajo"
        : escenario!.hallazgos.ideacion_autolitica || // Protocolo §7.2 — sin excepción
            escenario!.sospecha === "tromboembolismo" || // Protocolo §6 — escala directo a alto
            (perfil === "alto" && puedeSerAlto)
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

    // Lo que el agente dejó agendado para mañana. Una sola fila pendiente por puérpera: la
    // agenda es el próximo contacto, no un calendario completo de los 42 días.
    if (diaActual < DIAS_PUERPERIO) {
      const abierta = alertas.some((a) => a.puerpera_id === id && a.estado === "pendiente");
      preguntas.push({
        id: crypto.randomUUID(),
        puerpera_id: id,
        dia_puerperio: diaActual + 1,
        texto: preguntaSiguiente(diaActual + 1, tipo_parto === "cesarea", abierta),
        enviada: false,
      });
    }
  }

  return { puerperas, mensajes, evaluaciones, alertas, preguntas };
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

// ---------------------------------------------------------------- verificación

type Datos = ReturnType<typeof generar>;

/**
 * Chequeo de la cohorte antes de tocar la base. Falla ruidoso si el seed deja de servir a la
 * demo: si falta una región, si alguna de las ocho sospechas del protocolo no aparece en el
 * panel, si no queda ninguna alerta pendiente, o si la mezcla se aleja de las cifras DEIS.
 * Corre siempre, también en `--dry`. Es el único test del proyecto y es a propósito.
 */
function verificar(d: Datos) {
  const fallas: string[] = [];
  const revisar = (ok: boolean, queja: string) => {
    if (!ok) fallas.push(queja);
  };

  const regiones = new Set(d.puerperas.map((p) => p.region));
  for (const r of REGIONES) revisar(regiones.has(r.nombre), `región sin puérperas: ${r.nombre}`);

  const sospechas = new Set(d.evaluaciones.flatMap((e) => e.sospechas as Sospecha[]));
  for (const e of ESCENARIOS)
    revisar(sospechas.has(e.sospecha), `sospecha sin ningún caso: ${e.sospecha}`);

  const pendientes = d.alertas.filter((a) => a.estado === "pendiente");
  revisar(pendientes.length > 0, "ninguna alerta pendiente: el panel abre vacío");
  revisar(
    pendientes.some((a) => a.nivel === "alto"),
    "ninguna alerta pendiente de riesgo alto: la fila de arriba del panel no comunica urgencia"
  );

  const conMensajes = new Set(d.mensajes.map((m) => m.puerpera_id));
  revisar(
    conMensajes.size === d.puerperas.length,
    `${d.puerperas.length - conMensajes.size} puérperas sin ningún mensaje`
  );

  revisar(
    d.evaluaciones.every((e) => typeof e.cita_protocolo === "string" && e.cita_protocolo !== ""),
    "hay evaluaciones sin cita del protocolo"
  );

  const enCurso = d.puerperas.filter((p) => diaDe(p.fecha_parto as string) < DIAS_PUERPERIO).length;
  revisar(
    d.preguntas.length === enCurso,
    `${enCurso - d.preguntas.length} puérperas sin próxima pregunta agendada`
  );
  revisar(
    d.preguntas.every((q) => (q.dia_puerperio as number) <= DIAS_PUERPERIO),
    "hay preguntas agendadas más allá del día 42"
  );

  const cesareas = d.puerperas.filter((p) => p.tipo_parto === "cesarea").length / d.puerperas.length;
  revisar(
    Math.abs(cesareas - 0.5366) < 0.08,
    `cesáreas ${(cesareas * 100).toFixed(1)}%, se esperaba ~53,7% al combinar las tasas DEIS por dependencia`
  );

  if (fallas.length) throw new Error(`cohorte inválida:\n  - ${fallas.join("\n  - ")}`);
  return cesareas;
}

// ---------------------------------------------------------------- siembra

async function insertar(
  supabase: Awaited<ReturnType<typeof cliente>>,
  tabla: string,
  filas: Fila[]
) {
  for (let i = 0; i < filas.length; i += 500) {
    const { error } = await supabase.from(tabla).insert(filas.slice(i, i + 500));
    if (error) throw new Error(`${tabla}: ${error.message}`);
  }
  console.log(`  ${tabla}: ${filas.length}`);
}

function resumir(d: Datos, cesareas: number) {
  const n = d.puerperas.length;
  const edad = d.puerperas.reduce((s, p) => s + (p.edad as number), 0) / n;
  const isapre = d.puerperas.filter((p) => p.prevision === "isapre").length / n;
  const porEstado = (e: string) => d.alertas.filter((a) => a.estado === e).length;

  console.log(
    `\nCohorte vs. DEIS/INE (la referencia va entre paréntesis):\n` +
      `  cesáreas        ${(cesareas * 100).toFixed(1)}%  (54,3% observado DEIS 2025)\n` +
      `  ISAPRE          ${(isapre * 100).toFixed(1)}%  (9,3% de los partos DEIS 2025)\n` +
      `  edad promedio   ${edad.toFixed(1)}  (modal 30–34, INE 2025)\n` +
      `\nAlertas: ${porEstado("pendiente")} pendientes · ${porEstado("vista")} vistas · ` +
      `${porEstado("resuelta")} resueltas`
  );

  const porSospecha = new Map<string, number>();
  for (const a of d.alertas) {
    const clave = String(a.titulo).replace(/^Sospecha de /, "").replace(/, día \d+$/, "");
    porSospecha.set(clave, (porSospecha.get(clave) ?? 0) + 1);
  }
  console.log(
    "\nMezcla de señales:\n" +
      [...porSospecha.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `  ${v.toString().padStart(3)}  ${k}`)
        .join("\n")
  );
}

async function seed() {
  const seco = process.argv.includes("--dry"); // genera y verifica sin tocar la base
  if (!seco && !process.env.NEXT_PUBLIC_SUPABASE_URL)
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL en .env.local");

  const datos = generar();
  const cesareas = verificar(datos);

  if (seco) {
    console.log(
      `dry run — puerperas ${datos.puerperas.length}, mensajes ${datos.mensajes.length}, ` +
        `evaluaciones ${datos.evaluaciones.length}, alertas ${datos.alertas.length}, ` +
        `preguntas ${datos.preguntas.length}`
    );
  } else {
    const supabase = await cliente();
    // Idempotencia: puerperas cascadea a mensajes, evaluaciones, alertas y preguntas.
    const { error } = await supabase.from("puerperas").delete().gte("edad", 0);
    if (error) throw new Error(`borrado: ${error.message}`);

    console.log("Sembrando:");
    await insertar(supabase, "puerperas", datos.puerperas);
    await insertar(supabase, "mensajes", datos.mensajes);
    await insertar(supabase, "evaluaciones", datos.evaluaciones);
    await insertar(supabase, "alertas", datos.alertas);
    await insertar(supabase, "preguntas_programadas", datos.preguntas);
  }

  resumir(datos, cesareas);
}

seed().then(
  () => process.exit(0),
  (e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
);
