import { ToolCard } from "../../components/cards/ToolCard";
import { PageShell } from "../../components/common/PageShell";
import { platformTools } from "../../data/platformTools";
import { usePageTitle } from "../../hooks/usePageTitle";

export function PlatformEngineeringPage() {
  usePageTitle("Platform Engineering Tools");
  const availableTools = platformTools.filter(
    (tool) => tool.status === "available",
  );
  const plannedTools = platformTools.filter(
    (tool) => tool.status === "coming-soon",
  );

  return (
    <PageShell
      eyebrow="Tool catalog"
      title="Platform Engineering"
      description="Plan workload capacity, container resources, autoscaling, persistent storage, and JVM memory with practical calculators for platform engineering workflows."
    >
      <section aria-labelledby="available-platform-tools">
        <h2 id="available-platform-tools" className="sr-only">
          Available tools
        </h2>
        <div className="grid items-stretch gap-4 md:grid-cols-2">
          {availableTools.map((tool) => (
            <ToolCard key={tool.title} tool={tool} />
          ))}
        </div>
      </section>
      {plannedTools.length > 0 ? (
        <section
          aria-labelledby="planned-platform-tools"
          className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60"
        >
          <h2
            id="planned-platform-tools"
            className="text-sm font-semibold text-gray-700 dark:text-gray-200"
          >
            Planned tools
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {plannedTools.map((tool) => tool.title).join(", ")} — coming soon.
          </p>
        </section>
      ) : null}
    </PageShell>
  );
}
