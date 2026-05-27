import type { ZonaCorporal } from "../db/types";

export const ZONAS_CORPORALES: { id: ZonaCorporal; nombre: string; emoji: string }[] = [
  { id: "dedos", nombre: "Dedos", emoji: "✋" },
  { id: "munecas", nombre: "Muñecas", emoji: "🤚" },
  { id: "antebrazo", nombre: "Antebrazo", emoji: "💪" },
  { id: "codo", nombre: "Codo", emoji: "🦾" },
  { id: "hombro", nombre: "Hombro", emoji: "🫳" },
  { id: "espalda", nombre: "Espalda", emoji: "🧍" },
  { id: "core", nombre: "Core", emoji: "🌀" },
  { id: "cadera", nombre: "Cadera", emoji: "🦵" },
  { id: "rodilla", nombre: "Rodilla", emoji: "🦵" },
  { id: "tobillo", nombre: "Tobillo", emoji: "🦶" },
  { id: "pie", nombre: "Pie", emoji: "👣" },
];

export const MODALIDADES: { id: string; nombre: string; emoji: string; descripcion: string }[] = [
  {
    id: "boulder_indoor",
    nombre: "Boulder indoor",
    emoji: "🧱",
    descripcion: "Bloque en rocódromo",
  },
  {
    id: "boulder_outdoor",
    nombre: "Boulder outdoor",
    emoji: "🪨",
    descripcion: "Bloque en roca natural",
  },
  {
    id: "deportiva_indoor",
    nombre: "Deportiva indoor",
    emoji: "🧗",
    descripcion: "Vías con cuerda en rocódromo",
  },
  {
    id: "deportiva_outdoor",
    nombre: "Deportiva outdoor",
    emoji: "🏔️",
    descripcion: "Vías con cuerda en roca",
  },
];
