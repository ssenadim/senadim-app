export interface DeveloperTool {
  title: string;
  description: string;
  category: string;
  path?: string;
  status: "available" | "coming-soon";
}
