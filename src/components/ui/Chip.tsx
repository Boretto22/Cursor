import { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface ChipProps {
  activo?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

export function Chip({ activo, onClick, children, className }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "chip transition-all active:scale-95",
        activo && "chip-active",
        className
      )}
    >
      {children}
    </button>
  );
}
