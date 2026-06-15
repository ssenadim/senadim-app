import { Badge, Card } from "flowbite-react";
import type { ArchitectureNote } from "../../types/note";

interface NoteCardProps {
  note: ArchitectureNote;
}

const statusColors: Record<ArchitectureNote["status"], string> = {
  Draft: "gray",
  Planned: "purple",
  Research: "success",
};

export function NoteCard({ note }: NoteCardProps) {
  return (
    <Card className="h-full border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex h-full flex-col gap-3">
        <Badge color={statusColors[note.status]} className="w-fit">
          {note.status}
        </Badge>
        <h3 className="text-lg font-semibold text-gray-950 dark:text-white">
          {note.title}
        </h3>
        <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
          {note.summary}
        </p>
      </div>
    </Card>
  );
}
