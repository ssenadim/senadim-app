import { useEffect, useState } from "react";
import { Alert, Button, Select, Textarea } from "flowbite-react";
import { HelpTooltip } from "../../../components/common/HelpTooltip";
import { ToolToast } from "../../../components/common/ToolToast";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { ToolExample } from "../../../types/toolPage";
import type { ToastMessage, ToastTone } from "../../../types/toast";
import {
  formatJson,
  formatXml,
  isFormatterFailure,
  minifyJson,
  minifyXml,
  type FormatterType,
} from "../../../utils/formatter";
import { routePaths } from "../../../utils/routes";

const examples: ToolExample[] = [
  {
    title: "JSON Example",
    inputLabel: "Input",
    input: '{"name":"John","age":30}',
    outputLabel: "Output",
    output: '{\n  "name": "John",\n  "age": 30\n}',
  },
  {
    title: "XML Example",
    inputLabel: "Input",
    input: "<user><name>John</name></user>",
    outputLabel: "Output",
    output: "<user>\n  <name>John</name>\n</user>",
  },
];

export function FormatterToolPage() {
  usePageTitle("JSON & XML Formatter");

  const [formatType, setFormatType] = useState<FormatterType>("json");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 3200);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  function showToast(tone: ToastTone, text: string) {
    setToast({ id: Date.now(), tone, text });
  }

  function handleFormat() {
    const result = formatType === "json" ? formatJson(inputText) : formatXml(inputText);

    if (isFormatterFailure(result)) {
      setErrorMessage(result.error);
      setOutputText("");
      showToast("failure", "Formatting failed.");
      return;
    }

    setErrorMessage("");
    setOutputText(result.value);
    showToast("success", `${getFormatLabel(formatType)} formatted.`);
  }

  function handleMinify() {
    const result = formatType === "json" ? minifyJson(inputText) : minifyXml(inputText);

    if (isFormatterFailure(result)) {
      setErrorMessage(result.error);
      setOutputText("");
      showToast("failure", "Minification failed.");
      return;
    }

    setErrorMessage("");
    setOutputText(result.value);
    showToast("success", `${getFormatLabel(formatType)} minified.`);
  }

  async function handleCopy() {
    if (!outputText) {
      showToast("info", "There is no result to copy yet.");
      return;
    }

    try {
      await navigator.clipboard.writeText(outputText);
      showToast("success", "Result copied to clipboard.");
    } catch {
      showToast("failure", "Copy failed. Please copy the result manually.");
    }
  }

  function handleClear() {
    setInputText("");
    setOutputText("");
    setErrorMessage("");
    showToast("info", "Input and result cleared.");
  }

  return (
    <ToolPageLayout
      title="JSON & XML Formatter"
      description="Format or minify JSON and XML content for APIs, integrations, logs, and debugging workflows."
      breadcrumbs={[
        { label: "Developer Tools", path: routePaths.developerTools },
        { label: "JSON & XML Formatter" },
      ]}
      overviewTitle="What is a Formatter?"
      overview={
        <div className="space-y-3">
          <p>Formatters make structured data easier to read.</p>
          <p>Minifiers remove unnecessary whitespace.</p>
          <p>
            They are useful for APIs, integrations, logs, and debugging when
            structured payloads need to be inspected quickly.
          </p>
        </div>
      }
      inputs={
        <div className="space-y-5">
          <div className="max-w-sm">
            <div className="mb-2 flex items-center gap-2">
              <label
                htmlFor="formatter-type"
                className="text-sm font-semibold text-gray-900 dark:text-white"
              >
                Format Type
              </label>
              <HelpTooltip
                title="Format Type"
                description="Choose the structured data format you want to work with."
                exampleInput="JSON"
                exampleOutput="JSON formatting rules"
              />
            </div>
            <Select
              id="formatter-type"
              value={formatType}
              onChange={(event) =>
                setFormatType(event.target.value as FormatterType)
              }
            >
              <option value="json">JSON</option>
              <option value="xml">XML</option>
            </Select>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <label
                htmlFor="formatter-input"
                className="text-sm font-semibold text-gray-900 dark:text-white"
              >
                Input
              </label>
              <HelpTooltip
                title="Input"
                description="Paste JSON or XML content here."
                exampleInput='{"name":"John"}'
                exampleOutput='{\n  "name": "John"\n}'
              />
            </div>
            <Textarea
              id="formatter-input"
              rows={10}
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              placeholder="Paste JSON or XML content here..."
              className="font-mono"
            />
          </div>

          {errorMessage ? (
            <Alert color="failure">
              <span className="font-semibold">Validation failed.</span>{" "}
              {errorMessage}
            </Alert>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button color="blue" onClick={handleFormat}>
              Format
            </Button>
            <Button color="green" onClick={handleMinify}>
              Minify
            </Button>
            <Button color="light" onClick={handleCopy}>
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
            <label
              htmlFor="formatter-output"
              className="text-sm font-semibold text-gray-900 dark:text-white"
            >
              Output
            </label>
            <HelpTooltip
              title="Output"
              description="Formatted or minified result."
              exampleInput='{"name":"John"}'
              exampleOutput='{\n  "name": "John"\n}'
            />
          </div>
          <Textarea
            id="formatter-output"
            rows={10}
            value={outputText}
            readOnly
            placeholder="Formatted or minified result will appear here..."
            className="font-mono"
          />
        </div>
      }
      examples={examples}
      notesCollapsible
      notes={
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
          <li>Formatting changes presentation only.</li>
          <li>Formatting does not change the underlying data.</li>
          <li>Minification reduces size but not content.</li>
        </ul>
      }
      toast={<ToolToast toast={toast} />}
    />
  );
}

function getFormatLabel(formatType: FormatterType) {
  return formatType === "json" ? "JSON" : "XML";
}
