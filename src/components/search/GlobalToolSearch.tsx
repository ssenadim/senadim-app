import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { searchTools } from "../../data/toolCatalog";

export function GlobalToolSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelId = useId();
  const inputId = useId();
  const statusId = useId();
  const results = searchTools(query);
  const hasQuery = query.trim().length > 0;

  function closeSearch(returnFocus = false) {
    setIsOpen(false);
    setQuery("");

    if (returnFocus) {
      triggerRef.current?.focus();
    }
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    inputRef.current?.focus();

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeSearch();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape" && isOpen) {
          event.preventDefault();
          closeSearch(true);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label="Search tools"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => (isOpen ? closeSearch() : setIsOpen(true))}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 hover:text-gray-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 sm:px-3 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white dark:focus-visible:outline-cyan-400"
      >
        <svg
          aria-hidden="true"
          className="size-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
        <span className="hidden md:inline">Search tools...</span>
      </button>

      {isOpen ? (
        <section
          id={panelId}
          aria-label="Tool search"
          className="fixed top-[4.5rem] right-3 left-3 z-50 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl sm:absolute sm:top-[calc(100%+0.75rem)] sm:right-0 sm:left-auto sm:w-96 dark:border-gray-700 dark:bg-gray-900"
        >
          <div className="border-b border-gray-200 p-3 dark:border-gray-700">
            <label htmlFor={inputId} className="sr-only">
              Search Freeshot tools
            </label>
            <div className="relative">
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </svg>
              <input
                ref={inputRef}
                id={inputId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tools..."
                autoComplete="off"
                spellCheck={false}
                aria-describedby={statusId}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pr-3 pl-9 text-sm text-gray-950 placeholder:text-gray-500 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20"
              />
            </div>
          </div>

          <p id={statusId} className="sr-only" aria-live="polite">
            {!hasQuery
              ? "Search across Freeshot tools."
              : results.length === 0
                ? "No tools found."
                : `${results.length} ${results.length === 1 ? "tool" : "tools"} found.`}
          </p>

          {!hasQuery ? (
            <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Search across Freeshot tools.
            </p>
          ) : results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              No tools found.
            </p>
          ) : (
            <ul className="max-h-[min(24rem,calc(100vh-9rem))] overflow-y-auto p-2">
              {results.map((tool) => (
                <li key={tool.id}>
                  <Link
                    to={tool.route}
                    onClick={() => closeSearch()}
                    className="block min-w-0 rounded-lg px-3 py-3 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-cyan-600 dark:hover:bg-gray-800 dark:focus-visible:outline-cyan-400"
                  >
                    <span className="block text-sm font-semibold break-words text-gray-950 dark:text-white">
                      {tool.name}
                    </span>
                    <span className="mt-1 block text-xs font-medium text-cyan-700 dark:text-cyan-300">
                      {tool.area} · {tool.category}
                    </span>
                    <span className="mt-1 block text-xs leading-5 break-words text-gray-600 dark:text-gray-300">
                      {tool.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
