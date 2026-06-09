import { useMemo } from "react";
import { format, subDays, startOfWeek, addDays, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "../../utils/cn";

interface HeatmapProps {
  fechasConteo: Record<string, number>;
  meses?: number;
  className?: string;
  compact?: boolean;
}

function colorPorIntensidad(v: number): string {
  if (v === 0) return "bg-stone-100 dark:bg-stone-700";
  if (v === 1) return "bg-crux-primary/30";
  if (v === 2) return "bg-crux-primary/55";
  if (v === 3) return "bg-crux-primary/80";
  return "bg-crux-primary";
}

export function Heatmap({ fechasConteo, meses = 12, className, compact }: HeatmapProps) {
  const { semanas, etiquetasMes } = useMemo(() => {
    const dias = meses * 30;
    const hoy = new Date();
    const inicio = startOfWeek(subDays(hoy, dias), { weekStartsOn: 1 });

    const totalDias = Math.ceil((hoy.getTime() - inicio.getTime()) / 86400000) + 1;
    const totalSemanas = Math.ceil(totalDias / 7);

    const semanas: { fecha: string; conteo: number }[][] = [];
    for (let w = 0; w < totalSemanas; w++) {
      const semana: { fecha: string; conteo: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const fecha = addDays(inicio, w * 7 + d);
        if (fecha > hoy) continue;
        const key = format(fecha, "yyyy-MM-dd");
        semana.push({ fecha: key, conteo: fechasConteo[key] || 0 });
      }
      semanas.push(semana);
    }

    const etiquetasMes: { idx: number; label: string }[] = [];
    let ultimoMes = -1;
    semanas.forEach((sem, idx) => {
      if (!sem[0]) return;
      const m = new Date(sem[0].fecha).getMonth();
      if (m !== ultimoMes) {
        etiquetasMes.push({ idx, label: format(new Date(sem[0].fecha), "MMM", { locale: es }) });
        ultimoMes = m;
      }
    });

    return { semanas, etiquetasMes };
  }, [fechasConteo, meses]);

  const cellSize = compact ? "w-2.5 h-2.5" : "w-3 h-3";
  const gap = compact ? "gap-0.5" : "gap-1";

  return (
    <div className={cn("overflow-x-auto no-scrollbar", className)}>
      <div className="inline-flex flex-col min-w-full">
        {!compact && (
          <div className={cn("flex pl-6", gap)}>
            {semanas.map((_, i) => {
              const m = etiquetasMes.find((e) => e.idx === i);
              return (
                <div key={i} className={cn(cellSize, "text-[10px] text-stone-500 dark:text-stone-400 capitalize")}>
                  {m?.label}
                </div>
              );
            })}
          </div>
        )}
        <div className="flex gap-1">
          {!compact && (
            <div className={cn("flex flex-col justify-around text-[10px] text-stone-500 dark:text-stone-400 pr-1", gap)}>
              <span>L</span>
              <span>X</span>
              <span>V</span>
              <span>D</span>
            </div>
          )}
          <div className={cn("flex", gap)}>
            {semanas.map((sem, i) => (
              <div key={i} className={cn("flex flex-col", gap)}>
                {Array.from({ length: 7 }).map((_, di) => {
                  const dia = sem.find((d) => getDay(new Date(d.fecha) as Date) === ((di + 1) % 7));
                  if (!dia)
                    return (
                      <div
                        key={di}
                        className={cn(cellSize, "rounded-sm bg-transparent")}
                      />
                    );
                  return (
                    <div
                      key={di}
                      className={cn(
                        cellSize,
                        "rounded-sm",
                        colorPorIntensidad(dia.conteo)
                      )}
                      title={`${dia.fecha}: ${dia.conteo} sesión(es)`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
