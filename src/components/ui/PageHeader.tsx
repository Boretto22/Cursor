import { ReactNode } from "react";

interface PageHeaderProps {
  titulo: string;
  subtitulo?: string;
  accion?: ReactNode;
}

export function PageHeader({ titulo, subtitulo, accion }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 truncate">
          {titulo}
        </h1>
        {subtitulo && (
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            {subtitulo}
          </p>
        )}
      </div>
      {accion && <div className="shrink-0">{accion}</div>}
    </div>
  );
}
