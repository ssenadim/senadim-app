import { ToolCard } from "../../components/cards/ToolCard";
import { PageShell } from "../../components/common/PageShell";
import { developerTools } from "../../data/developerTools";
import { usePageTitle } from "../../hooks/usePageTitle";

export function DeveloperToolsPage() {
  usePageTitle("Developer Productivity Tools");

  return (
    <PageShell
      eyebrow="Tool catalog"
      title="Developer Productivity"
      description="Developer tools for formatting and comparing data, inspecting tokens, testing patterns, encoding values, and debugging everyday integration workflows."
    >
      <section aria-labelledby="developer-tools-catalog">
        <h2 id="developer-tools-catalog" className="sr-only">
          Available developer productivity tools
        </h2>
        <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
          {developerTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
