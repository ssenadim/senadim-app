import { useEffect, useId, useState } from "react";
import { Alert, Button, Select, Textarea, TextInput } from "flowbite-react";
import { ToolToast } from "../../../components/common/ToolToast";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { ToastMessage, ToastTone } from "../../../types/toast";
import {
  createDefaultClassSampleGenerationOptions,
  generateJsonSampleFromClass,
  getFirstParsedClassName,
  type ResolvedClassSampleGenerationOptions,
} from "../../../utils/classSampleGenerator";
import {
  createDefaultDataModelGenerationOptions,
  generateDataModel,
  getRootClassNameError,
  getXmlRootClassName,
  type DataModelInputFormat,
  type DataModelLanguage,
  type ResolvedDataModelGenerationOptions,
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
  const [dataOptions, setDataOptions] =
    useState<ResolvedDataModelGenerationOptions>(
      createDefaultDataModelGenerationOptions,
    );
  const [classSampleOptions, setClassSampleOptions] =
    useState<ResolvedClassSampleGenerationOptions>(
      createDefaultClassSampleGenerationOptions,
    );
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [areOptionsVisible, setAreOptionsVisible] = useState(false);
  const optionsPanelId = useId();

  const hasCurrentOutput =
    generationState === "valid" && generatedCode.length > 0;
  const inputFormatLabel = inputFormat === "json" ? "JSON" : "XML";
  const languageLabel = language === "csharp" ? "C#" : "Java";
  const inputLabel =
    mode === "data"
      ? `${inputFormatLabel} Input`
      : `${languageLabel} Class Input`;
  const outputLabel =
    mode === "data"
      ? `Generated ${languageLabel} Model`
      : "Generated JSON Sample";
  const outputEmptyMessage =
    mode === "data"
      ? `Generated ${languageLabel} model will appear here.`
      : "Generated JSON sample will appear here.";
  const primaryActionLabel =
    mode === "data"
      ? `Generate ${languageLabel} Model`
      : "Generate JSON Sample";
  const hasCustomizedOptions =
    mode === "data"
      ? JSON.stringify(dataOptions) !==
        JSON.stringify(createDefaultDataModelGenerationOptions())
      : JSON.stringify(classSampleOptions) !==
        JSON.stringify(createDefaultClassSampleGenerationOptions());

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

  function updateDataOption<
    Key extends keyof ResolvedDataModelGenerationOptions,
  >(key: Key, value: ResolvedDataModelGenerationOptions[Key]) {
    setDataOptions((current) => ({ ...current, [key]: value }));
    invalidateGeneratedCode();
  }

  function updateClassSampleOption<
    Key extends keyof ResolvedClassSampleGenerationOptions,
  >(key: Key, value: ResolvedClassSampleGenerationOptions[Key]) {
    setClassSampleOptions((current) => ({ ...current, [key]: value }));
    invalidateGeneratedCode();
  }

  function handleResetOptions() {
    if (mode === "data") {
      setDataOptions(createDefaultDataModelGenerationOptions());
    } else {
      setClassSampleOptions(createDefaultClassSampleGenerationOptions());
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
      ...classSampleOptions,
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
      dataOptions,
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
          ? "JSON sample copied."
          : `${languageLabel} model copied.`,
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
      overviewTitle="What is Data Model Generator?"
      overviewCollapsible
      overviewToggleLabel="What is Data Model Generator?"
      overview={
        <div className="space-y-3">
          <p>
            Convert representative JSON or XML into readable C# or Java model
            structures.
          </p>
          <p>
            C# and Java classes can also produce representative JSON samples.
            Source data and code are processed in your browser.
          </p>
        </div>
      }
      inputTitle={null}
      inputs={
        <div className="min-w-0 space-y-5">
          <div
            className={`grid min-w-0 gap-4 sm:grid-cols-2 ${
              mode === "data" ? "xl:grid-cols-4" : "xl:grid-cols-3"
            }`}
          >
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
                <option value="data">Data → Model</option>
                <option value="class">Class → Sample Data</option>
              </Select>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {mode === "data"
                  ? "JSON or XML → C# or Java"
                  : "C# or Java → JSON sample"}
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

            {mode === "data" ? (
              <div className="min-w-0">
                <label
                  htmlFor="data-model-generator-language"
                  className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Target Language
                </label>
                {languageSelector}
              </div>
            ) : null}

            <div className="min-w-0 sm:col-span-2 xl:col-span-1">
              <label
                htmlFor="data-model-generator-root-class"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                {mode === "data" ? "Root Class Name" : "Sample Root Class"}
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
                    ? "data-model-generator-root-class-error"
                    : "data-model-generator-root-class-note"
                }
              />
              {errorField === "rootClass" ? (
                <p
                  id="data-model-generator-root-class-error"
                  role="alert"
                  className="mt-2 text-sm font-medium text-red-700 dark:text-red-300"
                >
                  {errorMessage}
                </p>
              ) : (
                <p
                  id="data-model-generator-root-class-note"
                  className="mt-2 text-xs text-gray-500 dark:text-gray-400"
                >
                  {mode === "class"
                    ? "Choose a class declared in the input, or leave empty to use the first class."
                    : "Defines the generated root model name."}
                </p>
              )}
            </div>
          </div>

          <section className="min-w-0 rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-800/40">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Generator Options
                  </h2>
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                    {hasCustomizedOptions ? "Customized" : "Defaults"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {mode === "data"
                    ? `Naming and ${languageLabel} output preferences.`
                    : "JSON naming, nullable values, and collection samples."}
                </p>
              </div>
              <Button
                type="button"
                color="light"
                size="sm"
                onClick={() => setAreOptionsVisible((current) => !current)}
                aria-expanded={areOptionsVisible}
                aria-controls={optionsPanelId}
                className="shrink-0"
              >
                {areOptionsVisible ? "Hide Options" : "Show Options"}
              </Button>
            </div>

            {areOptionsVisible ? (
              <fieldset
                id={optionsPanelId}
                className="mt-4 min-w-0 border-t border-gray-200 pt-4 dark:border-gray-700"
              >
                <legend className="sr-only">Generator Options</legend>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Changing an option clears the current output until you
                    generate again.
                  </p>
                  <Button
                    type="button"
                    color="light"
                    size="xs"
                    onClick={handleResetOptions}
                    className="shrink-0"
                  >
                    Reset Options
                  </Button>
                </div>

                {mode === "data" ? (
                  <div className="space-y-5">
                    <div>
                      <h3 className="mb-3 text-xs font-semibold tracking-wide text-gray-700 uppercase dark:text-gray-300">
                        Naming
                      </h3>
                      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <div className="min-w-0">
                          <label
                            htmlFor="data-model-generator-property-naming"
                            className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200"
                          >
                            Property Naming
                          </label>
                          <Select
                            id="data-model-generator-property-naming"
                            value={dataOptions.propertyNaming}
                            onChange={(event) =>
                              updateDataOption(
                                "propertyNaming",
                                event.target
                                  .value as typeof dataOptions.propertyNaming,
                              )
                            }
                          >
                            <option value="default">
                              Default (
                              {language === "csharp"
                                ? "PascalCase"
                                : "camelCase"}
                              )
                            </option>
                            <option value="preserve">
                              Preserve Source Name
                            </option>
                          </Select>
                        </div>

                        <div className="min-w-0">
                          <label
                            htmlFor="data-model-generator-class-naming"
                            className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200"
                          >
                            Class Naming
                          </label>
                          <Select
                            id="data-model-generator-class-naming"
                            value={dataOptions.classNaming}
                            onChange={(event) =>
                              updateDataOption(
                                "classNaming",
                                event.target
                                  .value as typeof dataOptions.classNaming,
                              )
                            }
                          >
                            <option value="pascal">PascalCase</option>
                            <option value="preserve">
                              Preserve Source Name
                            </option>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {language === "csharp" ? (
                      <div>
                        <h3 className="mb-3 text-xs font-semibold tracking-wide text-gray-700 uppercase dark:text-gray-300">
                          C# Output
                        </h3>
                        <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          <div className="min-w-0">
                            <label
                              htmlFor="data-model-generator-csharp-nullable"
                              className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200"
                            >
                              Nullable Reference Types
                            </label>
                            <Select
                              id="data-model-generator-csharp-nullable"
                              value={
                                dataOptions.csharpNullableTypes
                                  ? "enabled"
                                  : "disabled"
                              }
                              onChange={(event) =>
                                updateDataOption(
                                  "csharpNullableTypes",
                                  event.target.value === "enabled",
                                )
                              }
                            >
                              <option value="disabled">Disabled</option>
                              <option value="enabled">Enabled</option>
                            </Select>
                          </div>

                          <div className="min-w-0">
                            <label
                              htmlFor="data-model-generator-csharp-style"
                              className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200"
                            >
                              C# Model Style
                            </label>
                            <Select
                              id="data-model-generator-csharp-style"
                              value={dataOptions.csharpModelStyle}
                              onChange={(event) =>
                                updateDataOption(
                                  "csharpModelStyle",
                                  event.target
                                    .value as typeof dataOptions.csharpModelStyle,
                                )
                              }
                            >
                              <option value="class">Class</option>
                              <option value="record">Record</option>
                            </Select>
                          </div>

                          {dataOptions.csharpModelStyle === "class" ? (
                            <div className="min-w-0">
                              <label
                                htmlFor="data-model-generator-csharp-setter"
                                className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200"
                              >
                                Property Setter
                              </label>
                              <Select
                                id="data-model-generator-csharp-setter"
                                value={dataOptions.csharpPropertySetter}
                                onChange={(event) =>
                                  updateDataOption(
                                    "csharpPropertySetter",
                                    event.target
                                      .value as typeof dataOptions.csharpPropertySetter,
                                  )
                                }
                              >
                                <option value="set">set</option>
                                <option value="init">init</option>
                              </Select>
                            </div>
                          ) : null}

                          <div className="min-w-0">
                            <label
                              htmlFor="data-model-generator-csharp-serialization"
                              className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200"
                            >
                              Serialization Attributes
                            </label>
                            <Select
                              id="data-model-generator-csharp-serialization"
                              value={dataOptions.csharpSerialization}
                              onChange={(event) =>
                                updateDataOption(
                                  "csharpSerialization",
                                  event.target
                                    .value as typeof dataOptions.csharpSerialization,
                                )
                              }
                            >
                              <option value="none">None</option>
                              <option value="system-text-json">
                                System.Text.Json
                              </option>
                            </Select>
                          </div>

                          <div className="min-w-0">
                            <label
                              htmlFor="data-model-generator-csharp-collection"
                              className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200"
                            >
                              Collection Type
                            </label>
                            <Select
                              id="data-model-generator-csharp-collection"
                              value={dataOptions.csharpCollectionType}
                              onChange={(event) =>
                                updateDataOption(
                                  "csharpCollectionType",
                                  event.target
                                    .value as typeof dataOptions.csharpCollectionType,
                                )
                              }
                            >
                              <option value="list">List&lt;T&gt;</option>
                              <option value="array">Array</option>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="mb-3 text-xs font-semibold tracking-wide text-gray-700 uppercase dark:text-gray-300">
                          Java Output
                        </h3>
                        <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          <div className="min-w-0">
                            <label
                              htmlFor="data-model-generator-java-style"
                              className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200"
                            >
                              Java Model Style
                            </label>
                            <Select
                              id="data-model-generator-java-style"
                              value={dataOptions.javaModelStyle}
                              onChange={(event) =>
                                updateDataOption(
                                  "javaModelStyle",
                                  event.target
                                    .value as typeof dataOptions.javaModelStyle,
                                )
                              }
                            >
                              <option value="accessors">
                                Fields + Getters/Setters
                              </option>
                              <option value="fields">Fields Only</option>
                            </Select>
                          </div>

                          <div className="min-w-0">
                            <label
                              htmlFor="data-model-generator-java-serialization"
                              className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200"
                            >
                              Serialization Attributes
                            </label>
                            <Select
                              id="data-model-generator-java-serialization"
                              value={dataOptions.javaSerialization}
                              onChange={(event) =>
                                updateDataOption(
                                  "javaSerialization",
                                  event.target
                                    .value as typeof dataOptions.javaSerialization,
                                )
                              }
                            >
                              <option value="none">None</option>
                              <option value="jackson">Jackson</option>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h3 className="mb-3 text-xs font-semibold tracking-wide text-gray-700 uppercase dark:text-gray-300">
                      JSON Sample
                    </h3>
                    <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      <div className="min-w-0">
                        <label
                          htmlFor="data-model-generator-json-property-naming"
                          className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200"
                        >
                          JSON Property Naming
                        </label>
                        <Select
                          id="data-model-generator-json-property-naming"
                          value={classSampleOptions.jsonPropertyNaming}
                          onChange={(event) =>
                            updateClassSampleOption(
                              "jsonPropertyNaming",
                              event.target
                                .value as typeof classSampleOptions.jsonPropertyNaming,
                            )
                          }
                        >
                          <option value="camel">camelCase</option>
                          <option value="preserve">
                            Preserve Class Member Name
                          </option>
                        </Select>
                      </div>

                      <div className="min-w-0">
                        <label
                          htmlFor="data-model-generator-nullable-sample"
                          className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200"
                        >
                          Nullable Sample Values
                        </label>
                        <Select
                          id="data-model-generator-nullable-sample"
                          value={classSampleOptions.nullableSampleValue}
                          onChange={(event) =>
                            updateClassSampleOption(
                              "nullableSampleValue",
                              event.target
                                .value as typeof classSampleOptions.nullableSampleValue,
                            )
                          }
                        >
                          <option value="example">
                            Generate Example Value
                          </option>
                          <option value="null">Generate null</option>
                        </Select>
                      </div>

                      <div className="min-w-0">
                        <label
                          htmlFor="data-model-generator-collection-sample"
                          className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200"
                        >
                          Collection Sample
                        </label>
                        <Select
                          id="data-model-generator-collection-sample"
                          value={classSampleOptions.collectionSampleValue}
                          onChange={(event) =>
                            updateClassSampleOption(
                              "collectionSampleValue",
                              event.target
                                .value as typeof classSampleOptions.collectionSampleValue,
                            )
                          }
                        >
                          <option value="one">One Item</option>
                          <option value="empty">Empty Array</option>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </fieldset>
            ) : null}
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              color="blue"
              onClick={handleGenerate}
              className="w-full sm:w-auto"
            >
              {primaryActionLabel}
            </Button>
          </div>

          {generationState === "valid" ? (
            <p role="status" aria-live="polite" className="sr-only">
              {mode === "data"
                ? `${languageLabel} model generated.`
                : "JSON sample generated."}
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

          <div className="grid min-w-0 gap-5 xl:grid-cols-2">
            <div className="min-w-0">
              <label
                htmlFor="data-model-generator-source-input"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                {inputLabel}
              </label>
              {(generationState === "empty" || generationState === "invalid") &&
              errorField === "source" &&
              errorMessage ? (
                <Alert
                  id="data-model-generator-source-error"
                  color="failure"
                  role="alert"
                  className="mb-3"
                >
                  <span className="font-semibold">
                    {generationState === "empty"
                      ? "Input required."
                      : "Unable to generate."}
                  </span>{" "}
                  {errorMessage}
                </Alert>
              ) : null}
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
                className="w-full max-w-full resize-y font-mono text-sm leading-6"
                spellCheck={false}
                wrap="off"
                aria-invalid={errorField === "source"}
                aria-describedby={
                  errorField === "source"
                    ? "data-model-generator-source-error"
                    : undefined
                }
              />
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2
                    id="data-model-generator-output-heading"
                    className="text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    {outputLabel}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Read-only generated output
                  </p>
                </div>
                <Button
                  type="button"
                  color="light"
                  size="sm"
                  onClick={handleCopyCode}
                  disabled={!hasCurrentOutput}
                  aria-describedby="data-model-generator-output-note"
                  className="shrink-0"
                >
                  {mode === "data" ? "Copy Code" : "Copy JSON"}
                </Button>
              </div>

              {warnings.length > 0 ? (
                <Alert
                  color="warning"
                  role="status"
                  aria-live="polite"
                  className="mb-3"
                >
                  <span className="font-semibold">
                    Generated with limitations.
                  </span>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </Alert>
              ) : null}

              <pre
                id="data-model-generator-output"
                role="region"
                aria-labelledby="data-model-generator-output-heading"
                aria-describedby="data-model-generator-output-note"
                tabIndex={0}
                className={`w-full max-w-full overflow-auto overscroll-contain rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 ${
                  hasCurrentOutput
                    ? "max-h-[42rem] min-h-[34rem] whitespace-pre"
                    : "min-h-32 whitespace-pre-wrap"
                }`}
              >
                {hasCurrentOutput ? (
                  generatedCode
                ) : (
                  <span className="font-sans text-gray-500 dark:text-gray-400">
                    {outputEmptyMessage}
                  </span>
                )}
              </pre>
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
            Generator options apply to this page only and return to defaults
            after a reload.
          </li>
          <li>
            Class-to-XML, XML serialization annotations, and full inheritance or
            arbitrary generic semantics are not available.
          </li>
        </ul>
      }
      toast={<ToolToast toast={toast} />}
    />
  );
}
