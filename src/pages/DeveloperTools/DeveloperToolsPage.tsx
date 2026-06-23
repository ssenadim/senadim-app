import { ToolCard } from "../../components/cards/ToolCard";
import { PageShell } from "../../components/common/PageShell";
import { developerTools } from "../../data/developerTools";
import { usePageTitle } from "../../hooks/usePageTitle";

export function DeveloperToolsPage() {
  usePageTitle("Developer Tools");

  return (
    <PageShell
      eyebrow="Tool catalog"
      title="Developer Tools"
      description="A curated set of practical utilities planned for Freeshot. These cards define the product surface before implementation begins."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {developerTools.map((tool) => (
          <ToolCard key={tool.title} tool={tool} />
        ))}
      </div>
    </PageShell>
  );
}
