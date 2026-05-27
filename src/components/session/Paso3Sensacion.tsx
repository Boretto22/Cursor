import { useSessionStore } from "../../store/sessionStore";
import { Slider } from "../ui/Slider";
import { Card } from "../ui/Card";

export function Paso3Sensacion() {
  const borrador = useSessionStore((s) => s.borrador);
  const actualizar = useSessionStore((s) => s.actualizar);
  if (!borrador) return null;

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold mb-1">¿Cómo te has sentido?</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Evalúa tu sesión del 1 al 10
        </p>
      </div>

      <Card className="space-y-6">
        <Slider
          label="Sensación general"
          valor={borrador.sensacion}
          onChange={(v) => actualizar({ sensacion: v })}
          emojiInicio="😣"
          emojiFin="🤩"
        />
        <p className="text-xs text-stone-500 -mt-3 px-1">
          {borrador.sensacion <= 3 && "Día regular, no pasa nada."}
          {borrador.sensacion > 3 && borrador.sensacion <= 6 && "Sensaciones intermedias."}
          {borrador.sensacion > 6 && borrador.sensacion <= 8 && "Bien, has rendido."}
          {borrador.sensacion > 8 && "Día top, a saco."}
        </p>

        <Slider
          label="Fatiga acumulada"
          valor={borrador.fatiga}
          onChange={(v) => actualizar({ fatiga: v })}
          emojiInicio="💤"
          emojiFin="🔥"
        />
        <p className="text-xs text-stone-500 -mt-3 px-1">
          {borrador.fatiga <= 3 && "Fresco, podrías seguir."}
          {borrador.fatiga > 3 && borrador.fatiga <= 6 && "Cansancio normal."}
          {borrador.fatiga > 6 && borrador.fatiga <= 8 && "Quemado, descanso necesario."}
          {borrador.fatiga > 8 && "Reventado, prioriza descanso."}
        </p>
      </Card>
    </div>
  );
}
