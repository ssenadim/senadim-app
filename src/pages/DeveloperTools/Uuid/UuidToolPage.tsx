import { useEffect, useState } from "react";
import { Alert, Button, Select, Textarea } from "flowbite-react";
import { HelpTooltip } from "../../../components/common/HelpTooltip";
import { ToolToast } from "../../../components/common/ToolToast";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { ToolExample } from "../../../types/toolPage";
import type { ToastMessage, ToastTone } from "../../../types/toast";
import {
  generateUuidV4List,
  uuidQuantityOptions,
  type UuidQuantity,
} from "../../../utils/uuid";
import { routePaths } from "../../../utils/routes";

const examples: ToolExample[] = [
  {
    title: "Example 1",
    inputLabel: "Use Case",
    input: "Database Primary Key",
    outputLabel: "Generated UUID",
    output: "550e8400-e29b-41d4-a716-446655440000",
  },
  {
    title: "Example 2",
    inputLabel: "Use Case",
    input: "Correlation ID for API Requests",
    outputLabel: "Generated UUID",
    output: "8f14e45f-ceea-4f3f-b2b8-6d6e6d6f6e6f",
  },
];

function parseQuantity(value: string): UuidQuantity {
  const numericValue = Number(value);
  const option = uuidQuantityOptions.find((quantity) => quantity === numericValue);

  return option ?? 1;
}

export function UuidToolPage() {
  usePageTitle("UUID Generator");

  const [quantity, setQuantity] = useState<UuidQuantity>(1);
  const [uuids, setUuids] = useState<string[]>([]);
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

  function handleGenerate() {
    try {
      const generatedUuids = generateUuidV4List(quantity);
      setUuids(generatedUuids);
      setErrorMessage("");
      showToast(
        "success",
        quantity === 1 ? "UUID generated." : `${quantity} UUIDs generated.`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "UUID generation failed. Please try again.";

      setErrorMessage(message);
      showToast("failure", "UUID generation failed.");
    }
  }

  async function copyText(value: string, successMessage: string) {
    if (!value) {
      showToast("info", "There is no UUID result to copy yet.");
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      showToast("success", successMessage);
    } catch {
      showToast("failure", "Copy failed. Please copy the value manually.");
    }
  }

  function handleCopyAll() {
    void copyText(uuids.join("\n"), "UUID result copied.");
  }

  function handleClear() {
    setUuids([]);
    setErrorMessage("");
    showToast("info", "UUID result cleared.");
  }

  const resultText = uuids.join("\n");

  return (
    <ToolPageLayout
      title="UUID Generator"
      description="Generate UUID v4 identifiers for APIs, databases, distributed systems, and event-driven workflows."
      breadcrumbs={[
        { label: "Developer Tools", path: routePaths.developerTools },
        { label: "UUID Generator" },
      ]}
      overviewTitle="What is a UUID?"
      overviewCollapsible
      overviewToggleLabel="What is a UUID?"
      overview={
        <div className="space-y-3">
          <p>
            UUID stands for Universally Unique Identifier, a standardized value
            used to identify records, messages, resources, and events.
          </p>
          <p>
            UUIDs are commonly used in APIs, databases, distributed systems, and
            event-driven architectures.
          </p>
          <p>
            They are useful when generating unique identifiers without relying
            on a central authority.
          </p>
        </div>
      }
      inputs={
        <div className="space-y-5">
          <div className="max-w-sm">
            <div className="mb-2 flex items-center gap-2">
              <label
                htmlFor="uuid-quantity"
                className="text-sm font-semibold text-gray-900 dark:text-white"
              >
                Quantity
              </label>
              <HelpTooltip
                title="Quantity"
                description="Select how many UUID values should be generated."
                exampleInput="5"
                exampleOutput="5 UUID v4 values"
              />
            </div>
            <Select
              id="uuid-quantity"
              value={quantity}
              onChange={(event) => setQuantity(parseQuantity(event.target.value))}
            >
              {uuidQuantityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
              UUID v4 values are generated in your browser using the Web Crypto
              API.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button color="blue" onClick={handleGenerate}>
              Generate
            </Button>
            <Button color="light" onClick={handleCopyAll}>
              Copy Result
            </Button>
            <Button color="gray" onClick={handleClear}>
              Clear
            </Button>
          </div>

          {errorMessage ? (
            <Alert color="failure" className="mt-5">
              <span className="font-semibold">UUID generation failed.</span>{" "}
              {errorMessage}
            </Alert>
          ) : null}

          <div>
            <div className="mb-2 flex items-center gap-2">
              <label
                htmlFor="uuid-result"
                className="text-sm font-semibold text-gray-900 dark:text-white"
              >
                Result
              </label>
              <HelpTooltip
                title="Result"
                description="Generated UUID values. These identifiers are suitable for most application and API scenarios."
                exampleInput="Generate 1"
                exampleOutput="550e8400-e29b-41d4-a716-446655440000"
              />
            </div>
            <Textarea
              id="uuid-result"
              rows={Math.min(Math.max(uuids.length, 5), 12)}
              value={resultText}
              readOnly
              placeholder="Generated UUID values will appear here..."
              className="font-mono"
            />
            {uuids.length > 0 ? (
              <div className="mt-4 grid gap-2">
                {uuids.map((uuid) => (
                  <div
                    key={uuid}
                    className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-950 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <code className="break-all text-sm text-gray-800 dark:text-gray-200">
                      {uuid}
                    </code>
                    <Button
                      color="light"
                      size="xs"
                      onClick={() => void copyText(uuid, "UUID copied.")}
                    >
                      Copy
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      }
      examples={examples}
      notesCollapsible
      notes={
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
          <li>UUIDs are not sequential.</li>
          <li>UUIDs are not encrypted.</li>
          <li>UUIDs should not be considered secret.</li>
          <li>UUID v4 uses randomness.</li>
        </ul>
      }
      toast={<ToolToast toast={toast} />}
    />
  );
}
