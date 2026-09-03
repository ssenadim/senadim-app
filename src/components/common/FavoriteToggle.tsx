import { useFavorites } from "../../hooks/useFavorites";

interface FavoriteToggleProps {
  toolId: string;
  toolName: string;
}

export function FavoriteToggle({ toolId, toolName }: FavoriteToggleProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(toolId);
  const actionLabel = `${favorite ? "Remove" : "Add"} ${toolName} ${
    favorite ? "from" : "to"
  } favorites`;

  return (
    <button
      type="button"
      aria-label={actionLabel}
      aria-pressed={favorite}
      title={actionLabel}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(toolId);
      }}
      className={[
        "pointer-events-auto relative z-20 inline-flex size-10 shrink-0 items-center justify-center rounded-lg border bg-white shadow-xs transition",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 dark:focus-visible:outline-cyan-400",
        favorite
          ? "border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-600 dark:bg-gray-800 dark:text-amber-300 dark:hover:bg-amber-950/40"
          : "border-gray-300 text-gray-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-amber-600 dark:hover:bg-amber-950/40 dark:hover:text-amber-300",
      ].join(" ")}
    >
      <svg
        aria-hidden="true"
        className="size-5"
        fill={favorite ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="m12 3.75 2.47 5.005 5.523.803-3.996 3.895.943 5.5L12 16.355l-4.94 2.598.943-5.5-3.996-3.895 5.523-.803L12 3.75Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.75"
        />
      </svg>
    </button>
  );
}
