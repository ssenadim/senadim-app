import { Button } from "flowbite-react";

interface CopyReadyOutputProps {
  copyLabel?: string;
  formatLabel: string;
  onCopy: (value: string, label: string) => void | Promise<void>;
  value: string;
}

export function CopyReadyOutput({
  copyLabel,
  formatLabel,
  onCopy,
  value,
}: CopyReadyOutputProps) {
  const actionLabel = copyLabel ?? formatLabel;

  return (
    <section
      aria-label={`${formatLabel} configuration`}
      className="min-w-0 overflow-hidden rounded-lg border border-gray-200 p-4 dark:border-gray-700"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-950 dark:text-white">
          {formatLabel}
        </h3>
        <Button
          color="light"
          size="xs"
          onClick={() => void onCopy(value, actionLabel)}
          className="shrink-0 whitespace-nowrap"
        >
          Copy {actionLabel}
        </Button>
      </div>
      <pre
        role="region"
        aria-label={`${formatLabel} code`}
        tabIndex={0}
        className="w-full max-w-full overflow-x-auto overscroll-x-contain rounded-lg bg-gray-50 p-3 text-sm whitespace-pre text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 dark:bg-gray-950 dark:text-gray-100"
      >
        {value}
      </pre>
    </section>
  );
}
