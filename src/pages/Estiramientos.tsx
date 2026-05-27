import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Clock, ListChecks } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardTitle } from "../components/ui/Card";
import { Chip } from "../components/ui/Chip";
import { Button } from "../components/ui/Button";
import { TemporizadorEjercicio } from "../components/timer/TemporizadorEjercicio";
import { RUTINAS_ESTIRAMIENTO, rutinaPorId } from "../data/estiramientos";
import type { TipoEstiramiento } from "../db/types";
import { db } from "../db/database";
import { hoyDateTimeISO, formatearFechaCorta } from "../utils/fechas";

const TIPOS: { id: TipoEstiramiento; label: string; emoji: string }[] = [
  { id: "pre", label: "Pre-escalada", emoji: "⏱️" },
  { id: "post", label: "Post-escalada", emoji: "🧘" },
  { id: "recuperacion", label: "Recuperación", emoji: "💆" },
];

export function Estiramientos() {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState<TipoEstiramiento>("post");
  const [rutinaActiva, setRutinaActiva] = useState<string | null>(null);

  const historial = useLiveQuery(async () => {
    return (await db.estiramientosSesion.orderBy("fecha").reverse().toArray()).slice(0, 10);
  });

  const rutinas = RUTINAS_ESTIRAMIENTO.filter((r) => r.tipo === tipo);
  const rutinaSel = rutinaActiva ? rutinaPorId(rutinaActiva) : null;

  async function onCompletar(completado: boolean, idx: number) {
    if (!rutinaSel) return;
    await db.estiramientosSesion.add({
      rutinaId: rutinaSel.id,
      fecha: hoyDateTimeISO(),
      tipo: rutinaSel.tipo,
      ejerciciosCompletados: idx + 1,
      ejerciciosTotal: rutinaSel.ejercicios.length,
      duracionTotalSeg: rutinaSel.ejercicios.reduce((a, e) => a + e.duracionSeg, 0),
      completado,
    });
    setRutinaActiva(null);
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader titulo="Estiramientos" subtitulo="Rutinas guiadas con temporizador" />
      </div>

      <div className="flex gap-1.5">
        {TIPOS.map((t) => (
          <Chip
            key={t.id}
            activo={tipo === t.id}
            onClick={() => setTipo(t.id)}
            className="flex-1 justify-center"
          >
            {t.emoji} {t.label}
          </Chip>
        ))}
      </div>

      <div className="space-y-3">
        {rutinas.map((r) => {
          const segTotal = r.ejercicios.reduce((a, e) => a + e.duracionSeg, 0);
          return (
            <Card key={r.id}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1">{r.nombre}</h3>
                  <div className="flex items-center gap-3 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <ListChecks className="w-3.5 h-3.5" />
                      {r.ejercicios.length} ejercicios
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {Math.ceil(segTotal / 60)} min
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3 max-h-16 overflow-hidden">
                {r.ejercicios.slice(0, 5).map((e) => (
                  <span
                    key={e.id}
                    className="text-xs px-2 py-0.5 rounded-full bg-crux-beige dark:bg-stone-700 text-stone-600 dark:text-stone-300"
                  >
                    {e.nombre}
                  </span>
                ))}
                {r.ejercicios.length > 5 && (
                  <span className="text-xs px-2 py-0.5 text-stone-400">
                    +{r.ejercicios.length - 5}
                  </span>
                )}
              </div>
              <Button bloque onClick={() => setRutinaActiva(r.id)}>
                <Play className="w-4 h-4" />
                Empezar rutina
              </Button>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardTitle>Historial reciente</CardTitle>
        {historial && historial.length > 0 ? (
          <div className="space-y-2">
            {historial.map((h) => {
              const r = rutinaPorId(h.rutinaId);
              return (
                <div
                  key={h.id}
                  className="flex items-center gap-3 py-1.5 border-b border-stone-100 dark:border-stone-700 last:border-0"
                >
                  <span className="text-lg">
                    {TIPOS.find((t) => t.id === h.tipo)?.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {r?.nombre || h.rutinaId}
                    </p>
                    <p className="text-xs text-stone-500">
                      {formatearFechaCorta(h.fecha)} ·{" "}
                      {h.ejerciciosCompletados}/{h.ejerciciosTotal} ejercicios
                    </p>
                  </div>
                  {h.completado && (
                    <span className="text-xs font-medium text-crux-primary">✓</span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-sm text-stone-500 py-4">
            Aún no has completado rutinas.
          </p>
        )}
      </Card>

      {rutinaSel && (
        <TemporizadorEjercicio
          ejercicios={rutinaSel.ejercicios}
          onCompletar={onCompletar}
          onCerrar={() => setRutinaActiva(null)}
        />
      )}
    </div>
  );
}
