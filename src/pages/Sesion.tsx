import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useSessionStore } from "../store/sessionStore";
import { BarraProgresoPasos } from "../components/session/BarraProgresoPasos";
import { Paso1Modalidad } from "../components/session/Paso1Modalidad";
import { Paso2Vias } from "../components/session/Paso2Vias";
import { Paso3Sensacion } from "../components/session/Paso3Sensacion";
import { Paso5Estiramientos } from "../components/session/Paso5Estiramientos";
import { Paso6Resumen } from "../components/session/Paso6Resumen";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { db } from "../db/database";
import { format, parseISO } from "date-fns";
import { hoyDateTimeISO } from "../utils/fechas";

const ETIQUETAS = ["Modalidad", "Vías", "Sensación", "Estiramientos", "Resumen"];

export function Sesion() {
  const navigate = useNavigate();
  const borrador = useSessionStore((s) => s.borrador);
  const iniciar = useSessionStore((s) => s.iniciarBorrador);
  const setPaso = useSessionStore((s) => s.setPaso);
  const resetear = useSessionStore((s) => s.resetear);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!borrador) iniciar();
  }, [borrador, iniciar]);

  if (!borrador) return null;

  const paso = borrador.paso;
  const puedeAvanzar = (() => {
    if (paso === 0) return !!borrador.modalidad;
    if (paso === 1) return borrador.vias.length > 0;
    return true;
  })();

  function siguiente() {
    if (paso < 4) setPaso(paso + 1);
  }
  function anterior() {
    if (paso > 0) setPaso(paso - 1);
  }

  async function guardar() {
    if (!borrador || !borrador.modalidad) return;
    setGuardando(true);
    try {
      const fechaDia = format(parseISO(borrador.fecha), "yyyy-MM-dd");
      const sessionId = await db.sesiones.add({
        fecha: borrador.fecha,
        fechaDia,
        modalidad: borrador.modalidad,
        nombreLugar: borrador.nombreLugar || undefined,
        duracionMin: borrador.duracionMin ?? undefined,
        sensacion: borrador.sensacion,
        fatiga: borrador.fatiga,
        tecnicasTrabajadasIds: borrador.tecnicasTrabajadasIds,
        notas: borrador.notas || undefined,
        zonaOutdoorId: borrador.zonaOutdoorId ?? undefined,
        proyectosIds: borrador.proyectosIds,
        esBorrador: false,
        createdAt: hoyDateTimeISO(),
        updatedAt: hoyDateTimeISO(),
      });
      for (let i = 0; i < borrador.vias.length; i++) {
        const v = borrador.vias[i];
        await db.vias.add({
          sessionId,
          nombre: v.nombre || undefined,
          grado: v.grado,
          resultado: v.resultado,
          intentos: v.intentos,
          fotoBase64: v.fotoBase64,
          notas: v.notas,
          orden: i,
        });
      }
      if (borrador.estiramientoCompletado && borrador.estiramientoRutinaId) {
        await db.estiramientosSesion.add({
          rutinaId: borrador.estiramientoRutinaId,
          fecha: borrador.fecha,
          tipo: "post",
          ejerciciosCompletados: 0,
          ejerciciosTotal: 0,
          duracionTotalSeg: 0,
          completado: true,
        });
      }
      resetear();
      navigate("/");
    } finally {
      setGuardando(false);
    }
  }

  function descartar() {
    resetear();
    setConfirmCancel(false);
    navigate("/");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={anterior}
          disabled={paso === 0}
          className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30"
          aria-label="Paso anterior"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">Nueva sesión</h1>
        <button
          onClick={() => setConfirmCancel(true)}
          className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
          aria-label="Cancelar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <BarraProgresoPasos paso={paso} total={5} etiquetas={ETIQUETAS} />

      <div className="pb-4">
        {paso === 0 && <Paso1Modalidad />}
        {paso === 1 && <Paso2Vias />}
        {paso === 2 && <Paso3Sensacion />}
        {paso === 3 && <Paso5Estiramientos />}
        {paso === 4 && <Paso6Resumen />}
      </div>

      <div className="fixed bottom-16 inset-x-0 px-4 pb-3 pt-3 bg-gradient-to-t from-crux-beige via-crux-beige to-transparent dark:from-stone-900 dark:via-stone-900 z-30">
        <div className="max-w-2xl mx-auto flex gap-2">
          {paso > 0 && (
            <Button variante="ghost" onClick={anterior} bloque>
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </Button>
          )}
          {paso < 4 ? (
            <Button onClick={siguiente} bloque disabled={!puedeAvanzar}>
              Siguiente
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={guardar} bloque disabled={guardando}>
              <Check className="w-4 h-4" />
              {guardando ? "Guardando..." : "Guardar sesión"}
            </Button>
          )}

        </div>
        <p className="text-center text-[10px] text-stone-500 mt-1">
          Borrador guardado automáticamente
        </p>
      </div>

      <Modal
        abierto={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        titulo="¿Descartar borrador?"
      >
        <p className="text-stone-600 dark:text-stone-300 mb-4">
          Perderás los datos introducidos en esta sesión.
        </p>
        <div className="flex gap-2">
          <Button variante="ghost" onClick={() => setConfirmCancel(false)} bloque>
            Volver
          </Button>
          <Button variante="danger" onClick={descartar} bloque>
            Descartar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
