import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { availableToolIds } from "../data/toolCatalog";
import {
  loadFavorites,
  storeFavorites,
  toggleFavoriteId,
} from "../utils/favorites";
import {
  FavoritesContext,
  type FavoritesContextValue,
} from "./favoritesContext";

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() =>
    loadFavorites(getBrowserStorage(), availableToolIds),
  );

  useEffect(() => {
    storeFavorites(getBrowserStorage(), favoriteIds, availableToolIds);
  }, [favoriteIds]);

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const isFavorite = useCallback(
    (toolId: string) => favoriteIdSet.has(toolId),
    [favoriteIdSet],
  );

  const addFavorite = useCallback((toolId: string) => {
    if (!availableToolIds.has(toolId)) {
      return;
    }

    setFavoriteIds((currentIds) =>
      currentIds.includes(toolId) ? currentIds : [...currentIds, toolId],
    );
  }, []);

  const removeFavorite = useCallback((toolId: string) => {
    setFavoriteIds((currentIds) =>
      currentIds.includes(toolId)
        ? currentIds.filter((favoriteId) => favoriteId !== toolId)
        : currentIds,
    );
  }, []);

  const toggleFavorite = useCallback((toolId: string) => {
    if (!availableToolIds.has(toolId)) {
      return;
    }

    setFavoriteIds((currentIds) => toggleFavoriteId(currentIds, toolId));
  }, []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteIds,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
    }),
    [addFavorite, favoriteIds, isFavorite, removeFavorite, toggleFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}
