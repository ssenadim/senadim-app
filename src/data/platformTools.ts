import type { DeveloperTool } from "../types/tool";
import { routePaths } from "../utils/routes";

export const platformTools: DeveloperTool[] = [
  {
    title: "OpenShift Calculator Suite",
    description:
      "Capacity, resource, autoscaling, memory, and storage sizing for OpenShift workloads.",
    category: "OpenShift",
    path: routePaths.containerPlatformCalculator,
    status: "available",
  },
  {
    title: "JVM Memory Calculator",
    description:
      "Size heap, metaspace, native memory, and safety buffer for JVM application containers.",
    category: "JVM",
    path: routePaths.jvmMemoryCalculator,
    status: "available",
  },
  {
    title: "Event Bus Calculator",
    description:
      "Plan event bus capacity, partitions, throughput, and retention.",
    category: "Messaging",
    status: "coming-soon",
  },
];
