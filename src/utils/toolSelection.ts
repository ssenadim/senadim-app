export function selectToolsByIds<Tool extends { id: string }>(
  tools: readonly Tool[],
  toolIds: readonly string[],
): Tool[] {
  const toolById = new Map(tools.map((tool) => [tool.id, tool]));
  const selectedIds = new Set<string>();

  return toolIds.flatMap((toolId) => {
    const tool = toolById.get(toolId);
    if (!tool || selectedIds.has(toolId)) {
      return [];
    }

    selectedIds.add(toolId);
    return [tool];
  });
}
