import { Badge, Card } from "flowbite-react";
import { PageShell } from "../../components/common/PageShell";
import { SectionHeader } from "../../components/common/SectionHeader";
import { usePageTitle } from "../../hooks/usePageTitle";

const expertise = [
  "React and TypeScript architecture",
  "Frontend platform design",
  "Component systems",
  "API integration patterns",
  "Performance-aware UI engineering",
  "Static deployment workflows",
];

const experienceAreas = [
  "Developer productivity tools",
  "Reusable UI foundations",
  "Documentation-driven architecture",
  "Scalable Vite applications",
];

const contactLinks = [
  { label: "GitHub", href: "https://github.com/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "Email", href: "mailto:hello@freeshot.dev" },
];

export function AboutPage() {
  usePageTitle("About");

  return (
    <PageShell
      eyebrow="Profile"
      title="About"
      description="A professional profile area for the owner of Freeshot, focused on technical strengths, experience areas, and contact points."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-950 dark:text-white">
            About Me
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
            I build practical, maintainable developer experiences with strong
            TypeScript foundations and a product-minded approach to frontend
            architecture.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge color="info">React</Badge>
            <Badge color="success">TypeScript</Badge>
            <Badge color="purple">Vite</Badge>
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <SectionHeader
              title="Technical Expertise"
              description="Areas that shape how this portal is organized and extended."
            />
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
            <SectionHeader title="Experience Areas" />
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
            <SectionHeader title="Contact Links" />
            <div className="mt-5 flex flex-wrap gap-3">
              {contactLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-gray-700 dark:text-gray-200 dark:hover:border-cyan-700 dark:hover:text-cyan-300"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
