import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, Plus, HeartPulse, Trash2, CheckCircle } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Chip } from "../components/ui/Chip";
import { EmptyState } from "../components/ui/EmptyState";
import { ZONAS_CORPORALES } from "../data/zonasCorporales";
import { db } from "../db/database";
import { hoyISO, formatearFechaCorta, diasEntreFechas } from "../utils/fechas";
import type { Lesion, SeveridadLesion, ZonaCorporal } from "../db/types";

const SEVERIDAD: { id: SeveridadLesion; label: string; color: string }[] = [
  { id: "leve", label: "Leve", color: "bg-amber-100 text-amber-700" },
  { id: "moderada", label: "Moderada", color: "bg-orange-100 text-orange-700" },
  { id: "grave", label: "Grave", color: "bg-rose-100 text-rose-700" },
];

export function Lesiones() {
  const navigate = useNavigate();
  const [editando, setEditando] = useState<Lesion | null>(null);
  const [filtro, setFiltro] = useState<"activas" | "historial">("activas");

  const lesiones = useLiveQuery(async () => {
    const todas = await db.lesiones.orderBy("fechaInicio").reverse().toArray();
    return filtro === "activas"
      ? todas.filter((l) => l.activa)
      : todas.filter((l) => !l.activa);
  }, [filtro]);

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
          titulo="Lesiones"
          subtitulo="Registro y seguimiento"
          accion={
            <Button tamano="sm" onClick={() => setEditando(emptyLesion())}>
              <Plus className="w-4 h-4" />
              Nueva
            </Button>
          }
        />
      </div>

      <div className="flex gap-1.5">
        <Chip
          activo={filtro === "activas"}
          onClick={() => setFiltro("activas")}
          className="flex-1 justify-center"
        >
          Activas
        </Chip>
        <Chip
          activo={filtro === "historial"}
          onClick={() => setFiltro("historial")}
          className="flex-1 justify-center"
        >
          Historial
        </Chip>
      </div>

      {lesiones && lesiones.length === 0 && (
        <EmptyState
          icono={HeartPulse}
          titulo={filtro === "activas" ? "Sin lesiones activas" : "Sin historial"}
          descripcion={
            filtro === "activas"
              ? "¡Cuerpo sano! Sigue calentando bien y estirando."
              : "Las lesiones recuperadas aparecerán aquí."
          }
        />
      )}

      <div className="space-y-3">
        {lesiones?.map((l) => {
          const zona = ZONAS_CORPORALES.find((z) => z.id === l.zona);
          const sev = SEVERIDAD.find((s) => s.id === l.severidad);
          const dias = diasEntreFechas(l.fechaInicio, l.fechaFin);
          return (
            <Card
              key={l.id}
              className="cursor-pointer hover:shadow-soft-lg transition-shadow"
              onClick={() => setEditando(l)}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-crux-beige dark:bg-stone-700 flex items-center justify-center text-2xl">
                  {zona?.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">
                      {zona?.nombre}
                      {l.lado && l.lado !== "ambos" && (
                        <span className="text-xs text-stone-500 ml-1">
                          ({l.lado})
                        </span>
                      )}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sev?.color}`}>
                      {sev?.label}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {formatearFechaCorta(l.fechaInicio)}
                    {l.fechaFin
                      ? ` → ${formatearFechaCorta(l.fechaFin)}`
                      : ` · ${dias} días activa`}
                  </p>
                </div>
                {l.activa && (
                  <span className="w-2.5 h-2.5 rounded-full bg-crux-danger animate-pulse" />
                )}
              </div>
              {l.descripcion && (
                <p className="text-xs text-stone-500 mt-2 line-clamp-2">
                  {l.descripcion}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      <ModalLesion lesion={editando} onClose={() => setEditando(null)} />
    </div>
  );
}

function emptyLesion(): Lesion {
  return {
    zona: "dedos",
    severidad: "leve",
    fechaInicio: hoyISO(),
    activa: true,
  };
}

function ModalLesion({ lesion, onClose }: { lesion: Lesion | null; onClose: () => void }) {
  const [local, setLocal] = useState<Lesion | null>(lesion);

  useEffect(() => {
    setLocal(lesion);
  }, [lesion]);

  if (!lesion || !local) return null;

  async function guardar() {
    if (!local) return;
    if (local.id) {
      await db.lesiones.update(local.id, local);
    } else {
      await db.lesiones.add(local);
    }
    onClose();
  }

  async function marcarResuelta() {
    if (!local?.id) return;
    await db.lesiones.update(local.id, {
      activa: false,
      fechaFin: local.fechaFin || hoyISO(),
    });
    onClose();
  }

  async function eliminar() {
    if (!local?.id) return;
    if (!confirm("¿Eliminar este registro?")) return;
    await db.lesiones.delete(local.id);
    onClose();
  }

  return (
    <Modal
      abierto={true}
      onClose={onClose}
      titulo={local.id ? "Editar lesión" : "Nueva lesión"}
      ancho="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="label">Zona corporal</label>
          <div className="flex flex-wrap gap-1.5">
            {ZONAS_CORPORALES.map((z) => (
              <Chip
                key={z.id}
                activo={local.zona === z.id}
                onClick={() => setLocal({ ...local, zona: z.id as ZonaCorporal })}
              >
                {z.emoji} {z.nombre}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Lado</label>
          <div className="flex gap-1.5">
            {[
              { id: "izquierda" as const, label: "Izquierda" },
              { id: "derecha" as const, label: "Derecha" },
              { id: "ambos" as const, label: "Ambos" },
            ].map((l) => (
              <Chip
                key={l.id}
                activo={local.lado === l.id}
                onClick={() => setLocal({ ...local, lado: l.id })}
                className="flex-1 justify-center"
              >
                {l.label}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Severidad</label>
          <div className="grid grid-cols-3 gap-2">
            {SEVERIDAD.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setLocal({ ...local, severidad: s.id })}
                className={`p-3 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                  local.severidad === s.id
                    ? "bg-crux-primary text-white"
                    : s.color
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Fecha inicio"
            type="date"
            value={local.fechaInicio}
            onChange={(e) => setLocal({ ...local, fechaInicio: e.target.value })}
          />
          <Input
            label="Fecha fin (opcional)"
            type="date"
            value={local.fechaFin ?? ""}
            onChange={(e) =>
              setLocal({
                ...local,
                fechaFin: e.target.value || undefined,
                activa: !e.target.value,
              })
            }
          />
        </div>

        <Textarea
          label="Descripción"
          placeholder="¿Qué sentiste? ¿Cómo te lesionaste?"
          value={local.descripcion ?? ""}
          onChange={(e) => setLocal({ ...local, descripcion: e.target.value })}
        />

        <Textarea
          label="Tratamiento / fisio"
          placeholder="Ejercicios, hielo, reposo..."
          value={local.tratamiento ?? ""}
          onChange={(e) => setLocal({ ...local, tratamiento: e.target.value })}
        />

        <div className="flex flex-wrap gap-2 pt-2">
          {local.id && local.activa && (
            <Button variante="secondary" onClick={marcarResuelta}>
              <CheckCircle className="w-4 h-4" />
              Marcar resuelta
            </Button>
          )}
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
