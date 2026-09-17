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
  const content = (
    <div className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-red-700 text-xs font-bold dark:border-red-300"
      >
        !
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="font-semibold">Invalid {formatLabel}</p>
          {hasLocation ? (
            <p className="text-sm font-medium">
              Line {diagnostic.line}, Column {diagnostic.column}
            </p>
          ) : null}
        </div>
        <p className="mt-1 text-sm leading-5 break-words">
          {diagnostic.message}
        </p>
        {onFocusDiagnostic ? (
          <span className="mt-1.5 inline-flex text-xs font-semibold underline decoration-1 underline-offset-2">
            Focus error in editor
          </span>
        ) : null}
      </div>
    </div>
  );

  return (
    <div
      id={id}
      className="min-w-0 rounded-lg border border-red-300 bg-red-50 text-red-950 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100"
      role="alert"
    >
      {onFocusDiagnostic ? (
        <button
          type="button"
          onClick={onFocusDiagnostic}
          className="block w-full rounded-lg p-3 text-left hover:bg-red-100/70 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:outline-none dark:hover:bg-red-950/60 dark:focus:ring-red-400 dark:focus:ring-offset-gray-900"
          aria-label={`Invalid ${formatLabel}. ${hasLocation ? `Line ${diagnostic.line}, Column ${diagnostic.column}. ` : ""}${diagnostic.message} Focus error in editor.`}
        >
          {content}
        </button>
      ) : (
        <div className="p-3" tabIndex={0}>
          {content}
        </div>
      )}
    </div>
  );
}
