import { useEffect, useState } from "react";
import { Button, Textarea } from "flowbite-react";
import { HelpTooltip } from "../../../components/common/HelpTooltip";
import { ToolToast } from "../../../components/common/ToolToast";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { ToolExample } from "../../../types/toolPage";
import type { ToastMessage, ToastTone } from "../../../types/toast";
import {
  generateHash,
  getByteCount,
  hashAlgorithms,
  type HashAlgorithm,
} from "../../../utils/hash";
import { routePaths } from "../../../utils/routes";

const examples: ToolExample[] = [
  {
    title: "SHA256 Example",
    inputLabel: "Input",
    input: "Hello World",
    outputLabel: "SHA256",
    output: "a591a6d40bf420404a011733cfb7b190...",
  },
];

export function HashGeneratorToolPage() {
  usePageTitle("Hash Generator");

  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("sha256");
  const [inputText, setInputText] = useState("");
  const [hash, setHash] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  function showToast(tone: ToastTone, text: string) {
    setToast({ id: Date.now(), tone, text });
  }

  async function handleGenerate() {
    if (!inputText) {
      setError("Enter text before generating a hash.");
      showToast("failure", "Input is empty.");
      return;
    }

    try {
      setHash(await generateHash(inputText, algorithm));
      setError("");
      showToast("success", "Hash generated.");
    } catch {
      setError("Hash generation failed. Please try again.");
      showToast("failure", "Hash generation failed.");
    }
  }

  async function handleCopy() {
    if (!hash) {
      showToast("info", "There is no hash to copy yet.");
      return;
    }

    try {
      await navigator.clipboard.writeText(hash);
      showToast("success", "Hash copied.");
    } catch {
      showToast("failure", "Copy failed. Please copy manually.");
    }
  }

  function handleClear() {
    setInputText("");
    setHash("");
    setError("");
    showToast("info", "Hash input cleared.");
  }

  return (
    <ToolPageLayout
      title="Hash Generator"
      description="Generate MD5, SHA1, SHA256 and SHA512 hashes from text input."
      breadcrumbs={[
        { label: "Developer Tools", path: routePaths.developerTools },
        { label: "Hash Generator" },
      ]}
      overviewTitle="What is a Hash?"
      overviewCollapsible
      overviewToggleLabel="What is a Hash?"
      overview={
        <div className="space-y-3">
          <p>Hashing converts input data into a fixed-length output.</p>
          <p>
            Hashes are commonly used for integrity checks, signatures and
            security-related operations.
          </p>
          <p>Hashing is one-way and cannot be reversed.</p>
        </div>
      }
      inputs={
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Algorithm
              </span>
              <HelpTooltip
                title="Algorithm"
                description="Select the hashing algorithm."
                exampleInput="SHA256"
                exampleOutput="64 character hash"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {hashAlgorithms.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setAlgorithm(item.value);
                    setHash("");
                  }}
                  className={[
                    "rounded-lg border px-3 py-2 text-sm font-semibold transition",
                    algorithm === item.value
                      ? "border-cyan-600 bg-cyan-50 text-cyan-800 dark:border-cyan-500 dark:bg-cyan-950 dark:text-cyan-200"
                      : "border-gray-200 bg-white text-gray-700 hover:border-cyan-300 hover:text-cyan-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2">
              <label htmlFor="hash-input" className="text-sm font-semibold text-gray-900 dark:text-white">
                Input Text
              </label>
              <HelpTooltip
                title="Input"
                description="Enter the text to hash."
                exampleInput="Hello World"
                exampleOutput="Generated hash"
              />
            </div>
            <Textarea
              id="hash-input"
              rows={8}
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              placeholder="Enter text to hash..."
              className="font-mono"
            />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Characters: {inputText.length} | Bytes: {getByteCount(inputText)}
            </p>
          </div>
          {error ? <p className="text-sm font-semibold text-red-600 dark:text-red-300">{error}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button color="blue" onClick={() => void handleGenerate()}>
              Generate Hash
            </Button>
            <Button color="light" onClick={() => void handleCopy()}>
              Copy Result
            </Button>
            <Button color="gray" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
      }
      outputs={
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Generated Hash
            </span>
            <HelpTooltip
              title="Output"
              description="Generated hash value."
              exampleInput="Hello World"
              exampleOutput="a591a6d40..."
            />
          </div>
          <pre className="min-h-24 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100">
            {hash || "-"}
          </pre>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Hash Length: {hash.length}
            </p>
            <Button color="light" size="sm" onClick={() => void handleCopy()}>
              Copy Result
            </Button>
          </div>
        </div>
      }
      examples={examples}
      notesCollapsible
      notes={
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
          <li>MD5 is not considered secure.</li>
          <li>SHA1 is deprecated for security-sensitive use cases.</li>
          <li>Prefer SHA256 or SHA512 for modern applications.</li>
          <li>Hashing is not encryption.</li>
        </ul>
      }
      toast={<ToolToast toast={toast} />}
    />
  );
}
