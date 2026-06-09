import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import {
  ArrowLeft,
  Plus,
  Trophy,
  Camera,
  X,
  Trash2,
  Target,
} from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Chip } from "../components/ui/Chip";
import { EmptyState } from "../components/ui/EmptyState";
import { MODALIDADES } from "../data/zonasCorporales";
import { gradosPorModalidad } from "../data/grados";
import { fileABase64Comprimido } from "../utils/imagen";
import { db } from "../db/database";
import { hoyDateTimeISO, hoyISO, formatearFechaCorta, diasEntreFechas } from "../utils/fechas";
import type { Modalidad, Proyecto, ResultadoVia } from "../db/types";

export function Proyectos() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<"todos" | "activos" | "enviados">("activos");
  const [editando, setEditando] = useState<Proyecto | null>(null);
  const [verDetalle, setVerDetalle] = useState<number | null>(null);

  const proyectos = useLiveQuery(async () => {
    const todos = await db.proyectos.orderBy("fechaInicio").reverse().toArray();
    if (filtro === "todos") return todos;
    if (filtro === "activos") return todos.filter((p) => !p.enviado);
    return todos.filter((p) => p.enviado);
  }, [filtro]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader
          titulo="Proyectos"
          subtitulo="Tus retos personales"
          accion={
            <Button tamano="sm" onClick={() => setEditando(emptyProyecto())}>
              <Plus className="w-4 h-4" />
              Nuevo
            </Button>
          }
        />
      </div>

      <div className="flex gap-1.5">
        {[
          { id: "activos" as const, label: "Activos" },
          { id: "enviados" as const, label: "Enviados" },
          { id: "todos" as const, label: "Todos" },
        ].map((f) => (
          <Chip
            key={f.id}
            activo={filtro === f.id}
            onClick={() => setFiltro(f.id)}
            className="flex-1 justify-center"
          >
            {f.label}
          </Chip>
        ))}
      </div>

      {proyectos && proyectos.length === 0 && (
        <EmptyState
          icono={Trophy}
          titulo="Sin proyectos"
          descripcion="Crea tu primer proyecto y empieza a registrar intentos."
          accion={
            <Button onClick={() => setEditando(emptyProyecto())}>
              <Plus className="w-4 h-4" />
              Nuevo proyecto
            </Button>
          }
        />
      )}

      <div className="space-y-3">
        {proyectos?.map((p) => {
          const mod = MODALIDADES.find((m) => m.id === p.modalidad);
          const dias = diasEntreFechas(p.fechaInicio, p.fechaEnviado);
          return (
            <Card
              key={p.id}
              className="cursor-pointer hover:shadow-soft-lg transition-shadow"
              onClick={() => setVerDetalle(p.id!)}
            >
              <div className="flex items-center gap-3">
                {p.fotoBase64 ? (
                  <img src={p.fotoBase64} className="w-16 h-16 rounded-xl object-cover" alt="" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-crux-beige dark:bg-stone-700 flex items-center justify-center text-2xl">
                    {mod?.emoji}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold truncate">{p.nombre}</h3>
                    {p.enviado && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                        ✓ Enviado
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-stone-500">
                    <span className="font-bold text-crux-primary">{p.grado}</span>
                    {" · "}
                    {p.intentosTotales} intentos · {dias} días
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <ModalProyecto
        proyecto={editando}
        onClose={() => setEditando(null)}
      />

      <ModalDetalleProyecto
        proyectoId={verDetalle}
        onClose={() => setVerDetalle(null)}
        onEditar={(p) => {
          setEditando(p);
          setVerDetalle(null);
        }}
      />
    </div>
  );
}

function emptyProyecto(): Proyecto {
  return {
    nombre: "",
    grado: "",
    modalidad: "deportiva_outdoor",
    descripcion: "",
    enviado: false,
    fechaInicio: hoyISO(),
    intentosTotales: 0,
    createdAt: hoyDateTimeISO(),
  };
}

function ModalProyecto({ proyecto, onClose }: { proyecto: Proyecto | null; onClose: () => void }) {
  const [local, setLocal] = useState<Proyecto | null>(proyecto);

  useEffect(() => {
    setLocal(proyecto);
  }, [proyecto]);

  if (!proyecto || !local) return null;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileABase64Comprimido(file, 800, 0.7);
    setLocal((p) => p && { ...p, fotoBase64: b64 });
  }

  async function guardar() {
    if (!local || !local.nombre || !local.grado) return;
    if (local.id) {
      await db.proyectos.update(local.id, local);
    } else {
      await db.proyectos.add(local);
    }
    onClose();
  }

  async function eliminar() {
    if (!local?.id) return;
    if (!confirm("¿Eliminar este proyecto?")) return;
    await db.proyectos.delete(local.id);
    await db.intentosProyecto.where("proyectoId").equals(local.id).delete();
    onClose();
  }

  const grados = gradosPorModalidad(local.modalidad);

  return (
    <Modal
      abierto={true}
      onClose={onClose}
      titulo={local.id ? "Editar proyecto" : "Nuevo proyecto"}
      ancho="lg"
    >
      <div className="space-y-4">
        <Input
          label="Nombre"
          placeholder="Ej: La Rambla"
          value={local.nombre}
          onChange={(e) => setLocal({ ...local, nombre: e.target.value })}
        />

        <div>
          <label className="label">Modalidad</label>
          <div className="grid grid-cols-2 gap-2">
            {MODALIDADES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setLocal({ ...local, modalidad: m.id as Modalidad, grado: "" })}
                className={`p-2 rounded-xl text-sm font-medium text-left transition-all ${
                  local.modalidad === m.id
                    ? "bg-crux-primary text-white"
                    : "bg-crux-beige dark:bg-stone-800 dark:text-stone-300"
                }`}
              >
                {m.emoji} {m.nombre}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Grado</label>
          <div className="flex flex-wrap gap-1.5">
            {grados.map((g) => (
              <Chip
                key={g}
                activo={local.grado === g}
                onClick={() => setLocal({ ...local, grado: g })}
              >
                {g}
              </Chip>
            ))}
          </div>
        </div>

        <Textarea
          label="Descripción"
          value={local.descripcion ?? ""}
          onChange={(e) => setLocal({ ...local, descripcion: e.target.value })}
        />

        <div>
          <label className="label">Foto</label>
          {local.fotoBase64 ? (
            <div className="relative">
              <img src={local.fotoBase64} className="w-full h-40 object-cover rounded-xl" alt="" />
              <button
                type="button"
                onClick={() => setLocal({ ...local, fotoBase64: undefined })}
                className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="btn-secondary w-full cursor-pointer">
              <Camera className="w-5 h-5" />
              Foto del proyecto
              <input type="file" accept="image/*" className="hidden" onChange={onFile} />
            </label>
          )}
        </div>

        <label className="flex items-center gap-3 cursor-pointer card !py-3">
          <input
            type="checkbox"
            checked={local.enviado}
            onChange={(e) =>
              setLocal({
                ...local,
                enviado: e.target.checked,
                fechaEnviado: e.target.checked ? hoyISO() : undefined,
              })
            }
            className="w-5 h-5 accent-crux-primary"
          />
          <span className="font-medium">✓ Marcar como enviado</span>
        </label>

        <div className="flex gap-2 pt-2">
          {local.id && (
            <Button variante="danger" onClick={eliminar}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button variante="ghost" onClick={onClose} bloque>
            Cancelar
          </Button>
          <Button onClick={guardar} bloque disabled={!local.nombre || !local.grado}>
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ModalDetalleProyecto({
  proyectoId,
  onClose,
  onEditar,
}: {
  proyectoId: number | null;
  onClose: () => void;
  onEditar: (p: Proyecto) => void;
}) {
  const [resultado, setResultado] = useState<ResultadoVia>("caida");
  const [notas, setNotas] = useState("");

  const proyecto = useLiveQuery(async () => {
    if (!proyectoId) return null;
    return db.proyectos.get(proyectoId);
  }, [proyectoId]);

  const intentos = useLiveQuery(async () => {
    if (!proyectoId) return [];
    return (
      await db.intentosProyecto.where("proyectoId").equals(proyectoId).toArray()
    ).sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  }, [proyectoId]);

  async function agregarIntento() {
    if (!proyectoId || !proyecto) return;
    await db.intentosProyecto.add({
      proyectoId,
      fecha: hoyDateTimeISO(),
      resultado,
      notas: notas || undefined,
    });
    await db.proyectos.update(proyectoId, {
      intentosTotales: proyecto.intentosTotales + 1,
      enviado: resultado === "redpoint" || resultado === "flash" || proyecto.enviado,
      fechaEnviado:
        (resultado === "redpoint" || resultado === "flash") && !proyecto.enviado
          ? hoyISO()
          : proyecto.fechaEnviado,
    });
    setNotas("");
    setResultado("caida");
  }

  return (
    <Modal
      abierto={!!proyectoId}
      onClose={onClose}
      titulo={proyecto?.nombre}
      ancho="lg"
    >
      {proyecto && (
        <div className="space-y-4">
          {proyecto.fotoBase64 && (
            <img
              src={proyecto.fotoBase64}
              alt=""
              className="w-full h-44 object-cover rounded-xl"
            />
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="chip">
              {MODALIDADES.find((m) => m.id === proyecto.modalidad)?.emoji}{" "}
              {MODALIDADES.find((m) => m.id === proyecto.modalidad)?.nombre}
            </span>
            <span className="chip chip-active">{proyecto.grado}</span>
            {proyecto.enviado && (
              <span className="chip chip-active">✓ Enviado</span>
            )}
          </div>
          {proyecto.descripcion && (
            <p className="text-sm text-stone-600 dark:text-stone-300">
              {proyecto.descripcion}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Card className="!p-3">
              <p className="text-xs text-stone-500">Intentos</p>
              <p className="text-xl font-bold">{proyecto.intentosTotales}</p>
            </Card>
            <Card className="!p-3">
              <p className="text-xs text-stone-500">Días trabajado</p>
              <p className="text-xl font-bold">
                {diasEntreFechas(proyecto.fechaInicio, proyecto.fechaEnviado)}
              </p>
            </Card>
          </div>

          <div className="card !p-3">
            <p className="label !mb-2 flex items-center gap-1.5">
              <Target className="w-4 h-4" /> Registrar intento
            </p>
            <div className="flex flex-wrap gap-1 mb-2">
              {(["flash", "redpoint", "caida"] as ResultadoVia[]).map((r) => (
                <Chip key={r} activo={resultado === r} onClick={() => setResultado(r)}>
                  {r === "flash" ? "⚡ A vista" : r === "redpoint" ? "🎯 Encadenado" : "💧 Caída"}
                </Chip>
              ))}
            </div>
            <Input
              placeholder="Notas (opcional)"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
            <Button bloque className="mt-2" onClick={agregarIntento}>
              <Plus className="w-4 h-4" />
              Añadir intento
            </Button>
          </div>

          <div>
            <p className="label">Historial</p>
            <div className="space-y-1.5">
              {intentos && intentos.length > 0 ? (
                intentos.map((i) => (
                  <div
                    key={i.id}
                    className="flex items-center justify-between text-sm py-1.5 border-b border-stone-100 dark:border-stone-700"
                  >
                    <span>{formatearFechaCorta(i.fecha)}</span>
                    <span className="font-medium">
                      {i.resultado === "flash" && "⚡ A vista"}
                      {i.resultado === "redpoint" && "🎯 Encadenado"}
                      {i.resultado === "caida" && "💧 Caída"}
                      {i.resultado === "top" && "🏔️ Top"}
                      {i.resultado === "proyecto" && "🔁 Trabajando"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-stone-500">Sin intentos registrados</p>
              )}
            </div>
          </div>

          <Button variante="secondary" bloque onClick={() => onEditar(proyecto)}>
            Editar proyecto
          </Button>
        </div>
      )}
    </Modal>
  );
}
