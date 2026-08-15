import { useMemo, useState } from "react";
import { Select, TextInput } from "flowbite-react";
import { CopyReadyOutput } from "../../../components/common/CopyReadyOutput";
import { HelpTooltip } from "../../../components/common/HelpTooltip";
import { ToolToast } from "../../../components/common/ToolToast";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { ToolExample } from "../../../types/toolPage";
import type { ToastMessage } from "../../../types/toast";
import { routePaths } from "../../../utils/routes";

type JvmProfile =
  | "Native-Heavy JVM Application"
  | "Heap-Intensive JVM Application"
  | "Balanced JVM Application";

const examples: ToolExample[] = [
  {
    title: "4 GiB Container Example",
    inputLabel: "Inputs",
    input:
      "Container Memory: 4096 MiB\nRuntime Profile: Heap-Intensive JVM Application",
    outputLabel: "Recommended",
    output:
      "Heap: 2662 MiB\nMetaspace: 410 MiB\nNative Memory: 614 MiB\nSafety Buffer: 410 MiB",
  },
];

export function JvmMemoryCalculatorPage() {
  usePageTitle("JVM Memory Calculator");

  const [containerMemory, setContainerMemory] = useState(4096);
  const [profile, setProfile] = useState<JvmProfile>(
    "Heap-Intensive JVM Application",
  );
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const containerMemoryError = getContainerMemoryError(containerMemory);

  const result = useMemo(
    () => calculateJvmMemory(containerMemory, profile),
    [containerMemory, profile],
  );
  const nonHeapNativeMb = result.metaspaceMb + result.nativeMb;
  const outputs = useMemo(() => {
    const javaOpts = `-Xms${result.heapMb}m -Xmx${result.heapMb}m`;
    const properties = `JAVA_OPTS=${javaOpts}\nJVM_HEAP_MB=${result.heapMb}\nJVM_METASPACE_MB=${result.metaspaceMb}`;
    const environment = `JAVA_OPTS=${javaOpts}\nCONTAINER_MEMORY_MB=${containerMemory}\nJVM_HEAP_MB=${result.heapMb}`;
    const json = JSON.stringify(
      {
        containerMemoryMb: containerMemory,
        profile,
        heapMb: result.heapMb,
        metaspaceMb: result.metaspaceMb,
        nativeMemoryMb: result.nativeMb,
        safetyBufferMb: result.bufferMb,
      },
      null,
      2,
    );
    const yaml = `env:\n  - name: JAVA_OPTS\n    value: "${javaOpts}"\n  - name: CONTAINER_MEMORY_MB\n    value: "${containerMemory}"`;

    return { environment, javaOpts, json, properties, yaml };
  }, [containerMemory, profile, result]);

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setToast({ id: Date.now(), tone: "success", text: `${label} copied.` });
    } catch {
      setToast({ id: Date.now(), tone: "failure", text: "Copy failed." });
    }
  }

  return (
    <ToolPageLayout
      title="JVM Memory Calculator"
      description="Calculate a practical runtime memory allocation for JVM application containers."
      breadcrumbs={[
        {
          label: "Platform Engineering Tools",
          path: routePaths.platformEngineering,
        },
        { label: "JVM Memory Calculator" },
      ]}
      overviewTitle="Why JVM Memory Sizing Matters?"
      overviewCollapsible
      overviewToggleLabel="Why JVM Memory Sizing Matters?"
      overview={
        <div className="space-y-3">
          <p>
            JVM memory includes heap, metaspace, native allocations, and
            operational headroom.
          </p>
          <p>
            Keeping these areas within the container limit reduces avoidable
            out-of-memory terminations.
          </p>
        </div>
      }
      inputs={
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 flex min-h-6 flex-wrap items-center gap-2">
              <label
                htmlFor="container-memory"
                className="text-sm font-semibold text-gray-900 dark:text-white"
              >
                Container Memory
              </label>
              <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                MiB
              </span>
              <HelpTooltip
                title="Container Memory"
                description="Total memory limit available to the JVM application, including heap and all runtime overhead."
              />
              <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                Required
              </span>
            </div>
            <TextInput
              id="container-memory"
              type="number"
              required
              min={256}
              step={1}
              inputMode="numeric"
              placeholder="e.g. 4096"
              value={Number.isNaN(containerMemory) ? "" : containerMemory}
              onChange={(event) =>
                setContainerMemory(
                  event.currentTarget.value === ""
                    ? Number.NaN
                    : Number(event.currentTarget.value),
                )
              }
              aria-invalid={Boolean(containerMemoryError)}
              aria-describedby={`container-memory-description${
                containerMemoryError ? " container-memory-error" : ""
              }`}
              color={containerMemoryError ? "failure" : "gray"}
            />
            <p
              id="container-memory-description"
              className="mt-2 text-sm text-gray-600 dark:text-gray-300"
            >
              Enter a whole number of MiB. Minimum: 256 MiB.
            </p>
            {containerMemoryError ? (
              <p
                id="container-memory-error"
                role="alert"
                className="mt-2 text-sm text-red-700 dark:text-red-300"
              >
                {containerMemoryError}
              </p>
            ) : null}
          </div>
          <div>
            <div className="mb-2 flex min-h-6 flex-wrap items-center gap-2">
              <label
                htmlFor="jvm-profile"
                className="text-sm font-semibold text-gray-900 dark:text-white"
              >
                Runtime Profile
              </label>
              <HelpTooltip
                title="Runtime Profile"
                description="Select the generic allocation pattern that most closely matches the JVM application's observed memory use."
              />
              <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                Required
              </span>
            </div>
            <Select
              id="jvm-profile"
              required
              value={profile}
              onChange={(event) => setProfile(event.target.value as JvmProfile)}
              aria-describedby="jvm-profile-description"
            >
              <option value="Native-Heavy JVM Application">
                Native-Heavy JVM Application
              </option>
              <option value="Heap-Intensive JVM Application">
                Heap-Intensive JVM Application
              </option>
              <option value="Balanced JVM Application">
                Balanced JVM Application
              </option>
            </Select>
            <p
              id="jvm-profile-description"
              className="mt-2 text-sm text-gray-600 dark:text-gray-300"
            >
              Choose the closest runtime memory pattern, then validate it with
              production metrics.
            </p>
          </div>
        </div>
      }
      outputs={
        containerMemoryError ? (
          <InvalidOutputState />
        ) : (
          <div className="min-w-0 space-y-6">
            <section
              aria-labelledby="primary-recommendation-title"
              className="rounded-xl border border-cyan-300 bg-cyan-50 p-5 shadow-sm dark:border-cyan-800 dark:bg-cyan-950/40"
            >
              <p className="text-xs font-semibold tracking-wide text-cyan-700 uppercase dark:text-cyan-300">
                Primary Recommendation
              </p>
              <h2
                id="primary-recommendation-title"
                className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                Recommended Maximum Heap
              </h2>
              <p className="mt-1 text-3xl font-bold break-words text-gray-950 sm:text-4xl dark:text-white">
                {result.heapMb} MiB
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700 dark:text-gray-200">
                Keep {nonHeapNativeMb} MiB outside the heap for metaspace and
                native memory, plus a {result.bufferMb} MiB safety buffer. The
                heap should not consume the full container limit.
              </p>
              <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryMetric
                  label="Available Container Memory"
                  value={`${containerMemory} MiB`}
                />
                <SummaryMetric
                  label="Maximum Heap"
                  value={`${result.heapMb} MiB`}
                />
                <SummaryMetric
                  label="Non-heap / Native"
                  value={`${nonHeapNativeMb} MiB`}
                />
                <SummaryMetric
                  label="Safety Margin"
                  value={`${result.bufferMb} MiB`}
                />
              </dl>
            </section>
            <section aria-labelledby="memory-breakdown-title">
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h2
                  id="memory-breakdown-title"
                  className="text-lg font-semibold text-gray-950 dark:text-white"
                >
                  Memory Breakdown
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Total runtime memory stays within the configured container
                  limit.
                </p>
                <dl className="mt-4 grid gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <BreakdownRow
                    label="Heap"
                    value={`${result.heapMb} MiB`}
                    percent={result.heapPercent}
                  />
                  <BreakdownRow
                    label="Metaspace"
                    value={`${result.metaspaceMb} MiB`}
                    percent={result.metaspacePercent}
                  />
                  <BreakdownRow
                    label="Native Memory"
                    value={`${result.nativeMb} MiB`}
                    percent={result.nativePercent}
                  />
                  <BreakdownRow
                    label="Safety Buffer"
                    value={`${result.bufferMb} MiB`}
                    percent={result.bufferPercent}
                  />
                  <BreakdownRow
                    label="Total Container Memory"
                    value={`${containerMemory} MiB`}
                    percent={100}
                    strong
                  />
                </dl>
              </div>
            </section>
            <section aria-labelledby="configuration-outputs-title">
              <h2
                id="configuration-outputs-title"
                className="mb-4 text-lg font-semibold text-gray-950 dark:text-white"
              >
                Copy-ready Configuration
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                <CopyReadyOutput
                  formatLabel="JVM Options"
                  value={outputs.javaOpts}
                  onCopy={copyText}
                />
                <CopyReadyOutput
                  formatLabel="Properties"
                  value={outputs.properties}
                  onCopy={copyText}
                />
                <CopyReadyOutput
                  formatLabel="Environment Variables"
                  value={outputs.environment}
                  onCopy={copyText}
                />
                <CopyReadyOutput
                  formatLabel="JSON"
                  value={outputs.json}
                  onCopy={copyText}
                />
                <CopyReadyOutput
                  formatLabel="YAML"
                  value={outputs.yaml}
                  onCopy={copyText}
                />
              </div>
            </section>
          </div>
        )
      }
      examples={examples}
      notesCollapsible
      notes={
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
          <li>Validate the selected profile with observed runtime metrics.</li>
          <li>Monitor heap, metaspace, and native memory together.</li>
          <li>Revisit the safety buffer when workload behavior changes.</li>
        </ul>
      }
      toast={<ToolToast toast={toast} />}
    />
  );
}

function calculateJvmMemory(containerMemory: number, profile: JvmProfile) {
  const profiles: Record<
    JvmProfile,
    {
      bufferPercent: number;
      heapPercent: number;
      metaspacePercent: number;
      nativePercent: number;
    }
  > = {
    "Native-Heavy JVM Application": {
      heapPercent: 55,
      metaspacePercent: 12,
      nativePercent: 18,
      bufferPercent: 15,
    },
    "Heap-Intensive JVM Application": {
      heapPercent: 65,
      metaspacePercent: 10,
      nativePercent: 15,
      bufferPercent: 10,
    },
    "Balanced JVM Application": {
      heapPercent: 60,
      metaspacePercent: 10,
      nativePercent: 15,
      bufferPercent: 15,
    },
  };
  const selected = profiles[profile];
  const allocationKeys = [
    "heapMb",
    "metaspaceMb",
    "nativeMb",
    "bufferMb",
  ] as const;
  type AllocationKey = (typeof allocationKeys)[number];
  const rawAllocations: Record<AllocationKey, number> = {
    heapMb: containerMemory * (selected.heapPercent / 100),
    metaspaceMb: containerMemory * (selected.metaspacePercent / 100),
    nativeMb: containerMemory * (selected.nativePercent / 100),
    bufferMb: containerMemory * (selected.bufferPercent / 100),
  };
  const allocations: Record<AllocationKey, number> = {
    heapMb: Math.floor(rawAllocations.heapMb),
    metaspaceMb: Math.floor(rawAllocations.metaspaceMb),
    nativeMb: Math.floor(rawAllocations.nativeMb),
    bufferMb: Math.floor(rawAllocations.bufferMb),
  };
  const allocatedMemory = allocationKeys.reduce(
    (total, key) => total + allocations[key],
    0,
  );
  const remainderOrder = [...allocationKeys].sort(
    (left, right) =>
      rawAllocations[right] -
      allocations[right] -
      (rawAllocations[left] - allocations[left]),
  );

  for (let index = 0; index < containerMemory - allocatedMemory; index += 1) {
    allocations[remainderOrder[index]] += 1;
  }

  return {
    ...selected,
    ...allocations,
  };
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-cyan-200 bg-white/70 p-3 dark:border-cyan-900 dark:bg-gray-950/40">
      <dt className="text-xs font-semibold text-gray-600 dark:text-gray-300">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-bold break-words text-gray-950 dark:text-white">
        {value}
      </dd>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  percent,
  strong,
}: {
  label: string;
  value: string;
  percent: number;
  strong?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-gray-200 pb-2 last:border-b-0 dark:border-gray-700">
      <dt
        className={`min-w-0 ${
          strong ? "font-bold text-gray-950 dark:text-white" : ""
        }`}
      >
        {label}
      </dt>
      <dd
        className={`max-w-full min-w-0 text-right break-words ${
          strong ? "font-bold text-gray-950 dark:text-white" : ""
        }`}
      >
        {value}{" "}
        <span className="text-gray-500 dark:text-gray-400">({percent}%)</span>
      </dd>
    </div>
  );
}

function getContainerMemoryError(value: number) {
  if (!Number.isFinite(value)) {
    return "Container memory is required; enter a numeric value in MiB.";
  }

  if (value <= 0) {
    return "Container memory must be greater than zero.";
  }

  if (!Number.isInteger(value)) {
    return "Container memory must be a whole number of MiB.";
  }

  if (value < 256) {
    return "Container memory must be at least 256 MiB.";
  }

  return null;
}

function InvalidOutputState() {
  return (
    <div
      role="status"
      className="rounded-lg border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
    >
      Correct the highlighted Container Memory value to see recommendations and
      copy-ready configuration.
    </div>
  );
}
