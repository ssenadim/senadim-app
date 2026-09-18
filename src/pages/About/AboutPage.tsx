import { Badge, Card } from "flowbite-react";
import type { ReactNode } from "react";
import { PageShell } from "../../components/common/PageShell";
import { architectureDesignTools } from "../../data/architectureDesignTools";
import { developerTools } from "../../data/developerTools";
import { platformTools } from "../../data/platformTools";
import { usePageTitle } from "../../hooks/usePageTitle";

type CardIconName = "target" | "layers" | "compass" | "users";

interface CapabilityPoint {
  title: string;
  description: string;
}

interface CapabilityArea {
  title: string;
  description: string;
  points: CapabilityPoint[];
  icon: CardIconName;
}

const iconPaths: Record<CardIconName, ReactNode> = {
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <path d="m14.8 9.2 4.7-4.7M16 4.5h3.5V8" />
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
  users: (
    <>
      <path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 20v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
};

const availableTools = [
  ...developerTools,
  ...platformTools,
  ...architectureDesignTools,
].filter((tool) => tool.status === "available");

function getToolTitle(toolId: string) {
  return availableTools.find((tool) => tool.id === toolId)?.title ?? toolId;
}

const capabilityAreas: CapabilityArea[] = [
  {
    title: "Developer Productivity",
    description:
      "Focused tools for common development, integration, inspection, and debugging workflows.",
    points: [
      {
        title: "Everyday utilities",
        description: `${getToolTitle("base64-encoder-decoder")}, ${getToolTitle("uuid-generator")}, ${getToolTitle("url-encoder-decoder")}, and ${getToolTitle("timestamp-converter")} support recurring data and integration tasks.`,
      },
      {
        title: "Structured data",
        description: `${getToolTitle("data-formatter")} formats and validates JSON, XML, and HTML with inline diagnostics where supported, while ${getToolTitle("data-compare")} helps inspect meaningful differences.`,
      },
      {
        title: "Security helpers",
        description: `${getToolTitle("jwt-decoder")}, ${getToolTitle("hash-generator")}, ${getToolTitle("regex-tester")}, and ${getToolTitle("pkce-generator")} provide focused inspection and generation workflows.`,
      },
      {
        title: "Configuration and APIs",
        description: `${getToolTitle("configuration-converter")} supports JSON to YAML, YAML to JSON, and Properties to JSON or YAML. ${getToolTitle("openapi-viewer")} explores OpenAPI 3.x overviews, endpoints, parameters, bodies, responses, schemas, and local references without executing APIs.`,
      },
    ],
    icon: "target",
  },
  {
    title: "Platform Engineering",
    description:
      "Planning tools for capacity, resource sizing, runtime memory, and operational configuration.",
    points: [
      {
        title: "Capacity and pod planning",
        description: `${getToolTitle("openshift-calculator-suite")} estimates workload capacity and practical pod resource starting points.`,
      },
      {
        title: "Autoscaling and storage",
        description:
          "HPA guidance and PVC sizing connect workload demand with scaling and retention inputs.",
      },
      {
        title: "Runtime memory",
        description: `Container memory planning and ${getToolTitle("jvm-memory-calculator")} help account for heap, native memory, and operational headroom.`,
      },
      {
        title: "Implementation inputs",
        description:
          "Copy-ready configuration outputs help turn calculations into practical deployment inputs where available.",
      },
    ],
    icon: "layers",
  },
  {
    title: "Architecture & Design",
    description:
      "Workflows for architecture visualization, decisions, security analysis, and lightweight documentation.",
    points: [
      {
        title: "Complementary diagramming",
        description: `${getToolTitle("plantuml-viewer")} and ${getToolTitle("mermaid-viewer")} provide balanced, template-driven text diagramming with SVG and PNG export.`,
      },
      {
        title: "Decisions and working notes",
        description: `${getToolTitle("architecture-notes")} captures lightweight context and can hand saved content to ${getToolTitle("adr-generator")} for formal decision documentation.`,
      },
      {
        title: "Threat and risk thinking",
        description: `${getToolTitle("threat-modeling-helper")} combines project definition, STRIDE-based threat identification, recommendations, risk assessment, and Markdown export.`,
      },
      {
        title: "Practical boundaries",
        description:
          "These tools support repeatable architecture conversations and documentation; they do not replace formal design or security review.",
      },
    ],
    icon: "compass",
  },
  {
    title: "Tool Discovery & Personalization",
    description:
      "Lightweight ways to find useful tools and return to the workflows that matter most.",
    points: [
      {
        title: "Global Tool Search",
        description:
          "Search connects tool names, categories, descriptions, and keywords across the available catalog.",
      },
      {
        title: "Favorites",
        description:
          "Frequently used tools can be marked for faster access across discovery surfaces.",
      },
      {
        title: "Recently Used Tools",
        description:
          "Recent activity provides a short path back to tools opened in this browser.",
      },
      {
        title: "Personalized Quick Access",
        description:
          "Favorites, recent activity, and useful defaults form one ordered entry point. Personalization is stored locally in the browser.",
      },
    ],
    icon: "users",
  },
];

const evolutionSteps: Array<{
  title: string;
  description: string;
  icon: CardIconName;
}> = [
  {
    title: "Developer Utilities",
    description:
      "Everyday encoding, formatting, token, date, and productivity tools established the foundation.",
    icon: "target",
  },
  {
    title: "Platform Engineering",
    description:
      "Capacity planning, resource sizing, and JVM and container utilities extended the toolkit into operational work.",
    icon: "layers",
  },
  {
    title: "Architecture & Design",
    description:
      "Diagramming, ADRs, threat modeling, and architecture notes added system-level context.",
    icon: "compass",
  },
  {
    title: "Discovery & Personalization",
    description:
      "Search, favorites, recent tools, and personalized Quick Access made a growing catalog easier to navigate.",
    icon: "users",
  },
  {
    title: "API & Workflow Expansion",
    description:
      "Configuration conversion, OpenAPI inspection, and richer editor diagnostics deepened developer workflows.",
    icon: "target",
  },
];

const principles = [
  {
    title: "Developer First",
    description: "Practical tools stay grounded in real engineering workflows.",
  },
  {
    title: "Vendor Neutral",
    description:
      "Generic language and examples avoid unnecessary vendor coupling.",
  },
  {
    title: "Privacy Conscious",
    description:
      "Where practical, processing and personalization remain in the browser.",
  },
  {
    title: "Lightweight",
    description:
      "Each tool solves a focused problem without unnecessary complexity.",
  },
  {
    title: "Consistent",
    description:
      "Shared patterns make different workflows feel like parts of one product.",
  },
];

const technologies = [
  "React",
  "TypeScript",
  "Vite",
  "Tailwind CSS",
  "Flowbite React",
];

const currentVersion = "v1.1 (In Development)";

const productDirection = [
  "More practical engineering tools",
  "Continued developer workflow improvements",
  "Deeper platform engineering capabilities",
  "Stronger architecture workflows",
  "Continuous UX and accessibility improvements",
];

function SectionTitle({
  icon,
  children,
}: {
  icon: CardIconName;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
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
            {iconPaths[icon]}
          </g>
        </svg>
      </span>
      <h2 className="min-w-0 text-xl font-bold break-words text-gray-950 dark:text-white">
        {children}
      </h2>
    </div>
  );
}

function CapabilityIcon({ icon }: { icon: CardIconName }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
      <svg
        className="size-4.5"
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
          {iconPaths[icon]}
        </g>
      </svg>
    </span>
  );
}

export function AboutPage() {
  usePageTitle("About Freeshot");

  return (
    <div className="[&>div>header>p:last-child]:mt-6">
      <PageShell
        eyebrow="Product Experience"
        title="About Freeshot"
        description="Freeshot is a practical engineering toolkit for developers, platform engineers, and software architects, bringing focused workflows and lightweight discovery into one coherent product."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="h-full border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <SectionTitle icon="target">What Freeshot Is</SectionTitle>
            <p className="mt-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
              Freeshot turns recurring engineering tasks into clear, reusable
              browser-based workflows. It helps practitioners move from an input
              or question to a useful result without adding unnecessary process
              or platform dependency.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge color="info">Practical</Badge>
              <Badge color="success">Focused</Badge>
              <Badge color="purple">Reusable</Badge>
            </div>
          </Card>

          <Card className="h-full border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <SectionTitle icon="users">Why It Took Shape</SectionTitle>
            <p className="mt-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
              Freeshot began as a focused collection of everyday developer
              utilities. Practical needs gradually expanded it into platform
              planning, architecture visualization and documentation, security
              analysis, configuration transformation, API inspection, and faster
              tool discovery.
            </p>
            <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
              Its direction has been informed by real-world ideas and feedback
              from software developers, software and security architects,
              analysts, and framework and platform engineering teams.
            </p>
          </Card>
        </div>

        <section className="min-w-0 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6 dark:border-gray-700 dark:bg-gray-800">
          <SectionTitle icon="layers">Product Journey</SectionTitle>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-gray-600 dark:text-gray-300">
            Freeshot has grown by following connected engineering needs rather
            than a date-driven feature timeline.
          </p>

          <ol className="mt-6 grid min-w-0 gap-6 xl:grid-cols-5 xl:gap-5">
            {evolutionSteps.map((step, index) => (
              <li
                key={step.title}
                className="relative flex min-w-0 gap-4 xl:block"
              >
                {index < evolutionSteps.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-10 -bottom-11 left-5 w-px bg-gray-200 xl:top-5 xl:-right-10 xl:bottom-auto xl:left-10 xl:h-px xl:w-auto dark:bg-gray-700"
                  />
                ) : null}
                <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-cyan-200 bg-white text-sm font-bold text-cyan-700 dark:border-cyan-800 dark:bg-gray-800 dark:text-cyan-300">
                  {index + 1}
                </span>
                <div className="min-w-0 xl:mt-4">
                  <div className="flex min-w-0 items-start gap-2 text-gray-950 dark:text-white">
                    <svg
                      className="mt-0.5 size-4 shrink-0 text-cyan-600 dark:text-cyan-400"
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
                        {iconPaths[step.icon]}
                      </g>
                    </svg>
                    <h3 className="min-w-0 font-semibold break-words">
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 break-words text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="min-w-0 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6 dark:border-gray-700 dark:bg-gray-800">
          <SectionTitle icon="layers">Current Capabilities</SectionTitle>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-gray-600 dark:text-gray-300">
            Four connected capability areas cover focused utilities, platform
            planning, architecture workflows, and faster paths through the
            catalog.
          </p>

          <div className="mt-6 grid min-w-0 items-stretch gap-5 xl:grid-cols-2">
            {capabilityAreas.map((area) => (
              <article
                key={area.title}
                className="flex min-w-0 flex-col rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <CapabilityIcon icon={area.icon} />
                  <div className="min-w-0">
                    <h3 className="font-semibold break-words text-gray-950 dark:text-white">
                      {area.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 break-words text-gray-600 dark:text-gray-300">
                      {area.description}
                    </p>
                  </div>
                </div>
                <ul className="mt-5 grid flex-1 gap-3">
                  {area.points.map((point) => (
                    <li
                      key={point.title}
                      className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <h4 className="text-sm font-semibold break-words text-gray-950 dark:text-white">
                        {point.title}
                      </h4>
                      <p className="mt-1.5 text-sm leading-6 break-words text-gray-600 dark:text-gray-300">
                        {point.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="min-w-0 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6 dark:border-gray-700 dark:bg-gray-800">
          <SectionTitle icon="compass">Product Principles</SectionTitle>
          <div className="mt-6 grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {principles.map((principle) => (
              <article
                key={principle.title}
                className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900"
              >
                <h3 className="font-semibold break-words text-gray-950 dark:text-white">
                  {principle.title}
                </h3>
                <p className="mt-2 text-sm leading-6 break-words text-gray-600 dark:text-gray-300">
                  {principle.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="min-w-0 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6 dark:border-gray-700 dark:bg-gray-800">
          <SectionTitle icon="target">Product Information</SectionTitle>
          <div className="mt-6 grid min-w-0 gap-4 lg:grid-cols-2">
            <article className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-950 dark:text-white">
                Built With
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                The implementation stays secondary to the workflows it supports.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {technologies.map((technology) => (
                  <Badge key={technology} color="gray">
                    {technology}
                  </Badge>
                ))}
              </div>
            </article>

            <article className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-950 dark:text-white">
                Current Stage
              </h3>
              <p className="mt-4 text-lg font-bold break-words text-cyan-700 dark:text-cyan-300">
                {currentVersion}
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                The current milestone brings the four product areas together
                with stronger discovery, API inspection, configuration, and
                validation workflows.
              </p>
            </article>
          </div>
        </section>

        <section className="min-w-0 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6 dark:border-gray-700 dark:bg-gray-800">
          <SectionTitle icon="compass">Product Direction</SectionTitle>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-gray-600 dark:text-gray-300">
            Freeshot will continue to evolve around practical engineering work,
            keeping future direction broad enough to respond to real needs.
          </p>
          <ul className="mt-6 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {productDirection.map((item) => (
              <li
                key={item}
                className="flex min-w-0 items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-6 break-words text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              >
                <span
                  aria-hidden="true"
                  className="mt-2 size-2 shrink-0 rounded-full bg-cyan-500"
                />
                <span className="min-w-0">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </PageShell>
    </div>
  );
}
