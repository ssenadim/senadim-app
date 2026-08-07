import type { DeveloperTool } from "../types/tool";
import { routePaths } from "../utils/routes";

export const platformTools: DeveloperTool[] = [
  {
    title: "Container Platform Calculator Suite",
    description:
      "Sizing and capacity planning tools for container platform workloads.",
    category: "Container Platform",
    path: routePaths.containerPlatformCalculator,
    status: "available",
  },
  {
    title: "JVM Memory Calculator",
    description:
      "Calculate recommended JVM memory settings for containerized Java applications.",
    category: "Java",
    path: routePaths.jvmMemoryCalculator,
    status: "available",
  },
  {
    title: "Event Bus Calculator",
    description: "Plan event bus capacity, partitions, throughput, and retention.",
    category: "Messaging",
    status: "coming-soon",
  },
];
