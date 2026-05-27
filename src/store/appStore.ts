import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  modoOscuro: boolean;
  toggleModoOscuro: () => void;
  setModoOscuro: (v: boolean) => void;
  nombreUsuario: string;
  setNombreUsuario: (n: string) => void;
  primerasVisitas: Record<string, boolean>;
  marcarVisitado: (k: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      modoOscuro: false,
      toggleModoOscuro: () =>
        set((s) => ({ modoOscuro: !s.modoOscuro })),
      setModoOscuro: (v) => set({ modoOscuro: v }),
      nombreUsuario: "",
      setNombreUsuario: (n) => set({ nombreUsuario: n }),
      primerasVisitas: {},
      marcarVisitado: (k) =>
        set((s) => ({
          primerasVisitas: { ...s.primerasVisitas, [k]: true },
        })),
    }),
    {
      name: "cruxtracker-app",
    }
  )
);
