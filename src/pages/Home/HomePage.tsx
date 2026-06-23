import { Link } from "react-router-dom";
import { Button, Card } from "flowbite-react";
import { MetricCard } from "../../components/cards/MetricCard";
import { ToolCard } from "../../components/cards/ToolCard";
import { SectionHeader } from "../../components/common/SectionHeader";
import { developerTools } from "../../data/developerTools";
import { platformTools } from "../../data/platformTools";
import { usePageTitle } from "../../hooks/usePageTitle";
import { routePaths } from "../../utils/routes";

const featuredDeveloperToolNames = [
  "JWT Decoder",
  "Timestamp Converter",
  "Data Compare",
  "Regex Tester",
];

const featuredToolNames = [
  "PlantUML Viewer",
  "OpenShift Calculator Suite",
  "JVM Memory Calculator",
  "JWT Decoder",
  "Timestamp Converter",
];

const featuredCapabilities = [
  {
    title: "Architecture & Design",
    description:
      "Generate architecture diagrams using PlantUML and reusable architecture templates.",
  },
  {
    title: "Platform Engineering",
    description:
      "OpenShift sizing, capacity planning, JVM memory calculations and operational tooling.",
  },
  {
    title: "Developer Productivity",
    description:
      "JWT, PKCE, Regex, Encoding, Formatting and comparison utilities.",
  },
];

export function HomePage() {
  usePageTitle("Home");

  const availableDeveloperTools = developerTools.filter(
    (tool) => tool.status === "available",
  );
  const availablePlatformTools = platformTools.filter(
    (tool) => tool.status === "available",
  );
  const featuredDeveloperTools = developerTools.filter((tool) =>
    featuredDeveloperToolNames.includes(tool.title),
  );
  const featuredTools = [...developerTools, ...platformTools].filter((tool) =>
    featuredToolNames.includes(tool.title),
  ).sort(
    (firstTool, secondTool) =>
      featuredToolNames.indexOf(firstTool.title) -
      featuredToolNames.indexOf(secondTool.title),
  );
  const totalTools = availableDeveloperTools.length + availablePlatformTools.length;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase text-cyan-700 dark:text-cyan-300">
            Architecture / Platform Engineering / Developer Productivity
          </p>
          <h1 className="mt-4 text-4xl font-bold text-gray-950 dark:text-white sm:text-5xl">
            Freeshot
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-gray-600 dark:text-gray-300">
            Architecture design templates, platform engineering calculators and
            developer productivity tools built for practical engineering work.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button as={Link} to={routePaths.developerTools} color="blue">
              Explore Developer Tools
            </Button>
            <Button as={Link} to={routePaths.platformEngineering} color="light">
              Explore Platform Engineering Tools
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-cyan-200 bg-cyan-50 p-6 shadow-sm dark:border-cyan-900 dark:bg-cyan-950/40 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-cyan-700 dark:text-cyan-300">
              Featured Tool
            </p>
            <h2 className="mt-3 text-3xl font-bold text-gray-950 dark:text-white">
              PlantUML Viewer
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-700 dark:text-gray-200">
              Create architecture diagrams instantly using reusable templates
              for ISAQB, OAuth2, PAR, DPoP, OpenShift and Microservice
              architectures.
            </p>
            <div className="mt-6">
              <Button as={Link} to={routePaths.plantUmlViewer} color="blue">
                Open PlantUML Viewer
              </Button>
            </div>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "ISAQB Architecture Templates",
              "OAuth2 / PAR / DPoP Flows",
              "OpenShift Architecture Templates",
              "Instant Diagram Rendering",
            ].map((highlight) => (
              <li
                key={highlight}
                className="rounded-lg border border-cyan-100 bg-white px-4 py-3 text-sm font-medium text-gray-800 dark:border-cyan-900 dark:bg-gray-900 dark:text-gray-100"
              >
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Developer Tools"
          value={`${availableDeveloperTools.length}+`}
          detail="Production-ready utilities"
        />
        <MetricCard
          label="Platform Engineering Tools"
          value={`${availablePlatformTools.length}+`}
          detail="Operational calculators"
        />
        <MetricCard
          label="Utilities"
          value={`${totalTools}+`}
          detail="Available toolbox entries"
        />
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeader
          title="Featured Capabilities"
          description="Freeshot is organized around architecture, platform operations and everyday developer workflows."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {featuredCapabilities.map((capability) => (
            <CapabilityCard
              key={capability.title}
              title={capability.title}
              description={capability.description}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <FeaturedSectionCard
          title="Developer Tools"
          description="Utilities for developers, architects and integration teams."
          examples={featuredDeveloperTools.map((tool) => tool.title)}
          actionLabel="View Developer Tools"
          to={routePaths.developerTools}
        />
        <FeaturedSectionCard
          title="Platform Engineering Tools"
          description="Sizing, capacity planning and operational tooling for OpenShift and containerized workloads."
          examples={availablePlatformTools.map((tool) => tool.title)}
          actionLabel="View Platform Engineering Tools"
          to={routePaths.platformEngineering}
        />
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeader
          title="Featured Tools"
          description="A focused set of architecture, platform engineering and developer productivity tools."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredTools.map((tool) => (
            <ToolCard key={tool.title} tool={tool} />
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-2xl font-bold text-gray-950 dark:text-white">
          About This Project
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-gray-600 dark:text-gray-300">
          This site contains practical tools and calculators created from
          real-world experience in software architecture, IAM, Java, .NET, APIs
          and platform engineering.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <RoadmapCard
          title="Current Focus"
          items={["Developer Tools", "Platform Engineering Tools"]}
        />
        <RoadmapCard
          title="Coming Soon"
          items={["Kafka Calculator", "Additional Platform Engineering utilities"]}
        />
      </section>
    </div>
  );
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
      <h2 className="text-2xl font-bold text-gray-950 dark:text-white">
        {title}
      </h2>
      <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
        {description}
      </p>
      <ul className="grid gap-2 text-sm text-gray-700 dark:text-gray-200 sm:grid-cols-2">
        {examples.map((example) => (
          <li key={example} className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900">
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

function CapabilityCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </section>
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
