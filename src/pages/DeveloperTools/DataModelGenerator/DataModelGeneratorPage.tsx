import { useEffect, useState } from "react";
import { Alert, Button, Select, Textarea, TextInput } from "flowbite-react";
import { ToolToast } from "../../../components/common/ToolToast";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { ToastMessage, ToastTone } from "../../../types/toast";
import {
  generateJsonSampleFromClass,
  getFirstParsedClassName,
} from "../../../utils/classSampleGenerator";
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

const initialCsharpClassExample = `public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; }
    public bool Active { get; set; }
    public Address Address { get; set; }
    public List<string> Roles { get; set; }
}

public class Address
{
    public string City { get; set; }
    public string PostalCode { get; set; }
}`;

const initialJavaClassExample = `public class Customer {
    private int id;
    private String name;
    private boolean active;
    private Address address;
    private List<String> roles;

    // getters and setters
}

public class Address {
    private String city;
    private String postalCode;
}`;

type GenerationState = "idle" | "empty" | "invalid" | "valid" | "stale";
type ErrorField = "source" | "rootClass" | null;
type GeneratorMode = "data" | "class";

export function DataModelGeneratorPage() {
  usePageTitle("Data Model Generator");

  const [mode, setMode] = useState<GeneratorMode>("data");
  const [inputFormat, setInputFormat] = useState<DataModelInputFormat>("json");
  const [language, setLanguage] = useState<DataModelLanguage>("csharp");
  const [rootClassName, setRootClassName] = useState("Root");
  const [isRootClassNameCustomized, setIsRootClassNameCustomized] =
    useState(false);
  const [sourceInput, setSourceInput] = useState(initialJsonExample);
  const [generatedCode, setGeneratedCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorField, setErrorField] = useState<ErrorField>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [generationState, setGenerationState] =
    useState<GenerationState>("idle");
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const hasCurrentOutput =
    generationState === "valid" && generatedCode.length > 0;
  const inputFormatLabel = inputFormat === "json" ? "JSON" : "XML";
  const languageLabel = language === "csharp" ? "C#" : "Java";
  const inputLabel =
    mode === "data"
      ? `${inputFormatLabel} Input`
      : `${languageLabel} Class Input`;

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
    setWarnings([]);
    setGenerationState(hadCurrentOutput ? "stale" : "idle");
  }

  function resetGenerationState() {
    setGeneratedCode("");
    setErrorMessage("");
    setErrorField(null);
    setWarnings([]);
    setGenerationState("idle");
  }

  function handleModeChange(nextMode: GeneratorMode) {
    setMode(nextMode);

    if (nextMode === "class") {
      const example =
        language === "csharp"
          ? initialCsharpClassExample
          : initialJavaClassExample;
      setSourceInput(example);

      if (!isRootClassNameCustomized) {
        setRootClassName(getFirstParsedClassName(example, language) ?? "Root");
      }
    } else {
      const example =
        inputFormat === "json" ? initialJsonExample : initialXmlExample;
      setSourceInput(example);

      if (!isRootClassNameCustomized) {
        setRootClassName(
          inputFormat === "xml"
            ? (getXmlRootClassName(example) ?? "Root")
            : "Root",
        );
      }
    }

    resetGenerationState();
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

  function handleLanguageChange(nextLanguage: DataModelLanguage) {
    setLanguage(nextLanguage);

    if (mode === "class") {
      const example =
        nextLanguage === "csharp"
          ? initialCsharpClassExample
          : initialJavaClassExample;
      setSourceInput(example);

      if (!isRootClassNameCustomized) {
        setRootClassName(
          getFirstParsedClassName(example, nextLanguage) ?? "Root",
        );
      }
    }

    invalidateGeneratedCode();
  }

  function handleSourceInputChange(value: string) {
    setSourceInput(value);

    if (!isRootClassNameCustomized) {
      const inferredRootName =
        mode === "class"
          ? getFirstParsedClassName(value, language)
          : inputFormat === "xml"
            ? getXmlRootClassName(value)
            : null;

      if (inferredRootName) {
        setRootClassName(inferredRootName);
      }
    }

    invalidateGeneratedCode();
  }

  function handleClassGeneration() {
    const classNameError = rootClassName.trim()
      ? getRootClassNameError(rootClassName)
      : null;

    if (classNameError) {
      setGeneratedCode("");
      setWarnings([]);
      setErrorMessage(classNameError);
      setErrorField("rootClass");
      setGenerationState("invalid");
      return;
    }

    const result = generateJsonSampleFromClass(sourceInput, language, {
      rootClassName,
      requireRootClass:
        isRootClassNameCustomized && Boolean(rootClassName.trim()),
    });

    if (!result.ok) {
      setGeneratedCode("");
      setWarnings([]);
      setErrorMessage(result.error);
      setErrorField(
        result.error.startsWith("Root class") ? "rootClass" : "source",
      );
      setGenerationState(sourceInput.trim() ? "invalid" : "empty");
      return;
    }

    setGeneratedCode(result.json);
    setWarnings(result.warnings);
    setErrorMessage("");
    setErrorField(null);
    setGenerationState("valid");

    if (!isRootClassNameCustomized) {
      setRootClassName(result.rootClassName);
    }
  }

  function handleDataGeneration() {
    const result = generateDataModel(
      sourceInput,
      language,
      rootClassName,
      inputFormat,
    );

    if (!result.ok) {
      setGeneratedCode("");
      setWarnings([]);
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
    setWarnings([]);
    setErrorMessage("");
    setErrorField(null);
    setGenerationState("valid");
  }

  function handleGenerate() {
    if (mode === "class") {
      handleClassGeneration();
    } else {
      handleDataGeneration();
    }
  }

  async function handleCopyCode() {
    if (!hasCurrentOutput) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedCode);
      showToast(
        "success",
        mode === "class"
          ? "JSON sample copied to clipboard."
          : `${languageLabel} model copied to clipboard.`,
      );
    } catch {
      showToast("failure", "Copy failed. Please copy the output manually.");
    }
  }

  const languageSelector = (
    <Select
      id="data-model-generator-language"
      value={language}
      onChange={(event) =>
        handleLanguageChange(event.target.value as DataModelLanguage)
      }
    >
      <option value="csharp">C#</option>
      <option value="java">Java</option>
    </Select>
  );

  return (
    <ToolPageLayout
      title="Data Model Generator"
      description="Generate C# or Java models from JSON or XML, and create representative JSON samples from class definitions."
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
            Class mode reads a focused subset of common C# and Java model
            declarations to create representative JSON shape samples. It does
            not execute code or emulate a runtime serializer.
          </p>
        </div>
      }
      inputTitle={null}
      inputs={
        <div className="min-w-0 space-y-5">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="min-w-0">
              <label
                htmlFor="data-model-generator-mode"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Generate From
              </label>
              <Select
                id="data-model-generator-mode"
                value={mode}
                onChange={(event) =>
                  handleModeChange(event.target.value as GeneratorMode)
                }
              >
                <option value="data">Data</option>
                <option value="class">Class</option>
              </Select>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {mode === "data" ? "Data → Model" : "Class → Sample Data"}
              </p>
            </div>

            <div className="min-w-0">
              <label
                htmlFor={
                  mode === "data"
                    ? "data-model-generator-input-format"
                    : "data-model-generator-language"
                }
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                {mode === "data" ? "Input Format" : "Input Language"}
              </label>
              {mode === "data" ? (
                <>
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
                </>
              ) : (
                languageSelector
              )}
            </div>

            <div className="min-w-0">
              <label
                htmlFor={
                  mode === "data"
                    ? "data-model-generator-language"
                    : "data-model-generator-output-format"
                }
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                {mode === "data" ? "Target Language" : "Output Format"}
              </label>
              {mode === "data" ? (
                languageSelector
              ) : (
                <Select
                  id="data-model-generator-output-format"
                  value="json"
                  disabled
                >
                  <option value="json">JSON Sample</option>
                </Select>
              )}
            </div>

            <div className="min-w-0 sm:col-span-2 xl:col-span-1">
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
                {mode === "class"
                  ? "Match a parsed class, or leave empty to use the first class."
                  : "Examples: Customer, Order, ApiResponse"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button type="button" color="blue" onClick={handleGenerate}>
              {mode === "data" ? "Generate Model" : "Generate JSON Sample"}
            </Button>
          </div>

          {generationState === "valid" ? (
            <p
              role="status"
              aria-live="polite"
              className="text-sm font-semibold text-emerald-700 dark:text-emerald-300"
            >
              {mode === "data"
                ? `Generated a current ${languageLabel} model.`
                : "Generated a current JSON sample."}
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

          {warnings.length > 0 ? (
            <Alert color="warning" role="status" aria-live="polite">
              <span className="font-semibold">Generated with limitations.</span>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </Alert>
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
                {inputLabel}
              </label>
              <Textarea
                id="data-model-generator-source-input"
                rows={22}
                value={sourceInput}
                onChange={(event) =>
                  handleSourceInputChange(event.target.value)
                }
                placeholder={
                  mode === "data"
                    ? `Paste ${inputFormatLabel} here...`
                    : `Paste ${languageLabel} class definitions here...`
                }
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
                  {mode === "data"
                    ? "Generated Model"
                    : "Generated JSON Sample"}
                </label>
                <Button
                  type="button"
                  color="light"
                  size="xs"
                  onClick={handleCopyCode}
                  disabled={!hasCurrentOutput}
                  aria-describedby="data-model-generator-output-note"
                >
                  {mode === "data" ? "Copy Code" : "Copy JSON"}
                </Button>
              </div>
              <Textarea
                id="data-model-generator-output"
                rows={22}
                value={generatedCode}
                readOnly
                placeholder={
                  mode === "data"
                    ? `Generated ${languageLabel} model will appear here...`
                    : "Generated JSON sample will appear here..."
                }
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
                  ? mode === "data"
                    ? "Copy Code uses the current generated source only."
                    : "Copy JSON uses the current generated sample only."
                  : generationState === "stale"
                    ? "Output was cleared after a change. Generate again to enable copying."
                    : mode === "data"
                      ? `Generate the current ${inputFormatLabel} to enable Copy Code.`
                      : `Generate the current ${languageLabel} class input to enable Copy JSON.`}
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
          <li>
            Outputs are generated only when you select the primary action.
          </li>
          <li>
            JSON empty arrays, mixed incompatible arrays, and null values use
            safe Object-style fallbacks rather than invented types.
          </li>
          <li>
            XML attributes become properties, repeated siblings become
            collections, and mixed element/text content falls back to a string.
          </li>
          <li>
            JSON samples demonstrate shape only; they do not emulate framework
            serialization. Recursive paths use null and unknown models use an
            empty object.
          </li>
          <li>
            Class-to-XML, serialization annotations, and full inheritance or
            arbitrary generic semantics are not available.
          </li>
        </ul>
      }
      toast={<ToolToast toast={toast} />}
    />
  );
}
