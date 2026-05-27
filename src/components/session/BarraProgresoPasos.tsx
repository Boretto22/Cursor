interface Props {
  paso: number;
  total: number;
  etiquetas?: string[];
}

export function BarraProgresoPasos({ paso, total, etiquetas }: Props) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
          Paso {paso + 1} de {total}
        </span>
        {etiquetas?.[paso] && (
          <span className="text-xs font-semibold text-crux-primary uppercase tracking-wide">
            {etiquetas[paso]}
          </span>
        )}
      </div>
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= paso ? "bg-crux-primary" : "bg-stone-200 dark:bg-stone-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
