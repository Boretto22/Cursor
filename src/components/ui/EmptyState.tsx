import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icono: LucideIcon;
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

export function EmptyState({ icono: Icono, titulo, descripcion, accion }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="w-16 h-16 rounded-2xl bg-crux-beige dark:bg-stone-700 flex items-center justify-center mb-4">
        <Icono className="w-8 h-8 text-crux-primary" />
      </div>
      <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-1">
        {titulo}
      </h3>
      {descripcion && (
        <p className="text-sm text-stone-500 dark:text-stone-400 max-w-xs mb-4">
          {descripcion}
        </p>
      )}
      {accion}
    </div>
  );
}
