import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getSearchTerms,
  normalizeSearchValue,
  searchTools,
  searchableTools,
} from "../../data/toolCatalog";
import { useFavorites } from "../../hooks/useFavorites";
import {
  filterToolsByFavorites,
  getToolSearchEmptyState,
  type ToolSearchEmptyState,
} from "../../utils/favoriteSearch";
import { getAdjacentResultIndex } from "../../utils/searchNavigation";
import { FavoriteToggle } from "../common/FavoriteToggle";

const RESULT_LIMIT = 8;

const emptyStateMessages: Record<
  Exclude<ToolSearchEmptyState, null | "no-tools">,
  string
> = {
  "search-prompt": "Search by tool name, category or keyword.",
  "no-favorites": "No favorite tools yet.",
  "no-matching-favorites": "No favorite tools match your search.",
};

function HighlightedText({ text, query }: { text: string; query: string }) {
  const terms = [...new Set(getSearchTerms(query))].sort(
    (firstTerm, secondTerm) => secondTerm.length - firstTerm.length,
  );

  if (terms.length === 0) {
    return text;
  }

  const escapedTerms = terms.map((term) =>
    term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const matchExpression = new RegExp(`(${escapedTerms.join("|")})`, "gi");

  return text.split(matchExpression).map((part, index): ReactNode => {
    if (!terms.includes(part.toLowerCase())) {
      return part;
    }

    return (
      <mark
        key={`${part}-${index}`}
        className="rounded-sm bg-cyan-100 px-0.5 text-inherit dark:bg-cyan-900/60"
      >
        {part}
      </mark>
    );
  });
}

export function GlobalToolSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { favoriteIds } = useFavorites();
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const panelId = useId();
  const inputId = useId();
  const statusId = useId();
  const hasQuery = normalizeSearchValue(query).length > 0;
  const queryResults = hasQuery
    ? searchTools(query)
    : favoritesOnly
      ? searchableTools
      : [];
  const allResults = filterToolsByFavorites(
    queryResults,
    favoriteIds,
    favoritesOnly,
  );
  const results = allResults.slice(0, RESULT_LIMIT);
  const displayQuery = query.trim().replace(/\s+/g, " ");
  const activeResult = results[activeIndex];
  const emptyState = getToolSearchEmptyState({
    favoritesOnly,
    favoriteCount: favoriteIds.length,
    hasQuery,
    resultCount: allResults.length,
  });
  const emptyStateMessage =
    emptyState === "no-tools"
      ? `No tools found for ${displayQuery}.`
      : emptyState
        ? emptyStateMessages[emptyState]
        : null;

  function closeSearch(returnFocus = false) {
    setIsOpen(false);
    setQuery("");
    setFavoritesOnly(false);
    setActiveIndex(-1);

    if (returnFocus) {
      triggerRef.current?.focus();
    }
  }

  function moveActiveResult(direction: 1 | -1) {
    if (results.length === 0) {
      return;
    }

    const nextIndex = getAdjacentResultIndex(
      activeIndex,
      results.length,
      direction,
    );

    setActiveIndex(nextIndex);
    requestAnimationFrame(() => {
      resultRefs.current[nextIndex]?.scrollIntoView({ block: "nearest" });
    });
  }

  function selectActiveResult() {
    if (!activeResult) {
      return;
    }

    navigate(activeResult.route);
    closeSearch();
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
          return;
        }

        if (event.target !== inputRef.current) {
          return;
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();
          moveActiveResult(1);
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          moveActiveResult(-1);
        } else if (event.key === "Enter" && activeResult) {
          event.preventDefault();
          selectActiveResult();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label="Search tools"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => {
          if (isOpen) {
            closeSearch();
          } else {
            setActiveIndex(-1);
            setIsOpen(true);
          }
        }}
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
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(-1);
                }}
                onBlur={() => setActiveIndex(-1)}
                placeholder="Search tools..."
                autoComplete="off"
                spellCheck={false}
                aria-describedby={statusId}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pr-3 pl-9 text-sm text-gray-950 placeholder:text-gray-500 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20"
              />
            </div>
            <label className="mt-3 flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm font-medium text-gray-700 focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-cyan-600 hover:bg-gray-50 dark:text-gray-200 dark:focus-within:outline-cyan-400 dark:hover:bg-gray-800">
              <input
                type="checkbox"
                checked={favoritesOnly}
                onChange={(event) => {
                  setFavoritesOnly(event.target.checked);
                  setActiveIndex(-1);
                }}
                className="size-4 rounded border-gray-300 bg-gray-50 text-cyan-600 focus:ring-2 focus:ring-cyan-600/30 dark:border-gray-600 dark:bg-gray-800 dark:text-cyan-500 dark:focus:ring-cyan-400/30"
              />
              <span>Favorites only</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 tabular-nums dark:bg-gray-700 dark:text-gray-300">
                {favoriteIds.length}
              </span>
            </label>
          </div>

          <p id={statusId} className="sr-only" aria-live="polite">
            {emptyStateMessage
              ? emptyStateMessage
              : activeResult
                ? `${activeResult.name} active. ${allResults.length} ${allResults.length === 1 ? "tool" : "tools"} found.`
                : `${allResults.length} ${allResults.length === 1 ? "tool" : "tools"} found.`}
          </p>

          {emptyState === "search-prompt" ? (
            <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {emptyStateMessages[emptyState]}
            </p>
          ) : emptyState === "no-favorites" ||
            emptyState === "no-matching-favorites" ? (
            <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {emptyStateMessages[emptyState]}
            </p>
          ) : emptyState === "no-tools" ? (
            <p className="px-4 py-6 text-center text-sm break-words text-gray-500 dark:text-gray-400">
              No tools found for &ldquo;{displayQuery}&rdquo;.
            </p>
          ) : (
            <>
              <ul className="max-h-[min(24rem,calc(100vh-13rem))] overflow-y-auto p-2">
                {results.map((tool, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <li key={tool.id} className="relative min-w-0">
                      <Link
                        ref={(element) => {
                          resultRefs.current[index] = element;
                        }}
                        to={tool.route}
                        onClick={() => closeSearch()}
                        className={[
                          "relative block min-w-0 rounded-lg py-3 pr-20 pl-3 transition-colors ring-inset hover:bg-cyan-50 hover:ring-1 hover:ring-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-cyan-600 dark:hover:bg-cyan-950/40 dark:hover:ring-cyan-700 dark:focus-visible:outline-cyan-400",
                          isActive
                            ? "bg-cyan-50 ring-2 ring-cyan-500 dark:bg-cyan-950/40 dark:ring-cyan-400"
                            : "",
                        ].join(" ")}
                      >
                        {isActive ? (
                          <>
                            <span className="sr-only">Active result. </span>
                            <svg
                              aria-hidden="true"
                              className="absolute top-1/2 right-14 size-4 -translate-y-1/2 text-cyan-700 dark:text-cyan-300"
                              fill="none"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="m9 18 6-6-6-6"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                              />
                            </svg>
                          </>
                        ) : null}
                        <span className="block text-sm font-semibold break-words text-gray-950 dark:text-white">
                          <HighlightedText text={tool.name} query={query} />
                        </span>
                        <span className="mt-1 block text-xs font-medium text-cyan-700 dark:text-cyan-300">
                          <HighlightedText text={tool.area} query={query} /> ·{" "}
                          <HighlightedText text={tool.category} query={query} />
                        </span>
                        <span className="mt-1 line-clamp-2 block text-xs leading-5 break-words text-gray-600 dark:text-gray-300">
                          <HighlightedText
                            text={tool.description}
                            query={query}
                          />
                        </span>
                      </Link>
                      <div className="absolute top-2 right-2 z-10">
                        <FavoriteToggle toolId={tool.id} toolName={tool.name} />
                      </div>
                    </li>
                  );
                })}
              </ul>
              {allResults.length > RESULT_LIMIT ? (
                <p className="border-t border-gray-200 px-4 py-2 text-center text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  Showing the top {RESULT_LIMIT} of {allResults.length} tools.
                </p>
              ) : null}
            </>
          )}
        </section>
      ) : null}
    </div>
  );
}
