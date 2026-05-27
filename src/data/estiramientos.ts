import type { RutinaEstiramiento } from "../db/types";

export const RUTINAS_ESTIRAMIENTO: RutinaEstiramiento[] = [
  {
    id: "pre-completa",
    nombre: "Calentamiento pre-escalada",
    tipo: "pre",
    ejercicios: [
      {
        id: "muneca-circulos",
        nombre: "Círculos de muñeca",
        duracionSeg: 30,
        descripcion: "15 segundos en cada dirección.",
        zonaCorporal: ["munecas"],
      },
      {
        id: "dedos-flexion",
        nombre: "Movilidad de dedos",
        duracionSeg: 45,
        descripcion: "Abre y cierra las manos lentamente.",
        zonaCorporal: ["dedos", "antebrazo"],
      },
      {
        id: "hombros-rotacion",
        nombre: "Rotación de hombros",
        duracionSeg: 40,
        descripcion: "Adelante 20s, atrás 20s.",
        zonaCorporal: ["hombro"],
      },
      {
        id: "cuello-lateral",
        nombre: "Inclinación cervical",
        duracionSeg: 30,
        descripcion: "15s a cada lado, sin forzar.",
      },
      {
        id: "torso-rotacion",
        nombre: "Rotación de torso",
        duracionSeg: 40,
        descripcion: "Pies separados, brazos relajados.",
        zonaCorporal: ["espalda", "core"],
      },
      {
        id: "cadera-circulos",
        nombre: "Círculos de cadera",
        duracionSeg: 40,
        descripcion: "20s a cada lado.",
        zonaCorporal: ["cadera"],
      },
      {
        id: "tobillos-circulos",
        nombre: "Movilidad de tobillos",
        duracionSeg: 30,
        descripcion: "Importante para puntas precisas.",
        zonaCorporal: ["tobillo"],
      },
      {
        id: "activacion-grip",
        nombre: "Activación de antebrazo",
        duracionSeg: 60,
        descripcion: "Aprieta una pelota o cierra-abre manos rápidamente.",
        zonaCorporal: ["antebrazo"],
      },
    ],
  },
  {
    id: "post-completa",
    nombre: "Vuelta a la calma post-sesión",
    tipo: "post",
    ejercicios: [
      {
        id: "antebrazo-extension",
        nombre: "Extensión de antebrazo",
        duracionSeg: 45,
        descripcion: "Brazo extendido, muñeca abajo, tira con la otra mano.",
        zonaCorporal: ["antebrazo", "munecas"],
      },
      {
        id: "antebrazo-flexion",
        nombre: "Flexión de antebrazo",
        duracionSeg: 45,
        descripcion: "Muñeca hacia arriba, tira suavemente.",
        zonaCorporal: ["antebrazo", "munecas"],
      },
      {
        id: "dedos-uno-uno",
        nombre: "Estiramiento dedo a dedo",
        duracionSeg: 60,
        descripcion: "Estira cada dedo individualmente con cuidado.",
        zonaCorporal: ["dedos"],
      },
      {
        id: "trapecio",
        nombre: "Trapecio y cuello",
        duracionSeg: 60,
        descripcion: "30s a cada lado, inclina la cabeza tirando suavemente.",
        zonaCorporal: ["hombro"],
      },
      {
        id: "dorsales",
        nombre: "Dorsales en suspensión",
        duracionSeg: 40,
        descripcion: "Cuélgate de una barra unos segundos.",
        zonaCorporal: ["espalda", "hombro"],
      },
      {
        id: "pectoral-pared",
        nombre: "Pectoral en pared",
        duracionSeg: 60,
        descripcion: "30s cada brazo, abre el pecho.",
        zonaCorporal: ["hombro"],
      },
      {
        id: "isquios",
        nombre: "Isquiotibiales",
        duracionSeg: 60,
        descripcion: "30s cada pierna, sin rebotes.",
      },
      {
        id: "gemelo",
        nombre: "Gemelo en pared",
        duracionSeg: 60,
        descripcion: "30s cada pierna, talón al suelo.",
        zonaCorporal: ["tobillo"],
      },
      {
        id: "psoas",
        nombre: "Psoas / cadera",
        duracionSeg: 60,
        descripcion: "30s cada lado en posición de zancada.",
        zonaCorporal: ["cadera"],
      },
    ],
  },
  {
    id: "recuperacion-dedos",
    nombre: "Recuperación de dedos y antebrazo",
    tipo: "recuperacion",
    ejercicios: [
      {
        id: "rec-circulacion",
        nombre: "Activación circulatoria",
        duracionSeg: 60,
        descripcion: "Abre y cierra manos lentamente para bombear sangre.",
        zonaCorporal: ["antebrazo", "dedos"],
      },
      {
        id: "rec-masaje",
        nombre: "Auto-masaje antebrazo",
        duracionSeg: 90,
        descripcion: "Masajea el antebrazo en dirección al codo.",
        zonaCorporal: ["antebrazo"],
      },
      {
        id: "rec-extension-larga",
        nombre: "Extensión de antebrazo prolongada",
        duracionSeg: 90,
        descripcion: "Estiramiento profundo y consciente.",
        zonaCorporal: ["antebrazo", "munecas"],
      },
      {
        id: "rec-flexion-larga",
        nombre: "Flexión de antebrazo prolongada",
        duracionSeg: 90,
        descripcion: "Estiramiento profundo de los flexores.",
        zonaCorporal: ["antebrazo", "munecas"],
      },
      {
        id: "rec-dedos",
        nombre: "Estiramiento dedos profundo",
        duracionSeg: 120,
        descripcion: "Cada dedo, suavemente.",
        zonaCorporal: ["dedos"],
      },
      {
        id: "rec-respiracion",
        nombre: "Respiración profunda",
        duracionSeg: 90,
        descripcion: "Inhala 4s, mantén 4s, exhala 6s.",
      },
    ],
  },
  {
    id: "post-rapida",
    nombre: "Post-escalada rápida (5 min)",
    tipo: "post",
    ejercicios: [
      {
        id: "post-r-antebrazo-e",
        nombre: "Extensión antebrazo",
        duracionSeg: 60,
        descripcion: "30s cada brazo.",
        zonaCorporal: ["antebrazo"],
      },
      {
        id: "post-r-antebrazo-f",
        nombre: "Flexión antebrazo",
        duracionSeg: 60,
        descripcion: "30s cada brazo.",
        zonaCorporal: ["antebrazo"],
      },
      {
        id: "post-r-dorsales",
        nombre: "Dorsales",
        duracionSeg: 30,
        descripcion: "Cuélgate o estira brazos arriba.",
        zonaCorporal: ["espalda"],
      },
      {
        id: "post-r-pectoral",
        nombre: "Pectoral",
        duracionSeg: 60,
        descripcion: "30s cada lado.",
        zonaCorporal: ["hombro"],
      },
      {
        id: "post-r-isquios",
        nombre: "Isquios",
        duracionSeg: 60,
        descripcion: "30s cada pierna.",
      },
    ],
  },
];

export function rutinaPorId(id: string) {
  return RUTINAS_ESTIRAMIENTO.find((r) => r.id === id);
}

export function rutinasPorTipo(tipo: "pre" | "post" | "recuperacion") {
  return RUTINAS_ESTIRAMIENTO.filter((r) => r.tipo === tipo);
}
