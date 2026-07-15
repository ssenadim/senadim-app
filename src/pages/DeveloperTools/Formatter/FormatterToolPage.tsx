import { useEffect, useState } from "react";
import { Alert, Button, Select, Textarea } from "flowbite-react";
import { HelpTooltip } from "../../../components/common/HelpTooltip";
import { ToolToast } from "../../../components/common/ToolToast";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { ToolExample } from "../../../types/toolPage";
import type { ToastMessage, ToastTone } from "../../../types/toast";
import {
  formatHtml,
  formatJson,
  formatXml,
  isFormatterFailure,
  minifyHtml,
  minifyJson,
  minifyXml,
  type FormatterType,
} from "../../../utils/formatter";
import { routePaths } from "../../../utils/routes";

const examples: ToolExample[] = [
  {
    title: "Basic JSON",
    description: "Typical REST API response.",
    inputLabel: "Input",
    input: '{"name":"John","age":30}',
    outputLabel: "Output",
    output: '{\n  "name": "John",\n  "age": 30\n}',
  },
  {
    title: "Basic XML",
    description: "Simple XML document.",
    inputLabel: "Input",
    input: "<user><name>John</name></user>",
    outputLabel: "Output",
    output: "<user>\n  <name>John</name>\n</user>",
  },  {
    title: "Basic HTML Page",
    description: "Simple HTML5 document.",
    inputLabel: "Input",
    input: "<main><h1>Hello</h1><p>Welcome</p></main>",
    outputLabel: "Output",
    output: "<main>\n  <h1>Hello</h1>\n  <p>Welcome</p>\n</main>",
  },  { title: "Responsive Layout", description: "Modern semantic HTML layout.", inputLabel: "Input", input: "<main><section><article>One</article><article>Two</article></section></main>", outputLabel: "Output", output: "Beautified responsive layout" },
  { title: "Simple Form", description: "Common HTML form controls.", inputLabel: "Input", input: "<form><label>Email<input type=\"email\"></label><button>Send</button></form>", outputLabel: "Output", output: "Beautified form markup" },
  { title: "Table Example", description: "Semantic HTML table.", inputLabel: "Input", input: "<table><tr><th>Name</th></tr><tr><td>Alex</td></tr></table>", outputLabel: "Output", output: "Beautified table markup" },

];

export function FormatterToolPage() {
  usePageTitle("Data Formatter");

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
    const result = formatType === "json" ? formatJson(inputText) : formatType === "xml" ? formatXml(inputText) : formatHtml(inputText);

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
    const result = formatType === "json" ? minifyJson(inputText) : formatType === "xml" ? minifyXml(inputText) : minifyHtml(inputText);

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
      title="Data Formatter"
      description="Format, validate and transform structured data such as JSON, XML and HTML for APIs, integrations, web development and debugging."
      breadcrumbs={[
        { label: "Developer Tools", path: routePaths.developerTools },
        { label: "Data Formatter" },
      ]}
      overviewTitle="Why Formatting Matters"
      overviewCollapsible
      overviewToggleLabel="Why Formatting Matters"
      overview={
        <div className="space-y-3">
          <p>Data Formatter supports JSON, XML, and HTML structured data.</p>
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
                {formatType === "html" ? "Beautify" : "Format"} Type
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
              <option value="html">HTML</option>
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
                description="Paste JSON, XML, or HTML content here."
                exampleInput='{"name":"John"}'
                exampleOutput='{\n  "name": "John"\n}'
              />
            </div>
            <Textarea
              id="formatter-input"
              rows={10}
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              placeholder="Paste JSON, XML, or HTML content here..."
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
              {formatType === "html" ? "Beautify" : "Format"}
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
      onExampleSelect={(example) => { setFormatType(example.title.startsWith("XML") ? "xml" : example.title.startsWith("HTML") ? "html" : "json"); setInputText(example.input); setOutputText(""); setErrorMessage(""); }}
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
  return formatType === "json" ? "JSON" : formatType === "xml" ? "XML" : "HTML";
}
