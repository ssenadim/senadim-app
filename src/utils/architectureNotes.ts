import {
  architectureNoteTypes,
  type ArchitectureNoteFilters,
  type ArchitectureNoteTemplate,
  type EditableArchitectureNote,
} from "../types/architectureNote";

export const architectureNotesStorageKey = "freeshot.architectureNotes.v1";

export interface ArchitectureNoteAdrHandoff {
  source: "architecture-note";
  title: string;
  context: string;
  tags: string[];
}

const noteTypeSet = new Set<string>(architectureNoteTypes);

export function createArchitectureNote(
  id: string,
  now = new Date().toISOString(),
): EditableArchitectureNote {
  return {
    id,
    title: "Untitled Architecture Note",
    type: "General",
    tags: [],
    content: "",
    createdAt: now,
    updatedAt: now,
  };
}

export function createArchitectureNoteFromTemplate(
  id: string,
  template: ArchitectureNoteTemplate,
  now = new Date().toISOString(),
): EditableArchitectureNote {
  return {
    ...createArchitectureNote(id, now),
    title: template.title,
    type: template.type,
    tags: [...template.suggestedTags],
    content: template.content,
  };
}

export function addUniqueTag(tags: string[], candidate: string) {
  const normalizedTag = candidate.trim();

  if (
    !normalizedTag ||
    tags.some(
      (tag) => tag.toLocaleLowerCase() === normalizedTag.toLocaleLowerCase(),
    )
  ) {
    return tags;
  }

  return [...tags, normalizedTag];
}

export function hasNoteChanges(
  savedNote: EditableArchitectureNote,
  draft: EditableArchitectureNote,
) {
  return (
    savedNote.title !== draft.title ||
    savedNote.type !== draft.type ||
    savedNote.content !== draft.content ||
    savedNote.tags.length !== draft.tags.length ||
    savedNote.tags.some((tag, index) => tag !== draft.tags[index])
  );
}

export function prepareNoteForSave(
  draft: EditableArchitectureNote,
  savedNote: EditableArchitectureNote | undefined,
  now = new Date().toISOString(),
): EditableArchitectureNote {
  const changed = !savedNote || hasNoteChanges(savedNote, draft);

  return {
    ...draft,
    title: draft.title.trim(),
    tags: draft.tags.map((tag) => tag.trim()).filter(Boolean),
    createdAt: savedNote?.createdAt ?? draft.createdAt,
    updatedAt: changed ? now : (savedNote?.updatedAt ?? draft.updatedAt),
  };
}

export function upsertArchitectureNote(
  notes: EditableArchitectureNote[],
  note: EditableArchitectureNote,
) {
  return [note, ...notes.filter((item) => item.id !== note.id)].sort(
    (left, right) => right.updatedAt.localeCompare(left.updatedAt),
  );
}

export function loadArchitectureNotes(storage: Storage) {
  const rawNotes = storage.getItem(architectureNotesStorageKey);
  if (!rawNotes) return [];

  try {
    const parsedNotes: unknown = JSON.parse(rawNotes);
    if (!Array.isArray(parsedNotes)) return [];

    return parsedNotes
      .filter(isEditableArchitectureNote)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  } catch {
    return [];
  }
}

export function storeArchitectureNotes(
  storage: Storage,
  notes: EditableArchitectureNote[],
) {
  storage.setItem(architectureNotesStorageKey, JSON.stringify(notes));
}

export function buildArchitectureNoteMarkdown(
  note: EditableArchitectureNote,
): string {
  const title = note.title.trim() || "Architecture Note";
  const content = removeLeadingDocumentHeading(note.content.trim());
  const lines = [
    `# ${escapeMarkdownInline(title)}`,
    "",
    `**Type:** ${note.type}`,
    `**Created:** ${formatMarkdownDate(note.createdAt)}`,
    `**Updated:** ${formatMarkdownDate(note.updatedAt)}`,
  ];

  if (note.tags.length > 0) {
    lines.push(
      "",
      `**Tags:** ${note.tags.map(escapeMarkdownInline).join(", ")}`,
    );
  }

  if (content) {
    lines.push("", "---", "", content);
  }

  return `${lines.join("\n")}\n`;
}

export function getArchitectureNoteFilename(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/\u0131/g, "i")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");

  return slug ? `${slug}.md` : "architecture-note.md";
}

export function createArchitectureNoteAdrHandoff(
  note: EditableArchitectureNote,
): ArchitectureNoteAdrHandoff {
  return {
    source: "architecture-note",
    title: note.title,
    context: note.content,
    tags: [...note.tags],
  };
}

export function readArchitectureNoteAdrHandoff(
  value: unknown,
): ArchitectureNoteAdrHandoff | null {
  if (!value || typeof value !== "object") return null;

  const handoff = value as Record<string, unknown>;
  if (
    handoff.source !== "architecture-note" ||
    typeof handoff.title !== "string" ||
    typeof handoff.context !== "string" ||
    !Array.isArray(handoff.tags) ||
    !handoff.tags.every((tag) => typeof tag === "string")
  ) {
    return null;
  }

  return {
    source: "architecture-note",
    title: handoff.title,
    context: handoff.context,
    tags: [...handoff.tags],
  };
}

export function getArchitectureNoteTags(notes: EditableArchitectureNote[]) {
  const tagsByNormalizedValue = new Map<string, string>();

  notes.forEach((note) => {
    note.tags.forEach((rawTag) => {
      const tag = rawTag.trim();
      if (!tag) return;

      const normalizedTag = tag.toLocaleLowerCase();
      const existingTag = tagsByNormalizedValue.get(normalizedTag);
      if (!existingTag || compareText(tag, existingTag) < 0) {
        tagsByNormalizedValue.set(normalizedTag, tag);
      }
    });
  });

  return [...tagsByNormalizedValue.values()].sort(compareText);
}

export function filterAndSortArchitectureNotes(
  notes: EditableArchitectureNote[],
  filters: ArchitectureNoteFilters,
) {
  const search = filters.search.trim().toLocaleLowerCase();
  const selectedTag = filters.tag.toLocaleLowerCase();

  return notes
    .filter((note) => {
      const matchesSearch =
        !search ||
        [note.title, note.content, note.type, ...note.tags].some((value) =>
          value.toLocaleLowerCase().includes(search),
        );
      const matchesType = !filters.type || note.type === filters.type;
      const matchesTag =
        !selectedTag ||
        note.tags.some((tag) => tag.trim().toLocaleLowerCase() === selectedTag);

      return matchesSearch && matchesType && matchesTag;
    })
    .sort((left, right) => compareArchitectureNotes(left, right, filters.sort));
}

function compareArchitectureNotes(
  left: EditableArchitectureNote,
  right: EditableArchitectureNote,
  sort: ArchitectureNoteFilters["sort"],
) {
  if (sort === "updated-desc") {
    return (
      right.updatedAt.localeCompare(left.updatedAt) ||
      right.createdAt.localeCompare(left.createdAt) ||
      compareText(left.title, right.title) ||
      left.id.localeCompare(right.id)
    );
  }

  if (sort === "created-desc") {
    return (
      right.createdAt.localeCompare(left.createdAt) ||
      right.updatedAt.localeCompare(left.updatedAt) ||
      compareText(left.title, right.title) ||
      left.id.localeCompare(right.id)
    );
  }

  const titleComparison = compareText(left.title, right.title);
  return (
    (sort === "title-desc" ? -titleComparison : titleComparison) ||
    right.createdAt.localeCompare(left.createdAt) ||
    left.id.localeCompare(right.id)
  );
}

function compareText(left: string, right: string) {
  return (
    left.localeCompare(right, undefined, { sensitivity: "base" }) ||
    left.localeCompare(right)
  );
}

function formatMarkdownDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown"
    : date.toISOString().slice(0, 10);
}

function removeLeadingDocumentHeading(content: string) {
  const heading = content.match(/^#[ \t]+.+?[ \t]*#*[ \t]*(?:\r?\n|$)/);
  if (!heading) return content;

  return content.slice(heading[0].length).replace(/^\r?\n/, "");
}

function escapeMarkdownInline(value: string) {
  return value.replace(/([\\`*_[\]<>#])/g, "\\$1");
}

function isEditableArchitectureNote(
  value: unknown,
): value is EditableArchitectureNote {
  if (!value || typeof value !== "object") return false;

  const note = value as Record<string, unknown>;
  return (
    typeof note.id === "string" &&
    typeof note.title === "string" &&
    typeof note.type === "string" &&
    noteTypeSet.has(note.type) &&
    Array.isArray(note.tags) &&
    note.tags.every((tag) => typeof tag === "string") &&
    typeof note.content === "string" &&
    typeof note.createdAt === "string" &&
    typeof note.updatedAt === "string"
  );
}
