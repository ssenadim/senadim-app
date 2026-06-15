import { useMemo, useState } from "react";
import { Badge, Button, Select, TextInput } from "flowbite-react";
import { HelpTooltip } from "../../../components/common/HelpTooltip";
import { ToolToast } from "../../../components/common/ToolToast";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { ToolExample } from "../../../types/toolPage";
import type { ToastMessage } from "../../../types/toast";
import { routePaths } from "../../../utils/routes";

const tabs = ["Pod Resources", "HPA", "Container Memory", "PVC Size"] as const;

type CalculatorTab = (typeof tabs)[number];
type ApplicationType = "Java" | ".NET" | "Node.js" | "Other";
type ExpectedLoad = "Low" | "Medium" | "High";

const examples: ToolExample[] = [
  {
    title: "Container Memory Example",
    inputLabel: "Inputs",
    input: "Heap: 2048 MB\nMetaspace: 256 MB\nNative: 256 MB\nBuffer: 20%",
    outputLabel: "Result",
    output: "3072 MB",
  },
];

const podResourceExamples: ToolExample[] = [
  {
    title: "Java Medium Load",
    inputLabel: "Inputs",
    input: "Application Type: Java\nExpected Load: Medium",
    outputLabel: "Recommended",
    output: "CPU: 500m/1\nMemory: 1Gi/2Gi",
  },
];

const hpaExamples: ToolExample[] = [
  {
    title: "Scale Out Example",
    inputLabel: "Inputs",
    input: "Current CPU: 85%\nTarget CPU: 60%",
    outputLabel: "Recommendation",
    output: "Scale out.",
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
  const [applicationType, setApplicationType] = useState<ApplicationType>("Java");
  const [expectedLoad, setExpectedLoad] = useState<ExpectedLoad>("Medium");
  const [currentCpu, setCurrentCpu] = useState(70);
  const [targetCpu, setTargetCpu] = useState(60);
  const [minReplicas, setMinReplicas] = useState(2);
  const [maxReplicas, setMaxReplicas] = useState(10);
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
  const isPodResources = activeTab === "Pod Resources";
  const isHpa = activeTab === "HPA";

  const podResources = useMemo(
    () => calculatePodResources(applicationType, expectedLoad),
    [applicationType, expectedLoad],
  );
  const podOutputs = useMemo(() => {
    const json = JSON.stringify(podResources, null, 2);
    const yaml = `resources:\n  requests:\n    cpu: "${podResources.cpuRequest}"\n    memory: "${podResources.memoryRequest}"\n  limits:\n    cpu: "${podResources.cpuLimit}"\n    memory: "${podResources.memoryLimit}"`;

    return { json, yaml };
  }, [podResources]);
  const hpaRecommendation = useMemo(
    () => getHpaRecommendation(currentCpu, targetCpu),
    [currentCpu, targetCpu],
  );
  const hpaOutputs = useMemo(() => {
    const json = JSON.stringify(
      {
        minReplicas,
        maxReplicas,
        targetCpuUtilization: targetCpu,
      },
      null,
      2,
    );
    const yaml = `apiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nspec:\n  minReplicas: ${minReplicas}\n  maxReplicas: ${maxReplicas}\n  metrics:\n    - type: Resource\n      resource:\n        name: cpu\n        target:\n          type: Utilization\n          averageUtilization: ${targetCpu}`;

    return { json, yaml };
  }, [maxReplicas, minReplicas, targetCpu]);

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

  function copyAllPodOutputs() {
    const value = [
      "# Kubernetes/OpenShift YAML",
      podOutputs.yaml,
      "",
      "# JSON",
      podOutputs.json,
    ].join("\n");

    void copyText(value, "All pod resource outputs");
  }

  function copyAllHpaOutputs() {
    const value = [
      "# OpenShift/Kubernetes YAML",
      hpaOutputs.yaml,
      "",
      "# JSON",
      hpaOutputs.json,
    ].join("\n");

    void copyText(value, "All HPA outputs");
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
      overviewTitle={
        isHpa
          ? "What is HPA?"
          : isPodResources
            ? "Why Pod Resources Matter"
            : "Why Container Memory Matters"
      }
      overview={
        isHpa ? (
          <div className="space-y-3">
            <p>HPA automatically adjusts pod count.</p>
            <p>Scaling decisions are based on resource metrics.</p>
            <p>Proper thresholds improve cost and performance balance.</p>
          </div>
        ) : isPodResources ? (
          <div className="space-y-3">
            <p>Requests reserve resources for scheduled workloads.</p>
            <p>Limits define maximum usage for containers.</p>
            <p>Correct sizing improves cluster efficiency.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p>Container memory should be larger than JVM heap.</p>
            <p>JVM uses additional memory outside heap.</p>
            <p>Insufficient limits may cause OOMKilled events.</p>
            <p>Proper sizing improves stability.</p>
          </div>
        )
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
          ) : activeTab === "Pod Resources" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                id="application-type"
                label="Application Type"
                value={applicationType}
                options={["Java", ".NET", "Node.js", "Other"]}
                onChange={(value) => setApplicationType(value as ApplicationType)}
              />
              <SelectField
                id="expected-load"
                label="Expected Load"
                value={expectedLoad}
                options={["Low", "Medium", "High"]}
                onChange={(value) => setExpectedLoad(value as ExpectedLoad)}
              />
            </div>
          ) : activeTab === "HPA" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <NumberField
                id="current-cpu"
                label="Current Average CPU Utilization (%)"
                value={currentCpu}
                onChange={setCurrentCpu}
                tooltip="Observed average CPU utilization."
              />
              <NumberField
                id="target-cpu"
                label="Target CPU Utilization (%)"
                value={targetCpu}
                onChange={setTargetCpu}
                tooltip="Desired CPU utilization threshold."
              />
              <NumberField
                id="min-replicas"
                label="Minimum Replicas"
                value={minReplicas}
                onChange={setMinReplicas}
                tooltip="Minimum number of pods."
              />
              <NumberField
                id="max-replicas"
                label="Maximum Replicas"
                value={maxReplicas}
                onChange={setMaxReplicas}
                tooltip="Maximum number of pods."
              />
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
        activeTab === "HPA" ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <MetricBox label="Target CPU" value={`${targetCpu}%`} />
              <MetricBox label="Min Replicas" value={minReplicas.toString()} />
              <MetricBox label="Max Replicas" value={maxReplicas.toString()} />
              <MetricBox label="Recommendation" value={hpaRecommendation.title} />
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-200">
                {hpaRecommendation.description}
              </p>
            </div>
            <section>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                  Copy-ready Configuration Outputs
                </h2>
                <Button color="light" size="sm" onClick={copyAllHpaOutputs}>
                  Copy All Outputs
                </Button>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <GeneratedOutput title="OpenShift/Kubernetes YAML" value={hpaOutputs.yaml} onCopy={() => void copyText(hpaOutputs.yaml, "YAML")} />
                <GeneratedOutput title="JSON" value={hpaOutputs.json} onCopy={() => void copyText(hpaOutputs.json, "JSON")} />
              </div>
            </section>
          </div>
        ) : activeTab === "Pod Resources" ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <MetricBox label="CPU Request" value={podResources.cpuRequest} />
              <MetricBox label="CPU Limit" value={podResources.cpuLimit} />
              <MetricBox label="Memory Request" value={podResources.memoryRequest} />
              <MetricBox label="Memory Limit" value={podResources.memoryLimit} />
            </div>
            <section>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                  Copy-ready Configuration Outputs
                </h2>
                <Button color="light" size="sm" onClick={copyAllPodOutputs}>
                  Copy All Outputs
                </Button>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <GeneratedOutput title="Kubernetes/OpenShift YAML" value={podOutputs.yaml} onCopy={() => void copyText(podOutputs.yaml, "YAML")} />
                <GeneratedOutput title="JSON" value={podOutputs.json} onCopy={() => void copyText(podOutputs.json, "JSON")} />
              </div>
            </section>
          </div>
        ) : activeTab === "Container Memory" ? (
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
      examples={isHpa ? hpaExamples : isPodResources ? podResourceExamples : examples}
      notesCollapsible
      notes={
        isHpa ? (
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
            <li>HPA requires metrics collection.</li>
            <li>CPU targets should be realistic.</li>
            <li>Requests must be configured correctly for HPA to behave as expected.</li>
          </ul>
        ) : isPodResources ? (
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
            <li>Values are starting recommendations.</li>
            <li>Monitor production workloads.</li>
            <li>Adjust based on real metrics.</li>
          </ul>
        ) : (
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
            <li>This is an estimation tool.</li>
            <li>Actual requirements depend on workload.</li>
            <li>Monitor memory usage in production.</li>
            <li>Review JVM container awareness settings.</li>
          </ul>
        )
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

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
      >
        {label}
      </label>
      <Select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-900 dark:bg-cyan-950/40">
      <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-xl font-bold text-gray-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function calculatePodResources(
  applicationType: ApplicationType,
  expectedLoad: ExpectedLoad,
) {
  // Starting assumptions: JVM/.NET apps need more baseline memory, Node.js is
  // lighter, and each load tier increases both CPU and memory conservatively.
  const table: Record<ApplicationType, Record<ExpectedLoad, {
    cpuLimit: string;
    cpuRequest: string;
    memoryLimit: string;
    memoryRequest: string;
  }>> = {
    Java: {
      Low: {
        cpuRequest: "250m",
        cpuLimit: "500m",
        memoryRequest: "512Mi",
        memoryLimit: "1Gi",
      },
      Medium: {
        cpuRequest: "500m",
        cpuLimit: "1",
        memoryRequest: "1Gi",
        memoryLimit: "2Gi",
      },
      High: {
        cpuRequest: "1",
        cpuLimit: "2",
        memoryRequest: "2Gi",
        memoryLimit: "4Gi",
      },
    },
    ".NET": {
      Low: {
        cpuRequest: "200m",
        cpuLimit: "500m",
        memoryRequest: "384Mi",
        memoryLimit: "768Mi",
      },
      Medium: {
        cpuRequest: "500m",
        cpuLimit: "1",
        memoryRequest: "768Mi",
        memoryLimit: "1536Mi",
      },
      High: {
        cpuRequest: "1",
        cpuLimit: "2",
        memoryRequest: "1536Mi",
        memoryLimit: "3Gi",
      },
    },
    "Node.js": {
      Low: {
        cpuRequest: "100m",
        cpuLimit: "250m",
        memoryRequest: "128Mi",
        memoryLimit: "256Mi",
      },
      Medium: {
        cpuRequest: "250m",
        cpuLimit: "500m",
        memoryRequest: "256Mi",
        memoryLimit: "512Mi",
      },
      High: {
        cpuRequest: "500m",
        cpuLimit: "1",
        memoryRequest: "512Mi",
        memoryLimit: "1Gi",
      },
    },
    Other: {
      Low: {
        cpuRequest: "100m",
        cpuLimit: "250m",
        memoryRequest: "256Mi",
        memoryLimit: "512Mi",
      },
      Medium: {
        cpuRequest: "250m",
        cpuLimit: "500m",
        memoryRequest: "512Mi",
        memoryLimit: "1Gi",
      },
      High: {
        cpuRequest: "500m",
        cpuLimit: "1",
        memoryRequest: "1Gi",
        memoryLimit: "2Gi",
      },
    },
  };

  return table[applicationType][expectedLoad];
}

function getHpaRecommendation(currentCpu: number, targetCpu: number) {
  if (currentCpu > targetCpu) {
    return {
      title: "Scale out",
      description:
        "Current CPU is above target. HPA should add replicas when metrics remain above the configured threshold.",
    };
  }

  if (currentCpu < targetCpu * 0.7) {
    return {
      title: "Scale down possible",
      description:
        "Current CPU is well below target. HPA may reduce replicas while staying above the minimum replica count.",
    };
  }

  return {
    title: "Current replica count is sufficient",
    description:
      "Current CPU is below or near the target. The current replica count is likely sufficient.",
  };
}
