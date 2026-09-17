export type ToolSearchEmptyState =
  | "search-prompt"
  | "no-tools"
  | "no-favorites"
  | "no-matching-favorites"
  | null;

export function filterToolsByFavorites<Tool extends { id: string }>(
  tools: readonly Tool[],
  favoriteIds: readonly string[],
  favoritesOnly: boolean,
): Tool[] {
  if (!favoritesOnly) {
    return [...tools];
  }

  const favoriteIdSet = new Set(favoriteIds);
  return tools.filter((tool) => favoriteIdSet.has(tool.id));
}

export function getToolSearchEmptyState({
  favoritesOnly,
  favoriteCount,
  hasQuery,
  resultCount,
}: {
  favoritesOnly: boolean;
  favoriteCount: number;
  hasQuery: boolean;
  resultCount: number;
}): ToolSearchEmptyState {
  if (favoritesOnly) {
    if (favoriteCount === 0) {
      return "no-favorites";
    }

    return resultCount === 0 ? "no-matching-favorites" : null;
  }

  if (!hasQuery) {
    return "search-prompt";
  }

  return resultCount === 0 ? "no-tools" : null;
}
