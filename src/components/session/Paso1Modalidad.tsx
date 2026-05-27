import { useSessionStore } from "../../store/sessionStore";
import { MODALIDADES } from "../../data/zonasCorporales";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import type { Modalidad } from "../../db/types";

export function Paso1Modalidad() {
  const borrador = useSessionStore((s) => s.borrador);
  const actualizar = useSessionStore((s) => s.actualizar);
  if (!borrador) return null;

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold mb-1">¿Qué tipo de sesión?</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Selecciona la modalidad para empezar
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {MODALIDADES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => actualizar({ modalidad: m.id as Modalidad })}
            className={`card flex flex-col items-start text-left transition-all active:scale-95 ${
              borrador.modalidad === m.id
                ? "!bg-crux-primary !text-white shadow-soft-lg"
                : ""
            }`}
          >
            <span className="text-3xl mb-2">{m.emoji}</span>
            <span className="font-semibold">{m.nombre}</span>
            <span
              className={`text-xs mt-0.5 ${
                borrador.modalidad === m.id
                  ? "text-white/80"
                  : "text-stone-500 dark:text-stone-400"
              }`}
            >
              {m.descripcion}
            </span>
          </button>
        ))}
      </div>

      <Card>
        <Input
          label="Lugar (opcional)"
          placeholder="Ej: Sharma Climbing, Margalef..."
          value={borrador.nombreLugar}
          onChange={(e) => actualizar({ nombreLugar: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Input
            label="Duración (min)"
            type="number"
            inputMode="numeric"
            placeholder="90"
            value={borrador.duracionMin ?? ""}
            onChange={(e) =>
              actualizar({
                duracionMin: e.target.value ? Number(e.target.value) : null,
              })
            }
          />
          <Input
            label="Fecha"
            type="datetime-local"
            value={borrador.fecha.slice(0, 16)}
            onChange={(e) => actualizar({ fecha: new Date(e.target.value).toISOString() })}
          />
        </div>
      </Card>
    </div>
  );
}
