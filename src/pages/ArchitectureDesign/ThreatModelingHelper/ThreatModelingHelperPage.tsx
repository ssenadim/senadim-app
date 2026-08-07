import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Radio,
  Select,
  TextInput,
} from "flowbite-react";

import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { routePaths } from "../../../utils/routes";
import { identifyThreats, type IdentifiedThreat } from "./threatIdentification";
import { ToolToast } from "../../../components/common/ToolToast";
import type { ToastMessage, ToastTone } from "../../../types/toast";
import {
  generateThreatModelReport,
  getThreatModelFilename,
} from "./threatModelReport";

const applicationTypes = [
  "Web Application",
  "REST API",
  "Backend Service",
  "Microservice",
  "Mobile Application",
  "Desktop Application",
] as const;

const authenticationOptions = [
  "None",
  "Username / Password",
  "OAuth2 / OpenID Connect",
  "API Key",
  "Certificate",
  "Other",
] as const;

const sensitiveDataOptions = [
  "Personal Data",
  "Financial Data",
  "Credentials",
  "Health Data",
  "Internal Business Data",
] as const;

export function ThreatModelingHelperPage() {
  usePageTitle("Threat Modeling Helper");

  const [projectName, setProjectName] = useState("");
  const [applicationType, setApplicationType] = useState<string>(
    applicationTypes[0],
  );
  const [authentication, setAuthentication] = useState<string>(
    authenticationOptions[0],
  );
  const [sensitiveData, setSensitiveData] = useState<string[]>([]);
  const [isInternetFacing, setIsInternetFacing] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const identifiedThreats = identifyThreats({
    applicationType,
    authentication,
    sensitiveData,
    isInternetFacing,
  });

  const markdownReport = generateThreatModelReport({
    projectName,
    applicationType,
    authentication,
    isInternetFacing,
    sensitiveData,
    threats: identifiedThreats,
  });
  const reportFilename = getThreatModelFilename(projectName);
  const canExportReport = identifiedThreats.length > 0;

  useEffect(() => {
    if (!toast) return;

    const timeoutId = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  function showToast(tone: ToastTone, text: string) {
    setToast({ id: Date.now(), tone, text });
  }

  async function handleCopyMarkdown() {
    if (!canExportReport) {
      showToast("info", "Identify at least one threat before exporting.");
      return;
    }

    try {
      await navigator.clipboard.writeText(markdownReport);
      showToast("success", "Threat model markdown copied.");
    } catch {
      showToast("failure", "Copy failed. Please copy the report manually.");
    }
  }

  function handleDownloadMarkdown() {
    if (!canExportReport) {
      showToast("info", "Identify at least one threat before exporting.");
      return;
    }

    const blob = new Blob([markdownReport], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = reportFilename;
    link.click();
    URL.revokeObjectURL(url);
    showToast("success", "Threat model markdown downloaded.");
  }
  function toggleSensitiveData(dataType: string) {
    setSensitiveData((current) =>
      current.includes(dataType)
        ? current.filter((item) => item !== dataType)
        : [...current, dataType],
    );
  }

  return (
    <ToolPageLayout
      title="Threat Modeling Helper"
      description="Capture project information to prepare for threat modeling."
      breadcrumbs={[
        {
          label: "Architecture & Design",
          path: routePaths.architectureDesign,
        },
        { label: "Threat Modeling Helper" },
      ]}
      overviewTitle="Project definition"
      overview={
        <p>
          Describe the application, its access model and the data it handles.
          This sprint only records project context and does not identify
          threats.
        </p>
      }
      inputTitle="Project Information"
      inputs={
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label
              htmlFor="project-name"
              className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
            >
              Project Name
            </label>
            <TextInput
              id="project-name"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="Customer Portal"
            />
          </div>

          <div>
            <label
              htmlFor="application-type"
              className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
            >
              Application Type
            </label>
            <Select
              id="application-type"
              value={applicationType}
              onChange={(event) => setApplicationType(event.target.value)}
            >
              {applicationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label
              htmlFor="authentication"
              className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
            >
              Authentication
            </label>
            <Select
              id="authentication"
              value={authentication}
              onChange={(event) => setAuthentication(event.target.value)}
            >
              {authenticationOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
              Internet Facing
            </legend>
            <div className="flex min-h-10 items-center gap-6 rounded-lg border border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-900">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <Radio
                  name="internet-facing"
                  value="yes"
                  checked={isInternetFacing}
                  onChange={() => setIsInternetFacing(true)}
                />
                Yes
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <Radio
                  name="internet-facing"
                  value="no"
                  checked={!isInternetFacing}
                  onChange={() => setIsInternetFacing(false)}
                />
                No
              </label>
            </div>
          </fieldset>

          <fieldset className="lg:col-span-2">
            <legend className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
              Sensitive Data
            </legend>
            <div className="flex flex-wrap gap-2">
              {sensitiveDataOptions.map((dataType) => {
                const id = `sensitive-${dataType.toLowerCase().replace(/ /g, "-")}`;

                return (
                  <label
                    key={dataType}
                    htmlFor={id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                  >
                    <Checkbox
                      id={id}
                      checked={sensitiveData.includes(dataType)}
                      onChange={() => toggleSensitiveData(dataType)}
                    />
                    {dataType}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>
      }
      outputs={
        <div>
          <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
            Project Summary
          </h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryItem
              label="Project Name"
              value={projectName.trim() || "Not provided"}
            />
            <SummaryItem label="Application Type" value={applicationType} />
            <SummaryItem label="Authentication" value={authentication} />
            <SummaryItem
              label="Sensitive Data"
              value={
                sensitiveData.length > 0
                  ? sensitiveData.join(", ")
                  : "None selected"
              }
            />
            <SummaryItem
              label="Internet Facing"
              value={isInternetFacing ? "Yes" : "No"}
            />
          </dl>

          <ThreatResults threats={identifiedThreats} />
          <ThreatModelReport
            markdown={markdownReport}
            canExport={canExportReport}
            onCopy={() => void handleCopyMarkdown()}
            onDownload={handleDownloadMarkdown}
          />
        </div>
      }
      examples={[]}
      toast={<ToolToast toast={toast} />}
    />
  );
}

function ThreatResults({ threats }: { threats: IdentifiedThreat[] }) {
  const groups = groupThreatsByCategory(threats);

  return (
    <section className="mt-5 border-t border-gray-200 pt-5 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
        Identified Threats
      </h2>

      {groups.length === 0 ? (
        <Alert color="info" className="mt-3">
          No STRIDE threats match the current project characteristics.
        </Alert>
      ) : (
        <div className="mt-3 space-y-4">
          {groups.map((group) => (
            <section key={group.category}>
              <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                {group.category}
              </h3>
              <div className="grid gap-3 lg:grid-cols-2">
                {group.threats.map((threat) => (
                  <article
                    key={threat.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-950"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h4 className="font-semibold text-gray-950 dark:text-white">
                        {threat.title}
                      </h4>
                      <Badge color="gray">{threat.category}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {threat.explanation}
                    </p>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Why it applies:
                      </span>{" "}
                      {threat.whyItApplies}
                    </p>
                    <div className="mt-3 border-t border-gray-200 pt-2 dark:border-gray-700">
                      <h5 className="text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-300">
                        Risk Assessment
                      </h5>
                      <dl className="mt-2 flex flex-wrap gap-2">
                        <RiskBadge
                          label="Likelihood"
                          value={threat.riskAssessment.likelihood}
                        />
                        <RiskBadge
                          label="Impact"
                          value={threat.riskAssessment.impact}
                        />
                        <RiskBadge
                          label="Risk Level"
                          value={threat.riskAssessment.riskLevel}
                        />
                      </dl>
                      <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                        {threat.riskAssessment.explanation}
                      </p>
                    </div>
                    <div className="mt-3 border-t border-gray-200 pt-2 dark:border-gray-700">
                      <h5 className="text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-300">
                        Recommended Mitigations
                      </h5>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-300">
                        {threat.recommendations.map((recommendation) => (
                          <li key={recommendation}>{recommendation}</li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
      <dt className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium break-words text-gray-900 dark:text-white">
        {value}
      </dd>
    </div>
  );
}

type RiskBadgeValue =
  | IdentifiedThreat["riskAssessment"]["likelihood"]
  | IdentifiedThreat["riskAssessment"]["riskLevel"];

const riskBadgeColors = {
  Low: "success",
  Medium: "warning",
  High: "failure",
  Critical: "purple",
} as const;

function RiskBadge({ label, value }: { label: string; value: RiskBadgeValue }) {
  return (
    <div className="flex items-center gap-1.5">
      <dt className="text-xs font-medium text-gray-600 dark:text-gray-400">
        {label}
      </dt>
      <dd>
        <Badge color={riskBadgeColors[value]}>{value}</Badge>
      </dd>
    </div>
  );
}

function groupThreatsByCategory(threats: readonly IdentifiedThreat[]) {
  return threats.reduce<
    Array<{
      category: IdentifiedThreat["category"];
      threats: IdentifiedThreat[];
    }>
  >((groups, threat) => {
    const existingGroup = groups.find(
      (group) => group.category === threat.category,
    );

    if (existingGroup) {
      existingGroup.threats.push(threat);
    } else {
      groups.push({
        category: threat.category,
        threats: [threat],
      });
    }

    return groups;
  }, []);
}

function ThreatModelReport({
  markdown,
  canExport,
  onCopy,
  onDownload,
}: {
  markdown: string;
  canExport: boolean;
  onCopy: () => void;
  onDownload: () => void;
}) {
  return (
    <section className="mt-5 border-t border-gray-200 pt-5 dark:border-gray-700">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
            Threat Model Report
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Live Markdown documentation generated locally from the current
            threat model.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            color="light"
            size="sm"
            disabled={!canExport}
            onClick={onCopy}
          >
            Copy Markdown
          </Button>
          <Button
            color="light"
            size="sm"
            disabled={!canExport}
            onClick={onDownload}
          >
            Download .md
          </Button>
        </div>
      </div>

      {canExport ? (
        <pre className="mt-3 max-h-[32rem] overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-800 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200">
          {markdown}
        </pre>
      ) : (
        <Alert color="info" className="mt-3">
          Complete the project information and identify at least one applicable
          threat before exporting a report.
        </Alert>
      )}
    </section>
  );
}
