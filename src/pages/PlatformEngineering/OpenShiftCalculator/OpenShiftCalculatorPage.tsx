import { useMemo, useState } from "react";
import { Badge, Button, TextInput } from "flowbite-react";
import { HelpTooltip } from "../../../components/common/HelpTooltip";
import { ToolToast } from "../../../components/common/ToolToast";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { ToolExample } from "../../../types/toolPage";
import type { ToastMessage } from "../../../types/toast";
import { routePaths } from "../../../utils/routes";

const tabs = ["Pod Resources", "HPA", "Container Memory", "PVC Size"] as const;

type CalculatorTab = (typeof tabs)[number];

const examples: ToolExample[] = [
  {
    title: "Container Memory Example",
    inputLabel: "Inputs",
    input: "Heap: 2048 MB\nMetaspace: 256 MB\nNative: 256 MB\nBuffer: 20%",
    outputLabel: "Result",
    output: "3072 MB",
  },
];

export function OpenShiftCalculatorPage() {
  usePageTitle("OpenShift Calculator Suite");

  const [activeTab, setActiveTab] = useState<CalculatorTab>("Container Memory");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [heap, setHeap] = useState(2048);
  const [metaspace, setMetaspace] = useState(256);
  const [nativeMemory, setNativeMemory] = useState(256);
  const [bufferPercent, setBufferPercent] = useState(20);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const calculation = useMemo(() => {
    const baseMemory = heap + metaspace + nativeMemory;
    const buffer = Math.round(baseMemory * (bufferPercent / 100));
    const total = baseMemory + buffer;

    return {
      buffer,
      total,
      totalGb: total / 1024,
    };
  }, [bufferPercent, heap, metaspace, nativeMemory]);

  const generatedOutputs = useMemo(() => {
    const memoryGi = Math.ceil(calculation.total / 1024);
    const properties = `JAVA_OPTS=-Xms${heap}m -Xmx${heap}m`;
    const environment = `JAVA_HEAP_MB=${heap}\nCONTAINER_MEMORY_MB=${calculation.total}`;
    const json = JSON.stringify(
      {
        heapMb: heap,
        recommendedMemoryMb: calculation.total,
        recommendedMemoryGi: memoryGi,
      },
      null,
      2,
    );
    const yaml = `resources:\n  requests:\n    memory: "${memoryGi}Gi"\n  limits:\n    memory: "${memoryGi}Gi"`;

    return { environment, json, properties, yaml };
  }, [calculation.total, heap]);

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setToast({ id: Date.now(), tone: "success", text: `${label} copied.` });
    } catch {
      setToast({ id: Date.now(), tone: "failure", text: "Copy failed." });
    }
  }

  function copyAllOutputs() {
    const value = [
      "# Properties",
      generatedOutputs.properties,
      "",
      "# Environment Variables",
      generatedOutputs.environment,
      "",
      "# JSON",
      generatedOutputs.json,
      "",
      "# Kubernetes/OpenShift YAML",
      generatedOutputs.yaml,
    ].join("\n");

    void copyText(value, "All outputs");
  }

  return (
    <ToolPageLayout
      title="OpenShift Calculator Suite"
      description="Sizing and capacity planning tools for OpenShift workloads."
      breadcrumbs={[
        {
          label: "Platform Engineering",
          path: routePaths.platformEngineering,
        },
        { label: "OpenShift Calculator Suite" },
      ]}
      overviewTitle="Why Container Memory Matters"
      overview={
        <div className="space-y-3">
          <p>Container memory should be larger than JVM heap.</p>
          <p>JVM uses additional memory outside heap.</p>
          <p>Insufficient limits may cause OOMKilled events.</p>
          <p>Proper sizing improves stability.</p>
        </div>
      }
      inputs={
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={[
                  "rounded-lg border px-3 py-2 text-sm font-semibold transition",
                  activeTab === tab
                    ? "border-cyan-600 bg-cyan-50 text-cyan-800 dark:border-cyan-500 dark:bg-cyan-950 dark:text-cyan-200"
                    : "border-gray-200 bg-white text-gray-700 hover:border-cyan-300 hover:text-cyan-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200",
                ].join(" ")}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Container Memory" ? (
            <div className="space-y-5">
              <NumberField
                id="heap-size"
                label="Heap Size (MB)"
                value={heap}
                onChange={setHeap}
                tooltip="Maximum JVM heap size (-Xmx)."
              />

              <Button
                color="light"
                size="sm"
                onClick={() => setShowAdvanced((current) => !current)}
              >
                {showAdvanced ? "Hide Advanced Settings" : "Show Advanced Settings"}
              </Button>

              {showAdvanced ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <NumberField
                    id="metaspace"
                    label="Metaspace (MB)"
                    value={metaspace}
                    onChange={setMetaspace}
                    tooltip="Memory used for class metadata."
                  />
                  <NumberField
                    id="native-memory"
                    label="Native Memory (MB)"
                    value={nativeMemory}
                    onChange={setNativeMemory}
                    tooltip="Thread stacks, direct buffers and JVM native allocations."
                  />
                  <NumberField
                    id="safety-buffer"
                    label="Safety Buffer (%)"
                    value={bufferPercent}
                    onChange={setBufferPercent}
                    tooltip="Additional headroom to avoid OOM kills."
                  />
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-950">
              <Badge color="warning" className="mx-auto w-fit">
                Coming Soon
              </Badge>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                {activeTab} calculator is coming soon.
              </p>
            </div>
          )}
        </div>
      }
      outputs={
        activeTab === "Container Memory" ? (
          <div className="space-y-6">
            <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-5 dark:border-cyan-900 dark:bg-cyan-950/40">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Recommended Container Memory
                </p>
                <p className="mt-2 text-4xl font-bold text-gray-950 dark:text-white">
                  {calculation.total} MB
                </p>
                <p className="mt-1 text-lg font-semibold text-cyan-800 dark:text-cyan-200">
                  {calculation.totalGb.toFixed(1)} GB
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                  Calculation Breakdown
                </h2>
                <div className="mt-4 grid gap-3 text-sm text-gray-700 dark:text-gray-200">
                  <BreakdownRow label="Heap" value={`${heap} MB`} />
                  <BreakdownRow label="Metaspace" value={`${metaspace} MB`} />
                  <BreakdownRow label="Native" value={`${nativeMemory} MB`} />
                  <BreakdownRow label="Buffer" value={`${calculation.buffer} MB`} />
                  <BreakdownRow label="Result" value={`${calculation.total} MB`} strong />
                </div>
              </div>
            </div>
            <section>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                  Copy-ready Configuration Outputs
                </h2>
                <Button color="light" size="sm" onClick={copyAllOutputs}>
                  Copy All Outputs
                </Button>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <GeneratedOutput title="Properties" value={generatedOutputs.properties} onCopy={() => void copyText(generatedOutputs.properties, "Properties")} />
                <GeneratedOutput title="Environment Variables" value={generatedOutputs.environment} onCopy={() => void copyText(generatedOutputs.environment, "Environment variables")} />
                <GeneratedOutput title="JSON" value={generatedOutputs.json} onCopy={() => void copyText(generatedOutputs.json, "JSON")} />
                <GeneratedOutput title="Kubernetes/OpenShift YAML" value={generatedOutputs.yaml} onCopy={() => void copyText(generatedOutputs.yaml, "YAML")} />
              </div>
            </section>
          </div>
        ) : undefined
      }
      examples={examples}
      notesCollapsible
      notes={
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
          <li>This is an estimation tool.</li>
          <li>Actual requirements depend on workload.</li>
          <li>Monitor memory usage in production.</li>
          <li>Review JVM container awareness settings.</li>
        </ul>
      }
      toast={<ToolToast toast={toast} />}
    />
  );
}

interface NumberFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  tooltip: string;
}

function NumberField({ id, label, value, onChange, tooltip }: NumberFieldProps) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <label
          htmlFor={id}
          className="text-sm font-semibold text-gray-900 dark:text-white"
        >
          {label}
        </label>
        <HelpTooltip title={label} description={tooltip} />
      </div>
      <TextInput
        id={id}
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 pb-2 last:border-b-0 dark:border-gray-700">
      <span>{label}</span>
      <span className={strong ? "font-bold text-gray-950 dark:text-white" : ""}>
        {value}
      </span>
    </div>
  );
}

function GeneratedOutput({
  title,
  value,
  onCopy,
}: {
  title: string;
  value: string;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-950 dark:text-white">
          {title}
        </h3>
        <Button color="light" size="xs" onClick={onCopy}>
          Copy
        </Button>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        {value}
      </pre>
    </div>
  );
}
