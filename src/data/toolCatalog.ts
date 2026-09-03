import type { CatalogTool, SearchableTool, ToolArea } from "../types/tool";
import { architectureDesignTools } from "./architectureDesignTools";
import { developerTools } from "./developerTools";
import { platformTools } from "./platformTools";

interface ToolGroup {
  area: ToolArea;
  tools: CatalogTool[];
}

const toolGroups: ToolGroup[] = [
  { area: "Developer Productivity", tools: developerTools },
  { area: "Platform Engineering", tools: platformTools },
  { area: "Architecture & Design", tools: architectureDesignTools },
];

function hasAvailableRoute(
  tool: CatalogTool,
): tool is CatalogTool & { path: string } {
  return tool.status === "available" && typeof tool.path === "string";
}

export const searchableTools: SearchableTool[] = toolGroups.flatMap(
  ({ area, tools }) =>
    tools.filter(hasAvailableRoute).map((tool) => ({
      id: tool.id,
      name: tool.title,
      route: tool.path,
      area,
      category: tool.category,
      description: tool.description,
      keywords: tool.keywords,
    })),
);

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function searchTools(query: string): SearchableTool[] {
  const terms = normalizeSearchValue(query).split(" ").filter(Boolean);

  if (terms.length === 0) {
    return [];
  }

  return searchableTools.filter((tool) => {
    const searchableText = normalizeSearchValue(
      [
        tool.name,
        tool.area,
        tool.category,
        tool.description,
        ...tool.keywords,
      ].join(" "),
    );

    return terms.every((term) => searchableText.includes(term));
  });
}
