import { navigationItems } from "../../data/navigation";
import { NavigationLink } from "./NavigationLink";

interface SidebarNavigationProps {
  onNavigate?: () => void;
}

export function SidebarNavigation({ onNavigate }: SidebarNavigationProps) {
  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-1">
      {navigationItems.map((item) => (
        <NavigationLink key={item.path} item={item} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}
