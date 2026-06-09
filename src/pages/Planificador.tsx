import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { Input, Textarea } from "../components/ui/Input";
import { Chip } from "../components/ui/Chip";
import { db } from "../db/database";
import { semanaISOActual, semanaISO } from "../utils/fechas";
import {
  format,
  addWeeks,
  parseISO,
  startOfWeek,
  addDays,
} from "date-fns";
import { es } from "date-fns/locale";
import type { DiaSemana, SesionPlanificada, TipoEntrenamiento } from "../db/types";

const DIAS_LBL: { id: DiaSemana; label: string; corto: string }[] = [
  { id: "lunes", label: "Lunes", corto: "L" },
  { id: "martes", label: "Martes", corto: "M" },
  { id: "miercoles", label: "Miércoles", corto: "X" },
  { id: "jueves", label: "Jueves", corto: "J" },
  { id: "viernes", label: "Viernes", corto: "V" },
  { id: "sabado", label: "Sábado", corto: "S" },
  { id: "domingo", label: "Domingo", corto: "D" },
];

const TIPOS: { id: TipoEntrenamiento; label: string; color: string; emoji: string }[] = [
  { id: "boulder", label: "Boulder", color: "bg-amber-100 text-amber-800", emoji: "🧱" },
  { id: "deportiva", label: "Deportiva", color: "bg-emerald-100 text-emerald-800", emoji: "🧗" },
  { id: "fuerza", label: "Fuerza", color: "bg-rose-100 text-rose-800", emoji: "💪" },
  { id: "tecnica", label: "Técnica", color: "bg-blue-100 text-blue-800", emoji: "🎯" },
  { id: "resistencia", label: "Resistencia", color: "bg-purple-100 text-purple-800", emoji: "🔁" },
  { id: "outdoor", label: "Outdoor", color: "bg-teal-100 text-teal-800", emoji: "🏔️" },
  { id: "descanso", label: "Descanso", color: "bg-stone-100 text-stone-700", emoji: "💤" },
];

export function Planificador() {
  const navigate = useNavigate();
  const [refDate, setRefDate] = useState(new Date());
  const semIso = semanaISO(refDate);
  const [editando, setEditando] = useState<SesionPlanificada | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);

  const sesiones = useLiveQuery(async () => {
    return db.sesionesPlanificadas.where("semanaISO").equals(semIso).toArray();
  }, [semIso]);

  const semanaInicio = startOfWeek(refDate, { weekStartsOn: 1 });

  async function moverA(id: number, dia: DiaSemana) {
    await db.sesionesPlanificadas.update(id, { dia });
  }

  async function toggleCompletado(s: SesionPlanificada) {
    await db.sesionesPlanificadas.update(s.id!, { completado: !s.completado });
  }

  function porDia(dia: DiaSemana): SesionPlanificada[] {
    return (sesiones || []).filter((s) => s.dia === dia);
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader
          titulo="Planificador"
          subtitulo="Tu semana de entrenamiento"
          accion={
            <Button
              tamano="sm"
              onClick={() =>
                setEditando({
                  semanaISO: semIso,
                  dia: "lunes",
                  tipo: "boulder",
                  titulo: "",
                  completado: false,
                })
              }
            >
              <Plus className="w-4 h-4" />
              Añadir
            </Button>
          }
        />
      </div>

      <Card className="!py-2 !px-2">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setRefDate(addWeeks(refDate, -1))}
            className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="font-semibold capitalize">
              {format(semanaInicio, "d MMM", { locale: es })} -{" "}
              {format(addDays(semanaInicio, 6), "d MMM yyyy", { locale: es })}
            </p>
            <button
              onClick={() => setRefDate(new Date())}
              className="text-xs text-crux-primary"
            >
              {semIso === semanaISOActual() ? "Esta semana" : "Volver a hoy"}
            </button>
          </div>
          <button
            onClick={() => setRefDate(addWeeks(refDate, 1))}
            className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </Card>

      <div className="space-y-2">
        {DIAS_LBL.map((d, idx) => {
          const fechaDia = format(addDays(semanaInicio, idx), "yyyy-MM-dd");
          const esHoy = fechaDia === format(new Date(), "yyyy-MM-dd");
          const items = porDia(d.id);
          return (
            <div
              key={d.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={async () => {
                if (draggedId) {
                  await moverA(draggedId, d.id);
                  setDraggedId(null);
                }
              }}
            >
              <Card className={esHoy ? "!ring-2 !ring-crux-primary/30" : ""}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                        esHoy
                          ? "bg-crux-primary text-white"
                          : "bg-crux-beige dark:bg-stone-800 dark:text-stone-300"
                      }`}
                    >
                      {d.corto}
                    </div>
                    <p className="font-semibold">{d.label}</p>
                    {esHoy && (
                      <span className="text-xs text-crux-primary font-medium">Hoy</span>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setEditando({
                        semanaISO: semIso,
                        dia: d.id,
                        tipo: "boulder",
                        titulo: "",
                        completado: false,
                      })
                    }
                    className="p-1.5 text-stone-400 hover:text-crux-primary"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {items.length === 0 ? (
                  <p className="text-xs text-stone-400 italic pl-10">
                    Sin entrenamiento planeado
                  </p>
                ) : (
                  <div className="space-y-1.5 pl-2">
                    {items.map((s) => {
                      const t = TIPOS.find((x) => x.id === s.tipo);
                      return (
                        <div
                          key={s.id}
                          draggable
                          onDragStart={() => setDraggedId(s.id!)}
                          onClick={() => setEditando(s)}
                          className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer ${t?.color} dark:bg-stone-700 dark:text-stone-100 ${
                            s.completado ? "opacity-50" : ""
                          }`}
                        >
                          <GripVertical className="w-4 h-4 opacity-40" />
                          <span className="text-lg">{t?.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium truncate ${
                                s.completado ? "line-through" : ""
                              }`}
                            >
                              {s.titulo || t?.label}
                            </p>
                            {s.duracionMin && (
                              <p className="text-xs opacity-70">{s.duracionMin} min</p>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCompletado(s);
                            }}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              s.completado
                                ? "bg-current border-current"
                                : "border-current/40"
                            }`}
                          >
                            {s.completado && (
                              <span className="text-white text-xs">✓</span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-stone-500 text-center px-4">
        💡 Arrastra los entrenamientos entre días para reordenarlos
      </p>

      <ModalSesion
        sesion={editando}
        onClose={() => setEditando(null)}
      />
    </div>
  );
}

function ModalSesion({
  sesion,
  onClose,
}: {
  sesion: SesionPlanificada | null;
  onClose: () => void;
}) {
  const [local, setLocal] = useState<SesionPlanificada | null>(sesion);

  useEffect(() => {
    setLocal(sesion);
  }, [sesion]);

  if (!sesion || !local) return null;

  async function guardar() {
    if (!local) return;
    if (local.id) {
      await db.sesionesPlanificadas.update(local.id, local);
    } else {
      await db.sesionesPlanificadas.add(local);
    }
    onClose();
  }

  async function eliminar() {
    if (!local?.id) return;
    await db.sesionesPlanificadas.delete(local.id);
    onClose();
  }

  return (
    <Modal
      abierto={true}
      onClose={onClose}
      titulo={local.id ? "Editar entrenamiento" : "Nuevo entrenamiento"}
      ancho="lg"
    >
      <div className="space-y-4">
        <Input
          label="Título"
          placeholder="Ej: Volumen boulder en El Berro"
          value={local.titulo ?? ""}
          onChange={(e) => setLocal({ ...local, titulo: e.target.value })}
        />

        <div>
          <label className="label">Día</label>
          <div className="grid grid-cols-7 gap-1">
            {DIAS_LBL.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setLocal({ ...local, dia: d.id })}
                className={`py-2 rounded-lg text-sm font-bold transition-all ${
                  local.dia === d.id
                    ? "bg-crux-primary text-white"
                    : "bg-crux-beige dark:bg-stone-800 dark:text-stone-300"
                }`}
              >
                {d.corto}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Tipo</label>
          <div className="grid grid-cols-2 gap-2">
            {TIPOS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setLocal({ ...local, tipo: t.id })}
                className={`p-2 rounded-xl text-sm font-medium text-left transition-all ${
                  local.tipo === t.id
                    ? "bg-crux-primary text-white"
                    : t.color
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Duración (min)"
          type="number"
          inputMode="numeric"
          value={local.duracionMin ?? ""}
          onChange={(e) =>
            setLocal({
              ...local,
              duracionMin: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />

        <Textarea
          label="Notas"
          value={local.notas ?? ""}
          onChange={(e) => setLocal({ ...local, notas: e.target.value })}
        />

        <div className="flex gap-2 pt-2">
          {local.id && (
            <Button variante="danger" onClick={eliminar}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button variante="ghost" onClick={onClose} bloque>
            Cancelar
          </Button>
          <Button onClick={guardar} bloque>
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
