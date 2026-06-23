import type { ReactNode } from "react";

export interface ToolBreadcrumbItem {
  label: string;
  path?: string;
}

export interface ToolExample {
  title: string;
  inputLabel: string;
  input: string;
  outputLabel: string;
  output: string;
}

export interface ToolPageLayoutProps {
  title: string;
  description: string;
  breadcrumbs: ToolBreadcrumbItem[];
  overviewTitle: string;
  overview: ReactNode;
  overviewCollapsible?: boolean;
  overviewToggleLabel?: string;
  inputTitle?: string | null;
  inputs?: ReactNode;
  outputs?: ReactNode;
  examples: ToolExample[];
  onExampleSelect?: (example: ToolExample) => void;
  notes?: ReactNode;
  notesCollapsible?: boolean;
  toast?: ReactNode;
}
