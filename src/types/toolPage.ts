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
  inputs: ReactNode;
  outputs: ReactNode;
  actions: ReactNode;
  examples: ToolExample[];
  notes?: ReactNode;
  notesCollapsible?: boolean;
  toast?: ReactNode;
}
