import type { PropsWithChildren } from "react";

interface PageShellProps extends PropsWithChildren {
  eyebrow?: string;
  title: string;
  description: string;
}

export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: PageShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-3 text-sm font-semibold uppercase text-cyan-700 dark:text-cyan-300">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-bold text-gray-950 dark:text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </header>
      {children}
    </div>
  );
}
