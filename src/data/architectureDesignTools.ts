import type { CatalogTool } from "../types/tool";
import { routePaths } from "../utils/routes";

export const architectureDesignTools: CatalogTool[] = [
  {
    id: "plantuml-viewer",
    title: "PlantUML Viewer",
    description: "Render PlantUML diagrams instantly from source code.",
    category: "Diagramming",
    keywords: ["plantuml", "uml", "c4", "diagram"],
    path: routePaths.plantUmlViewer,
    status: "available",
  },
  {
    id: "mermaid-viewer",
    title: "Mermaid Viewer",
    description:
      "Create and preview Mermaid diagrams directly in your browser.",
    category: "Diagramming",
    keywords: ["mermaid", "diagram", "flowchart", "sequence"],
    path: routePaths.mermaidViewer,
    status: "available",
  },
  {
    id: "adr-generator",
    title: "ADR Generator",
    description:
      "Create Architecture Decision Records using a structured template.",
    category: "Documentation",
    keywords: ["adr", "architecture decision", "record", "template"],
    path: routePaths.adrGenerator,
    status: "available",
  },
  {
    id: "architecture-notes",
    title: "Architecture Notes",
    description:
      "Capture lightweight system context, integration details and open questions locally.",
    category: "Documentation",
    keywords: ["architecture", "notes", "context", "integration"],
    path: routePaths.architectureNotesTool,
    status: "available",
  },
  {
    id: "threat-modeling-helper",
    title: "Threat Modeling Helper",
    description:
      "Capture the project context needed to prepare a threat model.",
    category: "Security",
    keywords: ["threat", "stride", "security", "risk"],
    path: routePaths.threatModelingHelper,
    status: "available",
  },
];
