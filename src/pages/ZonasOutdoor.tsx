import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  ArrowLeft,
  Plus,
  MapPin,
  Mountain,
  Crosshair,
  Trash2,
} from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { Chip } from "../components/ui/Chip";
import { MODALIDADES } from "../data/zonasCorporales";
import { db } from "../db/database";
import { hoyISO, formatearFechaCorta } from "../utils/fechas";
import type { Modalidad, ZonaOutdoor } from "../db/types";

const iconoCrux = new L.DivIcon({
  className: "",
  html: `<div style="background:#4A7C59;width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;">🧗</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function CentrarBoton() {
  const map = useMap();
  return (
    <button
      onClick={() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
          (p) => map.flyTo([p.coords.latitude, p.coords.longitude], 12),
          () => {}
        );
      }}
      className="absolute top-4 right-4 z-[400] p-2.5 bg-white dark:bg-stone-800 rounded-xl shadow-soft active:scale-95"
      aria-label="Centrar en mi posición"
    >
      <Crosshair className="w-5 h-5 text-crux-primary" />
    </button>
  );
}

export function ZonasOutdoor() {
  const navigate = useNavigate();
  const [editando, setEditando] = useState<ZonaOutdoor | null>(null);
  const [seleccionada, setSeleccionada] = useState<ZonaOutdoor | null>(null);
  const [modoAgregar, setModoAgregar] = useState(false);

  const zonas = useLiveQuery(async () => db.zonasOutdoor.toArray());

  function onMapClick(lat: number, lng: number) {
    if (!modoAgregar) return;
    setEditando({
      nombre: "",
      lat,
      lng,
      modalidades: ["deportiva_outdoor"],
      fechaPrimeraVisita: hoyISO(),
      visitas: 1,
    });
    setModoAgregar(false);
  }

  const centro: [number, number] =
    zonas && zonas.length > 0 ? [zonas[0].lat, zonas[0].lng] : [42.5, 1.5];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader
          titulo="Zonas outdoor"
          subtitulo={`${zonas?.length ?? 0} zonas visitadas`}
          accion={
            <Button
              tamano="sm"
              variante={modoAgregar ? "danger" : "primary"}
              onClick={() => setModoAgregar((v) => !v)}
            >
              {modoAgregar ? "Cancelar" : <><Plus className="w-4 h-4" /> Añadir</>}
            </Button>
          }
        />
      </div>

      {modoAgregar && (
        <div className="card bg-crux-primary text-white !p-3 text-sm flex items-center gap-2">
          <MapPin className="w-4 h-4 shrink-0" />
          Toca cualquier punto del mapa para crear una zona
        </div>
      )}

      <div className="relative h-[55vh] rounded-2xl overflow-hidden shadow-soft">
        <MapContainer
          center={centro}
          zoom={zonas && zonas.length > 0 ? 6 : 4}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {zonas?.map((z) => (
            <Marker
              key={z.id}
              position={[z.lat, z.lng]}
              icon={iconoCrux}
              eventHandlers={{ click: () => setSeleccionada(z) }}
            >
              <Popup>
                <strong>{z.nombre}</strong>
                <br />
                {z.region && `${z.region}, `}
                {z.pais}
                <br />
                Visitas: {z.visitas}
              </Popup>
            </Marker>
          ))}
          <ClickHandler onClick={onMapClick} />
          <CentrarBoton />
        </MapContainer>
      </div>

      {zonas && zonas.length > 0 ? (
        <div className="space-y-2">
          {zonas.map((z) => (
            <Card
              key={z.id}
              className="cursor-pointer hover:shadow-soft-lg transition-shadow"
              onClick={() => setSeleccionada(z)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-crux-beige dark:bg-stone-700 flex items-center justify-center text-xl">
                  🏔️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{z.nombre}</p>
                  <p className="text-xs text-stone-500 truncate">
                    {[z.region, z.pais].filter(Boolean).join(", ") || "—"} ·{" "}
                    {z.visitas} visita{z.visitas !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        !modoAgregar && (
          <EmptyState
            icono={Mountain}
            titulo="Sin zonas registradas"
            descripcion="Pulsa 'Añadir' y toca el mapa para crear tu primera zona outdoor."
          />
        )
      )}

      <ModalEditarZona
        zona={editando}
        onClose={() => setEditando(null)}
      />

      <Modal
        abierto={!!seleccionada}
        onClose={() => setSeleccionada(null)}
        titulo={seleccionada?.nombre}
      >
        {seleccionada && (
          <div className="space-y-3">
            <p className="text-sm text-stone-600 dark:text-stone-300">
              {[seleccionada.region, seleccionada.pais].filter(Boolean).join(", ")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {seleccionada.modalidades.map((m) => {
                const mo = MODALIDADES.find((x) => x.id === m);
                return (
                  <span key={m} className="chip">
                    {mo?.emoji} {mo?.nombre}
                  </span>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Card className="!p-3">
                <p className="text-xs text-stone-500">Visitas</p>
                <p className="text-xl font-bold">{seleccionada.visitas}</p>
              </Card>
              <Card className="!p-3">
                <p className="text-xs text-stone-500">Primera visita</p>
                <p className="text-sm font-medium">
                  {formatearFechaCorta(seleccionada.fechaPrimeraVisita)}
                </p>
              </Card>
            </div>
            {seleccionada.notas && (
              <p className="text-sm text-stone-600 dark:text-stone-300 italic">
                {seleccionada.notas}
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <Button
                variante="secondary"
                bloque
                onClick={() => {
                  setEditando(seleccionada);
                  setSeleccionada(null);
                }}
              >
                Editar
              </Button>
              <Button
                onClick={async () => {
                  await db.zonasOutdoor.update(seleccionada.id!, {
                    visitas: seleccionada.visitas + 1,
                  });
                  setSeleccionada(null);
                }}
                bloque
              >
                <Plus className="w-4 h-4" />
                Registrar visita
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ModalEditarZona({
  zona,
  onClose,
}: {
  zona: ZonaOutdoor | null;
  onClose: () => void;
}) {
  const [local, setLocal] = useState<ZonaOutdoor | null>(zona);

  useEffect(() => {
    setLocal(zona);
  }, [zona]);

  if (!zona || !local) return null;

  async function guardar() {
    if (!local || !local.nombre) return;
    if (local.id) {
      await db.zonasOutdoor.put(local);
    } else {
      await db.zonasOutdoor.add(local);
    }
    onClose();
  }

  async function eliminar() {
    if (!local?.id) return;
    if (!confirm("¿Eliminar esta zona?")) return;
    await db.zonasOutdoor.delete(local.id);
    onClose();
  }

  function toggleMod(m: Modalidad) {
    const has = local!.modalidades.includes(m);
    setLocal({
      ...local!,
      modalidades: has
        ? local!.modalidades.filter((x) => x !== m)
        : [...local!.modalidades, m],
    });
  }

  return (
    <Modal
      abierto={true}
      onClose={onClose}
      titulo={local.id ? "Editar zona" : "Nueva zona outdoor"}
    >
      <div className="space-y-4">
        <Input
          label="Nombre"
          placeholder="Ej: Margalef"
          value={local.nombre}
          onChange={(e) => setLocal({ ...local, nombre: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Región"
            value={local.region ?? ""}
            onChange={(e) => setLocal({ ...local, region: e.target.value })}
          />
          <Input
            label="País"
            value={local.pais ?? ""}
            onChange={(e) => setLocal({ ...local, pais: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Modalidades disponibles</label>
          <div className="flex flex-wrap gap-1.5">
            {MODALIDADES.filter((m) => m.id.includes("outdoor")).map((m) => (
              <Chip
                key={m.id}
                activo={local.modalidades.includes(m.id as Modalidad)}
                onClick={() => toggleMod(m.id as Modalidad)}
              >
                {m.emoji} {m.nombre}
              </Chip>
            ))}
          </div>
        </div>
        <Textarea
          label="Notas"
          value={local.notas ?? ""}
          onChange={(e) => setLocal({ ...local, notas: e.target.value })}
        />
        <p className="text-xs text-stone-500">
          📍 {local.lat.toFixed(4)}, {local.lng.toFixed(4)}
        </p>
        <div className="flex gap-2 pt-2">
          {local.id && (
            <Button variante="danger" onClick={eliminar}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button variante="ghost" onClick={onClose} bloque>
            Cancelar
          </Button>
          <Button onClick={guardar} bloque disabled={!local.nombre}>
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
