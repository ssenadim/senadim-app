import {
  architectureNoteTypes,
  type ArchitectureNoteTemplate,
  type EditableArchitectureNote,
} from "../types/architectureNote";

export const architectureNotesStorageKey = "freeshot.architectureNotes.v1";

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
