import { useEffect, useRef, useState } from "react";
import { Pause, Play, SkipForward, X } from "lucide-react";
import { Button } from "../ui/Button";
import type { EstiramientoEjercicio } from "../../db/types";
import { beep, beepDoble, vibrar } from "../../utils/audio";

interface TemporizadorEjercicioProps {
  ejercicios: EstiramientoEjercicio[];
  indiceInicial?: number;
  onCompletar: (completadoTotal: boolean, indiceActual: number) => void;
  onCerrar: () => void;
}

export function TemporizadorEjercicio({
  ejercicios,
  indiceInicial = 0,
  onCompletar,
  onCerrar,
}: TemporizadorEjercicioProps) {
  const [indice, setIndice] = useState(indiceInicial);
  const [restante, setRestante] = useState(ejercicios[indiceInicial]?.duracionSeg ?? 0);
  const [pausa, setPausa] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const actual = ejercicios[indice];
  const totalActual = actual?.duracionSeg ?? 0;
  const progreso = totalActual > 0 ? ((totalActual - restante) / totalActual) * 100 : 0;

  useEffect(() => {
    if (pausa) return;
    intervalRef.current = window.setInterval(() => {
      setRestante((r) => {
        if (r <= 1) {
          if (indice < ejercicios.length - 1) {
            beepDoble();
            vibrar([100, 50, 100]);
            const siguiente = indice + 1;
            setIndice(siguiente);
            return ejercicios[siguiente].duracionSeg;
          }
          beep(660, 250);
          beep(880, 250);
          vibrar([200, 100, 200, 100, 200]);
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          onCompletar(true, indice);
          return 0;
        }
        if (r <= 4 && r > 1) beep(440, 100, 0.08);
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [pausa, indice, ejercicios, onCompletar]);

  function saltar() {
    if (indice < ejercicios.length - 1) {
      beep(660);
      vibrar(80);
      const sig = indice + 1;
      setIndice(sig);
      setRestante(ejercicios[sig].duracionSeg);
    } else {
      onCompletar(true, indice);
    }
  }

  if (!actual) return null;

  return (
    <div className="fixed inset-0 z-50 bg-crux-primary text-white flex flex-col animate-fade-in">
      <div className="flex items-center justify-between p-4">
        <span className="text-sm opacity-80">
          {indice + 1} / {ejercicios.length}
        </span>
        <button
          onClick={onCerrar}
          className="p-2 rounded-lg hover:bg-white/10"
          aria-label="Cerrar temporizador"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">{actual.nombre}</h2>
        {actual.descripcion && (
          <p className="text-base opacity-80 max-w-md mb-8">{actual.descripcion}</p>
        )}

        <div className="relative w-56 h-56 mb-8">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="112"
              cy="112"
              r="100"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="112"
              cy="112"
              r="100"
              stroke="white"
              strokeWidth="12"
              fill="none"
              strokeDasharray={2 * Math.PI * 100}
              strokeDashoffset={2 * Math.PI * 100 * (1 - progreso / 100)}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-bold tabular-nums">{restante}s</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variante="ghost"
            tamano="lg"
            className="!bg-white/10 !text-white hover:!bg-white/20"
            onClick={() => setPausa((p) => !p)}
          >
            {pausa ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            {pausa ? "Reanudar" : "Pausar"}
          </Button>
          <Button
            variante="ghost"
            tamano="lg"
            className="!bg-white/10 !text-white hover:!bg-white/20"
            onClick={saltar}
          >
            <SkipForward className="w-5 h-5" />
            {indice < ejercicios.length - 1 ? "Saltar" : "Terminar"}
          </Button>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="flex gap-1">
          {ejercicios.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i < indice ? "bg-white" : i === indice ? "bg-white/60" : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
