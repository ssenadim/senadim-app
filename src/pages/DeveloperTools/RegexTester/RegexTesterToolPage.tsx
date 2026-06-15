import { useEffect, useState } from "react";
import { Badge, Button, TextInput, Textarea } from "flowbite-react";
import { HelpTooltip } from "../../../components/common/HelpTooltip";
import { ToolToast } from "../../../components/common/ToolToast";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { ToolExample } from "../../../types/toolPage";
import type { ToastMessage, ToastTone } from "../../../types/toast";
import {
  commonPatterns,
  isRegexFailure,
  regexFlags,
  testRegex,
  type RegexFlag,
  type RegexMatch,
} from "../../../utils/regex";
import { routePaths } from "../../../utils/routes";

const examples: ToolExample[] = [
  { title: "Email Detection", inputLabel: "Pattern", input: "[\\w.-]+@[\\w.-]+\\.\\w+", outputLabel: "Match", output: "hello@example.com" },
  { title: "UUID Detection", inputLabel: "Pattern", input: "[0-9a-fA-F-]{36}", outputLabel: "Match", output: "550e8400-e29b-41d4-a716-446655440000" },
  { title: "URL Detection", inputLabel: "Pattern", input: "https?:\\/\\/[^\\s]+", outputLabel: "Match", output: "https://example.com" },
];

export function RegexTesterToolPage() {
  usePageTitle("Regex Tester");

  const [pattern, setPattern] = useState("");
  const [text, setText] = useState("");
  const [flags, setFlags] = useState<RegexFlag[]>(["g"]);
  const [matches, setMatches] = useState<RegexMatch[]>([]);
  const [error, setError] = useState("");
  const [showPatterns, setShowPatterns] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  function showToast(tone: ToastTone, message: string) {
    setToast({ id: Date.now(), tone, text: message });
  }

  function toggleFlag(flag: RegexFlag) {
    setFlags((current) =>
      current.includes(flag)
        ? current.filter((item) => item !== flag)
        : [...current, flag],
    );
  }

  function handleTest() {
    const result = testRegex(pattern, text, flags);

    if (isRegexFailure(result)) {
      setError(result.error);
      setMatches([]);
      showToast("failure", "Regex test failed.");
      return;
    }

    setError("");
    setMatches(result.matches);
    showToast(result.matches.length ? "success" : "info", result.matches.length ? "Matches found." : "No matches found.");
  }

  async function copyMatches() {
    if (matches.length === 0) {
      showToast("info", "There are no matches to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(matches.map((match) => match.value).join("\n"));
      showToast("success", "Matches copied.");
    } catch {
      showToast("failure", "Copy failed. Please copy manually.");
    }
  }

  function clearAll() {
    setPattern("");
    setText("");
    setMatches([]);
    setError("");
    showToast("info", "Regex tester cleared.");
  }

  return (
    <ToolPageLayout
      title="Regex Tester"
      description="Test regular expressions against sample text and inspect matches."
      breadcrumbs={[
        { label: "Developer Tools", path: routePaths.developerTools },
        { label: "Regex Tester" },
      ]}
      overviewTitle="What is a Regular Expression?"
      overview={
        <div className="space-y-3">
          <p>Regular expressions are patterns used to search, validate and extract text.</p>
          <p>They are commonly used in APIs, validation rules, log analysis and data processing.</p>
        </div>
      }
      inputs={
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <label htmlFor="regex-pattern" className="text-sm font-semibold text-gray-900 dark:text-white">Regex Pattern</label>
              <HelpTooltip title="Regex" description="Enter a regular expression pattern." exampleInput="\\d+" exampleOutput="Number matches" />
            </div>
            <TextInput id="regex-pattern" value={pattern} onChange={(event) => setPattern(event.target.value)} placeholder="Enter regex pattern..." />
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Flags</span>
              <HelpTooltip title="Flags" description="Configure regex matching behavior." exampleInput="g i" exampleOutput="Global, case-insensitive matching" />
            </div>
            <div className="flex flex-wrap gap-2">
              {regexFlags.map((flag) => (
                <button key={flag.value} type="button" onClick={() => toggleFlag(flag.value)} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${flags.includes(flag.value) ? "border-cyan-600 bg-cyan-50 text-cyan-800 dark:border-cyan-500 dark:bg-cyan-950 dark:text-cyan-200" : "border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"}`}>
                  {flag.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2">
              <label htmlFor="regex-text" className="text-sm font-semibold text-gray-900 dark:text-white">Test Text</label>
              <HelpTooltip title="Test Text" description="Text content used for matching." exampleInput="hello@example.com" exampleOutput="Email match" />
            </div>
            <Textarea id="regex-text" rows={10} value={text} onChange={(event) => setText(event.target.value)} placeholder="Enter sample text..." className="font-mono" />
          </div>
          {error ? <p className="text-sm font-semibold text-red-600 dark:text-red-300">{error}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button color="blue" onClick={handleTest}>Test Regex</Button>
            <Button color="gray" onClick={clearAll}>Clear</Button>
            <Button color="light" onClick={() => void copyMatches()}>Copy Matches</Button>
          </div>
          <section>
            <Button color="light" size="sm" onClick={() => setShowPatterns((current) => !current)}>
              {showPatterns ? "Hide Common Patterns" : "Show Common Patterns"}
            </Button>
            {showPatterns ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {commonPatterns.map((item) => (
                  <button key={item.label} type="button" onClick={() => setPattern(item.pattern)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:border-cyan-300 hover:text-cyan-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      }
      outputs={
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Results</span>
            <HelpTooltip title="Results" description="Detected matches and match information." exampleInput="Match Count" exampleOutput="3 matches" />
          </div>
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <p className="text-lg font-bold text-gray-950 dark:text-white">Match Count: {matches.length}</p>
            {matches.length === 0 ? <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">No matches found yet.</p> : null}
          </div>
          {matches.length > 0 ? <HighlightedText text={text} matches={matches} /> : null}
          <div className="grid gap-3">
            {matches.map((match, index) => (
              <div key={`${match.index}-${match.value}-${index}`} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-950">
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Match {index + 1}</p>
                <p className="mt-1 break-all font-mono text-sm text-gray-900 dark:text-gray-100">{match.value}</p>
                <Badge color="info" className="mt-2 w-fit">Position {match.index}-{match.endIndex}</Badge>
              </div>
            ))}
          </div>
        </div>
      }
      examples={examples}
      notesCollapsible
      notes={
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
          <li>Regex performance may vary on large inputs.</li>
          <li>Complex patterns should be tested carefully.</li>
          <li>Regex is powerful but can become difficult to maintain.</li>
        </ul>
      }
      toast={<ToolToast toast={toast} />}
    />
  );
}

function HighlightedText({ text, matches }: { text: string; matches: RegexMatch[] }) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  matches.forEach((match, index) => {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    parts.push(<mark key={`${match.index}-${index}`} className="rounded bg-yellow-200 px-1 text-gray-950">{text.slice(match.index, match.endIndex)}</mark>);
    cursor = match.endIndex;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));

  return <pre className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100">{parts}</pre>;
}
