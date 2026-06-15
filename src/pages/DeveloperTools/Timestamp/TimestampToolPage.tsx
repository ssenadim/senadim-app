import { useEffect, useState } from "react";
import { Alert, Button, Select, TextInput } from "flowbite-react";
import { HelpTooltip } from "../../../components/common/HelpTooltip";
import { ToolToast } from "../../../components/common/ToolToast";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { ToolExample } from "../../../types/toolPage";
import type { ToastMessage, ToastTone } from "../../../types/toast";
import {
  convertDateToTimestamp,
  convertTimestampToDate,
  getCurrentTimestamps,
  getUnitLabel,
  isTimestampFailure,
  type DateTimestampResult,
  type TimestampDateResult,
  type TimestampTimezone,
} from "../../../utils/timestamp";
import { routePaths } from "../../../utils/routes";

const examples: ToolExample[] = [
  {
    title: "Example 1",
    inputLabel: "Input Timestamp",
    input: "1752600000",
    outputLabel: "Output",
    output: "2025-07-15 12:00:00 UTC",
  },
  {
    title: "Example 2",
    inputLabel: "Input Date",
    input: "2025-07-15 15:00:00 Europe/Istanbul",
    outputLabel: "Output",
    output: "1752600000",
  },
  {
    title: "JWT Example",
    inputLabel: "exp",
    input: "1752600000",
    outputLabel: "Converted Expiration",
    output: "2025-07-15 12:00:00 UTC",
  },
];

export function TimestampToolPage() {
  usePageTitle("Timestamp Converter");

  const [current, setCurrent] = useState(getCurrentTimestamps);
  const [timestampInput, setTimestampInput] = useState("");
  const [timestampResult, setTimestampResult] =
    useState<TimestampDateResult | null>(null);
  const [timestampError, setTimestampError] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [timezone, setTimezone] = useState<TimestampTimezone>("istanbul");
  const [dateResult, setDateResult] = useState<DateTimestampResult | null>(null);
  const [dateError, setDateError] = useState("");
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

  async function copyText(value: string, message: string) {
    if (!value) {
      showToast("info", "There is no result to copy yet.");
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      showToast("success", message);
    } catch {
      showToast("failure", "Copy failed. Please copy the value manually.");
    }
  }

  function handleTimestampConvert() {
    const result = convertTimestampToDate(timestampInput);

    if (isTimestampFailure(result)) {
      setTimestampError(result.error);
      setTimestampResult(null);
      showToast("failure", "Timestamp conversion failed.");
      return;
    }

    setTimestampError("");
    setTimestampResult(result);
    showToast("success", "Timestamp converted.");
  }

  function handleDateConvert() {
    const result = convertDateToTimestamp(dateInput, timezone);

    if (isTimestampFailure(result)) {
      setDateError(result.error);
      setDateResult(null);
      showToast("failure", "Date conversion failed.");
      return;
    }

    setDateError("");
    setDateResult(result);
    showToast("success", "Date converted to timestamp.");
  }

  function refreshCurrent() {
    setCurrent(getCurrentTimestamps());
    showToast("info", "Current timestamp refreshed.");
  }

  return (
    <ToolPageLayout
      title="Timestamp Converter"
      description="Convert Unix timestamps to human-readable dates and convert dates back to Unix timestamps."
      breadcrumbs={[
        { label: "Developer Tools", path: routePaths.developerTools },
        { label: "Timestamp Converter" },
      ]}
      overviewTitle="What is a Unix Timestamp?"
      overview={
        <div className="space-y-3">
          <p>
            Unix timestamps represent the number of seconds or milliseconds
            since January 1, 1970 UTC.
          </p>
          <p>
            They are commonly used in APIs, databases, event streams, and JWT
            tokens.
          </p>
          <p>
            JWT claims such as exp, iat, and nbf typically use Unix timestamps.
          </p>
        </div>
      }
      inputs={
        <div className="space-y-6">
          <section className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-900 dark:bg-cyan-950/40">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-950 dark:text-white">
                  Current Timestamp
                </p>
                <p className="mt-2 font-mono text-sm text-gray-700 dark:text-gray-200">
                  Seconds: {current.seconds}
                </p>
                <p className="font-mono text-sm text-gray-700 dark:text-gray-200">
                  Milliseconds: {current.milliseconds}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button color="light" size="sm" onClick={() => void copyText(current.seconds, "Current seconds copied.")}>
                  Copy Seconds
                </Button>
                <Button color="light" size="sm" onClick={() => void copyText(current.milliseconds, "Current milliseconds copied.")}>
                  Copy Milliseconds
                </Button>
                <Button color="gray" size="sm" onClick={refreshCurrent}>
                  Refresh
                </Button>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
              Timestamp to Date/Time
            </h2>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <label htmlFor="timestamp-input" className="text-sm font-semibold text-gray-900 dark:text-white">
                  Timestamp Value
                </label>
                <HelpTooltip
                  title="Timestamp Value"
                  description="Unix timestamps are commonly used in JWT tokens, databases, APIs and event systems."
                  exampleInput="1752600000"
                  exampleOutput="Unix Timestamp (Seconds)"
                />
              </div>
              <TextInput
                id="timestamp-input"
                value={timestampInput}
                onChange={(event) => setTimestampInput(event.target.value)}
                placeholder="1752600000"
              />
              {timestampResult ? (
                <p className="mt-2 text-sm font-medium text-cyan-700 dark:text-cyan-300">
                  Detected: {getUnitLabel(timestampResult.unit)}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button color="blue" onClick={handleTimestampConvert}>
                Convert Timestamp
              </Button>
              <Button color="light" onClick={() => void copyText(timestampResult ? `${timestampResult.utc}\n${timestampResult.local}\n${timestampResult.istanbul}` : "", "Timestamp result copied.")}>
                Copy Result
              </Button>
              <Button color="gray" onClick={() => {
                setTimestampInput("");
                setTimestampResult(null);
                setTimestampError("");
              }}>
                Clear
              </Button>
            </div>
            {timestampError ? <Alert color="failure">{timestampError}</Alert> : null}
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
              Date/Time to Timestamp
            </h2>
            <div className="grid gap-4 md:grid-cols-[1fr_16rem]">
              <div>
                <label htmlFor="date-input" className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                  Date / Time
                </label>
                <TextInput
                  id="date-input"
                  value={dateInput}
                  onChange={(event) => setDateInput(event.target.value)}
                  placeholder="2025-07-15 15:00:00"
                />
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <label htmlFor="timezone-input" className="text-sm font-semibold text-gray-900 dark:text-white">
                    Timezone
                  </label>
                  <HelpTooltip
                    title="Timezone"
                    description="Select the timezone used when converting date values."
                    exampleInput="Europe/Istanbul"
                    exampleOutput="UTC+03:00"
                  />
                </div>
                <Select
                  id="timezone-input"
                  value={timezone}
                  onChange={(event) =>
                    setTimezone(event.target.value as TimestampTimezone)
                  }
                >
                  <option value="utc">UTC</option>
                  <option value="local">Local Browser Timezone</option>
                  <option value="istanbul">Europe/Istanbul</option>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button color="blue" onClick={handleDateConvert}>
                Convert To Timestamp
              </Button>
              <Button color="light" onClick={() => void copyText(dateResult ? `${dateResult.seconds}\n${dateResult.milliseconds}` : "", "Date result copied.")}>
                Copy Result
              </Button>
              <Button color="gray" onClick={() => {
                setDateInput("");
                setDateResult(null);
                setDateError("");
              }}>
                Clear
              </Button>
            </div>
            {dateError ? <Alert color="failure">{dateError}</Alert> : null}
          </section>
        </div>
      }
      outputs={
        <div className="grid gap-5 lg:grid-cols-2">
          <ResultGroup
            title="Timestamp to Date/Time Result"
            rows={[
              ["UTC Date/Time", timestampResult?.utc],
              ["Local Browser Date/Time", timestampResult?.local],
              ["Europe/Istanbul Date/Time", timestampResult?.istanbul],
            ]}
          />
          <ResultGroup
            title="Date/Time to Timestamp Result"
            rows={[
              ["Unix Timestamp (Seconds)", dateResult?.seconds],
              ["Unix Timestamp (Milliseconds)", dateResult?.milliseconds],
            ]}
          />
        </div>
      }
      examples={examples}
      notesCollapsible
      notes={
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
          <li>Unix timestamps may use seconds or milliseconds.</li>
          <li>UTC is timezone-independent.</li>
          <li>Local time depends on the user's browser settings.</li>
          <li>JWT exp, iat and nbf claims usually use Unix timestamps in seconds.</li>
        </ul>
      }
      toast={<ToolToast toast={toast} />}
    />
  );
}

interface ResultGroupProps {
  title: string;
  rows: Array<[string, string | undefined]>;
}

function ResultGroup({ title, rows }: ResultGroupProps) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        <HelpTooltip
          title="Results"
          description="Converted date and time values in multiple timezones."
          exampleInput="1752600000"
          exampleOutput="2025-07-15 12:00:00 UTC"
        />
      </div>
      <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
        {rows.map(([label, value]) => (
          <div key={label} className="p-3">
            <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              {label}
            </p>
            <p className="mt-1 break-all font-mono text-sm text-gray-900 dark:text-gray-100">
              {value ?? "-"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
