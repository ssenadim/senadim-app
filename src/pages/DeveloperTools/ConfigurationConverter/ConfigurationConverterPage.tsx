import { useState } from "react";
import { Alert, Button, Select, Textarea } from "flowbite-react";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import {
  convertConfiguration,
  getConfigurationFormatLabel,
  isConfigurationConversionFailure,
  type ConfigurationFormat,
} from "../../../utils/configurationConverter";
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

function getOppositeFormat(format: ConfigurationFormat): ConfigurationFormat {
  return format === "json" ? "yaml" : "json";
}

export function ConfigurationConverterPage() {
  usePageTitle("Configuration Converter");

  const [inputFormat, setInputFormat] = useState<ConfigurationFormat>("json");
  const [outputFormat, setOutputFormat] = useState<ConfigurationFormat>("yaml");
  const [inputText, setInputText] = useState(initialJsonExample);
  const [outputText, setOutputText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const inputLabel = getConfigurationFormatLabel(inputFormat);
  const outputLabel = getConfigurationFormatLabel(outputFormat);

  function clearResultState() {
    setOutputText("");
    setErrorMessage("");
  }

  function handleInputFormatChange(format: ConfigurationFormat) {
    setInputFormat(format);
    setOutputFormat(getOppositeFormat(format));
    clearResultState();
  }

  function handleOutputFormatChange(format: ConfigurationFormat) {
    setOutputFormat(format);
    setInputFormat(getOppositeFormat(format));
    clearResultState();
  }

  function handleConvert() {
    const result = convertConfiguration(inputText, inputFormat, outputFormat);

    if (isConfigurationConversionFailure(result)) {
      setOutputText("");
      setErrorMessage(result.error);
      return;
    }

    setErrorMessage("");
    setOutputText(result.value);
  }

  function handleSwap() {
    setInputFormat(outputFormat);
    setOutputFormat(inputFormat);

    if (outputText) {
      setInputText(outputText);
    }

    clearResultState();
  }

  function handleClear() {
    setInputText("");
    clearResultState();
  }

  return (
    <ToolPageLayout
      title="Configuration Converter"
      description="Convert application configuration between JSON and YAML directly in your browser."
      breadcrumbs={[
        { label: "Developer Productivity", path: routePaths.developerTools },
        { label: "Configuration Converter" },
      ]}
      overviewTitle="Configuration Conversion"
      overviewCollapsible
      overviewToggleLabel="About Configuration Conversion"
      overview={
        <div className="space-y-3">
          <p>
            Convert JSON and YAML configuration without sending content to an
            external service.
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
                    event.target.value as ConfigurationFormat,
                  )
                }
              >
                <option value="json">JSON</option>
                <option value="yaml">YAML</option>
              </Select>
            </div>

            <Button type="button" color="light" onClick={handleSwap}>
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
                <option value="json">JSON</option>
                <option value="yaml">YAML</option>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button type="button" color="blue" onClick={handleConvert}>
              Convert
            </Button>
            <Button type="button" color="gray" onClick={handleClear}>
              Clear
            </Button>
          </div>

          {errorMessage ? (
            <Alert
              id="configuration-converter-validation-error"
              color="failure"
              role="alert"
            >
              <span className="font-semibold">Conversion failed.</span>{" "}
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
                  clearResultState();
                }}
                placeholder={`Paste ${inputLabel} configuration here...`}
                className="font-mono"
                spellCheck={false}
                aria-invalid={Boolean(errorMessage)}
                aria-describedby={
                  errorMessage
                    ? "configuration-converter-validation-error"
                    : undefined
                }
              />
            </div>

            <div className="min-w-0">
              <label
                htmlFor="configuration-converter-output"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Output ({outputLabel})
              </label>
              <Textarea
                id="configuration-converter-output"
                rows={16}
                value={outputText}
                readOnly
                placeholder={`Converted ${outputLabel} will appear here...`}
                className="font-mono"
                spellCheck={false}
              />
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
            YAML features that cannot be represented in JSON are rejected.
          </li>
        </ul>
      }
    />
  );
}
