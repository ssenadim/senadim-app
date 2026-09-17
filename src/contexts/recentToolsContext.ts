import { createContext } from "react";
import type { SearchableTool } from "../types/tool";

export interface RecentToolsContextValue {
  recentToolIds: readonly string[];
  recentTools: readonly SearchableTool[];
  markToolUsed: (toolId: string) => void;
  clearRecentTools: () => void;
}

export const RecentToolsContext = createContext<RecentToolsContextValue | null>(
  null,
);
