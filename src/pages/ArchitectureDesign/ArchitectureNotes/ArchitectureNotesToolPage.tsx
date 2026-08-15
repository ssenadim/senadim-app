import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Select, TextInput, Textarea } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { ToolToast } from "../../../components/common/ToolToast";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { architectureNoteTemplates } from "../../../data/architectureNoteTemplates";
import { usePageTitle } from "../../../hooks/usePageTitle";
import {
  architectureNoteTypes,
  type ArchitectureNoteFilters,
  type ArchitectureNoteSort,
  type ArchitectureNoteType,
  type EditableArchitectureNote,
} from "../../../types/architectureNote";
import type { ToastMessage, ToastTone } from "../../../types/toast";
import {
  addUniqueTag,
  buildArchitectureNoteMarkdown,
  createArchitectureNoteAdrHandoff,
  createArchitectureNote,
  createArchitectureNoteFromTemplate,
  filterAndSortArchitectureNotes,
  getArchitectureNoteFilename,
  getArchitectureNoteTags,
  hasNoteChanges,
  loadArchitectureNotes,
  prepareNoteForSave,
  storeArchitectureNotes,
  upsertArchitectureNote,
} from "../../../utils/architectureNotes";
import { routePaths } from "../../../utils/routes";
import { MarkdownPreview } from "./MarkdownPreview";

const defaultNoteFilters: ArchitectureNoteFilters = {
  search: "",
  type: "",
  tag: "",
  sort: "updated-desc",
};

const architectureNoteSortOptions: ReadonlyArray<{
  value: ArchitectureNoteSort;
  label: string;
}> = [
  { value: "updated-desc", label: "Recently Updated" },
  { value: "created-desc", label: "Recently Created" },
  { value: "title-asc", label: "Title A-Z" },
  { value: "title-desc", label: "Title Z-A" },
];

function createNoteId() {
  return globalThis.crypto?.randomUUID?.() ?? `architecture-note-${Date.now()}`;
}

function formatNoteDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function ArchitectureNotesToolPage() {
  usePageTitle("Architecture Notes");
  const navigate = useNavigate();

  const [notes, setNotes] = useState<EditableArchitectureNote[]>(() =>
    loadArchitectureNotes(window.localStorage),
  );
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    () => loadArchitectureNotes(window.localStorage)[0]?.id ?? null,
  );
  const [draft, setDraft] = useState<EditableArchitectureNote | null>(() => {
    const firstNote = loadArchitectureNotes(window.localStorage)[0];
    return firstNote ? { ...firstNote, tags: [...firstNote.tags] } : null;
  });
  const [tagInput, setTagInput] = useState("");
  const [filters, setFilters] =
    useState<ArchitectureNoteFilters>(defaultNoteFilters);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const savedSelection = useMemo(
    () => notes.find((note) => note.id === selectedNoteId),
    [notes, selectedNoteId],
  );
  const isDirty = Boolean(
    draft && (!savedSelection || hasNoteChanges(savedSelection, draft)),
  );
  const availableTags = useMemo(() => getArchitectureNoteTags(notes), [notes]);
  const visibleNotes = useMemo(
    () => filterAndSortArchitectureNotes(notes, filters),
    [filters, notes],
  );
  const hasActiveFilters =
    Boolean(filters.search || filters.type || filters.tag) ||
    filters.sort !== defaultNoteFilters.sort;
  const hasResultFilters = Boolean(
    filters.search || filters.type || filters.tag,
  );

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    if (
      filters.tag &&
      !availableTags.some(
        (tag) => tag.toLocaleLowerCase() === filters.tag.toLocaleLowerCase(),
      )
    ) {
      setFilters((current) => ({ ...current, tag: "" }));
    }
  }, [availableTags, filters.tag]);

  function showToast(tone: ToastTone, text: string) {
    setToast({ id: Date.now(), tone, text });
  }

  function startNewNote() {
    setSelectedNoteId(null);
    setDraft(createArchitectureNote(createNoteId()));
    setTagInput("");
  }

  function startNoteFromTemplate(
    template: (typeof architectureNoteTemplates)[number],
  ) {
    setSelectedNoteId(null);
    setDraft(createArchitectureNoteFromTemplate(createNoteId(), template));
    setTagInput("");
  }

  function selectNote(note: EditableArchitectureNote) {
    setSelectedNoteId(note.id);
    setDraft({ ...note, tags: [...note.tags] });
    setTagInput("");
  }

  function updateDraft(patch: Partial<EditableArchitectureNote>) {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  }

  function updateFilters(patch: Partial<ArchitectureNoteFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  function clearFilters() {
    setFilters(defaultNoteFilters);
  }

  function addTag() {
    if (!draft) return;
    const nextTags = addUniqueTag(draft.tags, tagInput);

    if (nextTags === draft.tags) {
      if (tagInput.trim())
        showToast("info", "That tag is already on this note.");
      return;
    }

    updateDraft({ tags: nextTags });
    setTagInput("");
  }

  function saveNote() {
    if (!draft) return;
    if (!draft.title.trim()) {
      showToast("failure", "Enter a title before saving the note.");
      return;
    }

    const savedNote = notes.find((note) => note.id === selectedNoteId);
    const noteToSave = prepareNoteForSave(draft, savedNote);
    const nextNotes = upsertArchitectureNote(notes, noteToSave);

    try {
      storeArchitectureNotes(window.localStorage, nextNotes);
      setNotes(nextNotes);
      setSelectedNoteId(noteToSave.id);
      setDraft({ ...noteToSave, tags: [...noteToSave.tags] });
      showToast("success", "Architecture note saved locally.");
    } catch {
      showToast("failure", "The note could not be saved in browser storage.");
    }
  }

  function deleteNote() {
    if (!selectedNoteId || !savedSelection) return;
    if (
      !window.confirm(
        `Delete “${savedSelection.title}”? This cannot be undone.`,
      )
    )
      return;

    const nextNotes = notes.filter((note) => note.id !== selectedNoteId);

    try {
      storeArchitectureNotes(window.localStorage, nextNotes);
      setNotes(nextNotes);
      setSelectedNoteId(nextNotes[0]?.id ?? null);
      setDraft(
        nextNotes[0] ? { ...nextNotes[0], tags: [...nextNotes[0].tags] } : null,
      );
      setTagInput("");
      showToast("success", "Architecture note deleted.");
    } catch {
      showToast(
        "failure",
        "The note could not be deleted from browser storage.",
      );
    }
  }

  async function copyMarkdown() {
    if (!savedSelection) return;

    try {
      await navigator.clipboard.writeText(
        buildArchitectureNoteMarkdown(savedSelection),
      );
      showToast("success", "Architecture note markdown copied.");
    } catch {
      showToast("failure", "Copy failed. Please copy the note manually.");
    }
  }

  function downloadMarkdown() {
    if (!savedSelection) return;

    const markdown = buildArchitectureNoteMarkdown(savedSelection);
    const blob = new Blob([markdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = getArchitectureNoteFilename(savedSelection.title);
    link.click();
    URL.revokeObjectURL(url);
    showToast("success", "Architecture note markdown downloaded.");
  }

  function createAdrFromNote() {
    if (!savedSelection) return;

    navigate(routePaths.adrGenerator, {
      state: createArchitectureNoteAdrHandoff(savedSelection),
    });
  }

  return (
    <ToolPageLayout
      title="Architecture Notes"
      description="Capture system context, integration details, security considerations and open architecture questions without the formality of an ADR."
      breadcrumbs={[
        { label: "Architecture & Design", path: routePaths.architectureDesign },
        { label: "Architecture Notes" },
      ]}
      overviewTitle="Lightweight architecture documentation"
      overviewCollapsible
      overviewToggleLabel="About Architecture Notes"
      overview={
        <p>
          Notes stay in this browser and support Markdown text. Use the ADR
          Generator when a formal decision record is required.
        </p>
      }
      inputTitle={null}
      inputs={
        <div className="grid min-w-0 gap-5">
          <NoteTemplates onUseTemplate={startNoteFromTemplate} />
          <NotesToolbar
            filters={filters}
            availableTags={availableTags}
            hasActiveFilters={hasActiveFilters}
            resultCount={visibleNotes.length}
            totalCount={notes.length}
            onChange={updateFilters}
            onClear={clearFilters}
          />
          <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(15rem,0.36fr)_minmax(0,1fr)]">
            <NotesList
              notes={visibleNotes}
              totalNotes={notes.length}
              hasResultFilters={hasResultFilters}
              selectedNoteId={selectedNoteId}
              onNew={startNewNote}
              onSelect={selectNote}
              onClearFilters={clearFilters}
            />
            {draft ? (
              <NoteEditor
                draft={draft}
                isExisting={Boolean(savedSelection)}
                isDirty={isDirty}
                tagInput={tagInput}
                onTagInputChange={setTagInput}
                onAddTag={addTag}
                onChange={updateDraft}
                onCopyMarkdown={copyMarkdown}
                onCreateAdr={createAdrFromNote}
                onDelete={deleteNote}
                onDownloadMarkdown={downloadMarkdown}
                onSave={saveNote}
              />
            ) : (
              <EmptyState onCreate={startNewNote} />
            )}
          </div>
        </div>
      }
      examples={[]}
      notes={
        <p className="text-sm leading-7 text-gray-600 dark:text-gray-300">
          Notes are stored only in this browser. Clearing site data removes
          them, and no note content is sent to an external service.
        </p>
      }
      notesCollapsible
      toast={<ToolToast toast={toast} />}
    />
  );
}

function NotesToolbar({
  filters,
  availableTags,
  hasActiveFilters,
  resultCount,
  totalCount,
  onChange,
  onClear,
}: {
  filters: ArchitectureNoteFilters;
  availableTags: string[];
  hasActiveFilters: boolean;
  resultCount: number;
  totalCount: number;
  onChange: (patch: Partial<ArchitectureNoteFilters>) => void;
  onClear: () => void;
}) {
  const resultLabel = `${resultCount} ${resultCount === 1 ? "result" : "results"}`;
  const hasResultFilters = Boolean(
    filters.search || filters.type || filters.tag,
  );

  return (
    <section
      className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
      aria-labelledby="architecture-notes-filter-heading"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2
          id="architecture-notes-filter-heading"
          className="text-sm font-semibold text-gray-950 dark:text-white"
        >
          Find Notes
        </h2>
        <p
          className="text-xs font-medium text-gray-500 dark:text-gray-400"
          aria-live="polite"
        >
          {hasResultFilters ? `${resultLabel} of ${totalCount}` : resultLabel}
        </p>
      </div>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(16rem,1.6fr)_repeat(3,minmax(9rem,1fr))_auto] xl:items-end">
        <div className="min-w-0 sm:col-span-2 xl:col-span-1">
          <label
            htmlFor="architecture-notes-search"
            className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300"
          >
            Search
          </label>
          <TextInput
            id="architecture-notes-search"
            type="search"
            sizing="sm"
            value={filters.search}
            placeholder="Search architecture notes..."
            onChange={(event) => onChange({ search: event.target.value })}
          />
        </div>
        <div className="min-w-0">
          <label
            htmlFor="architecture-notes-type-filter"
            className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300"
          >
            Note Type
          </label>
          <Select
            id="architecture-notes-type-filter"
            sizing="sm"
            value={filters.type}
            onChange={(event) =>
              onChange({
                type: event.target.value as ArchitectureNoteType | "",
              })
            }
          >
            <option value="">All Types</option>
            {architectureNoteTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-0">
          <label
            htmlFor="architecture-notes-tag-filter"
            className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300"
          >
            Tag
          </label>
          <Select
            id="architecture-notes-tag-filter"
            sizing="sm"
            value={filters.tag}
            onChange={(event) => onChange({ tag: event.target.value })}
          >
            <option value="">All Tags</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-0">
          <label
            htmlFor="architecture-notes-sort"
            className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300"
          >
            Sort
          </label>
          <Select
            id="architecture-notes-sort"
            sizing="sm"
            value={filters.sort}
            onChange={(event) =>
              onChange({ sort: event.target.value as ArchitectureNoteSort })
            }
          >
            {architectureNoteSortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        {hasActiveFilters ? (
          <Button
            color="light"
            size="xs"
            className="justify-self-start whitespace-nowrap xl:mb-0.5"
            onClick={onClear}
          >
            Clear filters
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function NoteTemplates({
  onUseTemplate,
}: {
  onUseTemplate: (template: (typeof architectureNoteTemplates)[number]) => void;
}) {
  return (
    <section className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 sm:p-5 dark:border-gray-700 dark:bg-gray-900">
      <div>
        <h2 className="font-semibold text-gray-950 dark:text-white">
          Architecture Note Templates
        </h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Start a new unsaved note with a practical Markdown structure.
        </p>
      </div>
      <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {architectureNoteTemplates.map((template) => (
          <article
            key={template.name}
            className="flex min-w-0 flex-col rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-950"
          >
            <h3 className="text-sm font-semibold text-gray-950 dark:text-white">
              {template.name}
            </h3>
            <p className="mt-1 flex-1 text-xs leading-5 text-gray-600 dark:text-gray-300">
              {template.description}
            </p>
            <Button
              color="light"
              size="xs"
              className="mt-3 self-start"
              onClick={() => onUseTemplate(template)}
              aria-label={`Use ${template.name} template`}
            >
              Use Template
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}

function NotesList({
  notes,
  totalNotes,
  hasResultFilters,
  selectedNoteId,
  onNew,
  onSelect,
  onClearFilters,
}: {
  notes: EditableArchitectureNote[];
  totalNotes: number;
  hasResultFilters: boolean;
  selectedNoteId: string | null;
  onNew: () => void;
  onSelect: (note: EditableArchitectureNote) => void;
  onClearFilters: () => void;
}) {
  const noteCount = `${notes.length} ${notes.length === 1 ? "note" : "notes"}`;

  return (
    <aside className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-950 dark:text-white">Notes</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {hasResultFilters
              ? `${notes.length} of ${totalNotes} notes`
              : noteCount}
          </p>
        </div>
        <Button color="blue" size="xs" onClick={onNew}>
          New Note
        </Button>
      </div>

      {notes.length > 0 ? (
        <div className="mt-4 grid max-h-[42rem] gap-2 overflow-y-auto pr-1">
          {notes.map((note) => {
            const selected = note.id === selectedNoteId;
            return (
              <button
                key={note.id}
                type="button"
                aria-current={selected ? "true" : undefined}
                onClick={() => onSelect(note)}
                className={`min-w-0 rounded-lg border p-3 text-left transition focus:outline-2 focus:outline-offset-2 focus:outline-cyan-600 ${
                  selected
                    ? "border-cyan-400 bg-cyan-50 dark:border-cyan-700 dark:bg-cyan-950/40"
                    : "border-gray-200 bg-white hover:border-cyan-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-cyan-800"
                }`}
              >
                <span className="flex min-w-0 items-start justify-between gap-2">
                  <span className="min-w-0 text-sm font-semibold break-words text-gray-950 dark:text-white">
                    {note.title}
                  </span>
                  {selected ? (
                    <span className="shrink-0 rounded-full bg-cyan-100 px-2 py-0.5 text-[0.6875rem] font-semibold text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100">
                      Selected
                    </span>
                  ) : null}
                </span>
                <span className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge color="gray">{note.type}</Badge>
                  <time
                    dateTime={note.updatedAt}
                    className="text-xs text-gray-500 dark:text-gray-400"
                  >
                    Updated {formatNoteDate(note.updatedAt)}
                  </time>
                </span>
                {note.tags.length > 0 ? (
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="max-w-full rounded-full bg-gray-100 px-2 py-0.5 text-xs break-all text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : totalNotes === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm leading-6 text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
          No saved notes yet. Create one to begin capturing architecture
          context.
        </p>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
            No architecture notes match your current search or filters.
          </p>
          <Button
            color="light"
            size="xs"
            className="mt-3"
            onClick={onClearFilters}
          >
            Clear filters
          </Button>
        </div>
      )}
    </aside>
  );
}

function NoteEditor({
  draft,
  isExisting,
  isDirty,
  tagInput,
  onTagInputChange,
  onAddTag,
  onChange,
  onCopyMarkdown,
  onCreateAdr,
  onDelete,
  onDownloadMarkdown,
  onSave,
}: {
  draft: EditableArchitectureNote;
  isExisting: boolean;
  isDirty: boolean;
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onAddTag: () => void;
  onChange: (patch: Partial<EditableArchitectureNote>) => void;
  onCopyMarkdown: () => void;
  onCreateAdr: () => void;
  onDelete: () => void;
  onDownloadMarkdown: () => void;
  onSave: () => void;
}) {
  const savedActionsDescription = !isExisting
    ? "Save this note to enable Markdown export and ADR handoff."
    : isDirty
      ? "These actions use the last saved version. Save first to include your current changes."
      : "Copy or download the saved Markdown, or transfer its context to the ADR Generator.";

  return (
    <section className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 sm:p-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-start sm:justify-between dark:border-gray-700">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-gray-950 dark:text-white">
              {isExisting ? "Edit Note" : "New Note"}
            </h2>
            {isDirty ? (
              <Badge color="warning">Unsaved changes</Badge>
            ) : (
              <Badge color="success">Saved</Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Preview updates as you type. Changes are stored only when you save.
          </p>
        </div>
        <div className="flex max-w-full flex-wrap gap-2 sm:justify-end">
          <Button color="blue" size="sm" onClick={onSave}>
            Save
          </Button>
          <Button
            color="light"
            size="sm"
            disabled={!isExisting}
            onClick={onDelete}
            aria-label={`Delete ${draft.title || "architecture note"}`}
          >
            Delete
          </Button>
        </div>
      </div>
      <div className="mt-4 flex min-w-0 flex-col gap-3 rounded-lg bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between dark:bg-gray-950/70">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
            Saved note actions
          </p>
          <p
            id="architecture-note-saved-actions-description"
            className="mt-0.5 text-xs leading-5 text-gray-500 dark:text-gray-400"
          >
            {savedActionsDescription}
          </p>
        </div>
        <div className="flex max-w-full flex-wrap gap-2 sm:shrink-0 sm:justify-end">
          <Button
            color="light"
            size="xs"
            disabled={!isExisting}
            onClick={onCopyMarkdown}
            aria-describedby="architecture-note-saved-actions-description"
          >
            Copy Markdown
          </Button>
          <Button
            color="light"
            size="xs"
            disabled={!isExisting}
            onClick={onDownloadMarkdown}
            aria-describedby="architecture-note-saved-actions-description"
          >
            Download Markdown
          </Button>
          <Button
            color="light"
            size="xs"
            disabled={!isExisting}
            onClick={onCreateAdr}
            aria-describedby="architecture-note-saved-actions-description architecture-note-adr-description"
          >
            Create ADR from Note
          </Button>
        </div>
      </div>
      <p
        id="architecture-note-adr-description"
        className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400"
      >
        ADR handoff transfers the saved title, tags and Markdown into a new ADR
        draft. It does not create an architecture decision automatically.
      </p>
      <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2">
        <div className="min-w-0 sm:col-span-2">
          <label
            htmlFor="architecture-note-title"
            className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
          >
            Title
          </label>
          <TextInput
            id="architecture-note-title"
            sizing="lg"
            className="min-w-0"
            value={draft.title}
            onChange={(event) => onChange({ title: event.target.value })}
            placeholder="Name this architecture note"
          />
        </div>
        <div className="min-w-0">
          <label
            htmlFor="architecture-note-type"
            className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
          >
            Note Type
          </label>
          <Select
            id="architecture-note-type"
            value={draft.type}
            onChange={(event) =>
              onChange({ type: event.target.value as ArchitectureNoteType })
            }
          >
            {architectureNoteTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-0">
          <label
            htmlFor="architecture-note-tag"
            className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
          >
            Tags
          </label>
          <div className="flex min-w-0 gap-2">
            <TextInput
              id="architecture-note-tag"
              aria-describedby="architecture-note-tag-help"
              className="min-w-0 flex-1"
              value={tagInput}
              onChange={(event) => onTagInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === ",") {
                  event.preventDefault();
                  onAddTag();
                }
              }}
              placeholder="authentication"
            />
            <Button color="light" size="sm" onClick={onAddTag}>
              Add
            </Button>
          </div>
          <p
            id="architecture-note-tag-help"
            className="mt-1.5 text-xs text-gray-500 dark:text-gray-400"
          >
            Press Enter or type a comma to add a tag.
          </p>
        </div>
        {draft.tags.length > 0 ? (
          <div
            className="flex min-w-0 flex-wrap gap-2 sm:col-span-2"
            aria-label="Note tags"
          >
            {draft.tags.map((tag) => (
              <span
                key={tag}
                className="flex max-w-full items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200"
              >
                <span className="break-all">{tag}</span>
                <button
                  type="button"
                  className="rounded px-1 hover:bg-cyan-100 focus:outline-2 focus:outline-cyan-600 dark:hover:bg-cyan-900"
                  aria-label={"Remove " + tag + " tag"}
                  onClick={() =>
                    onChange({
                      tags: draft.tags.filter((item) => item !== tag),
                    })
                  }
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : null}
        <div className="grid min-w-0 gap-4 sm:col-span-2 lg:grid-cols-2">
          <div className="min-w-0">
            <label
              htmlFor="architecture-note-content"
              className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
            >
              Markdown Editor
            </label>
            <Textarea
              id="architecture-note-content"
              rows={18}
              className="min-h-80 w-full max-w-full resize-y font-mono"
              value={draft.content}
              onChange={(event) => onChange({ content: event.target.value })}
              placeholder="Capture system context, integration details, constraints, risks or open questions using Markdown..."
            />
          </div>
          <div className="min-w-0">
            <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
              Markdown Preview
            </h3>
            <MarkdownPreview content={draft.content} />
          </div>
        </div>
      </div>
      <dl className="mt-5 grid gap-2 border-t border-gray-200 pt-4 text-xs text-gray-500 sm:grid-cols-2 dark:border-gray-700 dark:text-gray-400">
        <div>
          <dt className="font-semibold uppercase">Created</dt>
          <dd className="mt-1 break-words">
            {formatNoteDate(draft.createdAt)}
          </dd>
        </div>
        <div>
          <dt className="font-semibold uppercase">Updated</dt>
          <dd className="mt-1 break-words">
            {formatNoteDate(draft.updatedAt)}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="flex min-h-96 min-w-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-900">
      <div className="max-w-lg">
        <h2 className="text-xl font-semibold text-gray-950 dark:text-white">
          No note selected
        </h2>
        <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
          Select a saved note from the list, or start a new note to capture
          architecture context.
        </p>
        <Button color="blue" className="mt-5" onClick={onCreate}>
          New Note
        </Button>
      </div>
    </section>
  );
}
