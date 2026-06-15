import { NavLink } from "react-router-dom";
import type { NavigationItem } from "../../types/navigation";

interface NavigationLinkProps {
  item: NavigationItem;
  onNavigate?: () => void;
}

export function NavigationLink({ item, onNavigate }: NavigationLinkProps) {
  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          "block rounded-lg px-3 py-2 text-sm font-medium transition",
          isActive
            ? "bg-cyan-50 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
        ].join(" ")
      }
    >
      {item.label}
    </NavLink>
  );
}
