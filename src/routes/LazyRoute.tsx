import { Suspense, type ComponentType, type LazyExoticComponent } from "react";

export function LazyRoute({
  page: Page,
}: {
  page: LazyExoticComponent<ComponentType>;
}) {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <Page />
    </Suspense>
  );
}

function RouteLoadingState() {
  return (
    <div
      role="status"
      className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-8 text-sm font-medium text-gray-600 sm:px-6 lg:px-8 dark:text-gray-300"
    >
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-cyan-600 dark:border-gray-700 dark:border-t-cyan-400"
      />
      Loading page…
    </div>
  );
}
