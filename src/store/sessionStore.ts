import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Modalidad, ResultadoVia } from "../db/types";
import { hoyDateTimeISO } from "../utils/fechas";

export interface BorradorVia {
  tempId: string;
  nombre?: string;
  grado: string;
  resultado: ResultadoVia;
  intentos: number;
  fotoBase64?: string;
  notas?: string;
}

export interface BorradorSesion {
  paso: number; // 0-5
  fecha: string;
  modalidad: Modalidad | null;
  nombreLugar: string;
  duracionMin: number | null;
  vias: BorradorVia[];
  sensacion: number;
  fatiga: number;
  tecnicasTrabajadasIds: string[];
  estiramientoRutinaId: string | null;
  estiramientoCompletado: boolean;
  notas: string;
  zonaOutdoorId: number | null;
  proyectosIds: number[];
}

interface SessionState {
  borrador: BorradorSesion | null;
  iniciarBorrador: () => void;
  actualizar: (cambios: Partial<BorradorSesion>) => void;
  setPaso: (paso: number) => void;
  agregarVia: (v: BorradorVia) => void;
  actualizarVia: (tempId: string, cambios: Partial<BorradorVia>) => void;
  eliminarVia: (tempId: string) => void;
  resetear: () => void;
}

const estadoInicial = (): BorradorSesion => ({
  paso: 0,
  fecha: hoyDateTimeISO(),
  modalidad: null,
  nombreLugar: "",
  duracionMin: null,
  vias: [],
  sensacion: 5,
  fatiga: 5,
  tecnicasTrabajadasIds: [],
  estiramientoRutinaId: null,
  estiramientoCompletado: false,
  notas: "",
  zonaOutdoorId: null,
  proyectosIds: [],
});

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      borrador: null,
      iniciarBorrador: () => set({ borrador: estadoInicial() }),
      actualizar: (cambios) =>
        set((s) => ({
          borrador: s.borrador ? { ...s.borrador, ...cambios } : s.borrador,
        })),
      setPaso: (paso) =>
        set((s) => ({
          borrador: s.borrador ? { ...s.borrador, paso } : s.borrador,
        })),
      agregarVia: (v) =>
        set((s) => ({
          borrador: s.borrador
            ? { ...s.borrador, vias: [...s.borrador.vias, v] }
            : s.borrador,
        })),
      actualizarVia: (tempId, cambios) =>
        set((s) => ({
          borrador: s.borrador
            ? {
                ...s.borrador,
                vias: s.borrador.vias.map((v) =>
                  v.tempId === tempId ? { ...v, ...cambios } : v
                ),
              }
            : s.borrador,
        })),
      eliminarVia: (tempId) =>
        set((s) => ({
          borrador: s.borrador
            ? {
                ...s.borrador,
                vias: s.borrador.vias.filter((v) => v.tempId !== tempId),
              }
            : s.borrador,
        })),
      resetear: () => set({ borrador: null }),
    }),
    {
      name: "cruxtracker-borrador-sesion",
    }
  )
);
