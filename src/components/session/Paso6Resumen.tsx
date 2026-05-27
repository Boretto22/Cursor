import { useSessionStore } from "../../store/sessionStore";
import { Textarea } from "../ui/Input";
import { Card } from "../ui/Card";
import { MODALIDADES } from "../../data/zonasCorporales";
import { TECNICAS } from "../../data/tecnicas";

export function Paso6Resumen() {
  const borrador = useSessionStore((s) => s.borrador);
  const actualizar = useSessionStore((s) => s.actualizar);
  if (!borrador) return null;

  const mod = MODALIDADES.find((m) => m.id === borrador.modalidad);
  const flashCount = borrador.vias.filter((v) => v.resultado === "flash").length;
  const redpointCount = borrador.vias.filter((v) => v.resultado === "redpoint").length;

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold mb-1">Casi listo</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Añade notas finales y guarda la sesión
        </p>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{mod?.emoji}</span>
          <div>
            <p className="font-semibold">{mod?.nombre}</p>
            <p className="text-xs text-stone-500">
              {borrador.nombreLugar || "Sin lugar"} · {borrador.duracionMin ?? "—"} min
            </p>
          </div>
        </div>
        <hr className="border-stone-100 dark:border-stone-700" />
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-crux-primary">{borrador.vias.length}</p>
            <p className="text-xs text-stone-500">Vías</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{flashCount}</p>
            <p className="text-xs text-stone-500">A vista</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-600">{redpointCount}</p>
            <p className="text-xs text-stone-500">Encadenadas</p>
          </div>
        </div>
        <hr className="border-stone-100 dark:border-stone-700" />
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="text-xs text-stone-500">Sensación</p>
            <p className="font-bold">{borrador.sensacion}/10</p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Fatiga</p>
            <p className="font-bold">{borrador.fatiga}/10</p>
          </div>
        </div>
        {borrador.tecnicasTrabajadasIds.length > 0 && (
          <>
            <hr className="border-stone-100 dark:border-stone-700" />
            <div>
              <p className="text-xs text-stone-500 mb-1.5">Técnicas trabajadas</p>
              <div className="flex flex-wrap gap-1">
                {borrador.tecnicasTrabajadasIds.map((id) => {
                  const t = TECNICAS.find((x) => x.id === id);
                  return (
                    <span key={id} className="chip text-xs">
                      {t?.nombre}
                    </span>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </Card>

      <Textarea
        label="Notas de la sesión"
        placeholder="¿Algo que recordar? Lo que te ha funcionado, claves, ideas..."
        value={borrador.notas}
        onChange={(e) => actualizar({ notas: e.target.value })}
        rows={5}
      />
    </div>
  );
}
