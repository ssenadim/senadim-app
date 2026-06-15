import { Button, DarkThemeToggle } from "flowbite-react";
import { Link } from "react-router-dom";
import { routePaths } from "../../utils/routes";

interface TopNavigationProps {
  onOpenSidebar: () => void;
}

export function TopNavigation({ onOpenSidebar }: TopNavigationProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={onOpenSidebar}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white lg:hidden"
          >
            <svg
              className="size-6"
              aria-hidden="true"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
                d="M4 7h16M4 12h16M4 17h16"
              />
            </svg>
          </button>
          <div>
            <p className="text-sm font-semibold text-gray-950 dark:text-white">
              Senadim Toolbox
            </p>
            <p className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">
              Practical developer utilities and architecture notes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button as={Link} to={routePaths.developerTools} color="light" size="sm">
            Explore tools
          </Button>
          <DarkThemeToggle />
        </div>
      </div>
    </header>
  );
}
