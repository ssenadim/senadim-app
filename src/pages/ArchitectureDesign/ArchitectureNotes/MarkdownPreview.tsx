import ReactMarkdown from "react-markdown";

export function MarkdownPreview({ content }: { content: string }) {
  if (!content.trim()) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-950/60 dark:text-gray-400">
        Start writing Markdown to preview your architecture note.
      </div>
    );
  }

  return (
    <div className="min-h-80 min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-700 sm:p-5 dark:border-gray-700 dark:bg-gray-950/60 dark:text-gray-200">
      <ReactMarkdown
        skipHtml
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 text-2xl font-bold tracking-tight text-gray-950 dark:text-white">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-6 mb-3 text-xl font-semibold text-gray-950 first:mt-0 dark:text-white">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-5 mb-2 text-lg font-semibold text-gray-950 first:mt-0 dark:text-white">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mt-4 mb-2 font-semibold text-gray-950 dark:text-white">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="mt-4 mb-2 text-sm font-semibold text-gray-950 dark:text-white">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="mt-4 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              {children}
            </h6>
          ),
          p: ({ children }) => (
            <p className="my-3 leading-7 first:mt-0 last:mb-0">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-950 dark:text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="my-3 list-disc space-y-1 pl-6">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 list-decimal space-y-1 pl-6">{children}</ol>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="font-medium text-cyan-700 underline decoration-cyan-300 underline-offset-2 hover:text-cyan-900 dark:text-cyan-300 dark:hover:text-cyan-100"
            >
              {children}
            </a>
          ),
          code: ({ children, className }) => (
            <code
              className={`${className ?? ""} rounded bg-gray-200 px-1.5 py-0.5 font-mono text-sm text-gray-900 dark:bg-gray-800 dark:text-gray-100`}
            >
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="my-4 max-w-full overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm leading-6 text-gray-100 dark:bg-black [&_code]:block [&_code]:min-w-max [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-cyan-300 bg-cyan-50/70 py-1 pr-3 pl-4 text-gray-600 italic dark:border-cyan-800 dark:bg-cyan-950/30 dark:text-gray-300">
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="my-6 border-0 border-t border-gray-300 dark:border-gray-700" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
