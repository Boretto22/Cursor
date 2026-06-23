import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Moon,
  Sun,
  Download,
  Upload,
  Trash2,
  Mountain,
  HeartPulse,
  Calendar,
  Trophy,
  ChevronRight,
  Info,
  History,
} from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { useAppStore } from "../store/appStore";
import { useSessionStore } from "../store/sessionStore";
import { db } from "../db/database";
import { gradosPorModalidad, indiceGrado } from "../data/grados";

const ATAJOS = [
  { to: "/proyectos", label: "Proyectos", icon: Trophy },
  { to: "/zonas-outdoor", label: "Zonas outdoor", icon: Mountain },
  { to: "/lesiones", label: "Lesiones", icon: HeartPulse },
  { to: "/planificador", label: "Planificador semanal", icon: Calendar },
  { to: "/historial", label: "Historial de sesiones", icon: History },
];

export function Perfil() {
  const navigate = useNavigate();
  const { modoOscuro, toggleModoOscuro, nombreUsuario, setNombreUsuario } = useAppStore();
  const resetearSesion = useSessionStore((s) => s.resetear);
  const [confirmaBorrar, setConfirmaBorrar] = useState(false);
  const [acercaDe, setAcercaDe] = useState(false);

  const stats = useLiveQuery(async () => {
    const sesiones = (await db.sesiones.toArray()).filter((s) => !s.esBorrador);
    const vias = await db.vias.toArray();
    const proyectos = await db.proyectos.toArray();
    const enviados = proyectos.filter((p) => p.enviado).length;

    let gradoMaxDep: string | null = null;
    let gradoMaxBou: string | null = null;
    for (const v of vias) {
      if (v.resultado !== "redpoint" && v.resultado !== "flash") continue;
      const s = sesiones.find((x) => x.id === v.sessionId);
      if (!s) continue;
      if (s.modalidad.startsWith("boulder")) {
        if (!gradoMaxBou || indiceGrado(v.grado, "boulder_indoor") > indiceGrado(gradoMaxBou, "boulder_indoor")) {
          gradoMaxBou = v.grado;
        }
      } else {
        if (!gradoMaxDep || indiceGrado(v.grado, "deportiva_indoor") > indiceGrado(gradoMaxDep, "deportiva_indoor")) {
          gradoMaxDep = v.grado;
        }
      }
    }
    return {
      totalSesiones: sesiones.length,
      totalVias: vias.length,
      enviados,
      gradoMaxDep,
      gradoMaxBou,
    };
  });

  async function exportar() {
    const datos = {
      version: 1,
      exportadoEn: new Date().toISOString(),
      sesiones: await db.sesiones.toArray(),
      vias: await db.vias.toArray(),
      proyectos: await db.proyectos.toArray(),
      intentosProyecto: await db.intentosProyecto.toArray(),
      estiramientosSesion: await db.estiramientosSesion.toArray(),
      ejerciciosTecnica: await db.ejerciciosTecnica.toArray(),
      objetivosSemanales: await db.objetivosSemanales.toArray(),
      lesiones: await db.lesiones.toArray(),
      zonasOutdoor: await db.zonasOutdoor.toArray(),
      sesionesPlanificadas: await db.sesionesPlanificadas.toArray(),
      perfil: await db.perfil.toArray(),
    };
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cruxtracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const texto = await file.text();
      const datos = JSON.parse(texto);
      if (!confirm("Esto sustituirá todos tus datos actuales. ¿Continuar?")) return;
      await db.transaction(
        "rw",
        [
          db.sesiones,
          db.vias,
          db.proyectos,
          db.intentosProyecto,
          db.estiramientosSesion,
          db.ejerciciosTecnica,
          db.objetivosSemanales,
          db.lesiones,
          db.zonasOutdoor,
          db.sesionesPlanificadas,
          db.perfil,
        ],
        async () => {
          await Promise.all([
            db.sesiones.clear(),
            db.vias.clear(),
            db.proyectos.clear(),
            db.intentosProyecto.clear(),
            db.estiramientosSesion.clear(),
            db.ejerciciosTecnica.clear(),
            db.objetivosSemanales.clear(),
            db.lesiones.clear(),
            db.zonasOutdoor.clear(),
            db.sesionesPlanificadas.clear(),
            db.perfil.clear(),
          ]);
          if (datos.sesiones) await db.sesiones.bulkAdd(datos.sesiones);
          if (datos.vias) await db.vias.bulkAdd(datos.vias);
          if (datos.proyectos) await db.proyectos.bulkAdd(datos.proyectos);
          if (datos.intentosProyecto) await db.intentosProyecto.bulkAdd(datos.intentosProyecto);
          if (datos.estiramientosSesion) await db.estiramientosSesion.bulkAdd(datos.estiramientosSesion);
          if (datos.ejerciciosTecnica) await db.ejerciciosTecnica.bulkAdd(datos.ejerciciosTecnica);
          if (datos.objetivosSemanales) await db.objetivosSemanales.bulkAdd(datos.objetivosSemanales);
          if (datos.lesiones) await db.lesiones.bulkAdd(datos.lesiones);
          if (datos.zonasOutdoor) await db.zonasOutdoor.bulkAdd(datos.zonasOutdoor);
          if (datos.sesionesPlanificadas) await db.sesionesPlanificadas.bulkAdd(datos.sesionesPlanificadas);
          if (datos.perfil) await db.perfil.bulkAdd(datos.perfil);
        }
      );
      alert("✅ Datos importados correctamente");
    } catch (err) {
      alert("❌ Error al importar: " + (err as Error).message);
    }
  }

  async function borrarTodo() {
    await db.transaction(
      "rw",
      [
        db.sesiones,
        db.vias,
        db.proyectos,
        db.intentosProyecto,
        db.estiramientosSesion,
        db.ejerciciosTecnica,
        db.objetivosSemanales,
        db.lesiones,
        db.zonasOutdoor,
        db.sesionesPlanificadas,
      ],
      async () => {
        await Promise.all([
          db.sesiones.clear(),
          db.vias.clear(),
          db.proyectos.clear(),
          db.intentosProyecto.clear(),
          db.estiramientosSesion.clear(),
          db.ejerciciosTecnica.clear(),
          db.objetivosSemanales.clear(),
          db.lesiones.clear(),
          db.zonasOutdoor.clear(),
          db.sesionesPlanificadas.clear(),
        ]);
      }
    );
    resetearSesion();
    setConfirmaBorrar(false);
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader titulo="Perfil" subtitulo="Configuración y datos" />

      <Card>
        <CardTitle>Tu información</CardTitle>
        <Input
          label="Nombre"
          placeholder="Tu nombre"
          value={nombreUsuario}
          onChange={(e) => setNombreUsuario(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="text-center bg-crux-beige/60 dark:bg-stone-800 rounded-xl p-3">
            <p className="text-xs text-stone-500 dark:text-stone-400">Boulder máx.</p>
            <p className="text-xl font-bold text-crux-primary">
              {stats?.gradoMaxBou ?? "—"}
            </p>
          </div>
          <div className="text-center bg-crux-beige/60 dark:bg-stone-800 rounded-xl p-3">
            <p className="text-xs text-stone-500 dark:text-stone-400">Deportiva máx.</p>
            <p className="text-xl font-bold text-crux-primary">
              {stats?.gradoMaxDep ?? "—"}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="!p-3 text-center">
          <p className="text-xs text-stone-500">Sesiones</p>
          <p className="text-xl font-bold">{stats?.totalSesiones ?? 0}</p>
        </Card>
        <Card className="!p-3 text-center">
          <p className="text-xs text-stone-500">Vías</p>
          <p className="text-xl font-bold">{stats?.totalVias ?? 0}</p>
        </Card>
        <Card className="!p-3 text-center">
          <p className="text-xs text-stone-500">Enviados</p>
          <p className="text-xl font-bold">{stats?.enviados ?? 0}</p>
        </Card>
      </div>

      <Card>
        <CardTitle>Accesos rápidos</CardTitle>
        <div className="space-y-1 -mx-2">
          {ATAJOS.map(({ to, label, icon: Icon }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-crux-beige dark:hover:bg-stone-700 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-crux-beige dark:bg-stone-700 flex items-center justify-center">
                <Icon className="w-4 h-4 text-crux-primary" />
              </div>
              <span className="flex-1 text-left font-medium text-sm">{label}</span>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Preferencias</CardTitle>
        <button
          onClick={toggleModoOscuro}
          className="w-full flex items-center gap-3 py-2"
        >
          <div className="w-9 h-9 rounded-xl bg-crux-beige dark:bg-stone-700 flex items-center justify-center">
            {modoOscuro ? <Moon className="w-4 h-4 text-crux-primary" /> : <Sun className="w-4 h-4 text-crux-earth" />}
          </div>
          <span className="flex-1 text-left font-medium text-sm">Modo oscuro</span>
          <div
            className={`relative w-11 h-6 rounded-full overflow-hidden transition-colors flex-shrink-0 ${
              modoOscuro ? "bg-crux-primary" : "bg-stone-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                modoOscuro ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
        </button>
      </Card>

      <Card>
        <CardTitle>Datos</CardTitle>
        <div className="space-y-2">
          <Button bloque variante="secondary" onClick={exportar}>
            <Download className="w-4 h-4" />
            Exportar backup (JSON)
          </Button>
          <label className="btn-secondary w-full cursor-pointer">
            <Upload className="w-4 h-4" />
            Importar backup
            <input type="file" accept=".json" className="hidden" onChange={importar} />
          </label>
          <Button bloque variante="danger" onClick={() => setConfirmaBorrar(true)}>
            <Trash2 className="w-4 h-4" />
            Borrar todos los datos
          </Button>
        </div>
      </Card>

      <Card>
        <button
          onClick={() => setAcercaDe(true)}
          className="w-full flex items-center gap-3 py-1"
        >
          <Info className="w-4 h-4 text-crux-primary" />
          <span className="flex-1 text-left text-sm">Acerca de CruxTracker</span>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>
      </Card>

      <p className="text-xs text-center text-stone-400">
        CruxTracker · v1.0.0 · 100% offline
      </p>

      <Modal
        abierto={confirmaBorrar}
        onClose={() => setConfirmaBorrar(false)}
        titulo="¿Borrar todos los datos?"
      >
        <p className="text-sm text-stone-600 dark:text-stone-300 mb-4">
          Esta acción es irreversible. Todas las sesiones, vías, proyectos y demás
          quedarán eliminados. Exporta un backup antes si los necesitas.
        </p>
        <div className="flex gap-2">
          <Button variante="ghost" bloque onClick={() => setConfirmaBorrar(false)}>
            Cancelar
          </Button>
          <Button variante="danger" bloque onClick={borrarTodo}>
            Borrar todo
          </Button>
        </div>
      </Modal>

      <Modal
        abierto={acercaDe}
        onClose={() => setAcercaDe(false)}
        titulo="Acerca de CruxTracker"
      >
        <div className="space-y-3 text-sm text-stone-600 dark:text-stone-300">
          <p>
            <strong className="text-crux-primary">CruxTracker</strong> es una PWA
            offline-first para seguir tu progreso en escalada deportiva y boulder.
          </p>
          <p>
            Todos tus datos viven únicamente en tu dispositivo (IndexedDB). Si
            cambias de móvil, exporta el backup primero.
          </p>
          <p className="text-xs text-stone-400">
            Construido con React, Vite, Tailwind, Dexie, Zustand, Recharts y Leaflet.
          </p>
          <p className="text-xs text-stone-400">
            App desenvolupada per Antoni Pozo Miró.
          </p>
          <p className="text-xs text-stone-400">
            <a
              href="mailto:pozotoni08@gmail.com"
              className="underline hover:text-crux-primary transition-colors"
            >
              pozotoni08@gmail.com
            </a>
          </p>
        </div>
      </Modal>
    </div>
  );
}
