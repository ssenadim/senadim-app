export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-lg bg-cyan-700 text-sm font-bold text-white shadow-sm shadow-cyan-900/20 dark:bg-cyan-500 dark:text-gray-950">
        FS
      </div>
      <div>
        <p className="text-base font-bold text-gray-950 dark:text-white">
          Freeshot
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Developer Portal
        </p>
      </div>
    </div>
  );
}
