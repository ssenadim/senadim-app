import { Badge, Card } from "flowbite-react";
import type { ReactNode } from "react";
import { PageShell } from "../../components/common/PageShell";
import { architectureDesignTools } from "../../data/architectureDesignTools";
import { developerTools } from "../../data/developerTools";
import { platformTools } from "../../data/platformTools";
import { usePageTitle } from "../../hooks/usePageTitle";

type CardIconName = "target" | "layers" | "compass" | "users";

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

const getAvailableToolNames = (
  tools: ReadonlyArray<{ title: string; status: string }>,
) =>
  tools.filter((tool) => tool.status === "available").map((tool) => tool.title);

const capabilityAreas: Array<{
  title: string;
  description: string;
  details: string;
  tools: string[];
  icon: CardIconName;
}> = [
  {
    title: "Developer Productivity",
    description:
      "Everyday utilities that remove friction from common development, inspection, conversion, and security workflows.",
    details:
      "The collection spans data formatting and comparison, identity and security helpers, API exploration, and focused encoding utilities.",
    tools: getAvailableToolNames(developerTools),
    icon: "target",
  },
  {
    title: "Platform Engineering",
    description:
      "Planning tools for resource sizing and deployment decisions across container platforms and JVM workloads.",
    details:
      "The OpenShift Calculator Suite covers capacity, pod resources, HPA, container memory, and PVC sizing. JVM Memory Calculator and copy-ready outputs help turn estimates into implementation inputs.",
    tools: getAvailableToolNames(platformTools),
    icon: "layers",
  },
  {
    title: "Architecture & Design",
    description:
      "Lightweight workflows for visualizing systems, recording decisions, exploring security concerns, and keeping architecture context close to the work.",
    details:
      "PlantUML and Mermaid provide complementary diagramming options, while ADR Generator, Threat Modeling Helper, and Architecture Notes support decisions and documentation.",
    tools: getAvailableToolNames(architectureDesignTools),
    icon: "compass",
  },
  {
    title: "Tool Discovery & Personalization",
    description:
      "Fast ways to find the right tool and return to the workflows that matter most without creating an account.",
    details:
      "Global Tool Search connects the catalog, while Favorites, Recently Used, and Personalized Quick Access adapt the experience using browser-local preferences.",
    tools: [
      "Global Tool Search",
      "Favorites",
      "Recently Used",
      "Personalized Quick Access",
    ],
    icon: "users",
  },
];

const principles = [
  {
    title: "Developer First",
    description:
      "Workflows stay focused, direct, and ready for real engineering tasks.",
  },
  {
    title: "Vendor Neutral",
    description:
      "Tools support transferable practices instead of locking users into one ecosystem.",
  },
  {
    title: "Privacy Conscious",
    description:
      "Where practical, processing and personalization remain in the browser.",
  },
  {
    title: "Lightweight",
    description:
      "Each experience is designed to be approachable, responsive, and easy to reuse.",
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
      "Freeshot began with small, focused helpers for recurring development tasks.",
    icon: "target",
  },
  {
    title: "Platform Engineering",
    description:
      "Resource planning and JVM tools extended the toolkit into operational workflows.",
    icon: "layers",
  },
  {
    title: "Architecture & Design",
    description:
      "Diagramming, decision records, threat modeling, and notes added system-level context.",
    icon: "compass",
  },
  {
    title: "Discovery & Personalization",
    description:
      "Search and browser-local signals now make a growing catalog quicker to navigate.",
    icon: "users",
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
  "Expand practical workflows across the existing engineering areas",
  "Improve how tools connect, surface, and support repeat use",
  "Refine accessibility, consistency, and browser-local experiences",
];

function SectionTitle({
  icon,
  children,
}: {
  icon: CardIconName;
  children: ReactNode;
}) {
  return (
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
            {iconPaths[icon]}
          </g>
        </svg>
      </span>
      <h2 className="text-xl font-bold text-gray-950 dark:text-white">
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
        description="Freeshot is a practical engineering toolkit that brings Developer Productivity, Platform Engineering, Architecture & Design, and Tool Discovery & Personalization into one focused experience."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="h-full border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <SectionTitle icon="target">What Freeshot Is</SectionTitle>
            <p className="mt-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
              Freeshot turns common engineering tasks into clear, reusable
              workflows. It is designed to help practitioners move from a
              question or input to a useful result quickly, without adding
              unnecessary process or platform dependency.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge color="info">Practical</Badge>
              <Badge color="success">Focused</Badge>
              <Badge color="purple">Reusable</Badge>
            </div>
          </Card>

          <Card className="h-full border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <SectionTitle icon="users">How It Took Shape</SectionTitle>
            <p className="mt-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
              The product evolved from a small set of everyday utilities into a
              broader toolkit shaped by the practical needs of software
              developers, software architects, security architects, analysts,
              and framework and platform engineering teams.
            </p>
            <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
              That mix of perspectives keeps the product grounded in real
              development, operational, design, and security workflows.
            </p>
          </Card>
        </div>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <SectionTitle icon="layers">What You Can Do</SectionTitle>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-gray-600 dark:text-gray-300">
            The catalog is organized around four connected capability areas,
            from focused utilities to broader platform and architecture work.
          </p>

          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            {capabilityAreas.map((area) => (
              <article
                key={area.title}
                className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="flex items-start gap-3">
                  <CapabilityIcon icon={area.icon} />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-950 dark:text-white">
                      {area.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                      {area.description}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {area.details}
                </p>
                <div
                  className="mt-4 flex flex-wrap gap-2"
                  aria-label={`${area.title} capabilities`}
                >
                  {area.tools.map((tool) => (
                    <span
                      key={tool}
                      className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <SectionTitle icon="compass">Product Principles</SectionTitle>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {principles.map((principle) => (
              <article
                key={principle.title}
                className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900"
              >
                <h3 className="font-semibold text-gray-950 dark:text-white">
                  {principle.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {principle.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <SectionTitle icon="layers">Product Journey</SectionTitle>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-gray-600 dark:text-gray-300">
            Freeshot grows by following connected engineering needs rather than
            a date-driven feature timeline.
          </p>

          <ol className="mt-6 grid gap-6 md:grid-cols-4 md:gap-5">
            {evolutionSteps.map((step, index) => (
              <li
                key={step.title}
                className="relative flex min-w-0 gap-4 md:block"
              >
                {index < evolutionSteps.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-10 -bottom-11 left-5 w-px bg-gray-200 md:top-5 md:-right-10 md:bottom-auto md:left-10 md:h-px md:w-auto dark:bg-gray-700"
                  />
                ) : null}
                <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-cyan-200 bg-white text-sm font-bold text-cyan-700 dark:border-cyan-800 dark:bg-gray-800 dark:text-cyan-300">
                  {index + 1}
                </span>
                <div className="min-w-0 md:mt-4">
                  <div className="flex items-center gap-2 text-gray-950 dark:text-white">
                    <svg
                      className="size-4 shrink-0 text-cyan-600 dark:text-cyan-400"
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
                    <h3 className="font-semibold">{step.title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <SectionTitle icon="target">Product Information</SectionTitle>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.75fr_1.25fr]">
            <article className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-950 dark:text-white">
                Built With
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {technologies.map((technology) => (
                  <Badge key={technology} color="gray">
                    {technology}
                  </Badge>
                ))}
              </div>
            </article>

            <article className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-950 dark:text-white">
                Current Stage
              </h3>
              <p className="mt-4 text-lg font-bold text-cyan-700 dark:text-cyan-300">
                {currentVersion}
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                The toolkit is actively evolving through practical product and
                workflow improvements.
              </p>
            </article>

            <article className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-950 dark:text-white">
                Product Direction
              </h3>
              <ul className="mt-4 grid gap-2.5">
                {productDirection.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-5 text-gray-700 dark:text-gray-200"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-cyan-500"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      </PageShell>
    </div>
  );
}
