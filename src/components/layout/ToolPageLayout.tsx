import { Link } from "react-router-dom";
import type { ToolPageLayoutProps } from "../../types/toolPage";
import { SectionHeader } from "../common/SectionHeader";

export function ToolPageLayout({
  title,
  description,
  breadcrumbs,
  explanationTitle,
  explanation,
  examples,
  children,
}: ToolPageLayoutProps) {
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

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <SectionHeader title={explanationTitle} />
        <div className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
          {explanation}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeader
          title="Examples"
          description="Use these known values to verify the tool behavior quickly."
        />
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
      </section>

      {children}
    </div>
  );
}
