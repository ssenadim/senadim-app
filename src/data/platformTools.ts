import type { CatalogTool } from "../types/tool";
import { routePaths } from "../utils/routes";

export const platformTools: CatalogTool[] = [
  {
    id: "openshift-calculator-suite",
    title: "OpenShift Calculator Suite",
    description:
      "Capacity, resource, autoscaling, memory, and storage sizing for OpenShift workloads.",
    category: "OpenShift",
    keywords: ["openshift", "pod", "hpa", "pvc", "capacity"],
    path: routePaths.containerPlatformCalculator,
    status: "available",
  },
  {
    id: "jvm-memory-calculator",
    title: "JVM Memory Calculator",
    description:
      "Size heap, metaspace, native memory, and safety buffer for JVM application containers.",
    category: "JVM",
    keywords: ["jvm", "heap", "metaspace", "memory"],
    path: routePaths.jvmMemoryCalculator,
    status: "available",
  },
  {
    id: "event-bus-calculator",
    title: "Event Bus Calculator",
    description:
      "Plan event bus capacity, partitions, throughput, and retention.",
    category: "Messaging",
    keywords: ["event bus", "partitions", "throughput", "retention"],
    status: "coming-soon",
  },
];
