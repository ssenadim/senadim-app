import { Badge, Card } from "flowbite-react";
import { PageShell } from "../../components/common/PageShell";
import { SectionHeader } from "../../components/common/SectionHeader";
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

export function AboutPage() {
  usePageTitle("About Freeshot");

  return (
    <PageShell
      eyebrow="Freeshot"
      title="About Freeshot"
      description="Freeshot is a modern engineering toolkit designed to simplify everyday work for software engineers, platform engineers and solution architects. It combines practical tools for Developer Productivity, Platform Engineering and Architecture & Design into a single, lightweight web application. Our mission is simple: Help engineering teams spend less time on repetitive tasks and more time building great software."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-950 dark:text-white">
            Our Mission
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
            Freeshot focuses on solving real engineering problems with practical,
            easy-to-use tools. Every feature follows three simple principles:
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge color="info">Simple</Badge>
            <Badge color="success">Fast</Badge>
            <Badge color="purple">Useful</Badge>
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <SectionHeader title="Core Capabilities" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {expertise.map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <SectionHeader title="Design Principles" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {experienceAreas.map((item) => (
                <div
                  key={item}
                  className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <SectionHeader title="Community Driven" />
            <p className="mt-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
              Freeshot continues to evolve through practical feedback from software engineers, security architects, software architects, framework engineering teams and analysts working on real-world enterprise systems.
            </p>
            <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
              Their ideas, experience and continuous feedback help shape the platform and guide future improvements.
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
