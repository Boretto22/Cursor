import { useState } from "react";
import { Camera, Plus, Trash2, X } from "lucide-react";
import { useSessionStore, type BorradorVia } from "../../store/sessionStore";
import { gradosPorModalidad } from "../../data/grados";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Chip } from "../ui/Chip";
import { Modal } from "../ui/Modal";
import { fileABase64Comprimido } from "../../utils/imagen";
import type { ResultadoVia } from "../../db/types";

const RESULTADOS: { id: ResultadoVia; label: string; emoji: string; color: string }[] = [
  { id: "flash", label: "A vista / Flash", emoji: "⚡", color: "bg-amber-100 text-amber-800" },
  { id: "redpoint", label: "Encadenada", emoji: "🎯", color: "bg-emerald-100 text-emerald-800" },
  { id: "top", label: "Top", emoji: "🏔️", color: "bg-blue-100 text-blue-800" },
  { id: "caida", label: "Con caídas", emoji: "💧", color: "bg-orange-100 text-orange-800" },
  { id: "proyecto", label: "Proyecto", emoji: "🔁", color: "bg-purple-100 text-purple-800" },
];

export function Paso2Vias() {
  const borrador = useSessionStore((s) => s.borrador);
  const agregar = useSessionStore((s) => s.agregarVia);
  const actualizar = useSessionStore((s) => s.actualizarVia);
  const eliminar = useSessionStore((s) => s.eliminarVia);
  const [editando, setEditando] = useState<BorradorVia | null>(null);

  if (!borrador?.modalidad) {
    return (
      <div className="text-center py-8 text-stone-500">
        Selecciona primero una modalidad
      </div>
    );
  }

  const grados = gradosPorModalidad(borrador.modalidad);

  function nuevaVia() {
    setEditando({
      tempId: crypto.randomUUID(),
      nombre: "",
      grado: grados[Math.floor(grados.length / 3)],
      resultado: "redpoint",
      intentos: 1,
    });
  }

  function guardarVia(v: BorradorVia) {
    const existente = borrador!.vias.find((x) => x.tempId === v.tempId);
    if (existente) {
      actualizar(v.tempId, v);
    } else {
      agregar(v);
    }
    setEditando(null);
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold mb-1">Vías o bloques</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Añade cada vía o bloque que hayas intentado
        </p>
      </div>

      <div className="space-y-2">
        {borrador.vias.map((v) => {
          const r = RESULTADOS.find((x) => x.id === v.resultado);
          return (
            <Card key={v.tempId} className="!py-3">
              <div className="flex items-center gap-3">
                {v.fotoBase64 ? (
                  <img
                    src={v.fotoBase64}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-crux-beige dark:bg-stone-700 flex items-center justify-center font-bold text-crux-primary">
                    {v.grado}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {v.nombre || `Vía ${v.grado}`}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r?.color}`}>
                      {r?.emoji} {r?.label}
                    </span>
                    <span className="text-xs text-stone-500">{v.intentos} intentos</span>
                  </div>
                </div>
                <button
                  onClick={() => setEditando(v)}
                  className="text-sm text-crux-primary font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminar(v.tempId)}
                  className="p-1.5 text-stone-400 hover:text-crux-danger"
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <Button bloque variante="secondary" onClick={nuevaVia}>
        <Plus className="w-5 h-5" />
        Añadir vía
      </Button>

      <Modal
        abierto={!!editando}
        onClose={() => setEditando(null)}
        titulo={editando && borrador.vias.find((v) => v.tempId === editando.tempId) ? "Editar vía" : "Nueva vía"}
        ancho="lg"
      >
        {editando && (
          <EditorVia
            via={editando}
            grados={grados}
            onCancel={() => setEditando(null)}
            onSave={guardarVia}
          />
        )}
      </Modal>
    </div>
  );
}

function EditorVia({
  via,
  grados,
  onCancel,
  onSave,
}: {
  via: BorradorVia;
  grados: string[];
  onCancel: () => void;
  onSave: (v: BorradorVia) => void;
}) {
  const [local, setLocal] = useState<BorradorVia>(via);
  const [cargandoFoto, setCargandoFoto] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCargandoFoto(true);
    try {
      const b64 = await fileABase64Comprimido(file, 800, 0.7);
      setLocal((v) => ({ ...v, fotoBase64: b64 }));
    } finally {
      setCargandoFoto(false);
    }
  }

  return (
    <div className="space-y-4">
      <Input
        label="Nombre (opcional)"
        placeholder="Ej: La Reina del Mambo"
        value={local.nombre}
        onChange={(e) => setLocal({ ...local, nombre: e.target.value })}
      />

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

      <div>
        <label className="label">Resultado</label>
        <div className="grid grid-cols-2 gap-2">
          {RESULTADOS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setLocal({ ...local, resultado: r.id })}
              className={`p-3 rounded-xl text-sm font-medium text-left transition-all active:scale-95 ${
                local.resultado === r.id
                  ? "bg-crux-primary text-white"
                  : `${r.color} dark:bg-stone-800 dark:text-stone-200`
              }`}
            >
              <span className="text-lg">{r.emoji}</span> {r.label}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Intentos"
        type="number"
        inputMode="numeric"
        min={1}
        value={local.intentos}
        onChange={(e) => setLocal({ ...local, intentos: Math.max(1, Number(e.target.value) || 1) })}
      />

      <div>
        <label className="label">Foto (opcional)</label>
        {local.fotoBase64 ? (
          <div className="relative">
            <img src={local.fotoBase64} alt="Vía" className="w-full h-40 object-cover rounded-xl" />
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
            {cargandoFoto ? "Procesando..." : "Tomar / Elegir foto"}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={onFile}
            />
          </label>
        )}
      </div>

      <Input
        label="Notas (opcional)"
        placeholder="Detalles del movimiento clave..."
        value={local.notas ?? ""}
        onChange={(e) => setLocal({ ...local, notas: e.target.value })}
      />

      <div className="flex gap-2 pt-2">
        <Button variante="ghost" onClick={onCancel} bloque>
          Cancelar
        </Button>
        <Button onClick={() => onSave(local)} bloque>
          Guardar
        </Button>
      </div>
    </div>
  );
}
