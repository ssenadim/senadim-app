import { NoteCard } from "../../components/cards/NoteCard";
import { PageShell } from "../../components/common/PageShell";
import { latestNotes } from "../../data/architectureNotes";
import { usePageTitle } from "../../hooks/usePageTitle";

export function ArchitectureNotesPage() {
  usePageTitle("Architecture Notes");

  return (
    <PageShell
      eyebrow="Knowledge base"
      title="Architecture Notes"
      description="A placeholder for future articles covering frontend architecture, deployment, tool design, and maintainability decisions."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {latestNotes.map((note) => (
          <NoteCard key={note.title} note={note} />
        ))}
      </div>
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-xl font-semibold text-gray-950 dark:text-white">
          Articles are coming soon
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300">
          This page is ready to host long-form notes, decision records, and
          implementation guides as the portal matures.
        </p>
      </div>
    </PageShell>
  );
}
