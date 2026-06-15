import { ToolCard } from "../../components/cards/ToolCard";
import { PageShell } from "../../components/common/PageShell";
import { platformTools } from "../../data/platformTools";
import { usePageTitle } from "../../hooks/usePageTitle";

export function PlatformEngineeringPage() {
  usePageTitle("Platform Engineering");

  return (
    <PageShell
      eyebrow="Platform Engineering"
      title="Platform Engineering"
      description="Operational calculators and configuration generators for platform teams."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {platformTools.map((tool) => (
          <ToolCard key={tool.title} tool={tool} />
        ))}
      </div>
    </PageShell>
  );
}
