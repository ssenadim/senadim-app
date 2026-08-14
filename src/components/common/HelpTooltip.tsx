import { useId, useState } from "react";

interface HelpTooltipProps {
  title: string;
  description: string;
  exampleInput?: string;
  exampleOutput?: string;
}

export function HelpTooltip({
  title,
  description,
  exampleInput,
  exampleOutput,
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={tooltipId}
        aria-label={`Help: ${title}`}
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex size-6 items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 text-xs font-bold text-cyan-800 transition hover:bg-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-200 dark:hover:bg-cyan-900"
      >
        i
      </button>
      {isOpen ? (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute top-8 left-0 z-20 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white p-4 text-left shadow-lg sm:w-80 dark:border-gray-700 dark:bg-gray-900"
        >
          <span className="block text-sm font-semibold text-gray-950 dark:text-white">
            {title}
          </span>
          <span className="mt-2 block text-sm leading-6 text-gray-600 dark:text-gray-300">
            {description}
          </span>
          {exampleInput && exampleOutput ? (
            <span className="mt-3 block rounded-lg bg-gray-50 p-3 font-mono text-xs text-gray-700 dark:bg-gray-950 dark:text-gray-300">
              <span className="block">Input: {exampleInput}</span>
              <span className="mt-1 block">Output: {exampleOutput}</span>
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
