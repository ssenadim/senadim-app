import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Alert, Button, Select, Textarea, TextInput } from "flowbite-react";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import {
  analyzeOpenApi,
  filterOpenApiSchemas,
  type OpenApiAnalysis,
  type OpenApiEndpoint,
  type OpenApiInputFormat,
  type OpenApiMediaType,
  type OpenApiParameter,
  type OpenApiRequestBody,
  type OpenApiResponse,
  type OpenApiSchemaSummary,
  type OpenApiSchemaModel,
  type OpenApiSchemaProperty,
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
    parameters:
      - $ref: "#/components/parameters/CustomerId"
    get:
      operationId: getCustomer
      summary: Get customer
      description: Retrieve one customer by identifier.
      tags:
        - Customers
      responses:
        "200":
          description: Customer found
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Customer"
        "404":
          $ref: "#/components/responses/NotFound"
  /customers:
    post:
      operationId: createCustomer
      summary: Create customer
      tags:
        - Customers
      requestBody:
        $ref: "#/components/requestBodies/CreateCustomer"
      responses:
        "201":
          description: Customer created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Customer"
components:
  schemas:
    Customer:
      type: object
      properties:
        id:
          type: string
    CreateCustomerRequest:
      type: object
  parameters:
    CustomerId:
      name: id
      in: path
      required: true
      description: Customer identifier
      schema:
        type: string
  requestBodies:
    CreateCustomer:
      required: true
      description: Customer details
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/CreateCustomerRequest"
  responses:
    NotFound:
      description: Customer not found`;

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

interface SchemaNavigationValue {
  schemaNames: ReadonlySet<string>;
  navigateToSchema: (schemaName: string) => void;
}

const SchemaNavigationContext = createContext<SchemaNavigationValue | null>(
  null,
);

export function OpenApiViewerPage() {
  usePageTitle("OpenAPI Viewer");

  const [inputFormat, setInputFormat] = useState<OpenApiInputFormat>("auto");
  const [source, setSource] = useState(customerApiExample);
  const [analysis, setAnalysis] = useState<OpenApiAnalysis | null>(null);
  const [analysisRevision, setAnalysisRevision] = useState(0);
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
    setAnalysisRevision((current) => current + 1);
    setErrorMessage("");
    setIsStale(false);
  }

  return (
    <ToolPageLayout
      title="OpenAPI Viewer"
      description="Validate an OpenAPI 3.0 or 3.1 document and inspect its API overview and endpoint details entirely in your browser."
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
            The viewer validates required document sections and lets you expand
            operations and reusable schemas to inspect their metadata. It does
            not perform full specification validation.
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
      outputs={
        analysis ? (
          <AnalysisResult key={analysisRevision} analysis={analysis} />
        ) : undefined
      }
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
            API execution and recursive schema expansion are not included.
          </li>
        </ul>
      }
    />
  );
}

function AnalysisResult({ analysis }: { analysis: OpenApiAnalysis }) {
  const { overview, endpoints, schemas } = analysis;
  const [schemaQuery, setSchemaQuery] = useState("");
  const [expandedSchemaNames, setExpandedSchemaNames] = useState<Set<string>>(
    new Set(),
  );
  const [pendingSchemaName, setPendingSchemaName] = useState<string | null>(
    null,
  );
  const schemaButtonRefs = useRef(new Map<string, HTMLButtonElement>());
  const schemaNames = new Set(schemas.map((schema) => schema.name));
  const filteredSchemas = filterOpenApiSchemas(schemas, schemaQuery);
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

  useEffect(() => {
    if (!pendingSchemaName) {
      return;
    }

    const button = schemaButtonRefs.current.get(pendingSchemaName);
    if (!button) {
      return;
    }

    button.focus();
    button.scrollIntoView({ block: "center" });
    setPendingSchemaName(null);
  }, [expandedSchemaNames, pendingSchemaName, schemaQuery]);

  function navigateToSchema(schemaName: string) {
    if (!schemaNames.has(schemaName)) {
      return;
    }

    setSchemaQuery("");
    setExpandedSchemaNames((current) => {
      const next = new Set(current);
      next.add(schemaName);
      return next;
    });
    setPendingSchemaName(schemaName);
  }

  function toggleSchema(schemaName: string) {
    setExpandedSchemaNames((current) => {
      const next = new Set(current);
      if (next.has(schemaName)) {
        next.delete(schemaName);
      } else {
        next.add(schemaName);
      }
      return next;
    });
  }

  function setSchemaButtonRef(
    schemaName: string,
    button: HTMLButtonElement | null,
  ) {
    if (button) {
      schemaButtonRefs.current.set(schemaName, button);
    } else {
      schemaButtonRefs.current.delete(schemaName);
    }
  }

  return (
    <SchemaNavigationContext.Provider value={{ schemaNames, navigateToSchema }}>
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
              {endpoints.map((endpoint) => (
                <EndpointCard
                  key={`${endpoint.method}-${endpoint.path}`}
                  endpoint={endpoint}
                />
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              No endpoints are defined in this OpenAPI document.
            </p>
          )}
        </section>

        <SchemaExplorer
          schemas={schemas}
          filteredSchemas={filteredSchemas}
          query={schemaQuery}
          onQueryChange={setSchemaQuery}
          expandedSchemaNames={expandedSchemaNames}
          onToggleSchema={toggleSchema}
          setSchemaButtonRef={setSchemaButtonRef}
        />
      </div>
    </SchemaNavigationContext.Provider>
  );
}

interface SchemaExplorerProps {
  schemas: OpenApiSchemaModel[];
  filteredSchemas: OpenApiSchemaModel[];
  query: string;
  onQueryChange: (query: string) => void;
  expandedSchemaNames: ReadonlySet<string>;
  onToggleSchema: (schemaName: string) => void;
  setSchemaButtonRef: (
    schemaName: string,
    button: HTMLButtonElement | null,
  ) => void;
}

function SchemaExplorer({
  schemas,
  filteredSchemas,
  query,
  onQueryChange,
  expandedSchemaNames,
  onToggleSchema,
  setSchemaButtonRef,
}: SchemaExplorerProps) {
  return (
    <section aria-labelledby="openapi-schemas-heading">
      <h2
        id="openapi-schemas-heading"
        className="text-xl font-semibold text-gray-950 dark:text-white"
      >
        Schemas
      </h2>

      {schemas.length === 0 ? (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          No reusable schemas are defined in this OpenAPI document.
        </p>
      ) : (
        <>
          <div className="mt-4 max-w-md">
            <label
              htmlFor="openapi-schema-search"
              className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
            >
              Search Schemas
            </label>
            <TextInput
              id="openapi-schema-search"
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search names, properties, or descriptions..."
              aria-describedby="openapi-schema-search-note"
            />
            <p
              id="openapi-schema-search-note"
              className="mt-2 text-xs text-gray-500 dark:text-gray-400"
            >
              Showing {filteredSchemas.length} of {schemas.length} schemas.
            </p>
          </div>

          {filteredSchemas.length > 0 ? (
            <ul className="mt-4 grid min-w-0 gap-3">
              {filteredSchemas.map((schema) => (
                <SchemaCard
                  key={schema.name}
                  schema={schema}
                  isExpanded={expandedSchemaNames.has(schema.name)}
                  onToggle={() => onToggleSchema(schema.name)}
                  setButtonRef={(button) =>
                    setSchemaButtonRef(schema.name, button)
                  }
                />
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              No schemas match your search.
            </p>
          )}
        </>
      )}
    </section>
  );
}

function SchemaCard({
  schema,
  isExpanded,
  onToggle,
  setButtonRef,
}: {
  schema: OpenApiSchemaModel;
  isExpanded: boolean;
  onToggle: () => void;
  setButtonRef: (button: HTMLButtonElement | null) => void;
}) {
  const detailId = useId();
  const typeLabel =
    schema.type ??
    (schema.compositions?.length ? "Composed schema" : "Type not provided");

  return (
    <li className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <button
        ref={setButtonRef}
        type="button"
        className="flex w-full min-w-0 flex-col gap-3 p-4 text-left outline-none hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-inset sm:flex-row sm:items-start sm:justify-between dark:hover:bg-gray-800 dark:focus-visible:ring-cyan-400"
        aria-expanded={isExpanded}
        aria-controls={detailId}
        onClick={onToggle}
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <strong className="break-all text-gray-950 dark:text-white">
              {schema.name}
            </strong>
            <MetadataBadge tone="neutral">{typeLabel}</MetadataBadge>
            {schema.deprecated ? (
              <MetadataBadge tone="warning">Deprecated</MetadataBadge>
            ) : null}
          </span>
          {schema.description ? (
            <span className="mt-2 block text-sm leading-6 text-gray-600 dark:text-gray-300">
              {schema.description}
            </span>
          ) : null}
        </span>
        <span className="shrink-0 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
          {isExpanded ? "Hide schema" : "Show schema"}
        </span>
      </button>

      {isExpanded ? (
        <div
          id={detailId}
          className="border-t border-gray-200 bg-gray-50/70 p-4 sm:p-5 dark:border-gray-700 dark:bg-gray-950/40"
        >
          <SchemaDetails schema={schema} />
        </div>
      ) : null}
    </li>
  );
}

function SchemaDetails({ schema }: { schema: OpenApiSchemaModel }) {
  return (
    <div className="space-y-6">
      <SchemaMetadata schema={schema} />

      {schema.requiredProperties.length > 0 ? (
        <section>
          <h3 className="text-sm font-semibold text-gray-950 dark:text-white">
            Required Properties
          </h3>
          <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-200">
            {schema.requiredProperties.map((propertyName, index) => (
              <span key={propertyName}>
                {index > 0 ? ", " : null}
                <code className="break-all">{propertyName}</code>
              </span>
            ))}
          </p>
        </section>
      ) : null}

      {schema.properties.length > 0 ? (
        <section>
          <h3 className="text-sm font-semibold text-gray-950 dark:text-white">
            Properties
          </h3>
          <ul className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2">
            {schema.properties.map((property) => (
              <SchemaPropertyCard key={property.name} property={property} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function SchemaPropertyCard({ property }: { property: OpenApiSchemaProperty }) {
  return (
    <li className="min-w-0 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-wrap items-center gap-2">
        <strong className="text-sm break-all text-gray-950 dark:text-white">
          {property.name}
        </strong>
        <MetadataBadge tone={property.required ? "warning" : "neutral"}>
          {property.required ? "Required" : "Optional"}
        </MetadataBadge>
        {property.deprecated ? (
          <MetadataBadge tone="warning">Deprecated</MetadataBadge>
        ) : null}
      </div>
      {property.description ? (
        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
          {property.description}
        </p>
      ) : null}
      <div className="mt-3">
        <SchemaMetadata schema={property} compact />
      </div>
    </li>
  );
}

function SchemaMetadata({
  schema,
  compact = false,
}: {
  schema: OpenApiSchemaModel | OpenApiSchemaProperty;
  compact?: boolean;
}) {
  const hasFieldMetadata = Boolean(
    schema.type ||
    schema.format ||
    schema.referenceName ||
    schema.arrayItem ||
    schema.nullable !== undefined ||
    schema.readOnly !== undefined ||
    schema.writeOnly !== undefined,
  );

  return (
    <div className={compact ? "space-y-3" : "space-y-5"}>
      {schema.unresolvedReference ? (
        <UnresolvedReference reference={schema.unresolvedReference} />
      ) : null}

      {hasFieldMetadata ? (
        <dl className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {schema.type ? (
            <DetailField label="Type">{schema.type}</DetailField>
          ) : null}
          {schema.format ? (
            <DetailField label="Format">{schema.format}</DetailField>
          ) : null}
          {schema.referenceName ? (
            <DetailField label="Referenced Schema">
              <SchemaReference
                schemaName={schema.referenceName}
                label={schema.referenceName}
              />
            </DetailField>
          ) : null}
          {schema.arrayItem ? (
            <DetailField label="Array Items">
              <SchemaSummaryValue schema={schema.arrayItem} />
            </DetailField>
          ) : null}
          {schema.nullable !== undefined ? (
            <DetailField label="Nullable">
              {schema.nullable ? "Yes" : "No"}
            </DetailField>
          ) : null}
          {schema.readOnly !== undefined ? (
            <DetailField label="Read-only">
              {schema.readOnly ? "Yes" : "No"}
            </DetailField>
          ) : null}
          {schema.writeOnly !== undefined ? (
            <DetailField label="Write-only">
              {schema.writeOnly ? "Yes" : "No"}
            </DetailField>
          ) : null}
        </dl>
      ) : null}

      {schema.enumValues?.length ? (
        <SchemaValues label="Enum Values" values={schema.enumValues} />
      ) : null}

      {schema.compositions?.length ? (
        <section>
          <h4 className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
            Composition
          </h4>
          <ul className="mt-2 grid gap-2">
            {schema.compositions.map((composition) => (
              <li
                key={composition.keyword}
                className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200"
              >
                <strong>{composition.keyword}:</strong>{" "}
                {composition.members.map((member, index) => (
                  <span key={`${member.label}-${index}`}>
                    {index > 0 ? ", " : null}
                    <SchemaSummaryValue schema={member} />
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {schema.additionalProperties ? (
        <section>
          <h4 className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
            Additional Properties
          </h4>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
            {!schema.additionalProperties.allowed
              ? "Additional properties are not allowed."
              : schema.additionalProperties.schema
                ? "Additional properties: "
                : "Additional properties are allowed."}
            {schema.additionalProperties.allowed &&
            schema.additionalProperties.schema ? (
              <SchemaSummaryValue schema={schema.additionalProperties.schema} />
            ) : null}
          </p>
        </section>
      ) : null}

      {schema.defaultValue ? (
        <SchemaValues label="Default" values={[schema.defaultValue]} />
      ) : null}

      {schema.examples?.length ? (
        <SchemaValues label="Examples" values={schema.examples} />
      ) : null}
    </div>
  );
}

function SchemaValues({ label, values }: { label: string; values: string[] }) {
  return (
    <section>
      <h4 className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
        {label}
      </h4>
      <pre className="mt-2 max-w-full overflow-x-auto rounded-md bg-gray-950 p-3 text-xs whitespace-pre-wrap text-gray-100">
        <code>{values.join(", ")}</code>
      </pre>
    </section>
  );
}

function SchemaReference({
  schemaName,
  label,
}: {
  schemaName: string;
  label: string;
}) {
  const navigation = useContext(SchemaNavigationContext);

  if (!navigation?.schemaNames.has(schemaName)) {
    return <code className="break-all">{label}</code>;
  }

  return (
    <button
      type="button"
      className="rounded-sm font-mono text-cyan-700 underline decoration-cyan-300 underline-offset-2 outline-none hover:text-cyan-900 focus-visible:ring-2 focus-visible:ring-cyan-600 dark:text-cyan-300 dark:hover:text-cyan-200 dark:focus-visible:ring-cyan-400"
      onClick={() => navigation.navigateToSchema(schemaName)}
      aria-label={`Open ${schemaName} schema`}
    >
      {label}
    </button>
  );
}

function SchemaSummaryValue({ schema }: { schema: OpenApiSchemaSummary }) {
  if (schema.unresolvedReference) {
    return (
      <span className="text-amber-700 dark:text-amber-300">
        Unresolved reference: {schema.unresolvedReference}
      </span>
    );
  }

  if (!schema.label) {
    return null;
  }

  return schema.referenceName ? (
    <SchemaReference schemaName={schema.referenceName} label={schema.label} />
  ) : (
    <code className="break-all">{schema.label}</code>
  );
}

function EndpointCard({ endpoint }: { endpoint: OpenApiEndpoint }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const detailId = useId();

  return (
    <li className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <button
        type="button"
        className="flex w-full min-w-0 flex-col gap-3 p-4 text-left outline-none hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-inset sm:flex-row sm:items-start sm:justify-between dark:hover:bg-gray-800 dark:focus-visible:ring-cyan-400"
        aria-expanded={isExpanded}
        aria-controls={detailId}
        onClick={() => setIsExpanded((current) => !current)}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start">
          <MethodBadge method={endpoint.method} />
          <span className="min-w-0">
            <code className="block text-sm font-semibold break-all text-gray-950 dark:text-white">
              {endpoint.path}
            </code>
            <span className="mt-1 block text-sm leading-6 text-gray-600 dark:text-gray-300">
              {endpoint.summary ?? "No summary provided."}
            </span>
            {endpoint.deprecated || endpoint.securityRequired ? (
              <span className="mt-2 flex flex-wrap gap-2">
                {endpoint.deprecated ? (
                  <MetadataBadge tone="warning">Deprecated</MetadataBadge>
                ) : null}
                {endpoint.securityRequired ? (
                  <MetadataBadge tone="neutral">
                    Security Required
                  </MetadataBadge>
                ) : null}
              </span>
            ) : null}
          </span>
        </span>
        <span className="shrink-0 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
          {isExpanded ? "Hide details" : "Show details"}
        </span>
      </button>

      {isExpanded ? (
        <div
          id={detailId}
          className="border-t border-gray-200 bg-gray-50/70 p-4 sm:p-5 dark:border-gray-700 dark:bg-gray-950/40"
        >
          <EndpointDetails endpoint={endpoint} />
        </div>
      ) : null}
    </li>
  );
}

function MethodBadge({ method }: { method: string }) {
  return (
    <span
      className={`w-fit shrink-0 rounded-md border px-2 py-1 text-xs font-bold ${methodBadgeClasses[method] ?? methodBadgeClasses.HEAD}`}
    >
      {method}
    </span>
  );
}

function MetadataBadge({
  children,
  tone,
}: {
  children: string;
  tone: "warning" | "neutral";
}) {
  const toneClasses =
    tone === "warning"
      ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
      : "border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200";

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${toneClasses}`}
    >
      {children}
    </span>
  );
}

function EndpointDetails({ endpoint }: { endpoint: OpenApiEndpoint }) {
  const hasMetadata = Boolean(
    endpoint.operationId ||
    endpoint.summary ||
    endpoint.description ||
    endpoint.tags?.length,
  );

  return (
    <div className="space-y-6">
      {hasMetadata ? (
        <section>
          <h3 className="text-sm font-semibold text-gray-950 dark:text-white">
            Operation Details
          </h3>
          <dl className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2">
            {endpoint.operationId ? (
              <DetailField label="Operation ID">
                <code className="break-all">{endpoint.operationId}</code>
              </DetailField>
            ) : null}
            {endpoint.summary ? (
              <DetailField label="Summary">{endpoint.summary}</DetailField>
            ) : null}
            {endpoint.description ? (
              <DetailField label="Description">
                {endpoint.description}
              </DetailField>
            ) : null}
            {endpoint.tags?.length ? (
              <DetailField label="Tags">
                <span className="flex flex-wrap gap-2">
                  {endpoint.tags.map((tag) => (
                    <MetadataBadge key={tag} tone="neutral">
                      {tag}
                    </MetadataBadge>
                  ))}
                </span>
              </DetailField>
            ) : null}
          </dl>
        </section>
      ) : null}

      {endpoint.parameters?.length ? (
        <ParametersSection parameters={endpoint.parameters} />
      ) : null}

      {endpoint.requestBody ? (
        <RequestBodySection requestBody={endpoint.requestBody} />
      ) : null}

      {endpoint.responses?.length ? (
        <ResponsesSection responses={endpoint.responses} />
      ) : null}

      {!hasMetadata &&
      !endpoint.parameters?.length &&
      !endpoint.requestBody &&
      !endpoint.responses?.length ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          No additional operation details are provided.
        </p>
      ) : null}
    </div>
  );
}

function DetailField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
      <dt className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-6 break-words text-gray-700 dark:text-gray-200">
        {children}
      </dd>
    </div>
  );
}

function ParametersSection({ parameters }: { parameters: OpenApiParameter[] }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-950 dark:text-white">
        Parameters
      </h3>
      <ul className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2">
        {parameters.map((parameter, index) => (
          <li
            key={`${parameter.location}-${parameter.name}-${parameter.unresolvedReference}-${index}`}
            className="min-w-0 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
          >
            {parameter.unresolvedReference ? (
              <UnresolvedReference reference={parameter.unresolvedReference} />
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm break-all text-gray-950 dark:text-white">
                    {parameter.name ?? "Unnamed parameter"}
                  </strong>
                  {parameter.location ? (
                    <MetadataBadge tone="neutral">
                      {parameter.location}
                    </MetadataBadge>
                  ) : null}
                  <MetadataBadge
                    tone={parameter.required ? "warning" : "neutral"}
                  >
                    {parameter.required ? "Required" : "Optional"}
                  </MetadataBadge>
                </div>
                {parameter.description ? (
                  <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                    {parameter.description}
                  </p>
                ) : null}
                {parameter.schema ? (
                  <SchemaSummaryView schema={parameter.schema} label="Type" />
                ) : null}
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function RequestBodySection({
  requestBody,
}: {
  requestBody: OpenApiRequestBody;
}) {
  return (
    <section>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-950 dark:text-white">
          Request Body
        </h3>
        <MetadataBadge tone={requestBody.required ? "warning" : "neutral"}>
          {requestBody.required ? "Required" : "Optional"}
        </MetadataBadge>
      </div>
      <div className="mt-3 min-w-0 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
        {requestBody.unresolvedReference ? (
          <UnresolvedReference reference={requestBody.unresolvedReference} />
        ) : (
          <>
            {requestBody.description ? (
              <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                {requestBody.description}
              </p>
            ) : null}
            {requestBody.content.length > 0 ? (
              <ContentTypes content={requestBody.content} />
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

function ResponsesSection({ responses }: { responses: OpenApiResponse[] }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-950 dark:text-white">
        Responses
      </h3>
      <ul className="mt-3 grid min-w-0 gap-3">
        {responses.map((response) => (
          <li
            key={response.statusCode}
            className="min-w-0 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start">
              <span className="w-fit shrink-0 rounded-md border border-gray-300 bg-gray-100 px-2 py-1 font-mono text-xs font-semibold text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
                {response.statusCode}
              </span>
              <div className="min-w-0 flex-1">
                {response.unresolvedReference ? (
                  <UnresolvedReference
                    reference={response.unresolvedReference}
                  />
                ) : (
                  <>
                    {response.description ? (
                      <p className="text-sm leading-6 text-gray-700 dark:text-gray-200">
                        {response.description}
                      </p>
                    ) : null}
                    {response.content.length > 0 ? (
                      <ContentTypes content={response.content} />
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ContentTypes({ content }: { content: OpenApiMediaType[] }) {
  return (
    <div className="mt-3">
      <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
        Content Types
      </p>
      <ul className="mt-2 grid min-w-0 gap-2">
        {content.map((item) => (
          <li
            key={item.mediaType}
            className="min-w-0 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200"
          >
            <code className="break-all">{item.mediaType}</code>
            {item.schema ? (
              <SchemaSummaryView schema={item.schema} label="Schema" />
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SchemaSummaryView({
  schema,
  label,
}: {
  schema: OpenApiSchemaSummary;
  label: string;
}) {
  if (schema.unresolvedReference) {
    return (
      <div className="mt-2">
        <UnresolvedReference reference={schema.unresolvedReference} />
      </div>
    );
  }

  return schema.label ? (
    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
      {label}: <SchemaSummaryValue schema={schema} />
    </p>
  ) : null;
}

function UnresolvedReference({ reference }: { reference: string }) {
  return (
    <p className="text-sm text-amber-700 dark:text-amber-300">
      Unresolved reference: <code className="break-all">{reference}</code>
    </p>
  );
}
