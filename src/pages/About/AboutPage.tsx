import { Badge, Card } from "flowbite-react";
import type { ReactNode } from "react";
import { PageShell } from "../../components/common/PageShell";
import { usePageTitle } from "../../hooks/usePageTitle";

const expertise = [
  "Developer Productivity",
  "Platform Engineering",
  "Architecture & Design",
];

const experienceAreas = [
  "Vendor Neutral",
  "Developer First",
  "Privacy Focused",
  "Lightweight",
  "Practical",
  "Consistent User Experience",
];

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
const evolutionSteps: Array<{
  title: string;
  description: string;
  icon: CardIconName;
}> = [
  {
    title: "Developer Productivity",
    description:
      "Started with practical utilities for encoding, formatting, comparison, JWT inspection and everyday development tasks.",
    icon: "target",
  },
  {
    title: "Platform Engineering",
    description:
      "Expanded with OpenShift capacity planning, resource sizing and JVM memory tools.",
    icon: "layers",
  },
  {
    title: "Architecture & Design",
    description:
      "Introduced PlantUML templates and Architecture Decision Record tooling for software architects and engineering teams.",
    icon: "compass",
  },
];
function CardTitle({
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

export function AboutPage() {
  usePageTitle("About Freeshot");

  return (
    <div className="[&>div>header>p:last-child]:mt-6">
      <PageShell
        eyebrow="Product Experience"
        title="About Freeshot"
        description="Freeshot is a modern engineering toolkit designed to simplify everyday work for software engineers, platform engineers and solution architects. It combines practical tools for Developer Productivity, Platform Engineering and Architecture & Design into a single, lightweight web application. Our mission is simple: Help engineering teams spend less time on repetitive tasks and more time building great software."
      >
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="h-full border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <CardTitle icon="target">Our Mission</CardTitle>
            <p className="mt-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
              Freeshot focuses on solving real engineering problems with
              practical, easy-to-use tools. Every feature follows three simple
              principles:
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge color="info">Simple</Badge>
              <Badge color="success">Fast</Badge>
              <Badge color="purple">Useful</Badge>
            </div>
          </Card>

          <div className="flex flex-col gap-6">
            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <CardTitle icon="layers">Core Capabilities</CardTitle>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {expertise.map((item) => (
                  <div
                    key={item}
                    className="flex min-h-12 items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                  >
                    <span className="size-2 shrink-0 rounded-full bg-cyan-500" />
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <CardTitle icon="compass">Design Principles</CardTitle>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {experienceAreas.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-cyan-200 bg-cyan-50/30 p-6 shadow-md ring-1 ring-cyan-100/70 dark:border-cyan-900 dark:bg-cyan-950/10 dark:ring-cyan-900/50">
              <CardTitle icon="users">Community Driven</CardTitle>
              <p className="mt-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
                Freeshot continues to evolve through practical feedback from
                software engineers, security architects, software architects,
                framework engineering teams and analysts working on real-world
                enterprise systems.
              </p>
              <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
                Their ideas, experience and continuous feedback help shape the
                platform and guide future improvements.
              </p>
            </section>
          </div>
        </div>
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardTitle icon="layers">Product Evolution</CardTitle>
          <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
            Freeshot has grown through practical engineering needs and
            continuous user feedback.
          </p>

          <ol className="mt-6 grid gap-6 md:grid-cols-3 md:gap-5">
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

          <p className="mt-6 border-t border-gray-200 pt-5 text-sm leading-6 font-medium text-gray-700 dark:border-gray-700 dark:text-gray-200">
            Freeshot continues to evolve through feedback from developers,
            analysts, security architects, software architects and framework
            engineering teams.
          </p>
        </section>{" "}
      </PageShell>
    </div>
  );
}
