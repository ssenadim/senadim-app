import { SidebarNavigation } from "../navigation/SidebarNavigation";
import { BrandMark } from "./BrandMark";

export function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-gray-200 bg-white px-4 py-5 lg:block dark:border-gray-800 dark:bg-gray-900">
      <div className="sticky top-5 flex h-[calc(100vh-2.5rem)] flex-col">
        <BrandMark />
        <div className="mt-8">
          <SidebarNavigation />
        </div>
        <div className="mt-auto rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm font-semibold text-gray-950 dark:text-white">
            Freeshot v1.0 Preview
          </p>
          <p className="mt-2 text-xs leading-5 text-gray-600 dark:text-gray-400">
            Developer productivity, platform engineering and architecture tools
            in one browser-based toolkit.
          </p>
        </div>
      </div>
    </aside>
  );
}
