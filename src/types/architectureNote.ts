export const architectureNoteTypes = [
  "General",
  "System Overview",
  "Integration",
  "Security",
  "Data",
  "Deployment",
  "Operations",
  "Open Question",
] as const;

export type ArchitectureNoteType = (typeof architectureNoteTypes)[number];

export interface EditableArchitectureNote {
  id: string;
  title: string;
  type: ArchitectureNoteType;
  tags: string[];
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArchitectureNoteTemplate {
  name: string;
  description: string;
  title: string;
  type: ArchitectureNoteType;
  suggestedTags: readonly string[];
  content: string;
}
