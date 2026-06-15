import { SidebarNavigation } from "../navigation/SidebarNavigation";
import { BrandMark } from "./BrandMark";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close navigation"
        className="absolute inset-0 bg-gray-950/50"
        onClick={onClose}
      />
      <div className="relative flex h-full w-full max-w-80 flex-col border-r border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between gap-4">
          <BrandMark />
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <svg
              className="size-5"
              aria-hidden="true"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
                d="M6 6l12 12M18 6 6 18"
              />
            </svg>
          </button>
        </div>
        <div className="mt-8">
          <SidebarNavigation onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
}
