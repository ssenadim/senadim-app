import type { DeveloperTool } from "../types/tool";
import { routePaths } from "../utils/routes";

export const architectureDesignTools: DeveloperTool[] = [
  {
    title: "PlantUML Viewer",
    description: "Render PlantUML diagrams instantly from source code.",
    category: "Diagramming",
    path: routePaths.plantUmlViewer,
    status: "available",
  },
  {
    title: "ADR Generator",
    description:
      "Create Architecture Decision Records using a structured template.",
    category: "Documentation",
    path: routePaths.adrGenerator,
    status: "available",
  },
];
