import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

interface ModalProps {
  abierto: boolean;
  onClose: () => void;
  titulo?: string;
  children: ReactNode;
  ancho?: "sm" | "md" | "lg";
}

const anchos = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function Modal({ abierto, onClose, titulo, children, ancho = "md" }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (abierto) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handler);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [abierto, onClose]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={cn(
          "relative w-full bg-white dark:bg-stone-800 rounded-t-2xl sm:rounded-2xl shadow-soft-lg animate-slide-up max-h-[90vh] flex flex-col",
          anchos[ancho]
        )}
      >
        {titulo !== undefined && (
          <div className="flex items-center justify-between p-4 border-b border-stone-100 dark:border-stone-700">
            <h2 className="text-lg font-semibold">{titulo}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto p-4 flex-1">{children}</div>
      </div>
    </div>
  );
}
