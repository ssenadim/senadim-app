export type ValidationSeverity = "error" | "warning";

export interface ValidationDiagnostic {
  message: string;
  severity: ValidationSeverity;
  format: "json" | "xml" | "html";
  line?: number;
  column?: number;
  startOffset?: number;
  endOffset?: number;
  length?: number;
  code?: string;
  type?: "range" | "position" | "general";
}
