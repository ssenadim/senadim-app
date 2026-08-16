import { Link } from "react-router-dom";
import { Card } from "flowbite-react";
import { NoteCard } from "../../components/cards/NoteCard";
import { PageShell } from "../../components/common/PageShell";
import { latestNotes } from "../../data/architectureNotes";
import { usePageTitle } from "../../hooks/usePageTitle";
import { routePaths } from "../../utils/routes";

export function ArchitectureNotesPage() {
  usePageTitle("Architecture Notes Library");

  return (
    <PageShell
      eyebrow="Knowledge base"
      title="Architecture Notes"
      description="Browse practical architecture notes alongside planned research and implementation guidance."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to={routePaths.dpopArchitectureNote}
          className="block h-full rounded-lg outline-cyan-600 focus-visible:outline-2 focus-visible:outline-offset-2 dark:outline-cyan-400"
        >
          <Card className="h-full cursor-pointer border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-cyan-700">
            <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
              DPoP
            </h2>
            <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
              Demonstrating Proof-of-Possession for OAuth access tokens.
            </p>
          </Card>
        </Link>
        {latestNotes.map((note) => (
          <NoteCard key={note.title} note={note} />
        ))}
      </div>
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-xl font-semibold text-gray-950 dark:text-white">
          More articles are planned
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300">
          Additional long-form notes, decision records, and implementation
          guides will be added as the knowledge base grows.
        </p>
      </div>
    </PageShell>
  );
}
