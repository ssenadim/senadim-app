import { ToolCard } from "../../components/cards/ToolCard";
import { PageShell } from "../../components/common/PageShell";
import { architectureDesignTools } from "../../data/architectureDesignTools";
import { usePageTitle } from "../../hooks/usePageTitle";

export function ArchitectureDesignPage() {
  usePageTitle("Architecture & Design");

  return (
    <PageShell
      eyebrow="Architecture & Design"
      title="Architecture & Design"
      description="Tools for software architecture, documentation and design decisions."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {architectureDesignTools.map((tool) => (
          <ToolCard key={tool.title} tool={tool} />
        ))}
      </div>
    </PageShell>
  );
}
