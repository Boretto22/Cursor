import { useNavigate } from "react-router-dom";
import { Check, ExternalLink } from "lucide-react";
import { useSessionStore } from "../../store/sessionStore";
import { rutinasPorTipo } from "../../data/estiramientos";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

export function Paso5Estiramientos() {
  const borrador = useSessionStore((s) => s.borrador);
  const actualizar = useSessionStore((s) => s.actualizar);
  const navigate = useNavigate();
  if (!borrador) return null;

  const rutinas = [...rutinasPorTipo("post"), ...rutinasPorTipo("recuperacion")];

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold mb-1">Estiramientos</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Indica si has hecho una rutina post-sesión
        </p>
      </div>

      <Card>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={borrador.estiramientoCompletado}
            onChange={(e) =>
              actualizar({ estiramientoCompletado: e.target.checked })
            }
            className="w-5 h-5 accent-crux-primary"
          />
          <span className="font-medium">He hecho estiramientos</span>
        </label>
      </Card>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wide px-1">
          Rutinas disponibles
        </p>
        {rutinas.map((r) => (
          <Card key={r.id} className="!py-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{r.nombre}</p>
                <p className="text-xs text-stone-500">
                  {r.ejercicios.length} ejercicios ·{" "}
                  {Math.round(
                    r.ejercicios.reduce((a, e) => a + e.duracionSeg, 0) / 60
                  )}{" "}
                  min ·{" "}
                  <span className="capitalize">{r.tipo}</span>
                </p>
              </div>
              {borrador.estiramientoRutinaId === r.id ? (
                <span className="text-crux-primary">
                  <Check className="w-5 h-5" />
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => actualizar({ estiramientoRutinaId: r.id })}
                  className="text-sm font-medium text-crux-primary"
                >
                  Marcar
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Button
        bloque
        variante="secondary"
        onClick={() => navigate("/estiramientos")}
        type="button"
      >
        <ExternalLink className="w-4 h-4" />
        Ir a estiramientos
      </Button>
    </div>
  );
}
