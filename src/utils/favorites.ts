export const favoritesStorageKey = "freeshot:favorites";

type FavoritesStorage = Pick<Storage, "getItem" | "setItem">;

export function normalizeFavoriteIds(
  value: unknown,
  availableToolIds: ReadonlySet<string>,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value.filter(
        (toolId): toolId is string =>
          typeof toolId === "string" && availableToolIds.has(toolId),
      ),
    ),
  ];
}

export function loadFavorites(
  storage: FavoritesStorage | null,
  availableToolIds: ReadonlySet<string>,
): string[] {
  if (!storage) {
    return [];
  }

  try {
    const storedValue = storage.getItem(favoritesStorageKey);
    return storedValue
      ? normalizeFavoriteIds(JSON.parse(storedValue), availableToolIds)
      : [];
  } catch {
    return [];
  }
}

export function storeFavorites(
  storage: FavoritesStorage | null,
  favoriteIds: readonly string[],
  availableToolIds: ReadonlySet<string>,
) {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(
      favoritesStorageKey,
      JSON.stringify(normalizeFavoriteIds(favoriteIds, availableToolIds)),
    );
  } catch {
    // Favorites remain usable for this session if browser storage is unavailable.
  }
}

export function toggleFavoriteId(
  favoriteIds: readonly string[],
  toolId: string,
): string[] {
  return favoriteIds.includes(toolId)
    ? favoriteIds.filter((favoriteId) => favoriteId !== toolId)
    : [...favoriteIds, toolId];
}
