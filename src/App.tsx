import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useAppStore } from "./store/appStore";
import { ensurePerfil } from "./db/database";

export default function App() {
  const modoOscuro = useAppStore((s) => s.modoOscuro);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", modoOscuro);
  }, [modoOscuro]);

  useEffect(() => {
    ensurePerfil().catch(() => undefined);
  }, []);

  return <RouterProvider router={router} />;
}
