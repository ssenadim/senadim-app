import { useState } from "react";
import { Alert, Button, Select, Textarea } from "flowbite-react";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import {
  analyzeOpenApi,
  type OpenApiAnalysis,
  type OpenApiInputFormat,
} from "../../../utils/openApi";
import { routePaths } from "../../../utils/routes";

const customerApiExample = `openapi: 3.1.0
info:
  title: Customer API
  version: 1.0.0
  description: Retrieve and create customer records.
servers:
  - url: https://api.example.test
paths:
  /customers/{id}:
    get:
      summary: Get customer
      responses:
        "200":
          description: Customer found
  /customers:
    post:
      summary: Create customer
      responses:
        "201":
          description: Customer created
components:
  schemas:
    Customer:
      type: object
      properties:
        id:
          type: string`;

const formatLabels: Record<OpenApiInputFormat, string> = {
  auto: "Auto Detect",
  json: "JSON",
  yaml: "YAML",
};

const methodBadgeClasses: Record<string, string> = {
  GET: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  POST: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
  PUT: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
  PATCH:
    "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-200",
  DELETE:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
  OPTIONS:
    "border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-200",
  HEAD: "border-gray-300 bg-gray-100 text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200",
  TRACE:
    "border-pink-200 bg-pink-50 text-pink-800 dark:border-pink-800 dark:bg-pink-950 dark:text-pink-200",
};

export function OpenApiViewerPage() {
  usePageTitle("OpenAPI Viewer");

  const [inputFormat, setInputFormat] = useState<OpenApiInputFormat>("auto");
  const [source, setSource] = useState(customerApiExample);
  const [analysis, setAnalysis] = useState<OpenApiAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isStale, setIsStale] = useState(false);

  function invalidateAnalysis() {
    if (analysis) {
      setIsStale(true);
    }
    setAnalysis(null);
    setErrorMessage("");
  }

  function handleAnalyze() {
    const result = analyzeOpenApi(source, inputFormat);

    if (!result.ok) {
      setAnalysis(null);
      setErrorMessage(result.error);
      setIsStale(false);
      return;
    }

    setAnalysis(result.analysis);
    setErrorMessage("");
    setIsStale(false);
  }

  return (
    <ToolPageLayout
      title="OpenAPI Viewer"
      description="Validate an OpenAPI 3.0 or 3.1 document and inspect its API overview and endpoint list entirely in your browser."
      breadcrumbs={[
        { label: "Developer Productivity", path: routePaths.developerTools },
        { label: "OpenAPI Viewer" },
      ]}
      overviewTitle="About OpenAPI Viewer"
      overviewCollapsible
      overviewToggleLabel="About OpenAPI Viewer"
      overview={
        <div className="space-y-3">
          <p>
            Analyze the high-level structure of an OpenAPI 3.0.x or 3.1.x
            document without uploading its contents.
          </p>
          <p>
            This foundation validates the required document sections and lists
            operations. It does not perform full specification validation.
          </p>
        </div>
      }
      inputTitle="OpenAPI Definition"
      inputs={
        <div className="space-y-5">
          <div className="max-w-sm">
            <label
              htmlFor="openapi-input-format"
              className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
            >
              Input Format
            </label>
            <Select
              id="openapi-input-format"
              value={inputFormat}
              onChange={(event) => {
                setInputFormat(event.target.value as OpenApiInputFormat);
                invalidateAnalysis();
              }}
            >
              <option value="auto">Auto Detect</option>
              <option value="json">JSON</option>
              <option value="yaml">YAML</option>
            </Select>
          </div>

          <div className="min-w-0">
            <label
              htmlFor="openapi-definition"
              className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
            >
              OpenAPI Definition
            </label>
            <Textarea
              id="openapi-definition"
              rows={20}
              value={source}
              onChange={(event) => {
                setSource(event.target.value);
                invalidateAnalysis();
              }}
              placeholder="Paste an OpenAPI 3.0.x or 3.1.x document here..."
              className="font-mono"
              spellCheck={false}
              wrap="off"
              aria-invalid={Boolean(errorMessage)}
              aria-describedby={
                errorMessage
                  ? "openapi-validation-error"
                  : "openapi-definition-note"
              }
            />
            <p
              id="openapi-definition-note"
              className="mt-2 text-xs text-gray-500 dark:text-gray-400"
            >
              Analysis runs only when you select Analyze API. Content remains in
              this browser.
            </p>
          </div>

          {errorMessage ? (
            <Alert id="openapi-validation-error" color="failure" role="alert">
              <span className="font-semibold">Analysis failed.</span>{" "}
              {errorMessage}
            </Alert>
          ) : null}

          {isStale ? (
            <p
              role="status"
              aria-live="polite"
              className="text-sm font-medium text-amber-700 dark:text-amber-300"
            >
              The previous analysis was cleared after the definition changed.
              Analyze the API again to refresh it.
            </p>
          ) : null}

          <Button type="button" color="blue" onClick={handleAnalyze}>
            Analyze API
          </Button>
        </div>
      }
      outputs={analysis ? <AnalysisResult analysis={analysis} /> : undefined}
      examples={[]}
      notesCollapsible
      notes={
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
          <li>JSON and YAML parsing runs entirely in your browser.</li>
          <li>
            Auto Detect selects JSON for object or array syntax and YAML
            otherwise.
          </li>
          <li>OpenAPI 2.0 documents are not supported.</li>
          <li>
            Endpoint execution and detailed schema exploration are not included.
          </li>
        </ul>
      }
    />
  );
}

function AnalysisResult({ analysis }: { analysis: OpenApiAnalysis }) {
  const { overview, endpoints } = analysis;
  const metrics = [
    ["API Title", overview.title ?? "Not provided"],
    ["Version", overview.version ?? "Not provided"],
    ["OpenAPI Version", overview.openApiVersion],
    ["Detected Format", formatLabels[analysis.detectedFormat]],
    ["Servers", String(overview.serverCount)],
    ["Paths", String(overview.pathCount)],
    ["Operations", String(overview.operationCount)],
    ["Schemas", String(overview.schemaCount)],
    ["Tags", String(overview.tagCount)],
  ];

  return (
    <div className="space-y-7" aria-live="polite">
      <section aria-labelledby="openapi-overview-heading">
        <h2
          id="openapi-overview-heading"
          className="text-xl font-semibold text-gray-950 dark:text-white"
        >
          API Overview
        </h2>
        <dl className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(([label, value]) => (
            <div
              key={label}
              className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-950/60"
            >
              <dt className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                {label}
              </dt>
              <dd className="mt-1 text-sm font-semibold break-words text-gray-950 dark:text-white">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        {overview.description ? (
          <p className="mt-4 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-300">
            {overview.description}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="openapi-endpoints-heading">
        <h2
          id="openapi-endpoints-heading"
          className="text-xl font-semibold text-gray-950 dark:text-white"
        >
          Endpoints
        </h2>
        {endpoints.length > 0 ? (
          <ul className="mt-4 grid min-w-0 gap-3">
            {endpoints.map((endpoint, index) => (
              <li
                key={`${endpoint.method}-${endpoint.path}-${index}`}
                className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start">
                  <span
                    className={`w-fit shrink-0 rounded-md border px-2 py-1 text-xs font-bold ${methodBadgeClasses[endpoint.method] ?? methodBadgeClasses.HEAD}`}
                  >
                    {endpoint.method}
                  </span>
                  <div className="min-w-0">
                    <code className="block text-sm font-semibold break-all text-gray-950 dark:text-white">
                      {endpoint.path}
                    </code>
                    {endpoint.summary ? (
                      <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                        {endpoint.summary}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            No HTTP operations were found in the paths object.
          </p>
        )}
      </section>
    </div>
  );
}
