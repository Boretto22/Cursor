import type { CategoriaTecnica } from "../db/types";

export interface TecnicaInfo {
  id: string;
  nombre: string;
  categoria: CategoriaTecnica;
  descripcion: string;
  dificultad: 1 | 2 | 3;
}

export const TECNICAS: TecnicaInfo[] = [
  // Pies
  {
    id: "puntera",
    nombre: "Puntera precisa",
    categoria: "pies",
    descripcion:
      "Trabaja la precisión apoyando solo la punta del pie en pequeños cantos. Mantén el talón estable.",
    dificultad: 1,
  },
  {
    id: "canto-interno",
    nombre: "Canto interno",
    categoria: "pies",
    descripcion:
      "Usa el borde interno del pie de escalada para presas pequeñas. Reduce fatiga en los gemelos.",
    dificultad: 1,
  },
  {
    id: "canto-externo",
    nombre: "Canto externo / flag",
    categoria: "pies",
    descripcion:
      "El borde externo permite mantener cadera pegada y abre el cuerpo. Útil en placa.",
    dificultad: 2,
  },
  {
    id: "talonamiento",
    nombre: "Talonamiento",
    categoria: "pies",
    descripcion: "Engancha el talón para descargar peso del tren superior y bloquear movimientos.",
    dificultad: 2,
  },
  {
    id: "puntera-invertida",
    nombre: "Puntera invertida (toe hook)",
    categoria: "pies",
    descripcion: "Engancha el empeine bajo un canto o volumen para bloquear.",
    dificultad: 3,
  },
  {
    id: "huevo",
    nombre: "Huevo (smearing)",
    categoria: "pies",
    descripcion: "Apoyo a fricción sobre pared sin presa. Fundamental en placa y granito.",
    dificultad: 2,
  },

  // Manos
  {
    id: "regletas",
    nombre: "Agarre en regletas",
    categoria: "manos",
    descripcion:
      "Trabaja el grip semi-arqueado en cantos pequeños sin abusar del arqueo total.",
    dificultad: 2,
  },
  {
    id: "romos",
    nombre: "Agarre en romos",
    categoria: "manos",
    descripcion: "Trabaja la fuerza de muñeca y contacto en presas redondeadas.",
    dificultad: 2,
  },
  {
    id: "bidedos",
    nombre: "Bidedos / Monodedos",
    categoria: "manos",
    descripcion: "Trabajo específico en agujeros. Empieza con bidedos antes que monodedos.",
    dificultad: 3,
  },
  {
    id: "pinzas",
    nombre: "Pinzas",
    categoria: "manos",
    descripcion: "Trabaja fuerza de pulgar y aproximación. Imprescindible en bloque.",
    dificultad: 2,
  },
  {
    id: "diedro",
    nombre: "Empotres y diedros",
    categoria: "manos",
    descripcion: "Aprende a empotrar manos y puños en fisuras.",
    dificultad: 2,
  },

  // Equilibrio
  {
    id: "placa",
    nombre: "Placa estática",
    categoria: "equilibrio",
    descripcion: "Pies precisos, cuerpo cerca de la pared, peso en talones bajos.",
    dificultad: 1,
  },
  {
    id: "cadera-pared",
    nombre: "Cadera a pared",
    categoria: "equilibrio",
    descripcion: "Gira la cadera para acercar peso a la pared y liberar un brazo.",
    dificultad: 2,
  },
  {
    id: "rocking",
    nombre: "Rock-over",
    categoria: "equilibrio",
    descripcion: "Transferencia de peso sobre un pie alto para incorporarte.",
    dificultad: 2,
  },
  {
    id: "drop-knee",
    nombre: "Drop-knee (rodilla caída)",
    categoria: "equilibrio",
    descripcion: "Rota la rodilla hacia dentro para extender alcance y bloquear.",
    dificultad: 2,
  },

  // Fuerza
  {
    id: "bloqueo",
    nombre: "Bloqueo de brazo",
    categoria: "fuerza",
    descripcion: "Mantén un ángulo cerrado en el codo el tiempo necesario para avanzar.",
    dificultad: 2,
  },
  {
    id: "campus",
    nombre: "Campus / Dinámicos",
    categoria: "fuerza",
    descripcion: "Movimientos explosivos sin pies. Solo con buena base de fuerza.",
    dificultad: 3,
  },
  {
    id: "core",
    nombre: "Tensión de core",
    categoria: "fuerza",
    descripcion: "Mantén tensión abdominal en desplomes y techos.",
    dificultad: 2,
  },
  {
    id: "lock-off",
    nombre: "Lock-off profundo",
    categoria: "fuerza",
    descripcion: "Bloqueo con brazo doblado >90° para alcanzar presa lejana.",
    dificultad: 3,
  },

  // Coordinación
  {
    id: "dyno",
    nombre: "Dyno (salto)",
    categoria: "coordinacion",
    descripcion: "Salto controlado entre presas lejanas. Coordina pies-cadera-manos.",
    dificultad: 3,
  },
  {
    id: "double-clutch",
    nombre: "Double clutch",
    categoria: "coordinacion",
    descripcion: "Dyno con dos manos a la vez sobre la misma presa.",
    dificultad: 3,
  },
  {
    id: "deadpoint",
    nombre: "Deadpoint",
    categoria: "coordinacion",
    descripcion: "Movimiento dinámico atrapando la presa justo en el punto muerto del salto.",
    dificultad: 2,
  },
  {
    id: "ritmo",
    nombre: "Lectura y ritmo",
    categoria: "coordinacion",
    descripcion: "Encadena movimientos a un ritmo constante sin perder posición.",
    dificultad: 1,
  },
];

export const CATEGORIAS_TECNICA: { id: CategoriaTecnica; nombre: string; emoji: string }[] = [
  { id: "pies", nombre: "Pies", emoji: "🦶" },
  { id: "manos", nombre: "Manos", emoji: "✋" },
  { id: "equilibrio", nombre: "Equilibrio", emoji: "⚖️" },
  { id: "fuerza", nombre: "Fuerza", emoji: "💪" },
  { id: "coordinacion", nombre: "Coordinación", emoji: "🎯" },
];

export function tecnicasPorCategoria(cat: CategoriaTecnica): TecnicaInfo[] {
  return TECNICAS.filter((t) => t.categoria === cat);
}
