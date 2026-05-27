import { cn } from "../../utils/cn";

interface SliderProps {
  label?: string;
  valor: number;
  min?: number;
  max?: number;
  paso?: number;
  onChange: (v: number) => void;
  sufijo?: string;
  emojiInicio?: string;
  emojiFin?: string;
  className?: string;
}

export function Slider({
  label,
  valor,
  min = 1,
  max = 10,
  paso = 1,
  onChange,
  sufijo,
  emojiInicio,
  emojiFin,
  className,
}: SliderProps) {
  const porcentaje = ((valor - min) / (max - min)) * 100;
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="label !mb-0">{label}</span>
          <span className="text-lg font-bold text-crux-primary">
            {valor}
            {sufijo}
          </span>
        </div>
      )}
      <div className="flex items-center gap-3">
        {emojiInicio && <span className="text-xl">{emojiInicio}</span>}
        <div className="relative flex-1">
          <input
            type="range"
            min={min}
            max={max}
            step={paso}
            value={valor}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #4A7C59 0%, #4A7C59 ${porcentaje}%, #E5E5E5 ${porcentaje}%, #E5E5E5 100%)`,
            }}
          />
          <style>{`
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background: #4A7C59;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.15);
              cursor: pointer;
            }
            input[type="range"]::-moz-range-thumb {
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background: #4A7C59;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.15);
              cursor: pointer;
            }
          `}</style>
        </div>
        {emojiFin && <span className="text-xl">{emojiFin}</span>}
      </div>
    </div>
  );
}
