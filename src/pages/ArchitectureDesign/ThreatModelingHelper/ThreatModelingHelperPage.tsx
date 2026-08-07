import { useState } from "react";
import {
  Alert,
  Badge,
  Checkbox,
  Radio,
  Select,
  TextInput,
} from "flowbite-react";

import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { routePaths } from "../../../utils/routes";
import {
  identifyThreats,
  strideCategories,
  type IdentifiedThreat,
} from "./threatIdentification";

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

  const identifiedThreats = identifyThreats({
    applicationType,
    authentication,
    sensitiveData,
    isInternetFacing,
  });
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
        </div>
      }
      examples={[]}
    />
  );
}

function ThreatResults({ threats }: { threats: IdentifiedThreat[] }) {
  const groups = strideCategories
    .map((category) => ({
      category,
      threats: threats.filter((threat) => threat.category === category),
    }))
    .filter((group) => group.threats.length > 0);

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
