import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { availableToolIds, searchableTools } from "../data/toolCatalog";
import {
  loadRecentTools,
  markRecentToolUsed,
  resolveRecentTools,
  storeRecentTools,
  type RecentToolEntry,
} from "../utils/recentTools";
import {
  RecentToolsContext,
  type RecentToolsContextValue,
} from "./recentToolsContext";

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

export function RecentToolsProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<RecentToolEntry[]>(() =>
    loadRecentTools(getBrowserStorage(), availableToolIds),
  );

  useEffect(() => {
    storeRecentTools(getBrowserStorage(), entries, availableToolIds);
  }, [entries]);

  const markToolUsed = useCallback((toolId: string) => {
    if (!availableToolIds.has(toolId)) {
      return;
    }

    setEntries((currentEntries) =>
      markRecentToolUsed(currentEntries, toolId, Date.now(), availableToolIds),
    );
  }, []);

  const clearRecentTools = useCallback(() => {
    setEntries([]);
  }, []);

  const recentTools = useMemo(
    () => resolveRecentTools(entries, searchableTools),
    [entries],
  );

  const value = useMemo<RecentToolsContextValue>(
    () => ({
      recentToolIds: entries.map((entry) => entry.toolId),
      recentTools,
      markToolUsed,
      clearRecentTools,
    }),
    [clearRecentTools, entries, markToolUsed, recentTools],
  );

  return (
    <RecentToolsContext.Provider value={value}>
      {children}
    </RecentToolsContext.Provider>
  );
}
