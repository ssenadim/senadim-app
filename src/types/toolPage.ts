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
  explanationTitle: string;
  explanation: ReactNode;
  examples: ToolExample[];
  children: ReactNode;
}
