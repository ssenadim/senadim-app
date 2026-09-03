import { createContext } from "react";

export interface FavoritesContextValue {
  favoriteIds: readonly string[];
  isFavorite: (toolId: string) => boolean;
  addFavorite: (toolId: string) => void;
  removeFavorite: (toolId: string) => void;
  toggleFavorite: (toolId: string) => void;
}

export const FavoritesContext = createContext<FavoritesContextValue | null>(
  null,
);
