import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { Button, Select, TextInput } from "flowbite-react";
import { Link } from "react-router-dom";
import { CopyReadyOutput } from "../../../components/common/CopyReadyOutput";
import { HelpTooltip } from "../../../components/common/HelpTooltip";
import { ToolToast } from "../../../components/common/ToolToast";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { ToolExample } from "../../../types/toolPage";
import type { ToastMessage } from "../../../types/toast";
import { routePaths } from "../../../utils/routes";

const tabs = [
  "Capacity Planning",
  "Pod Resources",
  "HPA",
  "Container Memory",
  "PVC Size",
] as const;

type CalculatorTab = (typeof tabs)[number];
type ApplicationType = "Java" | ".NET" | "Node.js" | "Other";
type ExpectedLoad = "Low" | "Medium" | "High";
type CompressionEnabled = "Yes" | "No";

const examples: ToolExample[] = [
  {
    title: "Container Memory Example",
    inputLabel: "Inputs",
    input: "Heap: 2048 MiB\nMetaspace: 256 MiB\nNative: 256 MiB\nBuffer: 20%",
    outputLabel: "Result",
    output: "3072 MiB (3.0 GiB)",
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

const pvcExamples: ToolExample[] = [
  {
    title: "PVC Growth Example",
    inputLabel: "Inputs",
    input:
      "Daily Growth: 2 GiB/day\nRetention: 90 days\nBuffer: 20%\nCompression: Enabled",
    outputLabel: "Recommended PVC",
    output: "110 GiB",
  },
];

const capacityExamples: ToolExample[] = [
  {
    title: "Traffic Sizing Example",
    inputLabel: "Inputs",
    input:
      "RPS: 100\nAverage Response Time: 200 ms\nTarget CPU: 70%\nPod CPU: 500m",
    outputLabel: "Recommended",
    output: "Recommended Pod Count: 1",
  },
];

export function ContainerPlatformCalculatorPage() {
  usePageTitle("OpenShift Calculator");

  const [activeTab, setActiveTab] =
    useState<CalculatorTab>("Capacity Planning");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [heap, setHeap] = useState(2048);
  const [metaspace, setMetaspace] = useState(256);
  const [nativeMemory, setNativeMemory] = useState(256);
  const [bufferPercent, setBufferPercent] = useState(20);
  const [applicationType, setApplicationType] =
    useState<ApplicationType>("Java");
  const [expectedLoad, setExpectedLoad] = useState<ExpectedLoad>("Medium");
  const [currentCpu, setCurrentCpu] = useState(70);
  const [targetCpu, setTargetCpu] = useState(60);
  const [minReplicas, setMinReplicas] = useState(2);
  const [maxReplicas, setMaxReplicas] = useState(10);
  const [dailyGrowth, setDailyGrowth] = useState(1);
  const [retentionDays, setRetentionDays] = useState(30);
  const [growthBuffer, setGrowthBuffer] = useState(20);
  const [compressionEnabled, setCompressionEnabled] =
    useState<CompressionEnabled>("No");
  const [requestsPerSecond, setRequestsPerSecond] = useState(100);
  const [averageResponseTime, setAverageResponseTime] = useState(200);
  const [capacityTargetCpu, setCapacityTargetCpu] = useState(70);
  const [podCpuCapacity, setPodCpuCapacity] = useState(500);
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
    const environment = `JAVA_HEAP_MIB=${heap}\nCONTAINER_MEMORY_MIB=${calculation.total}`;
    const json = JSON.stringify(
      {
        heapMiB: heap,
        recommendedMemoryMiB: calculation.total,
        recommendedMemoryGiB: memoryGi,
      },
      null,
      2,
    );
    const yaml = `resources:\n  requests:\n    memory: "${memoryGi}Gi"\n  limits:\n    memory: "${memoryGi}Gi"`;

    return { environment, json, properties, yaml };
  }, [calculation.total, heap]);
  const isPodResources = activeTab === "Pod Resources";
  const isHpa = activeTab === "HPA";
  const isPvc = activeTab === "PVC Size";
  const isCapacityPlanning = activeTab === "Capacity Planning";
  const isCapacityPlanningValid =
    isNumberInRange(requestsPerSecond, 0.01) &&
    isNumberInRange(averageResponseTime, 1) &&
    isNumberInRange(capacityTargetCpu, 1, 100) &&
    isNumberInRange(podCpuCapacity, 1);
  const isContainerMemoryValid =
    isNumberInRange(heap, 1) &&
    isNumberInRange(metaspace, 0) &&
    isNumberInRange(nativeMemory, 0) &&
    isNumberInRange(bufferPercent, 0, 100);
  const isHpaValid =
    isNumberInRange(currentCpu, 0, 100) &&
    isNumberInRange(targetCpu, 1, 100) &&
    isNumberInRange(minReplicas, 1) &&
    isNumberInRange(maxReplicas, minReplicas) &&
    Number.isInteger(minReplicas) &&
    Number.isInteger(maxReplicas);
  const isPvcValid =
    isNumberInRange(dailyGrowth, 0.01) &&
    isNumberInRange(retentionDays, 1) &&
    Number.isInteger(retentionDays) &&
    isNumberInRange(growthBuffer, 0, 100);
  const isActiveTabValid = isCapacityPlanning
    ? isCapacityPlanningValid
    : activeTab === "Container Memory"
      ? isContainerMemoryValid
      : isHpa
        ? isHpaValid
        : isPvc
          ? isPvcValid
          : true;

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
  const pvcCalculation = useMemo(() => {
    const baseStorage = dailyGrowth;
    const retentionStorage = dailyGrowth * retentionDays;
    const adjustedStorage =
      compressionEnabled === "Yes" ? retentionStorage * 0.5 : retentionStorage;
    const buffer = adjustedStorage * (growthBuffer / 100);
    const recommended = Math.ceil(adjustedStorage + buffer);

    return {
      adjustedStorage,
      baseStorage,
      buffer,
      recommended,
      retentionStorage,
    };
  }, [compressionEnabled, dailyGrowth, growthBuffer, retentionDays]);
  const pvcOutputs = useMemo(() => {
    const json = JSON.stringify(
      {
        dailyGrowthGiB: dailyGrowth,
        retentionDays,
        growthBufferPercent: growthBuffer,
        compressionEnabled: compressionEnabled === "Yes",
        recommendedPvcGiB: pvcCalculation.recommended,
      },
      null,
      2,
    );
    const properties = `DAILY_GROWTH_GIB=${dailyGrowth}\nRETENTION_DAYS=${retentionDays}\nGROWTH_BUFFER_PERCENT=${growthBuffer}\nPVC_SIZE_GIB=${pvcCalculation.recommended}`;
    const yaml = `apiVersion: v1\nkind: PersistentVolumeClaim\nspec:\n  resources:\n    requests:\n      storage: "${pvcCalculation.recommended}Gi"`;

    return { json, properties, yaml };
  }, [
    compressionEnabled,
    dailyGrowth,
    growthBuffer,
    pvcCalculation.recommended,
    retentionDays,
  ]);
  const capacityCalculation = useMemo(() => {
    // Assumptions: concurrency follows Little's Law and each concurrent request
    // is treated as one unit of CPU pressure against effective pod CPU capacity.
    const concurrentRequests = Math.ceil(
      requestsPerSecond * (averageResponseTime / 1000),
    );
    const effectivePodCpu = podCpuCapacity * (capacityTargetCpu / 100);
    const requiredCpu = Math.ceil(concurrentRequests * 10);
    const recommendedPods = Math.max(
      1,
      Math.ceil(requiredCpu / effectivePodCpu),
    );

    return { concurrentRequests, recommendedPods, requiredCpu };
  }, [
    averageResponseTime,
    capacityTargetCpu,
    podCpuCapacity,
    requestsPerSecond,
  ]);
  const capacityOutputs = useMemo(() => {
    const json = JSON.stringify(
      {
        requestsPerSecond,
        averageResponseTimeMs: averageResponseTime,
        targetCpuUtilization: capacityTargetCpu,
        podCpuCapacityMillicores: podCpuCapacity,
        concurrentRequests: capacityCalculation.concurrentRequests,
        requiredCpuMillicores: capacityCalculation.requiredCpu,
        recommendedPodCount: capacityCalculation.recommendedPods,
      },
      null,
      2,
    );
    const properties = `REQUESTS_PER_SECOND=${requestsPerSecond}\nAVERAGE_RESPONSE_TIME_MS=${averageResponseTime}\nRECOMMENDED_REPLICAS=${capacityCalculation.recommendedPods}`;
    const yaml = `replicas: ${capacityCalculation.recommendedPods}`;

    return { json, properties, yaml };
  }, [
    averageResponseTime,
    capacityCalculation,
    capacityTargetCpu,
    podCpuCapacity,
    requestsPerSecond,
  ]);

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setToast({ id: Date.now(), tone: "success", text: `${label} copied.` });
    } catch {
      setToast({ id: Date.now(), tone: "failure", text: "Copy failed." });
    }
  }

  function handleTabKey(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    setActiveTab(tabs[nextIndex]);
    const tabButtons =
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]',
      );
    tabButtons?.item(nextIndex).focus();
  }

  const overviewTitle = isHpa
    ? "What is HPA?"
    : isCapacityPlanning
      ? "What is Capacity Planning?"
      : isPvc
        ? "Why PVC Sizing Matters?"
        : isPodResources
          ? "Why Pod Resources Matter?"
          : "Why Container Memory Matters?";

  return (
    <ToolPageLayout
      title="OpenShift Calculator Suite"
      description="Plan capacity, pod resources, autoscaling, runtime memory, and persistent storage for OpenShift workloads."
      breadcrumbs={[
        {
          label: "Platform Engineering",
          path: routePaths.platformEngineering,
        },
        { label: "OpenShift Calculator Suite" },
      ]}
      overviewTitle={overviewTitle}
      overviewCollapsible
      overviewToggleLabel={overviewTitle}
      overview={
        isHpa ? (
          <p>
            HPA adjusts replica counts from resource metrics. Realistic targets
            and requests keep scaling predictable.
          </p>
        ) : isCapacityPlanning ? (
          <p>
            Estimate pod capacity from traffic, response time, and available pod
            CPU, then validate the result with production metrics.
          </p>
        ) : isPvc ? (
          <p>
            Size persistent storage from growth, retention, compression, and
            headroom to reduce capacity risk.
          </p>
        ) : isPodResources ? (
          <p>
            Requests reserve schedulable capacity while limits bound usage.
            Balanced values improve cluster efficiency.
          </p>
        ) : (
          <p>
            Container memory must cover heap, metaspace, native allocations, and
            safety headroom to reduce out-of-memory terminations.
          </p>
        )
      }
      inputs={
        <div className="min-w-0 space-y-6">
          <div
            role="tablist"
            aria-label="OpenShift calculator"
            className="grid w-full max-w-full min-w-0 grid-cols-2 gap-2 sm:flex sm:flex-wrap"
          >
            {tabs.map((tab, index) => (
              <button
                key={tab}
                id={`calculator-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls="calculator-input-panel"
                tabIndex={activeTab === tab ? 0 : -1}
                onClick={() => setActiveTab(tab)}
                onKeyDown={(event) => handleTabKey(event, index)}
                className={[
                  "min-w-0 rounded-lg border px-3 py-2 text-center text-sm font-semibold break-words whitespace-normal transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 sm:shrink-0",
                  activeTab === tab
                    ? "border-cyan-600 bg-cyan-50 text-cyan-800 shadow-sm ring-1 ring-cyan-600 dark:border-cyan-500 dark:bg-cyan-950 dark:text-cyan-200 dark:ring-cyan-500"
                    : "border-gray-200 bg-white text-gray-700 hover:border-cyan-300 hover:text-cyan-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200",
                ].join(" ")}
              >
                {tab}
                {activeTab === tab ? (
                  <span className="sr-only"> (active)</span>
                ) : null}
              </button>
            ))}
          </div>

          <div
            id="calculator-input-panel"
            role="tabpanel"
            aria-labelledby={`calculator-tab-${tabs.indexOf(activeTab)}`}
            className="min-w-0"
          >
            {activeTab === "Capacity Planning" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <NumberField
                  id="requests-per-second"
                  label="Request Rate"
                  unit="req/s"
                  value={requestsPerSecond}
                  onChange={setRequestsPerSecond}
                  tooltip="Expected requests per second."
                  min={0.01}
                />
                <NumberField
                  id="average-response-time"
                  label="Average Response Time"
                  unit="ms"
                  value={averageResponseTime}
                  onChange={setAverageResponseTime}
                  tooltip="Average request processing time."
                  min={1}
                />
                <NumberField
                  id="capacity-target-cpu"
                  label="Target CPU Utilization"
                  unit="%"
                  value={capacityTargetCpu}
                  onChange={setCapacityTargetCpu}
                  tooltip="Desired CPU utilization threshold."
                  min={1}
                  max={100}
                />
                <NumberField
                  id="pod-cpu-capacity"
                  label="Pod CPU Capacity"
                  unit="millicores"
                  value={podCpuCapacity}
                  onChange={setPodCpuCapacity}
                  tooltip="Available CPU capacity per pod."
                  min={1}
                />
              </div>
            ) : activeTab === "Container Memory" ? (
              <div className="space-y-5">
                <NumberField
                  id="heap-size"
                  label="Heap Size"
                  unit="MiB"
                  value={heap}
                  onChange={setHeap}
                  tooltip="Maximum JVM heap size (-Xmx)."
                  min={1}
                />

                <Button
                  color="light"
                  size="sm"
                  onClick={() => setShowAdvanced((current) => !current)}
                  aria-expanded={showAdvanced}
                  aria-controls="container-memory-advanced-settings"
                >
                  {showAdvanced
                    ? "Hide Advanced Settings"
                    : "Show Advanced Settings"}
                </Button>

                {showAdvanced ? (
                  <div
                    id="container-memory-advanced-settings"
                    className="grid gap-4 md:grid-cols-3"
                  >
                    <NumberField
                      id="metaspace"
                      label="Metaspace"
                      unit="MiB"
                      value={metaspace}
                      onChange={setMetaspace}
                      tooltip="Memory used for class metadata."
                    />
                    <NumberField
                      id="native-memory"
                      label="Native Memory"
                      unit="MiB"
                      value={nativeMemory}
                      onChange={setNativeMemory}
                      tooltip="Thread stacks, direct buffers and JVM native allocations."
                    />
                    <NumberField
                      id="safety-buffer"
                      label="Safety Buffer"
                      unit="%"
                      value={bufferPercent}
                      onChange={setBufferPercent}
                      tooltip="Additional headroom to reduce out-of-memory terminations."
                      max={100}
                    />
                  </div>
                ) : null}
              </div>
            ) : activeTab === "Pod Resources" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField
                  id="application-type"
                  label="Application Type"
                  tooltip="Runtime profile used for the starting resource recommendation."
                  value={applicationType}
                  options={["Java", ".NET", "Node.js", "Other"]}
                  onChange={(value) =>
                    setApplicationType(value as ApplicationType)
                  }
                />
                <SelectField
                  id="expected-load"
                  label="Expected Load"
                  tooltip="Expected workload intensity for the selected runtime."
                  value={expectedLoad}
                  options={["Low", "Medium", "High"]}
                  onChange={(value) => setExpectedLoad(value as ExpectedLoad)}
                />
              </div>
            ) : activeTab === "HPA" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <NumberField
                  id="current-cpu"
                  label="Current Average CPU Utilization"
                  unit="%"
                  value={currentCpu}
                  onChange={setCurrentCpu}
                  tooltip="Observed average CPU utilization."
                  max={100}
                />
                <NumberField
                  id="target-cpu"
                  label="Target CPU Utilization"
                  unit="%"
                  value={targetCpu}
                  onChange={setTargetCpu}
                  tooltip="Desired CPU utilization threshold."
                  min={1}
                  max={100}
                />
                <NumberField
                  id="min-replicas"
                  label="Minimum Replicas"
                  unit="pods"
                  value={minReplicas}
                  onChange={setMinReplicas}
                  tooltip="Minimum number of pods."
                  min={1}
                  integer
                />
                <NumberField
                  id="max-replicas"
                  label="Maximum Replicas"
                  unit="pods"
                  value={maxReplicas}
                  onChange={setMaxReplicas}
                  tooltip="Maximum number of pods."
                  min={1}
                  integer
                  validationMessage={
                    Number.isFinite(maxReplicas) && maxReplicas < minReplicas
                      ? "Maximum Replicas must be at least Minimum Replicas."
                      : undefined
                  }
                />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <NumberField
                  id="daily-growth"
                  label="Daily Growth"
                  unit="GiB/day"
                  value={dailyGrowth}
                  onChange={setDailyGrowth}
                  tooltip="Average storage increase per day."
                  min={0.01}
                />
                <NumberField
                  id="retention-days"
                  label="Retention"
                  unit="days"
                  value={retentionDays}
                  onChange={setRetentionDays}
                  tooltip="Number of days data should be retained."
                  min={1}
                  integer
                />
                <NumberField
                  id="growth-buffer"
                  label="Safety Buffer"
                  unit="%"
                  value={growthBuffer}
                  onChange={setGrowthBuffer}
                  tooltip="Additional storage capacity for unexpected growth."
                  max={100}
                />
                <SelectField
                  id="compression-enabled"
                  label="Compression Enabled"
                  tooltip="Apply the existing 50% compression assumption to retained storage."
                  value={compressionEnabled}
                  options={["Yes", "No"]}
                  onChange={(value) =>
                    setCompressionEnabled(value as CompressionEnabled)
                  }
                />
              </div>
            )}
          </div>
        </div>
      }
      outputs={
        !isActiveTabValid ? (
          <InvalidOutputState />
        ) : activeTab === "Capacity Planning" ? (
          <div className="min-w-0 space-y-6">
            <PrimaryRecommendation
              label="Recommended Replica Capacity"
              value={`${capacityCalculation.recommendedPods} ${capacityCalculation.recommendedPods === 1 ? "pod" : "pods"}`}
              description={`Sized for ${capacityTargetCpu}% target CPU utilization, leaving ${100 - capacityTargetCpu}% utilization headroom per pod.`}
            />
            <SupportingSection title="Supporting Calculations">
              <MetricBox
                label="Concurrent Requests"
                value={capacityCalculation.concurrentRequests.toString()}
              />
              <MetricBox
                label="Required CPU Capacity"
                value={`${capacityCalculation.requiredCpu} millicores`}
              />
              <MetricBox
                label="Effective CPU per Pod"
                value={`${Math.round(podCpuCapacity * (capacityTargetCpu / 100))} millicores`}
              />
              <MetricBox
                label="Utilization Headroom"
                value={`${100 - capacityTargetCpu}%`}
              />
            </SupportingSection>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                Calculation Breakdown
              </h2>
              <div className="mt-4 grid gap-3 text-sm text-gray-700 dark:text-gray-200">
                <BreakdownRow
                  label="Concurrent Requests"
                  value={`${requestsPerSecond} RPS x ${averageResponseTime} ms`}
                />
                <BreakdownRow
                  label="Effective Pod CPU"
                  value={`${podCpuCapacity}m x ${capacityTargetCpu}%`}
                />
                <BreakdownRow
                  label="Required CPU Capacity"
                  value={`${capacityCalculation.requiredCpu}m`}
                />
                <BreakdownRow
                  label="Recommended Pod Count"
                  value={`${capacityCalculation.recommendedPods}`}
                  strong
                />
              </div>
            </div>
            <ConfigurationSection>
              <div className="grid gap-4 lg:grid-cols-2">
                <CopyReadyOutput
                  formatLabel="OpenShift YAML"
                  copyLabel="YAML"
                  value={capacityOutputs.yaml}
                  onCopy={copyText}
                />
                <CopyReadyOutput
                  formatLabel="JSON"
                  value={capacityOutputs.json}
                  onCopy={copyText}
                />
                <CopyReadyOutput
                  formatLabel="Properties"
                  value={capacityOutputs.properties}
                  onCopy={copyText}
                />
              </div>
            </ConfigurationSection>
          </div>
        ) : activeTab === "PVC Size" ? (
          <div className="min-w-0 space-y-6">
            <PrimaryRecommendation
              label="Recommended PVC Size"
              value={`${pvcCalculation.recommended} GiB`}
              description={`Includes ${retentionDays} days of retention and a ${growthBuffer}% safety buffer${compressionEnabled === "Yes" ? " after the 50% compression assumption" : ""}.`}
            />
            <SupportingSection title="Supporting Calculations">
              <MetricBox
                label="Daily Growth"
                value={`${pvcCalculation.baseStorage} GiB/day`}
              />
              <MetricBox
                label="Retention Requirement"
                value={`${pvcCalculation.retentionStorage} GiB`}
              />
              <MetricBox
                label="After Compression"
                value={`${pvcCalculation.adjustedStorage.toFixed(1)} GiB`}
              />
              <MetricBox
                label="Safety Buffer"
                value={`${pvcCalculation.buffer.toFixed(1)} GiB`}
              />
            </SupportingSection>
            <ConfigurationSection>
              <div className="grid gap-4 lg:grid-cols-2">
                <CopyReadyOutput
                  formatLabel="OpenShift YAML"
                  copyLabel="YAML"
                  value={pvcOutputs.yaml}
                  onCopy={copyText}
                />
                <CopyReadyOutput
                  formatLabel="JSON"
                  value={pvcOutputs.json}
                  onCopy={copyText}
                />
                <CopyReadyOutput
                  formatLabel="Properties"
                  value={pvcOutputs.properties}
                  onCopy={copyText}
                />
              </div>
            </ConfigurationSection>
          </div>
        ) : activeTab === "HPA" ? (
          <div className="min-w-0 space-y-6">
            <PrimaryRecommendation
              label="Calculated Scaling Recommendation"
              value={hpaRecommendation.title}
              description={hpaRecommendation.description}
            />
            <SupportingSection title="Utilization and Replica Bounds">
              <MetricBox label="Current CPU" value={`${currentCpu}%`} />
              <MetricBox label="Target CPU" value={`${targetCpu}%`} />
              <MetricBox label="Min Replicas" value={minReplicas.toString()} />
              <MetricBox label="Max Replicas" value={maxReplicas.toString()} />
            </SupportingSection>
            <ConfigurationSection>
              <div className="grid gap-4 lg:grid-cols-2">
                <CopyReadyOutput
                  formatLabel="OpenShift YAML"
                  copyLabel="YAML"
                  value={hpaOutputs.yaml}
                  onCopy={copyText}
                />
                <CopyReadyOutput
                  formatLabel="JSON"
                  value={hpaOutputs.json}
                  onCopy={copyText}
                />
              </div>
            </ConfigurationSection>
          </div>
        ) : activeTab === "Pod Resources" ? (
          <div className="min-w-0 space-y-6">
            <section aria-labelledby="pod-resource-recommendation-title">
              <div className="mb-4">
                <p className="text-xs font-semibold tracking-wide text-cyan-700 uppercase dark:text-cyan-300">
                  Primary Recommendation
                </p>
                <h2
                  id="pod-resource-recommendation-title"
                  className="mt-1 text-xl font-bold text-gray-950 dark:text-white"
                >
                  {applicationType} · {expectedLoad} load
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <ResourceRecommendationCard
                  resource="CPU"
                  request={formatCpuDisplay(podResources.cpuRequest)}
                  limit={formatCpuDisplay(podResources.cpuLimit)}
                />
                <ResourceRecommendationCard
                  resource="Memory"
                  request={formatMemoryDisplay(podResources.memoryRequest)}
                  limit={formatMemoryDisplay(podResources.memoryLimit)}
                />
              </div>
            </section>
            <ConfigurationSection>
              <div className="grid gap-4 lg:grid-cols-2">
                <CopyReadyOutput
                  formatLabel="OpenShift YAML"
                  copyLabel="YAML"
                  value={podOutputs.yaml}
                  onCopy={copyText}
                />
                <CopyReadyOutput
                  formatLabel="JSON"
                  value={podOutputs.json}
                  onCopy={copyText}
                />
              </div>
            </ConfigurationSection>
          </div>
        ) : activeTab === "Container Memory" ? (
          <div className="min-w-0 space-y-6">
            <PrimaryRecommendation
              label="Recommended Container Memory"
              value={`${calculation.total} MiB`}
              description={`${calculation.totalGb.toFixed(1)} GiB including the configured ${bufferPercent}% safety buffer.`}
            />
            <section aria-labelledby="memory-breakdown-title">
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                  <span id="memory-breakdown-title">Memory Breakdown</span>
                </h2>
                <div className="mt-4 grid gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <BreakdownRow label="Heap" value={`${heap} MiB`} />
                  <BreakdownRow label="Metaspace" value={`${metaspace} MiB`} />
                  <BreakdownRow
                    label="Native Memory"
                    value={`${nativeMemory} MiB`}
                  />
                  <BreakdownRow
                    label="Safety Buffer"
                    value={`${calculation.buffer} MiB`}
                  />
                  <BreakdownRow
                    label="Total Container Memory"
                    value={`${calculation.total} MiB`}
                    strong
                  />
                </div>
              </div>
            </section>
            <ConfigurationSection>
              <div className="grid gap-4 lg:grid-cols-2">
                <CopyReadyOutput
                  formatLabel="Properties"
                  value={generatedOutputs.properties}
                  onCopy={copyText}
                />
                <CopyReadyOutput
                  formatLabel="Environment Variables"
                  value={generatedOutputs.environment}
                  onCopy={copyText}
                />
                <CopyReadyOutput
                  formatLabel="JSON"
                  value={generatedOutputs.json}
                  onCopy={copyText}
                />
                <CopyReadyOutput
                  formatLabel="OpenShift YAML"
                  copyLabel="YAML"
                  value={generatedOutputs.yaml}
                  onCopy={copyText}
                />
              </div>
            </ConfigurationSection>
          </div>
        ) : undefined
      }
      examples={
        isHpa
          ? hpaExamples
          : isCapacityPlanning
            ? capacityExamples
            : isPvc
              ? pvcExamples
              : isPodResources
                ? podResourceExamples
                : examples
      }
      notesCollapsible
      notes={
        isHpa ? (
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
            <li>HPA requires metrics collection.</li>
            <li>CPU targets should be realistic.</li>
            <li>
              Requests must be configured correctly for HPA to behave as
              expected.
            </li>
          </ul>
        ) : isCapacityPlanning ? (
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
            <li>Results are estimates.</li>
            <li>Real workloads vary.</li>
            <li>Monitor and tune based on production metrics.</li>
          </ul>
        ) : isPvc ? (
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
            <li>Real growth rates vary over time.</li>
            <li>Always monitor actual usage.</li>
            <li>Revisit sizing periodically.</li>
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
            <li>
              Refine heap and non-heap allocation with the{" "}
              <Link
                to={routePaths.jvmMemoryCalculator}
                className="font-medium text-cyan-700 hover:underline dark:text-cyan-300"
              >
                JVM Memory Calculator
              </Link>
              .
            </li>
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
  unit: string;
  value: number;
  onChange: (value: number) => void;
  tooltip: string;
  min?: number;
  max?: number;
  integer?: boolean;
  validationMessage?: string;
}

function NumberField({
  id,
  label,
  unit,
  value,
  onChange,
  tooltip,
  min = 0,
  max,
  integer,
  validationMessage,
}: NumberFieldProps) {
  const error =
    validationMessage ?? getNumberFieldError(value, label, min, max, integer);
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  return (
    <div>
      <div className="mb-2 flex min-h-6 flex-wrap items-center gap-2">
        <label
          htmlFor={id}
          className="text-sm font-semibold text-gray-900 dark:text-white"
        >
          {label}
        </label>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          {unit}
        </span>
        <HelpTooltip title={label} description={tooltip} />
        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
          Required
        </span>
      </div>
      <TextInput
        id={id}
        type="number"
        required
        min={min}
        max={max}
        step={integer ? 1 : "any"}
        inputMode={integer ? "numeric" : "decimal"}
        placeholder={`Enter ${label.toLowerCase()}`}
        value={Number.isNaN(value) ? "" : value}
        onChange={(event) =>
          onChange(
            event.currentTarget.value === ""
              ? Number.NaN
              : Number(event.currentTarget.value),
          )
        }
        aria-invalid={Boolean(error)}
        aria-describedby={`${descriptionId}${error ? ` ${errorId}` : ""}`}
        color={error ? "failure" : "gray"}
      />
      <span id={descriptionId} className="sr-only">
        {tooltip} Required. Unit: {unit}. Minimum value: {min}.
        {max === undefined ? "" : ` Maximum value: ${max}.`}
        {integer ? " Whole numbers only." : ""}
      </span>
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-2 text-sm text-red-700 dark:text-red-300"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function getNumberFieldError(
  value: number,
  label: string,
  min: number,
  max?: number,
  integer?: boolean,
) {
  if (!Number.isFinite(value)) {
    return `${label} is required.`;
  }

  if (value < min) {
    return `${label} must be at least ${min}.`;
  }

  if (max !== undefined && value > max) {
    return `${label} must be no greater than ${max}.`;
  }

  if (integer && !Number.isInteger(value)) {
    return `${label} must be a whole number.`;
  }

  return null;
}

function isNumberInRange(value: number, min: number, max?: number) {
  return (
    Number.isFinite(value) &&
    value >= min &&
    (max === undefined || value <= max)
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
    <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-gray-200 pb-2 last:border-b-0 dark:border-gray-700">
      <span className="min-w-0">{label}</span>
      <span
        className={`max-w-full min-w-0 text-right break-words ${
          strong ? "font-bold text-gray-950 dark:text-white" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function InvalidOutputState() {
  return (
    <div
      role="status"
      className="rounded-lg border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
    >
      Review the current tab's input errors to see recommendations and
      copy-ready configuration.
    </div>
  );
}

function SelectField({
  id,
  label,
  tooltip,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  tooltip: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const descriptionId = `${id}-description`;

  return (
    <div>
      <div className="mb-2 flex min-h-6 flex-wrap items-center gap-2">
        <label
          htmlFor={id}
          className="text-sm font-semibold text-gray-900 dark:text-white"
        >
          {label}
        </label>
        <HelpTooltip title={label} description={tooltip} />
        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
          Required
        </span>
      </div>
      <Select
        id={id}
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={descriptionId}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
      <span id={descriptionId} className="sr-only">
        Required. {tooltip}
      </span>
    </div>
  );
}

function PrimaryRecommendation({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <section
      aria-label={label}
      className="rounded-xl border border-cyan-300 bg-cyan-50 p-5 shadow-sm dark:border-cyan-800 dark:bg-cyan-950/40"
    >
      <p className="text-xs font-semibold tracking-wide text-cyan-700 uppercase dark:text-cyan-300">
        Primary Recommendation
      </p>
      <h2 className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
        {label}
      </h2>
      <p className="mt-1 text-3xl font-bold break-words text-gray-950 sm:text-4xl dark:text-white">
        {value}
      </p>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700 dark:text-gray-200">
        {description}
      </p>
    </section>
  );
}

function SupportingSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-gray-950 dark:text-white">
        {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </section>
  );
}

function ConfigurationSection({ children }: { children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-gray-950 dark:text-white">
        Copy-ready Configuration
      </h2>
      {children}
    </section>
  );
}

function ResourceRecommendationCard({
  resource,
  request,
  limit,
}: {
  resource: string;
  request: string;
  limit: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-cyan-300 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-950/40">
      <h3 className="text-base font-bold text-gray-950 dark:text-white">
        {resource}
      </h3>
      <dl className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <dt className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
            Request
          </dt>
          <dd className="mt-1 text-xl font-bold break-words text-gray-950 dark:text-white">
            {request}
          </dd>
        </div>
        <div className="border-l border-cyan-200 pl-3 dark:border-cyan-800">
          <dt className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
            Limit
          </dt>
          <dd className="mt-1 text-xl font-bold break-words text-gray-950 dark:text-white">
            {limit}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <p className="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-xl font-bold break-words text-gray-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function formatCpuDisplay(value: string) {
  return value.endsWith("m")
    ? `${value.slice(0, -1)} millicores`
    : `${value} ${value === "1" ? "core" : "cores"}`;
}

function formatMemoryDisplay(value: string) {
  return value.endsWith("Mi")
    ? `${value.slice(0, -2)} MiB`
    : `${value.slice(0, -2)} GiB`;
}

function calculatePodResources(
  applicationType: ApplicationType,
  expectedLoad: ExpectedLoad,
) {
  // Starting assumptions: JVM/.NET apps need more baseline memory, Node.js is
  // lighter, and each load tier increases both CPU and memory conservatively.
  const table: Record<
    ApplicationType,
    Record<
      ExpectedLoad,
      {
        cpuLimit: string;
        cpuRequest: string;
        memoryLimit: string;
        memoryRequest: string;
      }
    >
  > = {
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
