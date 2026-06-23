import { Button } from "flowbite-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import type { ToolBreadcrumbItem, ToolExample } from "../../types/toolPage";
import { SectionHeader } from "../common/SectionHeader";

interface ToolHeaderProps {
  title: string;
  description: string;
  breadcrumbs: ToolBreadcrumbItem[];
}

interface ToolDescriptionProps {
  title: string;
  children: ReactNode;
  isCollapsible?: boolean;
  isVisible?: boolean;
  onToggle?: () => void;
  toggleLabel?: string;
}

interface ToolSectionProps {
  title?: string | null;
  description?: string;
  children: ReactNode;
}

interface ToolExamplesProps {
  examples: ToolExample[];
  isVisible: boolean;
  onToggle: () => void;
  onExampleSelect?: (example: ToolExample) => void;
}

interface ToolNotesProps {
  children: ReactNode;
  isCollapsible?: boolean;
  isVisible?: boolean;
  onToggle?: () => void;
}

function ToolSection({ title, description, children }: ToolSectionProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6">
      {title ? <SectionHeader title={title} description={description} /> : null}
      <div className={title ? "mt-5" : undefined}>{children}</div>
    </section>
  );
}

export function ToolHeader({
  title,
  description,
  breadcrumbs,
}: ToolHeaderProps) {
  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          {breadcrumbs.map((item, index) => (
            <li key={item.label} className="flex items-center gap-2">
              {index > 0 ? <span>/</span> : null}
              {item.path ? (
                <Link
                  to={item.path}
                  className="font-medium text-cyan-700 hover:text-cyan-900 dark:text-cyan-300 dark:hover:text-cyan-200"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <header className="max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-950 dark:text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </header>
    </>
  );
}

export function ToolDescription({
  title,
  children,
  isCollapsible,
  isVisible = true,
  onToggle,
  toggleLabel,
}: ToolDescriptionProps) {
  if (isCollapsible) {
    return (
      <section>
        <Button color="light" size="sm" onClick={onToggle}>
          {isVisible ? "\u25BC" : "\u25B6"} {toggleLabel ?? title}
        </Button>
        {isVisible ? (
          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-950 dark:text-white">
                {title}
              </h2>
              <div className="text-sm leading-7 text-gray-600 dark:text-gray-300">
                {children}
              </div>
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <ToolSection title={title}>
      <div className="text-sm leading-7 text-gray-600 dark:text-gray-300">
        {children}
      </div>
    </ToolSection>
  );
}

export function ToolInputArea({
  children,
  title = "Tool Inputs",
}: {
  children: ReactNode;
  title?: string | null;
}) {
  return <ToolSection title={title}>{children}</ToolSection>;
}

export function ToolResultArea({ children }: { children: ReactNode }) {
  return <ToolSection title="Tool Outputs">{children}</ToolSection>;
}

export function ToolExamples({
  examples,
  isVisible,
  onToggle,
  onExampleSelect,
}: ToolExamplesProps) {
  return (
    <section className="flex flex-col gap-5">
      <SectionHeader
        title="Tool Examples"
        description="Use these known values to verify the tool behavior quickly."
        action={
          <Button color="light" size="sm" onClick={onToggle}>
            {isVisible ? "Hide Examples" : "Show Examples"}
          </Button>
        }
      />
      {isVisible ? (
        <div className="grid gap-4 md:grid-cols-2">
          {examples.map((example) => (
            <div
              key={example.title}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                {example.title}
              </h2>
              {onExampleSelect ? (
                <div className="mt-3">
                  <Button
                    color="light"
                    size="xs"
                    onClick={() => onExampleSelect(example)}
                  >
                    Use Example
                  </Button>
                </div>
              ) : null}
              <div className="mt-4 grid gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    {example.inputLabel}
                  </p>
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-50 p-3 text-sm text-gray-800 dark:bg-gray-950 dark:text-gray-200">
                    {example.input}
                  </pre>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    {example.outputLabel}
                  </p>
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-50 p-3 text-sm text-gray-800 dark:bg-gray-950 dark:text-gray-200">
                    {example.output}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function ToolNotes({
  children,
  isCollapsible,
  isVisible = true,
  onToggle,
}: ToolNotesProps) {
  return (
    <section className="flex flex-col gap-5">
      <SectionHeader
        title="Tool Notes"
        action={
          isCollapsible ? (
            <Button color="light" size="sm" onClick={onToggle}>
              {isVisible ? "Hide Notes" : "Show Notes"}
            </Button>
          ) : undefined
        }
      />
      {isVisible ? (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6">
          {children}
        </div>
      ) : null}
    </section>
  );
}
