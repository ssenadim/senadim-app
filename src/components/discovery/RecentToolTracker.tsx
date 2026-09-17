import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { searchableTools } from "../../data/toolCatalog";
import { useRecentTools } from "../../hooks/useRecentTools";
import { getToolIdForPath } from "../../utils/recentTools";

export function RecentToolTracker() {
  const location = useLocation();
  const { markToolUsed } = useRecentTools();
  const lastTrackedNavigationRef = useRef<string | null>(null);
  const toolId = getToolIdForPath(
    searchableTools,
    location.pathname,
    import.meta.env.BASE_URL,
  );

  useEffect(() => {
    if (!toolId) {
      lastTrackedNavigationRef.current = null;
      return;
    }

    const navigationKey = `${location.key}:${toolId}`;
    if (lastTrackedNavigationRef.current === navigationKey) {
      return;
    }

    lastTrackedNavigationRef.current = navigationKey;
    markToolUsed(toolId);
  }, [location.key, markToolUsed, toolId]);

  return null;
}
