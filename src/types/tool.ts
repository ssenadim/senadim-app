export type ToolHighlight = "New" | "Popular" | "Recommended";

export interface DeveloperTool {
  title: string;
  description: string;
  category: string;
  path?: string;
  status: "available" | "coming-soon";
}

export interface CatalogTool extends DeveloperTool {
  id: string;
  keywords: string[];
}

export type ToolArea =
  | "Developer Productivity"
  | "Platform Engineering"
  | "Architecture & Design";

export interface SearchableTool {
  id: string;
  name: string;
  route: string;
  area: ToolArea;
  category: string;
  description: string;
  keywords: string[];
}
