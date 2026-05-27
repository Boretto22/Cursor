import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Check, Target, Trash2 } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Chip } from "../components/ui/Chip";
import { EmptyState } from "../components/ui/EmptyState";
import {
  CATEGORIAS_TECNICA,
  TECNICAS,
  tecnicasPorCategoria,
} from "../data/tecnicas";
import type { CategoriaTecnica } from "../db/types";
import { db } from "../db/database";
import { semanaISOActual, hoyISO, hoyDateTimeISO, formatearFechaCorta } from "../utils/fechas";

export function Tecnica() {
  const [categoria, setCategoria] = useState<CategoriaTecnica>("pies");
  const [tecnicaSel, setTecnicaSel] = useState<string | null>(null);
  const [modalObjetivo, setModalObjetivo] = useState(false);
  const [modalRegistro, setModalRegistro] = useState<{ ejercicioId: string } | null>(null);

  const objetivos = useLiveQuery(async () => {
    return db.objetivosSemanales
      .where("semanaISO")
      .equals(semanaISOActual())
      .toArray();
  });

  const registroSemana = useLiveQuery(async () => {
    const todos = await db.ejerciciosTecnica.toArray();
    return todos
      .filter((e) => {
        const dia = new Date(e.fecha);
        const hoy = new Date();
        const diff = (hoy.getTime() - dia.getTime()) / 86400000;
        return diff <= 7;
      })
      .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  });

  const tecnicaInfo = tecnicaSel ? TECNICAS.find((t) => t.id === tecnicaSel) : null;

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        titulo="Técnica"
        subtitulo="Biblioteca de ejercicios y objetivos"
        accion={
          <Button tamano="sm" onClick={() => setModalObjetivo(true)}>
            <Target className="w-4 h-4" />
            Objetivo
          </Button>
        }
      />

      {/* Objetivos semanales */}
      <Card>
        <CardTitle>Objetivos de esta semana</CardTitle>
        {objetivos && objetivos.length > 0 ? (
          <div className="space-y-2">
            {objetivos.map((o) => (
              <div
                key={o.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-crux-beige/60 dark:bg-stone-700/30"
              >
                <button
                  onClick={() =>
                    db.objetivosSemanales.update(o.id!, { completado: !o.completado })
                  }
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    o.completado
                      ? "bg-crux-primary border-crux-primary"
                      : "border-stone-300 dark:border-stone-500"
                  }`}
                >
                  {o.completado && <Check className="w-4 h-4 text-white" />}
                </button>
                <p
                  className={`flex-1 text-sm ${
                    o.completado ? "line-through text-stone-400" : ""
                  }`}
                >
                  {o.texto}
                </p>
                <button
                  onClick={() => db.objetivosSemanales.delete(o.id!)}
                  className="text-stone-400 hover:text-crux-danger"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-500 py-3 text-center">
            Sin objetivos. Define algo concreto y medible.
          </p>
        )}
      </Card>

      {/* Filtro categorías */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
        {CATEGORIAS_TECNICA.map((c) => (
          <Chip
            key={c.id}
            activo={categoria === c.id}
            onClick={() => setCategoria(c.id)}
          >
            {c.emoji} {c.nombre}
          </Chip>
        ))}
      </div>

      {/* Biblioteca */}
      <div className="space-y-2">
        {tecnicasPorCategoria(categoria).map((t) => (
          <Card
            key={t.id}
            className="cursor-pointer hover:shadow-soft-lg transition-shadow"
            onClick={() => setTecnicaSel(t.id)}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{t.nombre}</p>
                <p className="text-xs text-stone-500 line-clamp-1">
                  {t.descripcion}
                </p>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-4 rounded-sm ${
                      i < t.dificultad ? "bg-crux-primary" : "bg-stone-200 dark:bg-stone-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Registro técnica reciente */}
      <Card>
        <CardTitle>Registro de la semana</CardTitle>
        {registroSemana && registroSemana.length > 0 ? (
          <div className="space-y-2">
            {registroSemana.slice(0, 8).map((e) => {
              const t = TECNICAS.find((x) => x.id === e.ejercicioId);
              return (
                <div
                  key={e.id}
                  className="flex items-center gap-3 py-1.5 border-b border-stone-100 dark:border-stone-700 last:border-0"
                >
                  <span className="text-lg">
                    {CATEGORIAS_TECNICA.find((c) => c.id === e.categoria)?.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {t?.nombre || e.ejercicioId}
                    </p>
                    <p className="text-xs text-stone-500">
                      {formatearFechaCorta(e.fecha)}
                      {e.series && ` · ${e.series}x${e.repeticiones ?? "—"}`}
                      {e.duracionMin && ` · ${e.duracionMin} min`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icono={Target}
            titulo="Sin registros aún"
            descripcion="Marca un ejercicio y regístralo para empezar."
          />
        )}
      </Card>

      {/* Modal info técnica */}
      <Modal
        abierto={!!tecnicaSel}
        onClose={() => setTecnicaSel(null)}
        titulo={tecnicaInfo?.nombre}
        ancho="md"
      >
        {tecnicaInfo && (
          <div className="space-y-4">
            <span className="chip">
              {CATEGORIAS_TECNICA.find((c) => c.id === tecnicaInfo.categoria)?.emoji}{" "}
              {CATEGORIAS_TECNICA.find((c) => c.id === tecnicaInfo.categoria)?.nombre}
            </span>
            <p className="text-stone-600 dark:text-stone-300">
              {tecnicaInfo.descripcion}
            </p>
            <div>
              <p className="label">Dificultad</p>
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-2 rounded-sm ${
                      i < tecnicaInfo.dificultad ? "bg-crux-primary" : "bg-stone-200"
                    }`}
                  />
                ))}
              </div>
            </div>
            <Button
              bloque
              onClick={() => {
                setModalRegistro({ ejercicioId: tecnicaInfo.id });
              }}
            >
              <Plus className="w-4 h-4" />
              Registrar entrenamiento
            </Button>
          </div>
        )}
      </Modal>

      {/* Modal añadir objetivo */}
      <ModalObjetivo
        abierto={modalObjetivo}
        onClose={() => setModalObjetivo(false)}
      />

      {/* Modal registro técnica */}
      <ModalRegistroTecnica
        abierto={!!modalRegistro}
        ejercicioId={modalRegistro?.ejercicioId}
        onClose={() => {
          setModalRegistro(null);
          setTecnicaSel(null);
        }}
      />
    </div>
  );
}

function ModalObjetivo({ abierto, onClose }: { abierto: boolean; onClose: () => void }) {
  const [texto, setTexto] = useState("");
  const [cat, setCat] = useState<CategoriaTecnica | "">("");

  async function guardar() {
    if (!texto.trim()) return;
    await db.objetivosSemanales.add({
      semanaISO: semanaISOActual(),
      texto: texto.trim(),
      categoria: cat || undefined,
      completado: false,
      fechaCreacion: hoyDateTimeISO(),
    });
    setTexto("");
    setCat("");
    onClose();
  }

  return (
    <Modal abierto={abierto} onClose={onClose} titulo="Nuevo objetivo semanal">
      <div className="space-y-4">
        <Textarea
          label="¿Qué quieres mejorar?"
          placeholder="Ej: Encadenar mi primer 6c esta semana"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <div>
          <label className="label">Categoría (opcional)</label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIAS_TECNICA.map((c) => (
              <Chip
                key={c.id}
                activo={cat === c.id}
                onClick={() => setCat(cat === c.id ? "" : c.id)}
              >
                {c.emoji} {c.nombre}
              </Chip>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variante="ghost" onClick={onClose} bloque>
            Cancelar
          </Button>
          <Button onClick={guardar} bloque disabled={!texto.trim()}>
            Crear
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ModalRegistroTecnica({
  abierto,
  ejercicioId,
  onClose,
}: {
  abierto: boolean;
  ejercicioId?: string;
  onClose: () => void;
}) {
  const [series, setSeries] = useState("");
  const [reps, setReps] = useState("");
  const [dur, setDur] = useState("");
  const [notas, setNotas] = useState("");

  async function guardar() {
    if (!ejercicioId) return;
    const t = TECNICAS.find((x) => x.id === ejercicioId);
    if (!t) return;
    await db.ejerciciosTecnica.add({
      fecha: hoyISO(),
      ejercicioId,
      categoria: t.categoria,
      series: series ? Number(series) : undefined,
      repeticiones: reps ? Number(reps) : undefined,
      duracionMin: dur ? Number(dur) : undefined,
      notas: notas || undefined,
    });
    setSeries("");
    setReps("");
    setDur("");
    setNotas("");
    onClose();
  }

  return (
    <Modal abierto={abierto} onClose={onClose} titulo="Registrar entrenamiento">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Series" type="number" inputMode="numeric" value={series} onChange={(e) => setSeries(e.target.value)} />
          <Input label="Repeticiones" type="number" inputMode="numeric" value={reps} onChange={(e) => setReps(e.target.value)} />
        </div>
        <Input label="Duración (min)" type="number" inputMode="numeric" value={dur} onChange={(e) => setDur(e.target.value)} />
        <Textarea label="Notas" value={notas} onChange={(e) => setNotas(e.target.value)} />
        <div className="flex gap-2 pt-2">
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
