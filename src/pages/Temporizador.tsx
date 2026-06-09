import { useCallback, useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Play,
  Pause,
  RotateCcw,
  Save,
  Trash2,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { db } from "../db/database";
import type { TimerPreset } from "../db/types";
import { hoyDateTimeISO } from "../utils/fechas";
import { beepPiip, vibrar } from "../utils/audio";

// ─── types ───────────────────────────────────────────────────────────────────

type EstadoTimer = "idle" | "rep" | "descanso_rep" | "descanso_series" | "done";

interface ConfigTimer {
  series: number;
  repeticiones: number;
  duracionRep: number;
  descansoRep: number;
  descansoSeries: number;
}

type RawFields = Record<keyof ConfigTimer, string>;

// ─── helpers ─────────────────────────────────────────────────────────────────

const CONFIG_DEFECTO: ConfigTimer = {
  series: 3,
  repeticiones: 5,
  duracionRep: 30,
  descansoRep: 15,
  descansoSeries: 60,
};

function toRaw(c: ConfigTimer): RawFields {
  return {
    series: String(c.series),
    repeticiones: String(c.repeticiones),
    duracionRep: String(c.duracionRep),
    descansoRep: String(c.descansoRep),
    descansoSeries: String(c.descansoSeries),
  };
}

function parseRaw(raw: RawFields): ConfigTimer {
  const p = (s: string) => Math.max(1, parseInt(s, 10) || 1);
  return {
    series: p(raw.series),
    repeticiones: p(raw.repeticiones),
    duracionRep: p(raw.duracionRep),
    descansoRep: p(raw.descansoRep),
    descansoSeries: p(raw.descansoSeries),
  };
}

function formatSeg(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${String(sec).padStart(2, "0")}` : `${sec}s`;
}

function calcularTotalSeg(c: ConfigTimer): number {
  const repsPorSerie =
    c.repeticiones * c.duracionRep + (c.repeticiones - 1) * c.descansoRep;
  return c.series * repsPorSerie + (c.series - 1) * c.descansoSeries;
}

// ─── audio helpers ────────────────────────────────────────────────────────────

/** 880 Hz · 0.45 s — end of rep / end of rest-rep */
function beepRep() {
  beepPiip(880, 0.45);
}
/** 660 Hz · 0.55 s — end of series / end of rest-series */
function beepSeries() {
  beepPiip(660, 0.55);
}
/** 660 Hz · 1 s — full workout complete */
function beepDone() {
  beepPiip(660, 1.0, 0.8);
}

// ─── component ────────────────────────────────────────────────────────────────

export function Temporizador() {
  const [rawFields, setRawFields] = useState<RawFields>(toRaw(CONFIG_DEFECTO));
  const [config, setConfig] = useState<ConfigTimer>(CONFIG_DEFECTO);

  const [estado, setEstado] = useState<EstadoTimer>("idle");
  const [corriendo, setCorriendo] = useState(false);
  const [restante, setRestante] = useState(0);
  const [serieActual, setSerieActual] = useState(1);
  const [repActual, setRepActual] = useState(1);
  const [tiempoElapsado, setTiempoElapsado] = useState(0);
  const [tiempoTotal, setTiempoTotal] = useState(0);
  const [mostrarGuardar, setMostrarGuardar] = useState(false);
  const [mostrarConfig, setMostrarConfig] = useState(true);
  const [nombrePreset, setNombrePreset] = useState("");

  const intervalRef = useRef<number | null>(null);
  const serieRef = useRef(1);
  const repRef = useRef(1);
  const estadoRef = useRef<EstadoTimer>("idle");
  const configRef = useRef(config);
  const restanteRef = useRef(0);

  const presets = useLiveQuery(() =>
    db.temporizadorPresets.orderBy("creadoEn").reverse().toArray()
  );

  // ── raw-field helpers ───────────────────────────────────────────────────────

  function setRawField(k: keyof ConfigTimer, v: string) {
    // allow only digits
    if (v !== "" && !/^\d+$/.test(v)) return;
    setRawFields((prev) => ({ ...prev, [k]: v }));
  }

  function commitField(k: keyof ConfigTimer) {
    const val = Math.max(1, parseInt(rawFields[k], 10) || 1);
    setRawFields((prev) => ({ ...prev, [k]: String(val) }));
    setConfig((c) => ({ ...c, [k]: val }));
  }

  // ── timer state machine ─────────────────────────────────────────────────────

  const avanzar = useCallback(() => {
    const c = configRef.current;
    const s = serieRef.current;
    const r = repRef.current;
    const est = estadoRef.current;

    if (est === "rep") {
      if (r < c.repeticiones) {
        estadoRef.current = "descanso_rep";
        setEstado("descanso_rep");
        restanteRef.current = c.descansoRep;
        setRestante(c.descansoRep);
        beepRep();
        vibrar([80, 30, 80]);
      } else if (s < c.series) {
        estadoRef.current = "descanso_series";
        setEstado("descanso_series");
        restanteRef.current = c.descansoSeries;
        setRestante(c.descansoSeries);
        beepSeries();
        vibrar([150, 50, 150]);
      } else {
        estadoRef.current = "done";
        setEstado("done");
        setCorriendo(false);
        beepDone();
        vibrar([200, 100, 200, 100, 400]);
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        return;
      }
    } else if (est === "descanso_rep") {
      repRef.current = r + 1;
      setRepActual(r + 1);
      estadoRef.current = "rep";
      setEstado("rep");
      restanteRef.current = c.duracionRep;
      setRestante(c.duracionRep);
      beepRep();
      vibrar([80, 30, 80]);
    } else if (est === "descanso_series") {
      serieRef.current = s + 1;
      setSerieActual(s + 1);
      repRef.current = 1;
      setRepActual(1);
      estadoRef.current = "rep";
      setEstado("rep");
      restanteRef.current = c.duracionRep;
      setRestante(c.duracionRep);
      beepSeries();
      vibrar([150, 50, 150]);
    }
  }, []);

  useEffect(() => {
    if (!corriendo) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = window.setInterval(() => {
      restanteRef.current -= 1;
      setRestante(restanteRef.current);
      setTiempoElapsado((t) => t + 1);
      if (restanteRef.current <= 0) {
        avanzar();
      } else if (restanteRef.current <= 3) {
        beepPiip(660, 0.08, 0.06);
      }
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [corriendo, avanzar]);

  // ── actions ─────────────────────────────────────────────────────────────────

  function iniciar(configOverride?: ConfigTimer) {
    const c = configOverride ?? parseRaw(rawFields);
    // sync display so fields reflect what's running
    setConfig(c);
    setRawFields(toRaw(c));
    configRef.current = c;

    const total = calcularTotalSeg(c);
    setTiempoTotal(total);
    serieRef.current = 1;
    repRef.current = 1;
    estadoRef.current = "rep";
    restanteRef.current = c.duracionRep;
    setSerieActual(1);
    setRepActual(1);
    setEstado("rep");
    setRestante(c.duracionRep);
    setTiempoElapsado(0);
    setMostrarConfig(false);
    setCorriendo(true);
    beepPiip(880, 0.2, 0.5);
    vibrar(100);
  }

  function togglePausa() {
    setCorriendo((c) => !c);
  }

  function resetear() {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    setCorriendo(false);
    setEstado("idle");
    setRestante(0);
    setSerieActual(1);
    setRepActual(1);
    setTiempoElapsado(0);
    setMostrarConfig(true);
  }

  async function guardarPreset() {
    if (!nombrePreset.trim()) return;
    const c = parseRaw(rawFields);
    await db.temporizadorPresets.add({
      nombre: nombrePreset.trim(),
      ...c,
      creadoEn: hoyDateTimeISO(),
    });
    setNombrePreset("");
    setMostrarGuardar(false);
  }

  function cargarPreset(p: TimerPreset) {
    const c: ConfigTimer = {
      series: p.series,
      repeticiones: p.repeticiones,
      duracionRep: p.duracionRep,
      descansoRep: p.descansoRep,
      descansoSeries: p.descansoSeries,
    };
    iniciar(c);
  }

  // ── computed ─────────────────────────────────────────────────────────────────

  const progreso = tiempoTotal > 0 ? (tiempoElapsado / tiempoTotal) * 100 : 0;

  const configDisplayed = parseRaw(rawFields);
  const estimado = calcularTotalSeg(configDisplayed);

  const etiquetaEstado = () => {
    switch (estado) {
      case "rep":       return `Repetición ${repActual}/${config.repeticiones}`;
      case "descanso_rep":   return "Descanso entre reps";
      case "descanso_series": return "Descanso entre series";
      default:          return "";
    }
  };

  const colorEstado = () => {
    switch (estado) {
      case "rep":            return "text-crux-primary";
      case "descanso_rep":   return "text-amber-600";
      case "descanso_series":return "text-blue-600";
      default:               return "";
    }
  };

  // ── completion screen ────────────────────────────────────────────────────────

  if (estado === "done") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fade-in text-center px-4">
        <div className="w-20 h-20 rounded-2xl bg-crux-primary/10 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-crux-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-1">¡Completado!</h2>
          <p className="text-stone-500 dark:text-stone-400">
            {config.series} series · {config.repeticiones} reps ·{" "}
            {formatSeg(tiempoElapsado)} totales
          </p>
        </div>
        <Button onClick={resetear} tamano="lg" bloque>
          <RotateCcw className="w-5 h-5" />
          Nueva sesión
        </Button>
      </div>
    );
  }

  // ── main render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader titulo="Temporizador" subtitulo="Entrenamiento por intervalos" />

      {/* Config panel */}
      <Card>
        <button
          className="w-full flex items-center justify-between"
          onClick={() => setMostrarConfig((v) => !v)}
        >
          <CardTitle className="!mb-0">Configuración</CardTitle>
          {mostrarConfig
            ? <ChevronUp className="w-5 h-5 text-stone-400" />
            : <ChevronDown className="w-5 h-5 text-stone-400" />}
        </button>

        {mostrarConfig && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Series"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={String(CONFIG_DEFECTO.series)}
                value={rawFields.series}
                onChange={(e) => setRawField("series", e.target.value)}
                onBlur={() => commitField("series")}
              />
              <Input
                label="Repeticiones / serie"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={String(CONFIG_DEFECTO.repeticiones)}
                value={rawFields.repeticiones}
                onChange={(e) => setRawField("repeticiones", e.target.value)}
                onBlur={() => commitField("repeticiones")}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Duración rep (s)"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={String(CONFIG_DEFECTO.duracionRep)}
                value={rawFields.duracionRep}
                onChange={(e) => setRawField("duracionRep", e.target.value)}
                onBlur={() => commitField("duracionRep")}
              />
              <Input
                label="Descanso reps (s)"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={String(CONFIG_DEFECTO.descansoRep)}
                value={rawFields.descansoRep}
                onChange={(e) => setRawField("descansoRep", e.target.value)}
                onBlur={() => commitField("descansoRep")}
              />
              <Input
                label="Descanso series (s)"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={String(CONFIG_DEFECTO.descansoSeries)}
                value={rawFields.descansoSeries}
                onChange={(e) => setRawField("descansoSeries", e.target.value)}
                onBlur={() => commitField("descansoSeries")}
              />
            </div>
            <p className="text-xs text-stone-500 text-right">
              Tiempo total estimado:{" "}
              <span className="font-semibold text-crux-primary">
                {formatSeg(estimado)}
              </span>
            </p>
            <div className="flex gap-2 pt-1">
              <Button bloque onClick={() => iniciar()}>
                <Play className="w-4 h-4" />
                Iniciar
              </Button>
              <Button variante="secondary" onClick={() => setMostrarGuardar(true)}>
                <Save className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Active timer */}
      {estado !== "idle" && (
        <Card className="text-center">
          <div className="mb-2">
            <p className={`text-sm font-semibold uppercase tracking-wide ${colorEstado()}`}>
              {etiquetaEstado()}
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Serie {serieActual}/{config.series}
            </p>
          </div>

          <div className="relative w-48 h-48 mx-auto my-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" stroke="#E8E4DA" strokeWidth="8" fill="none" />
              <circle
                cx="50" cy="50" r="44"
                stroke={
                  estado === "rep" ? "#4A7C59"
                  : estado === "descanso_rep" ? "#D9A441"
                  : "#3B82F6"
                }
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 44}
                strokeDashoffset={
                  2 * Math.PI * 44 *
                  (1 - restante / (
                    estado === "rep" ? config.duracionRep
                    : estado === "descanso_rep" ? config.descansoRep
                    : config.descansoSeries
                  ))
                }
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-bold tabular-nums">{restante}</span>
            </div>
          </div>

          {/* Global progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
              <span>Progreso total</span>
              <span>{Math.round(progreso)}%</span>
            </div>
            <div className="h-2 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-crux-primary rounded-full transition-all duration-1000"
                style={{ width: `${progreso}%` }}
              />
            </div>
          </div>

          {/* Rep dots */}
          <div className="flex justify-center gap-1.5 mb-4 flex-wrap">
            {Array.from({ length: config.repeticiones }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < repActual - 1
                    ? "bg-crux-primary"
                    : i === repActual - 1
                    ? "bg-crux-primary/50"
                    : "bg-stone-200 dark:bg-stone-700"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2 justify-center">
            <Button variante="ghost" onClick={togglePausa} tamano="lg" className="flex-1">
              {corriendo ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              {corriendo ? "Pausar" : "Reanudar"}
            </Button>
            <Button variante="ghost" onClick={resetear} tamano="lg">
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      )}

      {/* Saved presets */}
      {presets && presets.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-stone-600 dark:text-stone-400 mb-2 px-1 uppercase tracking-wide">
            Presets guardados
          </h2>
          <div className="space-y-2">
            {presets.map((p) => (
              <Card key={p.id} className="!p-0 overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-stone-50 dark:hover:bg-stone-700/60 active:bg-stone-100 dark:active:bg-stone-700 transition-colors"
                  onClick={() => cargarPreset(p)}
                >
                  <div className="w-10 h-10 rounded-xl bg-crux-primary/10 flex items-center justify-center shrink-0">
                    <PlayCircle className="w-5 h-5 text-crux-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-stone-800 dark:text-stone-100">
                      {p.nombre}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {p.series}×{p.repeticiones} · {p.duracionRep}s trabajo · {p.descansoRep}s/{p.descansoSeries}s descanso
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs font-medium text-crux-primary hidden sm:inline">
                      Iniciar
                    </span>
                    <button
                      className="p-1.5 text-stone-400 hover:text-crux-danger transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        db.temporizadorPresets.delete(p.id!);
                      }}
                      aria-label="Eliminar preset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Save preset modal */}
      <Modal
        abierto={mostrarGuardar}
        onClose={() => setMostrarGuardar(false)}
        titulo="Guardar preset"
      >
        <div className="space-y-4">
          <Input
            label="Nombre del preset"
            placeholder="Ej: Hangboard 7-3, Campus reps..."
            value={nombrePreset}
            onChange={(e) => setNombrePreset(e.target.value)}
          />
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {configDisplayed.series} series · {configDisplayed.repeticiones} reps ·{" "}
            {configDisplayed.duracionRep}s trabajo · {configDisplayed.descansoRep}s/{configDisplayed.descansoSeries}s descanso
          </p>
          <div className="flex gap-2 pt-2">
            <Button variante="ghost" onClick={() => setMostrarGuardar(false)} bloque>
              Cancelar
            </Button>
            <Button onClick={guardarPreset} bloque disabled={!nombrePreset.trim()}>
              <Save className="w-4 h-4" />
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
