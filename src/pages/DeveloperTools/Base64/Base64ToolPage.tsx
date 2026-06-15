import { useEffect, useState } from "react";
import { Alert, Button, Textarea, Toast } from "flowbite-react";
import { HelpTooltip } from "../../../components/common/HelpTooltip";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { ToolExample } from "../../../types/toolPage";
import {
  decodeBase64,
  encodeBase64,
  isBase64Error,
} from "../../../utils/base64";
import { routePaths } from "../../../utils/routes";

type ToastTone = "success" | "failure" | "info";

interface ToastMessage {
  id: number;
  tone: ToastTone;
  text: string;
}

const examples: ToolExample[] = [
  {
    title: "Example 1",
    inputLabel: "Input",
    input: "Hello World",
    outputLabel: "Encoded",
    output: "SGVsbG8gV29ybGQ=",
  },
  {
    title: "Example 2",
    inputLabel: "Input",
    input: "admin:test123",
    outputLabel: "Encoded",
    output: "YWRtaW46dGVzdDEyMw==",
  },
];

function getToastClasses(tone: ToastTone) {
  const classes: Record<ToastTone, string> = {
    success:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
    failure:
      "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
    info: "border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950 dark:text-cyan-200",
  };

  return classes[tone];
}

export function Base64ToolPage() {
  usePageTitle("Base64 Encoder / Decoder");

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

  function handleEncode() {
    const result = encodeBase64(inputText);

    if (isBase64Error(result)) {
      setErrorMessage(result.error);
      showToast("failure", "Encoding failed.");
      return;
    }

    setOutputText(result.value);
    setErrorMessage("");
    showToast("success", "Text encoded to Base64.");
  }

  function handleDecode() {
    const result = decodeBase64(inputText);

    if (isBase64Error(result)) {
      setErrorMessage(result.error);
      setOutputText("");
      showToast("failure", "Base64 decoding failed.");
      return;
    }

    setOutputText(result.value);
    setErrorMessage("");
    showToast("success", "Base64 decoded to plain text.");
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

  function handleSwap() {
    setInputText(outputText);
    setOutputText(inputText);
    setErrorMessage("");
    showToast("info", "Input and result swapped.");
  }

  return (
    <ToolPageLayout
      title="Base64 Encoder / Decoder"
      description="Encode plain text into Base64 or decode Base64 values back into readable text."
      breadcrumbs={[
        { label: "Developer Tools", path: routePaths.developerTools },
        { label: "Base64 Encoder / Decoder" },
      ]}
      overviewTitle="What is Base64?"
      overview={
        <div className="space-y-3">
          <p>
            Base64 is an encoding format that represents binary or text data
            using a limited set of ASCII characters.
          </p>
          <p>
            It is commonly used in APIs, JWTs, email attachments, and
            integrations where data needs to travel safely through text-based
            systems.
          </p>
          <p className="font-semibold text-gray-800 dark:text-gray-100">
            Base64 is not encryption. Encoded values can be decoded by anyone
            who has the value.
          </p>
        </div>
      }
      inputs={
        <div>
          <div className="mb-2 flex items-center gap-2">
            <label
              htmlFor="base64-input"
              className="text-sm font-semibold text-gray-900 dark:text-white"
            >
              Input Text
            </label>
            <HelpTooltip
              title="Input Text"
              description="Enter plain text to encode, or Base64 text to decode."
              exampleInput="Hello World"
              exampleOutput="SGVsbG8gV29ybGQ="
            />
          </div>
          <Textarea
            id="base64-input"
            rows={12}
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            placeholder="Enter plain text or Base64 here..."
            className="font-mono"
          />
          {errorMessage ? (
            <Alert color="failure" className="mt-5">
              <span className="font-semibold">Invalid Base64 input.</span>{" "}
              {errorMessage}
            </Alert>
          ) : null}
        </div>
      }
      outputs={
        <div>
          <div className="mb-2 flex items-center gap-2">
            <label
              htmlFor="base64-output"
              className="text-sm font-semibold text-gray-900 dark:text-white"
            >
              Result
            </label>
            <HelpTooltip
              title="Result"
              description="The generated Base64 value or decoded plain text."
              exampleInput="admin:test123"
              exampleOutput="YWRtaW46dGVzdDEyMw=="
            />
          </div>
          <Textarea
            id="base64-output"
            rows={12}
            value={outputText}
            readOnly
            placeholder="Result will appear here..."
            className="font-mono"
          />
        </div>
      }
      actions={
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button color="blue" onClick={handleEncode}>
            Encode
          </Button>
          <Button color="green" onClick={handleDecode}>
            Decode
          </Button>
          <Button color="light" onClick={handleCopy}>
            Copy Result
          </Button>
          <Button color="light" onClick={handleSwap}>
            Swap
          </Button>
          <Button color="gray" onClick={handleClear}>
            Clear
          </Button>
        </div>
      }
      examples={examples}
      notes={
        <p className="text-sm leading-7 text-gray-600 dark:text-gray-300">
          Base64 is useful for transport-safe representation of text and binary
          data, but it does not protect secrets. Avoid treating encoded values
          as encrypted or secure.
        </p>
      }
      toast={
        toast ? (
          <div className="fixed bottom-5 right-5 z-50 max-w-sm">
            <Toast
              key={toast.id}
              className={`border shadow-lg ${getToastClasses(toast.tone)}`}
            >
              <div className="text-sm font-medium">{toast.text}</div>
            </Toast>
          </div>
        ) : null
      }
    />
  );
}
