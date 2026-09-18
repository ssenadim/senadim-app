import { useEffect, useState } from "react";
import { Alert, Button, Select, Textarea, TextInput } from "flowbite-react";
import { ToolToast } from "../../../components/common/ToolToast";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { ToastMessage, ToastTone } from "../../../types/toast";
import {
  generateDataModel,
  getRootClassNameError,
  getXmlRootClassName,
  type DataModelInputFormat,
  type DataModelLanguage,
} from "../../../utils/dataModelGenerator";
import { routePaths } from "../../../utils/routes";

const initialJsonExample = `{
  "id": 15,
  "name": "Customer",
  "active": true,
  "address": {
    "city": "Istanbul",
    "postalCode": "34400"
  },
  "roles": [
    "user",
    "admin"
  ]
}`;

const initialXmlExample = `<customer id="15">
  <name>Customer</name>
  <active>true</active>
  <address>
    <city>Istanbul</city>
    <postalCode>34400</postalCode>
  </address>
  <roles>
    <role>user</role>
    <role>admin</role>
  </roles>
</customer>`;

type GenerationState = "idle" | "empty" | "invalid" | "valid" | "stale";
type ErrorField = "source" | "rootClass" | null;

export function DataModelGeneratorPage() {
  usePageTitle("Data Model Generator");

  const [inputFormat, setInputFormat] = useState<DataModelInputFormat>("json");
  const [language, setLanguage] = useState<DataModelLanguage>("csharp");
  const [rootClassName, setRootClassName] = useState("Root");
  const [isRootClassNameCustomized, setIsRootClassNameCustomized] =
    useState(false);
  const [sourceInput, setSourceInput] = useState(initialJsonExample);
  const [generatedCode, setGeneratedCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorField, setErrorField] = useState<ErrorField>(null);
  const [generationState, setGenerationState] =
    useState<GenerationState>("idle");
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const hasCurrentOutput =
    generationState === "valid" && generatedCode.length > 0;
  const inputFormatLabel = inputFormat === "json" ? "JSON" : "XML";
  const languageLabel = language === "csharp" ? "C#" : "Java";

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

  function invalidateGeneratedCode() {
    const hadCurrentOutput =
      generationState === "stale" ||
      (generationState === "valid" && generatedCode.length > 0);

    setGeneratedCode("");
    setErrorMessage("");
    setErrorField(null);
    setGenerationState(hadCurrentOutput ? "stale" : "idle");
  }

  function handleInputFormatChange(format: DataModelInputFormat) {
    const nextExample =
      format === "json" ? initialJsonExample : initialXmlExample;

    setInputFormat(format);
    setSourceInput(nextExample);

    if (!isRootClassNameCustomized) {
      setRootClassName(
        format === "xml"
          ? (getXmlRootClassName(nextExample) ?? "Root")
          : "Root",
      );
    }

    invalidateGeneratedCode();
  }

  function handleSourceInputChange(value: string) {
    setSourceInput(value);

    if (inputFormat === "xml" && !isRootClassNameCustomized) {
      const inferredRootName = getXmlRootClassName(value);

      if (inferredRootName) {
        setRootClassName(inferredRootName);
      }
    }

    invalidateGeneratedCode();
  }

  function handleGenerate() {
    const result = generateDataModel(
      sourceInput,
      language,
      rootClassName,
      inputFormat,
    );

    if (!result.ok) {
      setGeneratedCode("");
      setErrorMessage(result.error);
      setErrorField(
        !sourceInput.trim()
          ? "source"
          : getRootClassNameError(rootClassName)
            ? "rootClass"
            : "source",
      );
      setGenerationState(
        !sourceInput.trim() || !rootClassName.trim() ? "empty" : "invalid",
      );
      return;
    }

    setGeneratedCode(result.code);
    setErrorMessage("");
    setErrorField(null);
    setGenerationState("valid");
  }

  async function handleCopyCode() {
    if (!hasCurrentOutput) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedCode);
      showToast("success", `${languageLabel} model copied to clipboard.`);
    } catch {
      showToast("failure", "Copy failed. Please copy the code manually.");
    }
  }

  return (
    <ToolPageLayout
      title="Data Model Generator"
      description="Generate copy-ready C# or Java model classes from JSON or XML directly in your browser."
      breadcrumbs={[
        { label: "Developer Productivity", path: routePaths.developerTools },
        { label: "Data Model Generator" },
      ]}
      overviewTitle="What is Data Model Generation?"
      overviewCollapsible
      overviewToggleLabel="What is Data Model Generation?"
      overview={
        <div className="space-y-3">
          <p>
            Turn representative JSON or XML into a readable starting point for
            C# or Java data models without sending the content to an external
            service.
          </p>
          <p>
            Basic values, nested objects, and arrays are inferred
            deterministically. Empty or incompatible arrays and null values use
            conservative Object-style fallbacks.
          </p>
        </div>
      }
      inputTitle={null}
      inputs={
        <div className="min-w-0 space-y-5">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="min-w-0">
              <label
                htmlFor="data-model-generator-input-format"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Input Format
              </label>
              <Select
                id="data-model-generator-input-format"
                value={inputFormat}
                onChange={(event) =>
                  handleInputFormatChange(
                    event.target.value as DataModelInputFormat,
                  )
                }
                aria-describedby="data-model-generator-input-format-note"
              >
                <option value="json">JSON</option>
                <option value="xml">XML</option>
              </Select>
              <p
                id="data-model-generator-input-format-note"
                className="mt-2 text-xs text-gray-500 dark:text-gray-400"
              >
                Choose the source format before generating a model.
              </p>
            </div>

            <div className="min-w-0">
              <label
                htmlFor="data-model-generator-language"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Target Language
              </label>
              <Select
                id="data-model-generator-language"
                value={language}
                onChange={(event) => {
                  setLanguage(event.target.value as DataModelLanguage);
                  invalidateGeneratedCode();
                }}
              >
                <option value="csharp">C#</option>
                <option value="java">Java</option>
              </Select>
            </div>

            <div className="min-w-0 sm:col-span-2 lg:col-span-1">
              <label
                htmlFor="data-model-generator-root-class"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Root Class Name
              </label>
              <TextInput
                id="data-model-generator-root-class"
                value={rootClassName}
                onChange={(event) => {
                  setRootClassName(event.target.value);
                  setIsRootClassNameCustomized(true);
                  invalidateGeneratedCode();
                }}
                placeholder="Root"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={errorField === "rootClass"}
                aria-describedby={
                  errorField === "rootClass"
                    ? "data-model-generator-validation-error"
                    : "data-model-generator-root-class-note"
                }
              />
              <p
                id="data-model-generator-root-class-note"
                className="mt-2 text-xs text-gray-500 dark:text-gray-400"
              >
                Examples: Customer, Order, ApiResponse
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button type="button" color="blue" onClick={handleGenerate}>
              Generate Model
            </Button>
          </div>

          {generationState === "valid" ? (
            <p
              role="status"
              aria-live="polite"
              className="text-sm font-semibold text-emerald-700 dark:text-emerald-300"
            >
              Generated a current {languageLabel} model.
            </p>
          ) : null}

          {generationState === "stale" ? (
            <p
              role="status"
              aria-live="polite"
              className="text-sm font-medium text-amber-700 dark:text-amber-300"
            >
              Previous output was cleared after a change. Generate again to
              refresh it.
            </p>
          ) : null}

          {(generationState === "empty" || generationState === "invalid") &&
          errorMessage ? (
            <Alert
              id="data-model-generator-validation-error"
              color={generationState === "empty" ? "warning" : "failure"}
              role="alert"
            >
              <span className="font-semibold">
                {generationState === "empty"
                  ? "Input required."
                  : "Unable to generate."}
              </span>{" "}
              {errorMessage}
            </Alert>
          ) : null}

          <div className="grid min-w-0 gap-5 lg:grid-cols-2">
            <div className="min-w-0">
              <label
                htmlFor="data-model-generator-source-input"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                {inputFormatLabel} Input
              </label>
              <Textarea
                id="data-model-generator-source-input"
                rows={22}
                value={sourceInput}
                onChange={(event) =>
                  handleSourceInputChange(event.target.value)
                }
                placeholder={`Paste ${inputFormatLabel} here...`}
                className="max-w-full font-mono"
                spellCheck={false}
                wrap="off"
                aria-invalid={errorField === "source"}
                aria-describedby={
                  errorField === "source"
                    ? "data-model-generator-validation-error"
                    : undefined
                }
              />
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label
                  htmlFor="data-model-generator-output"
                  className="text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Generated Model
                </label>
                <Button
                  type="button"
                  color="light"
                  size="xs"
                  onClick={handleCopyCode}
                  disabled={!hasCurrentOutput}
                  aria-describedby="data-model-generator-output-note"
                >
                  Copy Code
                </Button>
              </div>
              <Textarea
                id="data-model-generator-output"
                rows={22}
                value={generatedCode}
                readOnly
                placeholder={`Generated ${languageLabel} model will appear here...`}
                className="max-w-full font-mono"
                spellCheck={false}
                wrap="off"
                aria-describedby="data-model-generator-output-note"
              />
              <p
                id="data-model-generator-output-note"
                className="mt-2 text-xs text-gray-500 dark:text-gray-400"
              >
                {hasCurrentOutput
                  ? "Copy Code uses the current generated source only."
                  : generationState === "stale"
                    ? "Output was cleared after a change. Generate again to enable Copy Code."
                    : `Generate the current ${inputFormatLabel} to enable Copy Code.`}
              </p>
            </div>
          </div>
        </div>
      }
      examples={[]}
      notesCollapsible
      notes={
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
          <li>Parsing and generation run entirely in your browser.</li>
          <li>Models are generated only when you select Generate Model.</li>
          <li>
            JSON empty arrays, mixed incompatible arrays, and null values use
            safe Object-style fallbacks rather than invented types.
          </li>
          <li>
            XML attributes become properties, repeated siblings become
            collections, and mixed element/text content falls back to a string.
          </li>
          <li>
            When an XML attribute and child element share a name, the child
            property receives an Element suffix.
          </li>
          <li>
            Reverse generation and serialization annotations are not available.
          </li>
        </ul>
      }
      toast={<ToolToast toast={toast} />}
    />
  );
}
