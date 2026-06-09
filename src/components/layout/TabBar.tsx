import { NavLink } from "react-router-dom";
import { Home, PlusCircle, BarChart3, Timer, User } from "lucide-react";
import { cn } from "../../utils/cn";

const tabs = [
  { to: "/", label: "Inicio", icon: Home, end: true },
  { to: "/sesion", label: "Sesión", icon: PlusCircle },
  { to: "/progreso", label: "Progreso", icon: BarChart3 },
  { to: "/temporizador", label: "Temporizador", icon: Timer },
  { to: "/perfil", label: "Perfil", icon: User },
];

export function TabBar() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur border-t border-stone-100 dark:border-stone-800 safe-bottom"
      aria-label="Navegación principal"
    >
      <ul className="flex items-stretch justify-around max-w-2xl mx-auto px-2 py-1">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-medium transition-colors",
                  isActive
                    ? "text-crux-primary"
                    : "text-stone-500 dark:text-stone-400 hover:text-crux-primary-dark"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      isActive && "stroke-[2.5]"
                    )}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
