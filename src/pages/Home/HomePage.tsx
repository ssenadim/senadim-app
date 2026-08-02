import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { Badge, Button, Card } from "flowbite-react";
import { MetricCard } from "../../components/cards/MetricCard";
import { ToolCard } from "../../components/cards/ToolCard";
import { SectionHeader } from "../../components/common/SectionHeader";
import { architectureDesignTools } from "../../data/architectureDesignTools";
import { developerTools } from "../../data/developerTools";
import { platformTools } from "../../data/platformTools";
import { usePageTitle } from "../../hooks/usePageTitle";
import { routePaths } from "../../utils/routes";


const featuredToolNames = [
  "PlantUML Viewer",
  "Container Platform Calculator Suite",
  "JVM Memory Calculator",
  "JWT Decoder",
  "Timestamp Converter",
];

const featuredCapabilities = [
  {
    title: "Architecture & Design",
    description:
      "Architecture diagrams, C4 modeling, ISAQB templates and PlantUML tooling.",
  },
  {
    title: "Platform Engineering",
    description:
      "Container platform sizing, capacity planning, JVM memory calculations and operational tooling.",
  },
  {
    title: "Developer Productivity",
    description:
      "JWT, PKCE, Regex, Encoding, Formatting and comparison utilities.",
  },
];
type FeaturedCategoryIcon = "code" | "layers" | "compass";

const featuredCategories: Array<{
  title: string;
  description: string;
  tools: string[];
  icon: FeaturedCategoryIcon;
}> = [
  {
    title: "Developer Productivity",
    description: "Everyday tools that improve developer productivity.",
    tools: [
      "JWT Decoder",
      "Data Formatter",
      "Base64 Encoder / Decoder",
      "UUID Generator",
      "Regex Tester",
    ],
    icon: "code",
  },
  {
    title: "Platform Engineering",
    description: "Utilities for cloud platforms and infrastructure operations.",
    tools: ["OpenShift Calculator", "JVM Memory Calculator"],
    icon: "layers",
  },
  {
    title: "Architecture & Design",
    description:
      "Tools that help software architects visualize and document systems.",
    tools: ["PlantUML Viewer", "ADR Generator"],
    icon: "compass",
  },
];

const quickAccessTools = [
  {
    title: "JWT Decoder",
    description: "Inspect JWT headers and payloads securely in your browser.",
    category: "Developer Productivity",
    path: routePaths.jwtDecoderTool,
  },
  {
    title: "Data Formatter",
    description: "Format and validate JSON, XML and other structured data.",
    category: "Developer Productivity",
    path: routePaths.formatterTool,
  },
  {
    title: "OpenShift Calculator",
    description: "Plan container platform capacity and resource requirements.",
    category: "Platform Engineering",
    path: routePaths.containerPlatformCalculator,
  },
  {
    title: "JVM Memory Calculator",
    description: "Calculate JVM memory settings for containerized applications.",
    category: "Platform Engineering",
    path: routePaths.jvmMemoryCalculator,
  },
  {
    title: "PlantUML Viewer",
    description: "Render architecture diagrams instantly from PlantUML source.",
    category: "Architecture & Design",
    path: routePaths.plantUmlViewer,
  },
  {
    title: "ADR Generator",
    description: "Create Architecture Decision Records from a structured template.",
    category: "Architecture & Design",
    path: routePaths.adrGenerator,
  },
];
const whyFreeshotPrinciples = [
  {
    title: "Developer First",
    description: "Built for real engineering workflows.",
  },
  {
    title: "Vendor Neutral",
    description: "Works across technologies and platforms.",
  },
  {
    title: "Privacy Focused",
    description: "Your data stays in your browser whenever possible.",
  },
  {
    title: "Lightweight",
    description: "Fast, simple and distraction-free.",
  },
  {
    title: "Community Driven",
    description:
      "Continuously improved through feedback from developers, architects and engineering teams.",
  },
];
const featuredCategoryIconPaths: Record<FeaturedCategoryIcon, ReactNode> = {
  code: (
    <>
      <path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9 4.9-2.1Z" />
    </>
  ),
};
export function HomePage() {
  usePageTitle("Home");

  const availableDeveloperTools = developerTools.filter(
    (tool) => tool.status === "available",
  );
  const availableArchitectureTools = architectureDesignTools.filter(
    (tool) => tool.status === "available",
  );
  const availablePlatformTools = platformTools.filter(
    (tool) => tool.status === "available",
  );

  const featuredTools = [
    ...architectureDesignTools,
    ...platformTools,
    ...developerTools,
  ].filter((tool) => featuredToolNames.includes(tool.title)).sort(
    (firstTool, secondTool) =>
      featuredToolNames.indexOf(firstTool.title) -
      featuredToolNames.indexOf(secondTool.title),
  );
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase text-cyan-700 dark:text-cyan-300">
            Modern Engineering Toolkit
          </p>
          <h1 className="mt-4 text-4xl font-bold text-gray-950 dark:text-white sm:text-5xl">
            Freeshot
          </h1>
          <p className="mt-5 text-2xl leading-tight font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
            <span className="block">Developer Productivity.</span>
            <span className="block">Platform Engineering.</span>
            <span className="block">Architecture &amp; Design.</span>
            <span className="mt-2 block text-cyan-700 dark:text-cyan-300">
              Everything in one place.
            </span>
          </p>
          <p className="mt-6 max-w-3xl text-base leading-7 text-gray-600 dark:text-gray-300">
            Freeshot is a lightweight, modern web application that brings
            practical daily tools together to improve engineering productivity.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge color="info">Developer Productivity</Badge>
            <Badge color="success">Platform Engineering</Badge>
            <Badge color="purple">Architecture &amp; Design</Badge>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
              for ISAQB, OAuth2, PAR, DPoP, container platform and microservice
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
              "C4 Architecture Templates",
              "ISAQB Architecture Templates",
              "OAuth2 / PAR / DPoP Flows",
              "Container Platform Architecture Templates",
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
          label="Architecture & Design"
          value={`${availableArchitectureTools.length}+`}
          detail="Architecture and documentation tools"
        />
        <MetricCard
          label="Platform Engineering Tools"
          value={`${availablePlatformTools.length}+`}
          detail="Operational calculators"
        />
        <MetricCard
          label="Developer Tools"
          value={`${availableDeveloperTools.length}+`}
          detail="Developer productivity utilities"
        />
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeader
          title="Featured Capabilities"
          description="Freeshot is organized around architecture design, platform operations and everyday developer workflows."
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

      <section className="flex flex-col gap-5">
        <SectionHeader title="Explore by Category" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredCategories.map((category) => (
            <CategoryOverviewCard key={category.title} {...category} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeader
          title="Why Freeshot?"
          description="Freeshot is designed to help engineers solve everyday technical problems faster with practical, lightweight and vendor-neutral tools."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {whyFreeshotPrinciples.map((principle) => (
            <article
              key={principle.title}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-full bg-cyan-500"
                />
                <h3 className="font-semibold text-gray-950 dark:text-white">
                  {principle.title}
                </h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                {principle.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeader
          title="Quick Access"
          description="Start with the tools most frequently used by developers, platform engineers and software architects."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickAccessTools.map((tool) => (
            <QuickAccessCard key={tool.title} {...tool} />
          ))}
        </div>
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
          Freeshot is intended for software architects, platform engineers and
          developers who need practical support for architecture design,
          platform engineering and developer productivity workflows.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <RoadmapCard
          title="Current Focus"
          items={[
            "Architecture & Design",
            "Platform Engineering",
            "Developer Productivity",
          ]}
        />
        <RoadmapCard
          title="Coming Soon"
          items={["Event Bus Calculator", "Additional Platform Engineering utilities"]}
        />
      </section>
    </div>
  );
}

interface CategoryOverviewCardProps {
  title: string;
  description: string;
  tools: string[];
  icon: FeaturedCategoryIcon;
}

function CategoryOverviewCard({
  title,
  description,
  tools,
  icon,
}: CategoryOverviewCardProps) {
  return (
    <Card className="h-full border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
          <svg
            className="size-5"
            aria-hidden="true"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            >
              {featuredCategoryIconPaths[icon]}
            </g>
          </svg>
        </span>
        <h3 className="text-xl font-bold text-gray-950 dark:text-white">
          {title}
        </h3>
      </div>
      <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
        {description}
      </p>
      <div className="flex flex-wrap gap-2">
        {tools.map((tool) => (
          <Badge key={tool} color="gray">
            {tool}
          </Badge>
        ))}
      </div>
    </Card>
  );
}

interface QuickAccessCardProps {
  title: string;
  description: string;
  category: string;
  path: string;
}

function QuickAccessCard({
  title,
  description,
  category,
  path,
}: QuickAccessCardProps) {
  return (
    <Link
      to={path}
      className="block h-full rounded-lg outline-cyan-600 focus:outline-2 focus:outline-offset-2"
      aria-label={`Open ${title}`}
    >
      <Card className="h-full border-gray-200 bg-white shadow-sm hover:border-cyan-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-cyan-700">
        <Badge color="gray" className="w-fit">
          {category}
        </Badge>
        <div>
          <h3 className="text-base font-semibold text-gray-950 dark:text-white">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {description}
          </p>
        </div>
      </Card>
    </Link>
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
