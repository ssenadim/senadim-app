export const maximumQuickAccessTools = 6;

export type QuickAccessSource = "favorite" | "recent" | "default";

export interface QuickAccessItem<Tool> {
  tool: Tool;
  source: QuickAccessSource;
}

interface QuickAccessOptions<Tool> {
  tools: readonly Tool[];
  favoriteIds: readonly string[];
  recentToolIds: readonly string[];
  defaultToolIds: readonly string[];
  limit?: number;
}

export function buildQuickAccessItems<Tool extends { id: string }>({
  tools,
  favoriteIds,
  recentToolIds,
  defaultToolIds,
  limit = maximumQuickAccessTools,
}: QuickAccessOptions<Tool>): QuickAccessItem<Tool>[] {
  const normalizedLimit = Math.max(0, limit);
  const toolById = new Map(tools.map((tool) => [tool.id, tool]));
  const selectedIds = new Set<string>();
  const selectedItems: QuickAccessItem<Tool>[] = [];

  function appendTools(toolIds: readonly string[], source: QuickAccessSource) {
    for (const toolId of toolIds) {
      if (selectedItems.length >= normalizedLimit) {
        return;
      }

      const tool = toolById.get(toolId);
      if (!tool || selectedIds.has(tool.id)) {
        continue;
      }

      selectedIds.add(tool.id);
      selectedItems.push({ tool, source });
    }
  }

  appendTools(favoriteIds, "favorite");
  appendTools(recentToolIds, "recent");
  appendTools(defaultToolIds, "default");

  return selectedItems;
}

export function buildQuickAccessTools<Tool extends { id: string }>(
  options: QuickAccessOptions<Tool>,
): Tool[] {
  return buildQuickAccessItems(options).map((item) => item.tool);
}
