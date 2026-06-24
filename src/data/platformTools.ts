import type { DeveloperTool } from "../types/tool";
import { routePaths } from "../utils/routes";

export const platformTools: DeveloperTool[] = [
  {
    title: "OpenShift Calculator Suite",
    description: "Sizing and capacity planning tools for OpenShift workloads.",
    category: "OpenShift",
    path: routePaths.openShiftCalculator,
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
    title: "Kafka Calculator",
    description: "Plan Kafka capacity, partitions, throughput, and retention.",
    category: "Streaming",
    status: "coming-soon",
  },
];
