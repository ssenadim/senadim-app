import { useContext } from "react";
import { RecentToolsContext } from "../contexts/recentToolsContext";

export function useRecentTools() {
  const context = useContext(RecentToolsContext);

  if (!context) {
    throw new Error("useRecentTools must be used within RecentToolsProvider");
  }

  return context;
}
