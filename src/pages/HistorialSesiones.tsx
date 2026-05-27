import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, Trash2, Calendar } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { db } from "../db/database";
import { MODALIDADES } from "../data/zonasCorporales";
import { formatearFechaCorta } from "../utils/fechas";

const RESULTADO_LBL: Record<string, { lbl: string; emoji: string }> = {
  flash: { lbl: "A vista", emoji: "⚡" },
  redpoint: { lbl: "Encadenada", emoji: "🎯" },
  top: { lbl: "Top", emoji: "🏔️" },
  caida: { lbl: "Con caídas", emoji: "💧" },
  proyecto: { lbl: "Proyecto", emoji: "🔁" },
};

export function HistorialSesiones() {
  const navigate = useNavigate();
  const [seleccionada, setSeleccionada] = useState<number | null>(null);

  const sesiones = useLiveQuery(async () =>
    (await db.sesiones.orderBy("fecha").reverse().toArray()).filter(
      (s) => !s.esBorrador
    )
  );

  const detalle = useLiveQuery(async () => {
    if (!seleccionada) return null;
    const sesion = await db.sesiones.get(seleccionada);
    const vias = await db.vias.where("sessionId").equals(seleccionada).toArray();
    return { sesion, vias: vias.sort((a, b) => a.orden - b.orden) };
  }, [seleccionada]);

  async function eliminarSesion(id: number) {
    if (!confirm("¿Eliminar esta sesión y sus vías?")) return;
    await db.transaction("rw", db.sesiones, db.vias, async () => {
      await db.vias.where("sessionId").equals(id).delete();
      await db.sesiones.delete(id);
    });
    setSeleccionada(null);
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
          titulo="Historial"
          subtitulo={`${sesiones?.length ?? 0} sesiones`}
        />
      </div>

      {sesiones && sesiones.length === 0 && (
        <EmptyState
          icono={Calendar}
          titulo="Sin sesiones aún"
          descripcion="Empieza registrando tu primera sesión."
        />
      )}

      <div className="space-y-2">
        {sesiones?.map((s) => {
          const mod = MODALIDADES.find((m) => m.id === s.modalidad);
          return (
            <Card
              key={s.id}
              className="cursor-pointer hover:shadow-soft-lg transition-shadow"
              onClick={() => setSeleccionada(s.id!)}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-crux-beige dark:bg-stone-700 flex items-center justify-center text-2xl">
                  {mod?.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {mod?.nombre}
                    {s.nombreLugar && (
                      <span className="text-stone-500"> · {s.nombreLugar}</span>
                    )}
                  </p>
                  <p className="text-xs text-stone-500">
                    {formatearFechaCorta(s.fechaDia)} · {s.duracionMin ?? "—"} min
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-stone-500">Sensación</p>
                  <p className="font-bold text-crux-primary">{s.sensacion}/10</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        abierto={!!seleccionada}
        onClose={() => setSeleccionada(null)}
        titulo="Detalle de sesión"
        ancho="lg"
      >
        {detalle?.sesion && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {MODALIDADES.find((m) => m.id === detalle.sesion!.modalidad)?.emoji}
              </span>
              <div>
                <p className="font-semibold">
                  {MODALIDADES.find((m) => m.id === detalle.sesion!.modalidad)?.nombre}
                </p>
                <p className="text-xs text-stone-500">
                  {formatearFechaCorta(detalle.sesion.fechaDia)} ·{" "}
                  {detalle.sesion.duracionMin ?? "—"} min
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <Card className="!p-3">
                <p className="text-xs text-stone-500">Vías</p>
                <p className="font-bold">{detalle.vias.length}</p>
              </Card>
              <Card className="!p-3">
                <p className="text-xs text-stone-500">Sensación</p>
                <p className="font-bold">{detalle.sesion.sensacion}/10</p>
              </Card>
              <Card className="!p-3">
                <p className="text-xs text-stone-500">Fatiga</p>
                <p className="font-bold">{detalle.sesion.fatiga}/10</p>
              </Card>
            </div>

            {detalle.vias.length > 0 && (
              <div>
                <p className="label">Vías</p>
                <div className="space-y-2">
                  {detalle.vias.map((v) => {
                    const r = RESULTADO_LBL[v.resultado];
                    return (
                      <div
                        key={v.id}
                        className="flex items-center gap-3 p-2 rounded-xl bg-crux-beige/60 dark:bg-stone-700/40"
                      >
                        {v.fotoBase64 ? (
                          <img
                            src={v.fotoBase64}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-crux-primary/10 flex items-center justify-center font-bold text-crux-primary">
                            {v.grado}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {v.nombre || `Vía ${v.grado}`}
                          </p>
                          <p className="text-xs text-stone-500">
                            {r.emoji} {r.lbl} · {v.intentos} intentos
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {detalle.sesion.notas && (
              <div>
                <p className="label">Notas</p>
                <p className="text-sm text-stone-600 dark:text-stone-300 whitespace-pre-wrap">
                  {detalle.sesion.notas}
                </p>
              </div>
            )}

            <Button
              variante="danger"
              bloque
              onClick={() => eliminarSesion(detalle.sesion!.id!)}
            >
              <Trash2 className="w-4 h-4" />
              Eliminar sesión
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
