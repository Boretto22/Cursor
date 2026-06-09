import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Inicio } from "./pages/Inicio";
import { Sesion } from "./pages/Sesion";
import { Progreso } from "./pages/Progreso";
import { Temporizador } from "./pages/Temporizador";
import { Perfil } from "./pages/Perfil";
import { Estiramientos } from "./pages/Estiramientos";
import { Proyectos } from "./pages/Proyectos";
import { ZonasOutdoor } from "./pages/ZonasOutdoor";
import { Lesiones } from "./pages/Lesiones";
import { Planificador } from "./pages/Planificador";
import { HistorialSesiones } from "./pages/HistorialSesiones";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Inicio /> },
      { path: "sesion", element: <Sesion /> },
      { path: "progreso", element: <Progreso /> },
      { path: "temporizador", element: <Temporizador /> },
      { path: "perfil", element: <Perfil /> },
      { path: "estiramientos", element: <Estiramientos /> },
      { path: "proyectos", element: <Proyectos /> },
      { path: "zonas-outdoor", element: <ZonasOutdoor /> },
      { path: "lesiones", element: <Lesiones /> },
      { path: "planificador", element: <Planificador /> },
      { path: "historial", element: <HistorialSesiones /> },
    ],
  },
]);
