import { useEffect, useState } from "react";
import { Alert, Button, Checkbox, Select, Textarea } from "flowbite-react";
import { HelpTooltip } from "../../../components/common/HelpTooltip";
import { ToolToast } from "../../../components/common/ToolToast";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { ToastMessage, ToastTone } from "../../../types/toast";
import {
  convertConfiguration,
  getConfigurationFormatLabel,
  getSupportedOutputFormats,
  isConfigurationConversionFailure,
  type ConfigurationFormat,
  type ConfigurationInputFormat,
  type PropertiesValueTypes,
} from "../../../utils/configurationConverter";
import {
  formatTextStatistics,
  getConfigurationDownload,
} from "../../../utils/configurationOutput";
import { routePaths } from "../../../utils/routes";

const initialJsonExample = `{
  "server": {
    "port": 8080
  },
  "database": {
    "host": "localhost",
    "enabled": true
  }
}`;

const initialYamlExample = `server:
  port: 8080
database:
  host: localhost
  enabled: true`;

const initialPropertiesExample = `server.port=8080
server.address=localhost
database.host=db.internal
database.enabled=true
security.session.timeout=900`;

type ValidationState = "idle" | "empty" | "valid" | "invalid" | "stale";

export function ConfigurationConverterPage() {
  usePageTitle("Configuration Converter");

  const [inputFormat, setInputFormat] =
    useState<ConfigurationInputFormat>("json");
  const [outputFormat, setOutputFormat] = useState<ConfigurationFormat>("yaml");
  const [inputText, setInputText] = useState(initialJsonExample);
  const [outputText, setOutputText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [validationState, setValidationState] =
    useState<ValidationState>("idle");
  const [expandDottedKeys, setExpandDottedKeys] = useState(true);
  const [propertiesValueTypes, setPropertiesValueTypes] =
    useState<PropertiesValueTypes>("infer");
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const inputLabel = getConfigurationFormatLabel(inputFormat);
  const outputLabel = getConfigurationFormatLabel(outputFormat);
  const supportedOutputFormats = getSupportedOutputFormats(inputFormat);
  const hasCurrentOutput = validationState === "valid" && outputText.length > 0;

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

  function resetResultState() {
    setOutputText("");
    setErrorMessage("");
    setValidationState("idle");
  }

  function invalidateResultState() {
    const shouldShowStaleState =
      validationState === "stale" ||
      (validationState === "valid" && outputText.length > 0);

    setOutputText("");
    setErrorMessage("");
    setValidationState(shouldShowStaleState ? "stale" : "idle");
  }

  function handleInputFormatChange(format: ConfigurationInputFormat) {
    setInputFormat(format);

    const nextOutputFormats = getSupportedOutputFormats(format);
    setOutputFormat((current) =>
      nextOutputFormats.includes(current) ? current : nextOutputFormats[0],
    );

    if (
      !inputText.trim() ||
      inputText === initialJsonExample ||
      inputText === initialYamlExample ||
      inputText === initialPropertiesExample
    ) {
      setInputText(
        format === "json"
          ? initialJsonExample
          : format === "yaml"
            ? initialYamlExample
            : initialPropertiesExample,
      );
    }

    invalidateResultState();
  }

  function handleOutputFormatChange(format: ConfigurationFormat) {
    setOutputFormat(format);
    invalidateResultState();
  }

  function handleConvert() {
    if (!inputText.trim()) {
      setOutputText("");
      setErrorMessage(`Enter ${inputLabel} configuration to convert.`);
      setValidationState("empty");
      return;
    }

    const result = convertConfiguration(inputText, inputFormat, outputFormat, {
      expandDottedKeys,
      propertiesValueTypes,
    });

    if (isConfigurationConversionFailure(result)) {
      setOutputText("");
      setErrorMessage(result.error);
      setValidationState("invalid");
      return;
    }

    setErrorMessage("");
    setOutputText(result.value);
    setValidationState("valid");
  }

  function handleSwap() {
    if (inputFormat === "properties") {
      return;
    }

    setInputFormat(outputFormat);
    setOutputFormat(inputFormat);

    if (outputText) {
      setInputText(outputText);
    }

    invalidateResultState();
  }

  function handleClear() {
    setInputText("");
    resetResultState();
    showToast("info", "Input and output cleared.");
  }

  async function handleCopyOutput() {
    if (!hasCurrentOutput) {
      return;
    }

    try {
      await navigator.clipboard.writeText(outputText);
      showToast("success", "Output copied to clipboard.");
    } catch {
      showToast("failure", "Copy failed. Please copy the output manually.");
    }
  }

  function handleDownloadOutput() {
    if (!hasCurrentOutput) {
      return;
    }

    const download = getConfigurationDownload(outputText, outputFormat);
    const blob = new Blob([download.content], { type: download.mimeType });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = download.fileName;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    showToast("success", `${download.fileName} downloaded.`);
  }

  return (
    <ToolPageLayout
      title="Configuration Converter"
      description="Convert Properties configuration to JSON or YAML, or convert between JSON and YAML directly in your browser."
      breadcrumbs={[
        { label: "Developer Productivity", path: routePaths.developerTools },
        { label: "Configuration Converter" },
      ]}
      overviewTitle="What is Configuration Conversion?"
      overviewCollapsible
      overviewToggleLabel="What is Configuration Conversion?"
      overview={
        <div className="space-y-3">
          <p>
            Convert Properties, JSON, and YAML configuration without sending
            content to an external service.
          </p>
          <p>
            Compatible strings, numbers, booleans, null values, arrays, and
            objects are preserved between formats.
          </p>
        </div>
      }
      inputTitle={null}
      inputs={
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-end">
            <div>
              <label
                htmlFor="configuration-converter-input-format"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Input Format
              </label>
              <Select
                id="configuration-converter-input-format"
                value={inputFormat}
                onChange={(event) =>
                  handleInputFormatChange(
                    event.target.value as ConfigurationInputFormat,
                  )
                }
              >
                <option value="json">JSON</option>
                <option value="yaml">YAML</option>
                <option value="properties">Properties</option>
              </Select>
            </div>

            <Button
              type="button"
              color="light"
              onClick={handleSwap}
              disabled={inputFormat === "properties"}
              aria-label={`Swap ${inputLabel} and ${outputLabel} formats`}
              aria-describedby={
                inputFormat === "properties"
                  ? "configuration-converter-swap-note"
                  : undefined
              }
            >
              Swap Formats
            </Button>

            <div>
              <label
                htmlFor="configuration-converter-output-format"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Output Format
              </label>
              <Select
                id="configuration-converter-output-format"
                value={outputFormat}
                onChange={(event) =>
                  handleOutputFormatChange(
                    event.target.value as ConfigurationFormat,
                  )
                }
              >
                {supportedOutputFormats.map((format) => (
                  <option key={format} value={format}>
                    {getConfigurationFormatLabel(format)}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <p
            className="text-sm font-medium text-gray-600 dark:text-gray-300"
            aria-live="polite"
          >
            Current direction: {inputLabel} → {outputLabel}
          </p>

          {inputFormat === "properties" ? (
            <div className="space-y-3">
              <p
                id="configuration-converter-swap-note"
                className="text-xs text-gray-500 dark:text-gray-400"
              >
                Swap is unavailable because conversion to Properties is not
                supported.
              </p>

              <fieldset className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950/50">
                <legend className="px-2 text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-300">
                  Properties options
                </legend>
                <div className="grid min-w-0 gap-4 sm:grid-cols-2 sm:items-end">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <label
                        htmlFor="configuration-converter-value-types"
                        className="text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        Value Types
                      </label>
                      <HelpTooltip
                        title="Infer Types"
                        description="Convert simple values such as numbers and booleans to native types when safe. Preserve Strings keeps every value as text."
                      />
                    </div>
                    <Select
                      id="configuration-converter-value-types"
                      value={propertiesValueTypes}
                      onChange={(event) => {
                        setPropertiesValueTypes(
                          event.target.value as PropertiesValueTypes,
                        );
                        invalidateResultState();
                      }}
                    >
                      <option value="infer">Infer Types</option>
                      <option value="preserve">Preserve Strings</option>
                    </Select>
                  </div>

                  <div className="flex min-h-10 items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-900">
                    <Checkbox
                      id="configuration-converter-expand-dotted-keys"
                      checked={expandDottedKeys}
                      onChange={(event) => {
                        setExpandDottedKeys(event.target.checked);
                        invalidateResultState();
                      }}
                    />
                    <label
                      htmlFor="configuration-converter-expand-dotted-keys"
                      className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Expand dotted keys
                    </label>
                    <HelpTooltip
                      title="Expand dotted keys"
                      description="Convert keys such as server.port into nested objects."
                    />
                  </div>
                </div>
              </fieldset>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button type="button" color="blue" onClick={handleConvert}>
              Convert
            </Button>
            <Button type="button" color="gray" onClick={handleClear}>
              Clear
            </Button>
          </div>

          {validationState === "valid" ? (
            <p
              role="status"
              aria-live="polite"
              className="text-sm font-semibold text-emerald-700 dark:text-emerald-300"
            >
              Valid {inputLabel}
            </p>
          ) : null}

          {validationState === "stale" ? (
            <p
              role="status"
              aria-live="polite"
              className="text-sm font-medium text-amber-700 dark:text-amber-300"
            >
              Previous output was cleared after a change. Convert again to
              refresh it.
            </p>
          ) : null}

          {(validationState === "empty" || validationState === "invalid") &&
          errorMessage ? (
            <Alert
              id="configuration-converter-validation-error"
              color={validationState === "empty" ? "warning" : "failure"}
              role="alert"
            >
              <span className="font-semibold">
                {validationState === "empty"
                  ? "Input required."
                  : `Invalid ${inputLabel}.`}
              </span>{" "}
              {errorMessage}
            </Alert>
          ) : null}

          <div className="grid min-w-0 gap-5 lg:grid-cols-2">
            <div className="min-w-0">
              <label
                htmlFor="configuration-converter-input"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Input ({inputLabel})
              </label>
              <Textarea
                id="configuration-converter-input"
                rows={16}
                value={inputText}
                onChange={(event) => {
                  setInputText(event.target.value);
                  invalidateResultState();
                }}
                placeholder={`Paste ${inputLabel} configuration here...`}
                className="font-mono"
                spellCheck={false}
                wrap="off"
                aria-invalid={Boolean(errorMessage)}
                aria-describedby={
                  errorMessage
                    ? "configuration-converter-validation-error"
                    : undefined
                }
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {formatTextStatistics(inputText)}
              </p>
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label
                  htmlFor="configuration-converter-output"
                  className="text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Output ({outputLabel})
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    color="light"
                    size="xs"
                    onClick={handleCopyOutput}
                    disabled={!hasCurrentOutput}
                    aria-describedby="configuration-converter-output-actions-note"
                  >
                    Copy Output
                  </Button>
                  <Button
                    type="button"
                    color="light"
                    size="xs"
                    onClick={handleDownloadOutput}
                    disabled={!hasCurrentOutput}
                    aria-describedby="configuration-converter-output-actions-note"
                  >
                    Download Output
                  </Button>
                </div>
              </div>
              <Textarea
                id="configuration-converter-output"
                rows={16}
                value={outputText}
                readOnly
                placeholder={`Converted ${outputLabel} will appear here...`}
                className="font-mono"
                spellCheck={false}
                wrap="off"
              />
              {outputText ? (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {formatTextStatistics(outputText)}
                </p>
              ) : null}
              <p
                id="configuration-converter-output-actions-note"
                className="mt-2 text-xs text-gray-500 dark:text-gray-400"
              >
                {hasCurrentOutput
                  ? "Actions use the current converted output only."
                  : validationState === "stale"
                    ? "Output was cleared after a change. Convert again to enable actions."
                    : "Convert the current input to enable output actions."}
              </p>
            </div>
          </div>
        </div>
      }
      examples={[]}
      notesCollapsible
      notes={
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
          <li>Conversion runs entirely in your browser.</li>
          <li>Input is converted only when you select Convert.</li>
          <li>
            Properties input supports comments, dotted keys, and conservative
            value type inference.
          </li>
          <li>
            YAML features that cannot be represented in JSON are rejected.
          </li>
        </ul>
      }
      toast={<ToolToast toast={toast} />}
    />
  );
}
