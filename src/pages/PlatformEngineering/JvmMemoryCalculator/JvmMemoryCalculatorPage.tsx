import { useMemo, useState } from "react";
import { Button, Select, TextInput } from "flowbite-react";
import { HelpTooltip } from "../../../components/common/HelpTooltip";
import { ToolToast } from "../../../components/common/ToolToast";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { ToolExample } from "../../../types/toolPage";
import type { ToastMessage } from "../../../types/toast";
import { routePaths } from "../../../utils/routes";

type JvmProfile = "Keycloak" | "Spring Boot" | "Generic Java";

const examples: ToolExample[] = [
  {
    title: "4096 MB Container Example",
    inputLabel: "Inputs",
    input: "Container Memory: 4096 MB\nProfile: Spring Boot",
    outputLabel: "Recommended",
    output: "Heap: 2662 MB\nMetaspace: 410 MB\nNative: 614 MB\nBuffer: 410 MB",
  },
];

export function JvmMemoryCalculatorPage() {
  usePageTitle("JVM Memory Calculator");

  const [containerMemory, setContainerMemory] = useState(4096);
  const [profile, setProfile] = useState<JvmProfile>("Spring Boot");
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const result = useMemo(
    () => calculateJvmMemory(containerMemory, profile),
    [containerMemory, profile],
  );
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

  function copyAllOutputs() {
    const value = [
      "# JAVA_OPTS",
      outputs.javaOpts,
      "",
      "# Properties",
      outputs.properties,
      "",
      "# Environment Variables",
      outputs.environment,
      "",
      "# JSON",
      outputs.json,
      "",
      "# YAML",
      outputs.yaml,
    ].join("\n");

    void copyText(value, "All outputs");
  }

  return (
    <ToolPageLayout
      title="JVM Memory Calculator"
      description="Calculate recommended JVM memory settings for containerized Java applications."
      breadcrumbs={[
        { label: "Platform Engineering Tools", path: routePaths.platformEngineering },
        { label: "JVM Memory Calculator" },
      ]}
      overviewTitle="Why JVM Memory Sizing Matters"
      overviewCollapsible
      overviewToggleLabel="Why JVM Memory Sizing Matters"
      overview={
        <div className="space-y-3">
          <p>JVM memory is more than heap.</p>
          <p>
            Container memory must account for metaspace and native allocations.
          </p>
          <p>Proper sizing reduces OOMKilled events.</p>
        </div>
      }
      inputs={
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <label htmlFor="container-memory" className="text-sm font-semibold text-gray-900 dark:text-white">
                Container Memory (MB)
              </label>
              <HelpTooltip title="Container Memory" description="Available memory limit for the Java container." />
            </div>
            <TextInput
              id="container-memory"
              type="number"
              min={256}
              value={containerMemory}
              onChange={(event) => setContainerMemory(Number(event.target.value))}
            />
          </div>
          <div>
            <label htmlFor="jvm-profile" className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
              Application Profile
            </label>
            <Select
              id="jvm-profile"
              value={profile}
              onChange={(event) => setProfile(event.target.value as JvmProfile)}
            >
              <option value="Keycloak">Keycloak</option>
              <option value="Spring Boot">Spring Boot</option>
              <option value="Generic Java">Generic Java</option>
            </Select>
          </div>
        </div>
      }
      outputs={
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <MetricBox label="Heap Size" value={`${result.heapMb} MB`} />
            <MetricBox label="Metaspace" value={`${result.metaspaceMb} MB`} />
            <MetricBox label="Native Memory" value={`${result.nativeMb} MB`} />
            <MetricBox label="Safety Buffer" value={`${result.bufferMb} MB`} />
            <MetricBox label="Heap %" value={`${result.heapPercent}%`} />
            <MetricBox label="Metaspace %" value={`${result.metaspacePercent}%`} />
            <MetricBox label="Native %" value={`${result.nativePercent}%`} />
            <MetricBox label="Buffer %" value={`${result.bufferPercent}%`} />
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
              <GeneratedOutput title="JAVA_OPTS" value={outputs.javaOpts} onCopy={() => void copyText(outputs.javaOpts, "JAVA_OPTS")} />
              <GeneratedOutput title="Properties" value={outputs.properties} onCopy={() => void copyText(outputs.properties, "Properties")} />
              <GeneratedOutput title="Environment Variables" value={outputs.environment} onCopy={() => void copyText(outputs.environment, "Environment variables")} />
              <GeneratedOutput title="JSON" value={outputs.json} onCopy={() => void copyText(outputs.json, "JSON")} />
              <GeneratedOutput title="YAML" value={outputs.yaml} onCopy={() => void copyText(outputs.yaml, "YAML")} />
            </div>
          </section>
        </div>
      }
      examples={examples}
      notesCollapsible
      notes={
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
          <li>Actual workloads vary.</li>
          <li>Monitor production usage.</li>
          <li>Revisit sizing periodically.</li>
        </ul>
      }
      toast={<ToolToast toast={toast} />}
    />
  );
}

function calculateJvmMemory(containerMemory: number, profile: JvmProfile) {
  // Assumptions: Keycloak keeps more native/metaspace headroom, Spring Boot can
  // allocate more heap, and Generic Java uses a conservative balanced split.
  const profiles: Record<JvmProfile, {
    bufferPercent: number;
    heapPercent: number;
    metaspacePercent: number;
    nativePercent: number;
  }> = {
    Keycloak: {
      heapPercent: 55,
      metaspacePercent: 12,
      nativePercent: 18,
      bufferPercent: 15,
    },
    "Spring Boot": {
      heapPercent: 65,
      metaspacePercent: 10,
      nativePercent: 15,
      bufferPercent: 10,
    },
    "Generic Java": {
      heapPercent: 60,
      metaspacePercent: 10,
      nativePercent: 15,
      bufferPercent: 15,
    },
  };
  const selected = profiles[profile];

  return {
    ...selected,
    bufferMb: Math.round(containerMemory * (selected.bufferPercent / 100)),
    heapMb: Math.round(containerMemory * (selected.heapPercent / 100)),
    metaspaceMb: Math.round(containerMemory * (selected.metaspacePercent / 100)),
    nativeMb: Math.round(containerMemory * (selected.nativePercent / 100)),
  };
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
