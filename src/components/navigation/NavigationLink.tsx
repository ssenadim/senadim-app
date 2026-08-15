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
          "block rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 dark:focus-visible:outline-cyan-400",
          isActive
            ? "bg-cyan-50 text-cyan-800 ring-1 ring-cyan-300 ring-inset dark:bg-cyan-950 dark:text-cyan-200 dark:ring-cyan-800"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
        ].join(" ")
      }
    >
      {item.label}
    </NavLink>
  );
}
