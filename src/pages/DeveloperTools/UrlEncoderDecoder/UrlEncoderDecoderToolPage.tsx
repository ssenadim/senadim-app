import { useEffect, useState } from "react";
import { Button, Textarea } from "flowbite-react";
import { HelpTooltip } from "../../../components/common/HelpTooltip";
import { ToolToast } from "../../../components/common/ToolToast";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { ToolExample } from "../../../types/toolPage";
import type { ToastMessage, ToastTone } from "../../../types/toast";
import {
  decodeUrlValue,
  encodeUrlValue,
  isUrlEncodingFailure,
} from "../../../utils/urlEncoding";
import { routePaths } from "../../../utils/routes";

const examples: ToolExample[] = [
  {
    title: "Example 1",
    inputLabel: "Input",
    input: "hello world",
    outputLabel: "Encoded",
    output: "hello%20world",
  },
  {
    title: "Example 2",
    inputLabel: "Input",
    input: "https://freeshot.dev/search?q=jwt decoder",
    outputLabel: "Encoded",
    output: "https%3A%2F%2Ffreeshot.dev%2Fsearch%3Fq%3Djwt%20decoder",
  },
  {
    title: "Example 3",
    inputLabel: "Input",
    input: "https%3A%2F%2Ffreeshot.dev%2Fsearch%3Fq%3Djwt%20decoder",
    outputLabel: "Decoded",
    output: "https://freeshot.dev/search?q=jwt decoder",
  },
];

export function UrlEncoderDecoderToolPage() {
  usePageTitle("URL Encoder / Decoder");

  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
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

  function runEncode() {
    const result = encodeUrlValue(inputText);
    if (isUrlEncodingFailure(result)) {
      setError(result.error);
      showToast("failure", "Encoding failed.");
      return;
    }
    setOutputText(result.value);
    setError("");
    showToast("success", "Value encoded.");
  }

  function runDecode() {
    const result = decodeUrlValue(inputText);
    if (isUrlEncodingFailure(result)) {
      setError(result.error);
      setOutputText("");
      showToast("failure", "Decoding failed.");
      return;
    }
    setOutputText(result.value);
    setError("");
    showToast("success", "Value decoded.");
  }

  async function copyResult() {
    if (!outputText) {
      showToast("info", "There is no result to copy yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(outputText);
      showToast("success", "Result copied.");
    } catch {
      showToast("failure", "Copy failed. Please copy manually.");
    }
  }

  function swapValues() {
    setInputText(outputText);
    setOutputText(inputText);
    setError("");
    showToast("info", "Input and output swapped.");
  }

  function clearAll() {
    setInputText("");
    setOutputText("");
    setError("");
    showToast("info", "URL encoder cleared.");
  }

  return (
    <ToolPageLayout
      title="URL Encoder / Decoder"
      description="Encode and decode URLs, query parameters and special characters."
      breadcrumbs={[
        { label: "Developer Tools", path: routePaths.developerTools },
        { label: "URL Encoder / Decoder" },
      ]}
      overviewTitle="What is URL Encoding?"
      overviewCollapsible
      overviewToggleLabel="What is URL Encoding?"
      overview={
        <div className="space-y-3">
          <p>
            URL encoding converts special characters into a safe format for
            transport over HTTP.
          </p>
          <p>
            It is frequently used in APIs, redirects, OAuth flows and query
            parameters.
          </p>
          <p>
            Spaces, ampersands and other reserved characters are encoded.
          </p>
        </div>
      }
      inputs={
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <label htmlFor="url-input" className="text-sm font-semibold text-gray-900 dark:text-white">
                Input Text
              </label>
              <HelpTooltip title="Input" description="Paste a URL, query string or text value." exampleInput="hello world" exampleOutput="hello%20world" />
            </div>
            <Textarea id="url-input" rows={8} value={inputText} onChange={(event) => setInputText(event.target.value)} placeholder="Paste URL, query string, redirect URL or text value..." className="font-mono" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Character Count: {inputText.length}</p>
          </div>
          {error ? <p className="text-sm font-semibold text-red-600 dark:text-red-300">{error}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button color="blue" onClick={runEncode}>Encode</Button>
            <Button color="green" onClick={runDecode}>Decode</Button>
            <Button color="light" onClick={swapValues}>Swap Input / Output</Button>
            <Button color="light" onClick={() => void copyResult()}>Copy Result</Button>
            <Button color="gray" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      }
      outputs={
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Result
            </span>
            <HelpTooltip title="Output" description="Encoded or decoded result." exampleInput="hello world" exampleOutput="hello%20world" />
            <HelpTooltip title="Encoding" description="Convert reserved URL characters into URL-safe format." exampleInput="a b" exampleOutput="a%20b" />
          </div>
          <Textarea rows={8} value={outputText} readOnly placeholder="Encoded or decoded result will appear here..." className="font-mono" />
          <div className="mt-3 grid gap-2 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-2">
            <p>Encoded Length: {outputText ? encodeURIComponent(outputText).length : 0}</p>
            <p>Decoded Length: {outputText.length}</p>
          </div>
        </div>
      }
      examples={examples}
      notesCollapsible
      notes={
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
          <li>URL encoding is not encryption.</li>
          <li>Encoded values can be decoded back.</li>
          <li>Commonly used in OAuth redirect URIs and API integrations.</li>
        </ul>
      }
      toast={<ToolToast toast={toast} />}
    />
  );
}
