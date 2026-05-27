import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

export type Variante = "primary" | "secondary" | "ghost" | "danger";
export type Tamano = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamano?: Tamano;
  bloque?: boolean;
}

const variantes: Record<Variante, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

const tamanos: Record<Tamano, string> = {
  sm: "text-sm px-3 py-2",
  md: "text-base px-4 py-2.5",
  lg: "text-lg px-5 py-3",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variante = "primary", tamano = "md", bloque, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(variantes[variante], tamanos[tamano], bloque && "w-full", className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
