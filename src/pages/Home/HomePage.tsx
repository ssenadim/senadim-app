import { Link } from "react-router-dom";
import { Button, Card } from "flowbite-react";
import { MetricCard } from "../../components/cards/MetricCard";
import { ToolCard } from "../../components/cards/ToolCard";
import { SectionHeader } from "../../components/common/SectionHeader";
import { architectureDesignTools } from "../../data/architectureDesignTools";
import { developerTools } from "../../data/developerTools";
import { platformTools } from "../../data/platformTools";
import { searchableTools } from "../../data/toolCatalog";
import { useFavorites } from "../../hooks/useFavorites";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useRecentTools } from "../../hooks/useRecentTools";
import type { CatalogTool, SearchableTool } from "../../types/tool";
import {
  buildQuickAccessItems,
  maximumQuickAccessTools,
} from "../../utils/quickAccess";
import { routePaths } from "../../utils/routes";
import { selectToolsByIds } from "../../utils/toolSelection";

const featuredDeveloperToolIds = [
  "jwt-decoder",
  "timestamp-converter",
  "data-compare",
  "regex-tester",
];

const defaultQuickAccessToolIds = [
  "jwt-decoder",
  "data-compare",
  "openshift-calculator-suite",
  "jvm-memory-calculator",
  "plantuml-viewer",
  "mermaid-viewer",
];

const architectureDiagrammingTools = selectToolsByIds(searchableTools, [
  "plantuml-viewer",
  "mermaid-viewer",
]);

const recentlyAddedTools = selectToolsByIds(searchableTools, [
  "openapi-viewer",
  "configuration-converter",
]);

const homeRecentToolLimit = 3;

export function HomePage() {
  usePageTitle("Home");
  const { favoriteIds } = useFavorites();
  const { recentToolIds, recentTools, clearRecentTools } = useRecentTools();

  const availableDeveloperTools = developerTools.filter(
    (tool) => tool.status === "available",
  );
  const availableArchitectureTools = architectureDesignTools.filter(
    (tool) => tool.status === "available",
  );
  const availablePlatformTools = platformTools.filter(
    (tool) => tool.status === "available",
  );
  const featuredDeveloperTools = developerTools.filter((tool) =>
    featuredDeveloperToolIds.includes(tool.id),
  );
  const quickAccessItems = buildQuickAccessItems({
    tools: searchableTools,
    favoriteIds,
    recentToolIds,
    defaultToolIds: defaultQuickAccessToolIds,
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8 dark:border-gray-800 dark:bg-gray-900">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold text-cyan-700 uppercase dark:text-cyan-300">
            Developer Productivity / Platform Engineering / Architecture &amp;
            Design
          </p>
          <h1 className="mt-4 text-4xl font-bold text-gray-950 sm:text-5xl dark:text-white">
            Freeshot
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-gray-600 dark:text-gray-300">
            Freeshot is an engineering toolkit for developer productivity,
            platform engineering, and architecture and design workflows.
          </p>
          <ul className="mt-6 grid max-w-4xl gap-2 text-sm text-gray-700 sm:grid-cols-2 lg:grid-cols-3 dark:text-gray-200">
            {[
              "Developer Productivity Utilities",
              "Container Platform Capacity Planning",
              "JVM Memory Sizing",
              "JWT & PKCE Tools",
              "Architecture Decision Records",
              "PlantUML & Mermaid Diagramming",
            ].map((capability) => (
              <li
                key={capability}
                className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-950"
              >
                {capability}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button as={Link} to={routePaths.developerTools} color="blue">
              Explore Developer Productivity
            </Button>
            <Button as={Link} to={routePaths.platformEngineering} color="light">
              Explore Platform Engineering
            </Button>
            <Button as={Link} to={routePaths.architectureDesign} color="light">
              Explore Architecture &amp; Design
            </Button>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeader
          title="Quick Access"
          description="Your fastest way back to useful Freeshot tools."
        />
        <div className="grid min-w-0 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickAccessItems
            .slice(0, maximumQuickAccessTools)
            .map(({ tool, source }) => (
              <ToolCard
                key={tool.id}
                tool={toCatalogTool(tool)}
                variant="compact"
                contextLabel={
                  source === "favorite"
                    ? "Favorite"
                    : source === "recent"
                      ? "Recent"
                      : undefined
                }
              />
            ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Architecture & Design"
          value={String(availableArchitectureTools.length)}
          detail="Architecture and documentation tools"
        />
        <MetricCard
          label="Platform Engineering"
          value={String(availablePlatformTools.length)}
          detail="Operational calculators"
        />
        <MetricCard
          label="Developer Productivity"
          value={String(availableDeveloperTools.length)}
          detail="Developer productivity utilities"
        />
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeader
          title="Architecture Diagramming"
          description="Create and preview text-based diagrams using PlantUML or Mermaid, with practical templates and export capabilities."
        />
        <div className="grid items-stretch gap-4 md:grid-cols-2">
          {architectureDiagrammingTools.map((tool) => (
            <ToolCard key={tool.id} tool={toCatalogTool(tool)} />
          ))}
        </div>
      </section>

      {recentTools.length > 0 ? (
        <section className="flex flex-col gap-5">
          <SectionHeader
            title="Recently Used"
            description="Return to tools you opened most recently."
            action={
              <Button
                type="button"
                color="light"
                size="sm"
                aria-label="Clear recently used tools"
                onClick={clearRecentTools}
              >
                Clear Recently Used
              </Button>
            }
          />
          <div className="grid min-w-0 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {recentTools.slice(0, homeRecentToolLimit).map((tool) => (
              <ToolCard key={tool.id} tool={toCatalogTool(tool)} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-5">
        <SectionHeader
          title="Featured Categories"
          description="Explore Freeshot by engineering workflow and discipline."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          <FeaturedSectionCard
            title="Architecture & Design"
            description="Tools for architecture diagrams, C4 modeling, ADRs and design documentation."
            examples={availableArchitectureTools.map((tool) => tool.title)}
            actionLabel="View Architecture & Design"
            to={routePaths.architectureDesign}
          />
          <FeaturedSectionCard
            title="Developer Productivity"
            description="Developer productivity utilities for integration teams, backend engineers and architects."
            examples={featuredDeveloperTools.map((tool) => tool.title)}
            actionLabel="View Developer Productivity"
            to={routePaths.developerTools}
          />
          <FeaturedSectionCard
            title="Platform Engineering"
            description="Sizing, capacity planning and operational tooling for container platform workloads."
            examples={availablePlatformTools.map((tool) => tool.title)}
            actionLabel="View Platform Engineering"
            to={routePaths.platformEngineering}
          />
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeader
          title="Recently Added"
          description="Recent additions for API exploration and application configuration workflows."
        />
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          {recentlyAddedTools.map((tool) => (
            <ToolCard key={tool.id} tool={toCatalogTool(tool)} />
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-2xl font-bold text-gray-950 dark:text-white">
          Why Freeshot
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-gray-600 dark:text-gray-300">
          Freeshot gives software architects, platform engineers, and developers
          focused browser-based tools for recurring engineering work. Tool
          discovery and personalization stay lightweight, while inputs and
          preferences remain local to the browser where practical.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <RoadmapCard
          title="Current Focus"
          items={[
            "Architecture & Design",
            "Platform Engineering",
            "Developer Productivity",
            "Tool Discovery & Personalization",
          ]}
        />
        <RoadmapCard
          title="Coming Soon"
          items={[
            "Event Bus Calculator",
            "Additional Platform Engineering utilities",
          ]}
        />
      </section>
    </div>
  );
}

function toCatalogTool(tool: SearchableTool): CatalogTool {
  return {
    id: tool.id,
    title: tool.name,
    description: tool.description,
    category: tool.category,
    keywords: tool.keywords,
    path: tool.route,
    status: "available",
  };
}

interface FeaturedSectionCardProps {
  title: string;
  description: string;
  examples: string[];
  actionLabel: string;
  to: string;
}

function FeaturedSectionCard({
  title,
  description,
  examples,
  actionLabel,
  to,
}: FeaturedSectionCardProps) {
  return (
    <Card className="border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-2xl font-bold text-gray-950 dark:text-white">
        {title}
      </h3>
      <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
        {description}
      </p>
      <ul className="grid gap-2 text-sm text-gray-700 sm:grid-cols-2 dark:text-gray-200">
        {examples.map((example) => (
          <li
            key={example}
            className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900"
          >
            {example}
          </li>
        ))}
      </ul>
      <div>
        <Button as={Link} to={to} color="light" size="sm">
          {actionLabel}
        </Button>
      </div>
    </Card>
  );
}

function RoadmapCard({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
        {title}
      </h2>
      <ul className="mt-4 grid gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
