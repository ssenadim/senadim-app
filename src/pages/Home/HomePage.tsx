import { Link } from "react-router-dom";
import { Button } from "flowbite-react";
import { MetricCard } from "../../components/cards/MetricCard";
import { NoteCard } from "../../components/cards/NoteCard";
import { ToolCard } from "../../components/cards/ToolCard";
import { SectionHeader } from "../../components/common/SectionHeader";
import { latestNotes } from "../../data/architectureNotes";
import { developerTools } from "../../data/developerTools";
import { usePageTitle } from "../../hooks/usePageTitle";
import { routePaths } from "../../utils/routes";

export function HomePage() {
  usePageTitle("Home");

  const featuredTools = developerTools.slice(0, 3);
  const featuredNotes = latestNotes.slice(0, 3);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase text-cyan-700 dark:text-cyan-300">
            Senadim Toolbox
          </p>
          <h1 className="mt-4 text-4xl font-bold text-gray-950 dark:text-white sm:text-5xl">
            A focused developer portal for everyday engineering work.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-300">
            Centralized utilities, practical architecture notes, and a scalable
            React foundation designed for clean growth.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button as={Link} to={routePaths.developerTools} color="blue">
              Browse developer tools
            </Button>
            <Button as={Link} to={routePaths.architectureNotes} color="light">
              Read architecture notes
            </Button>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-950 p-5 font-mono text-sm text-gray-100 shadow-inner dark:border-gray-700">
          <div className="flex gap-2">
            <span className="size-3 rounded-full bg-red-400" />
            <span className="size-3 rounded-full bg-amber-300" />
            <span className="size-3 rounded-full bg-emerald-400" />
          </div>
          <div className="mt-6 space-y-3">
            <p className="text-cyan-300">senadim-toolbox init</p>
            <p>
              <span className="text-emerald-300">status</span> portal-ready
            </p>
            <p>
              <span className="text-emerald-300">stack</span> react19 vite
              typescript
            </p>
            <p>
              <span className="text-emerald-300">tools</span> catalog-first
              implementation-next
            </p>
            <p className="text-gray-400">Deploy target: GitHub Pages</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Tool catalog" value="7" detail="Planned utilities" />
        <MetricCard label="Architecture" value="5" detail="Page-level modules" />
        <MetricCard label="Deployment" value="Ready" detail="Static Vite output" />
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeader
          title="Featured Tools"
          description="A starter catalog for developer utilities. Functionality is intentionally left for dedicated implementation passes."
          action={
            <Link
              to={routePaths.developerTools}
              className="text-sm font-semibold text-cyan-700 hover:text-cyan-900 dark:text-cyan-300 dark:hover:text-cyan-200"
            >
              View all tools
            </Link>
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          {featuredTools.map((tool) => (
            <ToolCard key={tool.title} tool={tool} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeader
          title="Latest Notes"
          description="A lightweight writing area for decisions, patterns, and lessons learned as the toolbox evolves."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {featuredNotes.map((note) => (
            <NoteCard key={note.title} note={note} />
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-cyan-200 bg-cyan-50 p-6 dark:border-cyan-900 dark:bg-cyan-950/40 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-950 dark:text-white">
              Build the toolbox one reliable utility at a time.
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700 dark:text-gray-300">
              The foundation is prepared for future tool pages, shared form
              controls, validation helpers, and deployable static output.
            </p>
          </div>
          <Button as={Link} to={routePaths.about} color="blue">
            About the portal
          </Button>
        </div>
      </section>
    </div>
  );
}
