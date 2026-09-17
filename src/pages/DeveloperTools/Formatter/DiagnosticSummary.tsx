import type { ValidationDiagnostic } from "../../../types/validationDiagnostic";

interface DiagnosticSummaryProps {
  id: string;
  diagnostic: ValidationDiagnostic;
  onFocusDiagnostic?: () => void;
}

export function DiagnosticSummary({
  id,
  diagnostic,
  onFocusDiagnostic,
}: DiagnosticSummaryProps) {
  const formatLabel = diagnostic.format.toUpperCase();
  const hasLocation = Boolean(diagnostic.line && diagnostic.column);

  return (
    <div
      id={id}
      className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-950 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100"
      role="alert"
      tabIndex={0}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-red-700 text-sm font-bold dark:border-red-300"
        >
          !
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Invalid {formatLabel}</p>
          {hasLocation ? (
            <p className="mt-1 text-sm font-medium">
              Line {diagnostic.line}, Column {diagnostic.column}
            </p>
          ) : null}
          <p className="mt-2 text-sm leading-6">{diagnostic.message}</p>
          {hasLocation && onFocusDiagnostic ? (
            <button
              type="button"
              onClick={onFocusDiagnostic}
              className="mt-3 rounded-md border border-red-400 bg-white px-3 py-1.5 text-sm font-semibold text-red-800 hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none dark:border-red-700 dark:bg-gray-900 dark:text-red-200 dark:hover:bg-red-950 dark:focus:ring-offset-gray-900"
            >
              Go to error
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
