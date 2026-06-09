import { useNavigate } from "react-router-dom";
import {
  Flame,
  Calendar,
  Timer as TimerIcon,
  Trophy,
  Mountain,
  HeartPulse,
  Layers,
  PlusCircle,
  ChevronRight,
} from "lucide-react";
import { Card, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { Heatmap } from "../components/charts/Heatmap";
import {
  useResumenSemanal,
  useUltimasSesiones,
} from "../hooks/useResumenSemanal";
import { useAppStore } from "../store/appStore";
import { formatearFechaCorta } from "../utils/fechas";
import { MODALIDADES } from "../data/zonasCorporales";

const accesosRapidos = [
  { to: "/estiramientos", label: "Estiramientos", icon: HeartPulse, color: "bg-rose-50 text-rose-700" },
  { to: "/proyectos", label: "Proyectos", icon: Trophy, color: "bg-amber-50 text-amber-700" },
  { to: "/zonas-outdoor", label: "Zonas", icon: Mountain, color: "bg-emerald-50 text-emerald-700" },
  { to: "/planificador", label: "Planificador", icon: Calendar, color: "bg-indigo-50 text-indigo-700" },
  { to: "/lesiones", label: "Lesiones", icon: Layers, color: "bg-orange-50 text-orange-700" },
  { to: "/historial", label: "Historial", icon: TimerIcon, color: "bg-stone-50 text-stone-700" },
];

export function Inicio() {
  const navigate = useNavigate();
  const resumen = useResumenSemanal(3);
  const ultimas = useUltimasSesiones(3);
  const nombre = useAppStore((s) => s.nombreUsuario);

  const saludo = (() => {
    const h = new Date().getHours();
    if (h < 6) return "Buenas noches";
    if (h < 13) return "Buenos días";
    if (h < 20) return "Buenas tardes";
    return "Buenas noches";
  })();

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        titulo={`${saludo}${nombre ? `, ${nombre}` : ""}`}
        subtitulo="Listo para una nueva escalada"
      />

      {/* Tarjeta destacada de racha */}
      <Card className="bg-gradient-to-br from-crux-primary to-crux-primary-dark text-white shadow-soft-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
            <Flame className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <p className="text-sm opacity-80">Racha actual</p>
            <p className="text-3xl font-bold">
              {resumen?.racha ?? 0}
              <span className="text-base font-medium opacity-80 ml-1">
                {resumen?.racha === 1 ? "día" : "días"}
              </span>
            </p>
          </div>
          {resumen?.racha && resumen.racha >= 3 ? (
            <span className="text-3xl">🔥</span>
          ) : null}
        </div>
      </Card>

      {/* Botón nueva sesión */}
      <Button
        bloque
        tamano="lg"
        onClick={() => navigate("/sesion")}
        className="shadow-soft"
      >
        <PlusCircle className="w-5 h-5" />
        Nueva sesión
      </Button>

      {/* Resumen semanal */}
      <div>
        <h2 className="text-sm font-semibold text-stone-600 dark:text-stone-400 mb-2 px-1 uppercase tracking-wide">
          Esta semana
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Sesiones</p>
            <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">
              {resumen?.sesionesSemana ?? 0}
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {resumen?.diasUnicosSemana ?? 0} días únicos
            </p>
          </Card>
          <Card>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Vías escaladas</p>
            <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">
              {resumen?.viasSemana ?? 0}
            </p>
            <p className="text-xs text-crux-primary mt-1 font-medium">
              ⚡ {resumen?.flashSemana ?? 0} a vista
            </p>
          </Card>
          <Card>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Tiempo total</p>
            <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">
              {resumen?.duracionTotalMin ?? 0}
              <span className="text-base font-medium opacity-70 ml-1">min</span>
            </p>
          </Card>
          <Card>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Media diaria</p>
            <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">
              {resumen?.diasUnicosSemana
                ? Math.round(resumen.duracionTotalMin / resumen.diasUnicosSemana)
                : 0}
              <span className="text-base font-medium opacity-70 ml-1">min</span>
            </p>
          </Card>
        </div>
      </div>

      {/* Mini heatmap */}
      <Card>
        <CardTitle>Actividad reciente</CardTitle>
        <Heatmap fechasConteo={resumen?.fechasConteoUltMeses ?? {}} meses={3} compact />
        <div className="flex items-center justify-between mt-3 text-xs text-stone-500 dark:text-stone-400">
          <span>Hace 3 meses</span>
          <div className="flex items-center gap-1">
            <span>Menos</span>
            <div className="flex gap-0.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-stone-100 dark:bg-stone-700" />
              <div className="w-2.5 h-2.5 rounded-sm bg-crux-primary/30" />
              <div className="w-2.5 h-2.5 rounded-sm bg-crux-primary/55" />
              <div className="w-2.5 h-2.5 rounded-sm bg-crux-primary/80" />
              <div className="w-2.5 h-2.5 rounded-sm bg-crux-primary" />
            </div>
            <span>Más</span>
          </div>
        </div>
      </Card>

      {/* Últimas sesiones */}
      {ultimas && ultimas.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-sm font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wide">
              Últimas sesiones
            </h2>
            <button
              onClick={() => navigate("/historial")}
              className="text-sm text-crux-primary font-medium flex items-center gap-0.5"
            >
              Ver todas <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {ultimas.map((s) => {
              const mod = MODALIDADES.find((m) => m.id === s.modalidad);
              return (
                <Card key={s.id} className="!py-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{mod?.emoji ?? "🧗"}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate text-stone-800 dark:text-stone-100">
                        {mod?.nombre} {s.nombreLugar ? `· ${s.nombreLugar}` : ""}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {formatearFechaCorta(s.fechaDia)} · {s.duracionMin ?? "—"} min
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-stone-500 dark:text-stone-400">Sensación</p>
                      <p className="font-semibold text-crux-primary">{s.sensacion}/10</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <div>
        <h2 className="text-sm font-semibold text-stone-600 dark:text-stone-400 mb-2 px-1 uppercase tracking-wide">
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {accesosRapidos.map(({ to, label, icon: Icon, color }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="card !p-3 flex flex-col items-center gap-2 active:scale-95 transition-transform"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} dark:bg-stone-700 dark:text-stone-100`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-center">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
