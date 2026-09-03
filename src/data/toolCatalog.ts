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

export const availableToolIds: ReadonlySet<string> = new Set(
  searchableTools.map((tool) => tool.id),
);

export function normalizeSearchValue(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function getSearchTerms(query: string): string[] {
  return normalizeSearchValue(query).split(" ").filter(Boolean);
}

function containsEveryTerm(value: string, terms: string[]) {
  const normalizedValue = normalizeSearchValue(value);
  return terms.every((term) => normalizedValue.includes(term));
}

function getMatchRank(
  tool: SearchableTool,
  normalizedQuery: string,
  terms: string[],
): number | null {
  const normalizedName = normalizeSearchValue(tool.name);
  const keywordText = tool.keywords.join(" ");
  const categoryText = `${tool.area} ${tool.category}`;
  const searchableText = [
    tool.name,
    categoryText,
    tool.description,
    keywordText,
  ].join(" ");

  if (!containsEveryTerm(searchableText, terms)) {
    return null;
  }

  if (normalizedName === normalizedQuery) {
    return 0;
  }

  if (normalizedName.startsWith(normalizedQuery)) {
    return 1;
  }

  if (normalizedName.includes(normalizedQuery)) {
    return 2;
  }

  if (containsEveryTerm(keywordText, terms)) {
    return 3;
  }

  if (containsEveryTerm(categoryText, terms)) {
    return 4;
  }

  if (containsEveryTerm(tool.description, terms)) {
    return 5;
  }

  return 6;
}

export function searchToolCollection(
  tools: SearchableTool[],
  query: string,
): SearchableTool[] {
  const normalizedQuery = normalizeSearchValue(query);
  const terms = getSearchTerms(query);

  if (terms.length === 0) {
    return [];
  }

  return tools
    .map((tool, index) => ({
      index,
      rank: getMatchRank(tool, normalizedQuery, terms),
      tool,
    }))
    .filter(
      (match): match is typeof match & { rank: number } => match.rank !== null,
    )
    .sort(
      (firstMatch, secondMatch) =>
        firstMatch.rank - secondMatch.rank ||
        firstMatch.index - secondMatch.index,
    )
    .map((match) => match.tool);
}

export function searchTools(query: string): SearchableTool[] {
  return searchToolCollection(searchableTools, query);
}
