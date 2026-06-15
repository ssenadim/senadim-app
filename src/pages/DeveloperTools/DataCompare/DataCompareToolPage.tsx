import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Checkbox, Textarea } from "flowbite-react";
import { HelpTooltip } from "../../../components/common/HelpTooltip";
import { ToolToast } from "../../../components/common/ToolToast";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { ToolExample } from "../../../types/toolPage";
import type { ToastMessage, ToastTone } from "../../../types/toast";
import {
  compareContent,
  compareFormats,
  supportsIgnoreFormatting,
  type CompareFormat,
  type CompareOptions,
  type CompareResult,
} from "../../../utils/dataCompare";
import { routePaths } from "../../../utils/routes";

const examples: ToolExample[] = [
  {
    title: "JSON",
    inputLabel: "Left",
    input: '{"name":"John","age":30}',
    outputLabel: "Right",
    output: '{\n  "name": "John",\n  "age": 31\n}',
  },
  {
    title: "XML",
    inputLabel: "Left",
    input: "<user><name>John</name></user>",
    outputLabel: "Right",
    output: "<user><name>Jane</name></user>",
  },
  {
    title: "Plain Text",
    inputLabel: "Left",
    input: "Hello World",
    outputLabel: "Right",
    output: "hello world",
  },
];

export function DataCompareToolPage() {
  usePageTitle("Data Compare");

  const [format, setFormat] = useState<CompareFormat>("json");
  const [leftContent, setLeftContent] = useState("");
  const [rightContent, setRightContent] = useState("");
  const [options, setOptions] = useState<CompareOptions>({
    ignoreWhitespace: false,
    ignoreCase: false,
    ignoreFormatting: true,
  });
  const [result, setResult] = useState<CompareResult | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 3200);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const visibleOptions = useMemo(
    () => ({
      ...options,
      ignoreFormatting:
        options.ignoreFormatting && supportsIgnoreFormatting(format),
    }),
    [format, options],
  );

  function showToast(tone: ToastTone, text: string) {
    setToast({ id: Date.now(), tone, text });
  }

  function handleCompare() {
    const comparison = compareContent(
      leftContent,
      rightContent,
      format,
      visibleOptions,
    );

    setResult(comparison);
    showToast(
      comparison.isIdentical ? "success" : "info",
      comparison.isIdentical
        ? "Content is identical."
        : "Differences detected.",
    );
  }

  function handleSwap() {
    setLeftContent(rightContent);
    setRightContent(leftContent);
    setResult(null);
    showToast("info", "Left and right content swapped.");
  }

  function handleClear() {
    setLeftContent("");
    setRightContent("");
    setResult(null);
    showToast("info", "Comparison cleared.");
  }

  async function handleCopyDifferences() {
    if (!result || result.isIdentical) {
      showToast("info", "There are no differences to copy.");
      return;
    }

    const summary = result.differences
      .map(
        (difference) =>
          `Line ${difference.line}\nLeft: ${difference.left}\nRight: ${difference.right}`,
      )
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(summary);
      showToast("success", "Differences copied.");
    } catch {
      showToast("failure", "Copy failed. Please copy the differences manually.");
    }
  }

  return (
    <ToolPageLayout
      title="Data Compare"
      description="Compare JSON, XML, YAML, Java, C# and plain text content with practical noise-reduction options."
      breadcrumbs={[
        { label: "Developer Tools", path: routePaths.developerTools },
        { label: "Data Compare" },
      ]}
      overviewTitle="What is Data Compare?"
      overview={
        <div className="space-y-3">
          <p>Compare structured and unstructured content.</p>
          <p>
            It is useful for APIs, configuration files, source code, and
            troubleshooting.
          </p>
          <p>It helps identify differences quickly.</p>
        </div>
      }
      inputs={
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Format
              </span>
              <HelpTooltip
                title="Format"
                description="Select the content type being compared."
                exampleInput="JSON"
                exampleOutput="Structured JSON comparison"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {compareFormats.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setFormat(item.value);
                    setResult(null);
                  }}
                  className={[
                    "rounded-lg border px-3 py-2 text-sm font-semibold transition",
                    format === item.value
                      ? "border-cyan-600 bg-cyan-50 text-cyan-800 dark:border-cyan-500 dark:bg-cyan-950 dark:text-cyan-200"
                      : "border-gray-200 bg-white text-gray-700 hover:border-cyan-300 hover:text-cyan-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-cyan-700 dark:hover:text-cyan-300",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Comparison Mode
              </span>
              <HelpTooltip
                title="Comparison Mode"
                description="Control how differences are evaluated."
                exampleInput="Ignore Case"
                exampleOutput="HELLO and hello are treated as equal"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <OptionCheckbox
                id="exact-comparison"
                label="Exact Comparison"
                checked={
                  !options.ignoreWhitespace &&
                  !options.ignoreCase &&
                  !options.ignoreFormatting
                }
                onChange={() =>
                  setOptions({
                    ignoreWhitespace: false,
                    ignoreCase: false,
                    ignoreFormatting: false,
                  })
                }
              />
              <OptionCheckbox
                id="ignore-whitespace"
                label="Ignore Whitespace"
                checked={options.ignoreWhitespace}
                onChange={() =>
                  setOptions((current) => ({
                    ...current,
                    ignoreWhitespace: !current.ignoreWhitespace,
                  }))
                }
              />
              <OptionCheckbox
                id="ignore-case"
                label="Ignore Case"
                checked={options.ignoreCase}
                onChange={() =>
                  setOptions((current) => ({
                    ...current,
                    ignoreCase: !current.ignoreCase,
                  }))
                }
              />
              {supportsIgnoreFormatting(format) ? (
                <OptionCheckbox
                  id="ignore-formatting"
                  label="Ignore Formatting"
                  checked={options.ignoreFormatting}
                  onChange={() =>
                    setOptions((current) => ({
                      ...current,
                      ignoreFormatting: !current.ignoreFormatting,
                    }))
                  }
                />
              ) : null}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label
                htmlFor="compare-left"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Left Content
              </label>
              <Textarea
                id="compare-left"
                rows={12}
                value={leftContent}
                onChange={(event) => setLeftContent(event.target.value)}
                placeholder="Paste left content here..."
                className="font-mono"
              />
            </div>
            <div>
              <label
                htmlFor="compare-right"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Right Content
              </label>
              <Textarea
                id="compare-right"
                rows={12}
                value={rightContent}
                onChange={(event) => setRightContent(event.target.value)}
                placeholder="Paste right content here..."
                className="font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button color="blue" onClick={handleCompare}>
              Compare
            </Button>
            <Button color="light" onClick={handleSwap}>
              Swap Left/Right
            </Button>
            <Button color="gray" onClick={handleClear}>
              Clear All
            </Button>
            <Button color="light" onClick={() => void handleCopyDifferences()}>
              Copy Differences
            </Button>
          </div>
        </div>
      }
      outputs={
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Results
            </span>
            <HelpTooltip
              title="Results"
              description="Comparison outcome and detected differences."
              exampleInput="Line 2 changed"
              exampleOutput="Differences detected"
            />
          </div>
          {!result ? (
            <p className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
              Run a comparison to see the summary and line-level differences.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-950 dark:text-white">
                    {result.isIdentical
                      ? "Content is identical"
                      : "Differences detected"}
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Total differences: {result.differences.length}
                  </p>
                </div>
                <Badge color={result.isIdentical ? "success" : "failure"}>
                  {result.isIdentical ? "Identical" : "Changed"}
                </Badge>
              </div>

              {!result.isIdentical ? (
                <div className="grid gap-3">
                  {result.differences.slice(0, 25).map((difference) => (
                    <div
                      key={`${difference.line}-${difference.left}-${difference.right}`}
                      className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/50"
                    >
                      <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                        Line {difference.line}
                      </p>
                      <div className="mt-2 grid gap-2 lg:grid-cols-2">
                        <pre className="overflow-x-auto rounded bg-white p-2 text-xs text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                          {difference.left || "(empty)"}
                        </pre>
                        <pre className="overflow-x-auto rounded bg-white p-2 text-xs text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                          {difference.right || "(empty)"}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      }
      examples={examples}
      notesCollapsible
      notes={
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
          <li>Ignore Formatting applies only to structured formats.</li>
          <li>Ignore Whitespace can reduce noise.</li>
          <li>Large files may take longer to compare.</li>
        </ul>
      }
      toast={<ToolToast toast={toast} />}
    />
  );
}

interface OptionCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

function OptionCheckbox({
  id,
  label,
  checked,
  onChange,
}: OptionCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
    >
      <Checkbox id={id} checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}
