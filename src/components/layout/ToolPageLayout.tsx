import { Link } from "react-router-dom";
import { Button } from "flowbite-react";
import { useState } from "react";
import type { ReactNode } from "react";
import type { ToolPageLayoutProps } from "../../types/toolPage";
import { SectionHeader } from "../common/SectionHeader";

interface ToolSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

function ToolSection({ title, description, children }: ToolSectionProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6">
      <SectionHeader title={title} description={description} />
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function ToolPageLayout({
  title,
  description,
  breadcrumbs,
  overviewTitle,
  overview,
  inputs,
  outputs,
  actions,
  examples,
  notes,
  toast,
}: ToolPageLayoutProps) {
  const [areExamplesVisible, setAreExamplesVisible] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
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

      <ToolSection title="Tool Overview">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-950 dark:text-white">
            {overviewTitle}
          </h2>
          <div className="text-sm leading-7 text-gray-600 dark:text-gray-300">
            {overview}
          </div>
        </div>
      </ToolSection>

      <div className="grid gap-6 xl:grid-cols-2">
        <ToolSection title="Tool Inputs">{inputs}</ToolSection>
        <ToolSection title="Tool Outputs">{outputs}</ToolSection>
      </div>

      <ToolSection
        title="Tool Actions"
        description="Run the operation, manage the result, or reset the tool state."
      >
        {actions}
      </ToolSection>

      <section className="flex flex-col gap-5">
        <SectionHeader
          title="Tool Examples"
          description="Use these known values to verify the tool behavior quickly."
          action={
            <Button
              color="light"
              size="sm"
              onClick={() => setAreExamplesVisible((current) => !current)}
            >
              {areExamplesVisible ? "Hide Examples" : "Show Examples"}
            </Button>
          }
        />
        {areExamplesVisible ? (
          <div className="grid gap-4 md:grid-cols-2">
            {examples.map((example) => (
              <div
                key={example.title}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                  {example.title}
                </h2>
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

      {notes ? <ToolSection title="Tool Notes">{notes}</ToolSection> : null}
      {toast}
    </div>
  );
}
