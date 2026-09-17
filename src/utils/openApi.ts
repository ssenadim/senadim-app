import { parse } from "yaml";

export type OpenApiInputFormat = "auto" | "json" | "yaml";
export type OpenApiDetectedFormat = Exclude<OpenApiInputFormat, "auto">;

export interface OpenApiSchemaSummary {
  label?: string;
  referenceName?: string;
  unresolvedReference?: string;
}

export interface OpenApiSchemaComposition {
  keyword: "allOf" | "oneOf" | "anyOf";
  members: OpenApiSchemaSummary[];
}

export interface OpenApiAdditionalProperties {
  allowed: boolean;
  schema?: OpenApiSchemaSummary;
}

export interface OpenApiSchemaMetadata {
  type?: string;
  description?: string;
  format?: string;
  nullable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  deprecated?: true;
  enumValues?: string[];
  arrayItem?: OpenApiSchemaSummary;
  compositions?: OpenApiSchemaComposition[];
  additionalProperties?: OpenApiAdditionalProperties;
  defaultValue?: string;
  examples?: string[];
  referenceName?: string;
  unresolvedReference?: string;
}

export interface OpenApiSchemaProperty extends OpenApiSchemaMetadata {
  name: string;
  required: boolean;
}

export interface OpenApiSchemaModel extends OpenApiSchemaMetadata {
  name: string;
  requiredProperties: string[];
  properties: OpenApiSchemaProperty[];
}

export interface OpenApiMediaType {
  mediaType: string;
  schema?: OpenApiSchemaSummary;
}

export interface OpenApiParameter {
  name?: string;
  location?: string;
  required: boolean;
  description?: string;
  schema?: OpenApiSchemaSummary;
  unresolvedReference?: string;
}

export interface OpenApiRequestBody {
  required: boolean;
  description?: string;
  content: OpenApiMediaType[];
  unresolvedReference?: string;
}

export interface OpenApiResponse {
  statusCode: string;
  description?: string;
  content: OpenApiMediaType[];
  unresolvedReference?: string;
}

export interface OpenApiEndpoint {
  method: string;
  path: string;
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  deprecated?: true;
  securityRequired?: true;
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses?: OpenApiResponse[];
}

export interface OpenApiOverview {
  title?: string;
  version?: string;
  openApiVersion: string;
  description?: string;
  serverCount: number;
  pathCount: number;
  operationCount: number;
  schemaCount: number;
  tagCount: number;
}

export interface OpenApiAnalysis {
  detectedFormat: OpenApiDetectedFormat;
  overview: OpenApiOverview;
  endpoints: OpenApiEndpoint[];
  schemas: OpenApiSchemaModel[];
}

export interface OpenApiAnalysisSuccess {
  ok: true;
  analysis: OpenApiAnalysis;
}

export interface OpenApiAnalysisFailure {
  ok: false;
  error: string;
}

export type OpenApiAnalysisResult =
  | OpenApiAnalysisSuccess
  | OpenApiAnalysisFailure;

const supportedOpenApiVersion = /^3\.(?:0|1)\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;
const httpMethods = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "options",
  "head",
  "trace",
] as const;

type UnknownRecord = Record<string, unknown>;

export function analyzeOpenApi(
  source: string,
  format: OpenApiInputFormat = "auto",
): OpenApiAnalysisResult {
  const trimmedSource = source.trim();

  if (!trimmedSource) {
    return failure("Enter an OpenAPI definition to analyze.");
  }

  const detectedFormat =
    format === "auto" ? detectOpenApiFormat(trimmedSource) : format;
  const parsed = parseOpenApiSource(trimmedSource, detectedFormat);

  if (!parsed.ok) {
    return parsed;
  }

  if (!isRecord(parsed.value)) {
    return failure("The OpenAPI definition must contain a document object.");
  }

  if (parsed.value.swagger === "2.0") {
    return failure(
      "OpenAPI 2.0 is not supported. Use an OpenAPI 3.0.x or 3.1.x document.",
    );
  }

  if (!("openapi" in parsed.value)) {
    return failure("The document is missing the required openapi property.");
  }

  const openApiVersion = parsed.value.openapi;
  if (
    typeof openApiVersion !== "string" ||
    !supportedOpenApiVersion.test(openApiVersion)
  ) {
    return failure(
      "Unsupported OpenAPI version. Use an OpenAPI 3.0.x or 3.1.x document.",
    );
  }

  if (!isRecord(parsed.value.info)) {
    return failure("The document is missing the required info object.");
  }

  if (!isRecord(parsed.value.paths)) {
    return failure("The document is missing the required paths object.");
  }

  const endpoints = extractEndpoints(parsed.value.paths, parsed.value);
  const pathCount = Object.entries(parsed.value.paths).filter(
    ([path, pathItem]) => path.startsWith("/") && isRecord(pathItem),
  ).length;
  const components = isRecord(parsed.value.components)
    ? parsed.value.components
    : undefined;
  const schemas =
    components && isRecord(components.schemas) ? components.schemas : undefined;
  const schemaModels = parseSchemaModels(schemas, parsed.value);

  return {
    ok: true,
    analysis: {
      detectedFormat,
      overview: {
        title: getOptionalString(parsed.value.info.title),
        version: getOptionalString(parsed.value.info.version),
        openApiVersion,
        description: getOptionalString(parsed.value.info.description),
        serverCount: Array.isArray(parsed.value.servers)
          ? parsed.value.servers.length
          : 0,
        pathCount,
        operationCount: endpoints.length,
        schemaCount: schemaModels.length,
        tagCount: Array.isArray(parsed.value.tags)
          ? parsed.value.tags.length
          : 0,
      },
      endpoints,
      schemas: schemaModels,
    },
  };
}

export function filterOpenApiSchemas(
  schemas: readonly OpenApiSchemaModel[],
  query: string,
): OpenApiSchemaModel[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [...schemas];
  }

  return schemas.filter(
    (schema) =>
      schema.name.toLowerCase().includes(normalizedQuery) ||
      schema.description?.toLowerCase().includes(normalizedQuery) ||
      schema.properties.some(
        (property) =>
          property.name.toLowerCase().includes(normalizedQuery) ||
          property.description?.toLowerCase().includes(normalizedQuery),
      ),
  );
}

export function detectOpenApiFormat(source: string): OpenApiDetectedFormat {
  const firstCharacter = source.trimStart()[0];
  return firstCharacter === "{" || firstCharacter === "[" ? "json" : "yaml";
}

function parseOpenApiSource(
  source: string,
  format: OpenApiDetectedFormat,
): { ok: true; value: unknown } | OpenApiAnalysisFailure {
  try {
    return {
      ok: true,
      value: format === "json" ? JSON.parse(source) : parse(source),
    };
  } catch {
    return failure(
      `The OpenAPI definition is not valid ${format.toUpperCase()}.`,
    );
  }
}

function extractEndpoints(
  paths: UnknownRecord,
  document: UnknownRecord,
): OpenApiEndpoint[] {
  const endpoints: OpenApiEndpoint[] = [];

  for (const [path, pathItemValue] of Object.entries(paths)) {
    if (!path.startsWith("/")) {
      continue;
    }

    const pathItemResolution = resolveReferencedRecord(pathItemValue, document);
    if (!pathItemResolution.value) {
      continue;
    }
    const pathItem = pathItemResolution.value;
    const pathParameters = parseParameters(pathItem.parameters, document);

    for (const method of httpMethods) {
      const operation = pathItem[method];
      if (!isRecord(operation)) {
        continue;
      }

      const endpoint: OpenApiEndpoint = {
        method: method.toUpperCase(),
        path,
      };
      const summary = getOptionalString(operation.summary);
      const description = getOptionalString(operation.description);
      const operationId = getOptionalString(operation.operationId);
      const tags = Array.isArray(operation.tags)
        ? operation.tags
            .filter(
              (tag): tag is string =>
                typeof tag === "string" && Boolean(tag.trim()),
            )
            .map((tag) => tag.trim())
        : [];
      const parameters = combineParameters(
        pathParameters,
        parseParameters(operation.parameters, document),
      );
      const requestBody = parseRequestBody(operation.requestBody, document);
      const responses = parseResponses(operation.responses, document);

      if (summary) endpoint.summary = summary;
      if (description) endpoint.description = description;
      if (operationId) endpoint.operationId = operationId;
      if (tags.length > 0) endpoint.tags = tags;
      if (operation.deprecated === true) endpoint.deprecated = true;
      const security = Object.prototype.hasOwnProperty.call(
        operation,
        "security",
      )
        ? operation.security
        : document.security;
      if (hasSecurityRequirements(security)) {
        endpoint.securityRequired = true;
      }
      if (parameters.length > 0) endpoint.parameters = parameters;
      if (requestBody) endpoint.requestBody = requestBody;
      if (responses.length > 0) endpoint.responses = responses;

      endpoints.push(endpoint);
    }
  }

  return endpoints;
}

function parseParameters(
  value: unknown,
  document: UnknownRecord,
): OpenApiParameter[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((parameterValue) => {
    const resolution = resolveReferencedRecord(parameterValue, document);
    if (resolution.unresolvedReference || !resolution.value) {
      return resolution.unresolvedReference
        ? [
            {
              required: false,
              unresolvedReference: resolution.unresolvedReference,
            },
          ]
        : [];
    }

    const parameter = resolution.value;
    const parsedParameter: OpenApiParameter = {
      required: parameter.required === true,
    };
    const name = getOptionalString(parameter.name);
    const location = getOptionalString(parameter.in);
    const description = getOptionalString(parameter.description);
    const schema = getSchemaSummary(
      parameter.schema ?? getFirstContentSchema(parameter.content),
      document,
    );

    if (name) parsedParameter.name = name;
    if (location) parsedParameter.location = location;
    if (description) parsedParameter.description = description;
    if (schema) parsedParameter.schema = schema;

    return [parsedParameter];
  });
}

function combineParameters(
  pathParameters: OpenApiParameter[],
  operationParameters: OpenApiParameter[],
): OpenApiParameter[] {
  const combined = new Map<string, OpenApiParameter>();

  for (const parameter of [...pathParameters, ...operationParameters]) {
    combined.set(getParameterKey(parameter), parameter);
  }

  return [...combined.values()];
}

function getParameterKey(parameter: OpenApiParameter): string {
  if (parameter.unresolvedReference) {
    return `reference:${parameter.unresolvedReference}`;
  }

  const location = parameter.location?.toLowerCase() ?? "unknown";
  const name =
    location === "header" ? parameter.name?.toLowerCase() : parameter.name;
  return `${location}:${name ?? "unnamed"}`;
}

function parseRequestBody(
  value: unknown,
  document: UnknownRecord,
): OpenApiRequestBody | undefined {
  if (value === undefined) {
    return undefined;
  }

  const resolution = resolveReferencedRecord(value, document);
  if (resolution.unresolvedReference || !resolution.value) {
    return resolution.unresolvedReference
      ? {
          required: false,
          content: [],
          unresolvedReference: resolution.unresolvedReference,
        }
      : undefined;
  }

  return {
    required: resolution.value.required === true,
    description: getOptionalString(resolution.value.description),
    content: parseContent(resolution.value.content, document),
  };
}

function parseResponses(
  value: unknown,
  document: UnknownRecord,
): OpenApiResponse[] {
  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value)
    .sort(([firstCode], [secondCode]) =>
      compareResponseCodes(firstCode, secondCode),
    )
    .flatMap<OpenApiResponse>(([statusCode, responseValue]) => {
      const resolution = resolveReferencedRecord(responseValue, document);
      if (resolution.unresolvedReference || !resolution.value) {
        return resolution.unresolvedReference
          ? [
              {
                statusCode,
                content: [],
                unresolvedReference: resolution.unresolvedReference,
              },
            ]
          : [];
      }

      return [
        {
          statusCode,
          description: getOptionalString(resolution.value.description),
          content: parseContent(resolution.value.content, document),
        },
      ];
    });
}

function compareResponseCodes(firstCode: string, secondCode: string): number {
  if (firstCode === "default") return secondCode === "default" ? 0 : 1;
  if (secondCode === "default") return -1;

  const firstIsNumeric = /^\d{3}$/.test(firstCode);
  const secondIsNumeric = /^\d{3}$/.test(secondCode);

  if (firstIsNumeric && secondIsNumeric) {
    return Number(firstCode) - Number(secondCode);
  }
  if (firstIsNumeric) return -1;
  if (secondIsNumeric) return 1;
  return firstCode.localeCompare(secondCode);
}

function parseContent(
  value: unknown,
  document: UnknownRecord,
): OpenApiMediaType[] {
  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value)
    .sort(([firstType], [secondType]) => firstType.localeCompare(secondType))
    .flatMap(([mediaType, mediaTypeValue]) => {
      if (!isRecord(mediaTypeValue)) {
        return [];
      }

      const schema = getSchemaSummary(mediaTypeValue.schema, document);
      return [{ mediaType, ...(schema ? { schema } : {}) }];
    });
}

function getFirstContentSchema(value: unknown): unknown {
  if (!isRecord(value)) {
    return undefined;
  }

  for (const mediaTypeValue of Object.values(value)) {
    if (isRecord(mediaTypeValue) && mediaTypeValue.schema !== undefined) {
      return mediaTypeValue.schema;
    }
  }

  return undefined;
}

function parseSchemaModels(
  schemas: UnknownRecord | undefined,
  document: UnknownRecord,
): OpenApiSchemaModel[] {
  if (!schemas) {
    return [];
  }

  return Object.entries(schemas)
    .sort(([firstName], [secondName]) => firstName.localeCompare(secondName))
    .map(([name, value]) => parseSchemaModel(name, value, document));
}

function parseSchemaModel(
  name: string,
  value: unknown,
  document: UnknownRecord,
): OpenApiSchemaModel {
  const metadata = parseSchemaMetadata(value, document);
  const resolution = resolveReferencedRecord(value, document);
  const schema = resolution.value;
  const requiredProperties = schema ? getStringArray(schema.required) : [];
  const requiredPropertyNames = new Set(requiredProperties);
  const properties =
    schema && isRecord(schema.properties)
      ? Object.entries(schema.properties)
          .sort(([firstName], [secondName]) =>
            firstName.localeCompare(secondName),
          )
          .map(([propertyName, propertyValue]) => ({
            name: propertyName,
            required: requiredPropertyNames.has(propertyName),
            ...parseSchemaMetadata(propertyValue, document),
          }))
      : [];

  return {
    name,
    requiredProperties,
    properties,
    ...metadata,
  };
}

function parseSchemaMetadata(
  value: unknown,
  document: UnknownRecord,
): OpenApiSchemaMetadata {
  if (!isRecord(value)) {
    return {};
  }

  const reference = getOptionalString(value.$ref);
  const resolution = resolveReferencedRecord(value, document);
  if (resolution.unresolvedReference || !resolution.value) {
    return {
      ...(reference ? { referenceName: getReferenceName(reference) } : {}),
      ...(resolution.unresolvedReference
        ? { unresolvedReference: resolution.unresolvedReference }
        : {}),
    };
  }

  const schema = resolution.value;
  const type = getSchemaTypeLabel(schema.type);
  const description = getOptionalString(schema.description);
  const format = getOptionalString(schema.format);
  const enumValues = getCompactValues(schema.enum);
  const examples = getSchemaExamples(schema);
  const arrayItem = hasSchemaType(schema.type, "array")
    ? getSchemaSummary(schema.items, document)
    : undefined;
  const compositions = parseSchemaCompositions(schema, document);
  const additionalProperties = parseAdditionalProperties(
    schema.additionalProperties,
    document,
  );
  const defaultValue = serializeCompactValue(schema.default);
  const nullableFromType =
    Array.isArray(schema.type) && schema.type.includes("null");

  return {
    ...(type ? { type } : {}),
    ...(description ? { description } : {}),
    ...(format ? { format } : {}),
    ...(typeof schema.nullable === "boolean"
      ? { nullable: schema.nullable }
      : nullableFromType
        ? { nullable: true }
        : {}),
    ...(typeof schema.readOnly === "boolean"
      ? { readOnly: schema.readOnly }
      : {}),
    ...(typeof schema.writeOnly === "boolean"
      ? { writeOnly: schema.writeOnly }
      : {}),
    ...(schema.deprecated === true ? { deprecated: true as const } : {}),
    ...(enumValues.length > 0 ? { enumValues } : {}),
    ...(arrayItem ? { arrayItem } : {}),
    ...(compositions.length > 0 ? { compositions } : {}),
    ...(additionalProperties ? { additionalProperties } : {}),
    ...(defaultValue ? { defaultValue } : {}),
    ...(examples.length > 0 ? { examples } : {}),
    ...(reference ? { referenceName: getReferenceName(reference) } : {}),
  };
}

function parseSchemaCompositions(
  schema: UnknownRecord,
  document: UnknownRecord,
): OpenApiSchemaComposition[] {
  const keywords = ["allOf", "oneOf", "anyOf"] as const;

  return keywords.flatMap((keyword) => {
    const values = schema[keyword];
    if (!Array.isArray(values)) {
      return [];
    }

    const members = values.map(
      (value) =>
        getSchemaSummary(value, document) ?? { label: "Inline schema" },
    );
    return members.length > 0 ? [{ keyword, members }] : [];
  });
}

function parseAdditionalProperties(
  value: unknown,
  document: UnknownRecord,
): OpenApiAdditionalProperties | undefined {
  if (typeof value === "boolean") {
    return { allowed: value };
  }

  const schema = getSchemaSummary(value, document);
  return schema ? { allowed: true, schema } : undefined;
}

function getSchemaExamples(schema: UnknownRecord): string[] {
  const values = [
    ...(Array.isArray(schema.examples) ? schema.examples : []),
    ...(schema.example !== undefined ? [schema.example] : []),
  ];

  return values
    .map(serializeCompactValue)
    .filter((value): value is string => Boolean(value))
    .slice(0, 3);
}

function getCompactValues(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(serializeCompactValue)
    .filter((item): item is string => Boolean(item));
}

function serializeCompactValue(value: unknown): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  try {
    const serialized = JSON.stringify(value);
    return serialized && serialized.length <= 160 ? serialized : undefined;
  } catch {
    return undefined;
  }
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function getSchemaSummary(
  value: unknown,
  document: UnknownRecord,
): OpenApiSchemaSummary | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const reference = getOptionalString(value.$ref);
  if (reference) {
    const resolution = resolveReferencedRecord(value, document);
    if (resolution.unresolvedReference || !resolution.value) {
      return { unresolvedReference: reference };
    }

    return {
      label:
        getReferenceName(reference) ?? getInlineSchemaLabel(resolution.value),
      referenceName: getReferenceName(reference),
    };
  }

  if (hasSchemaType(value.type, "array")) {
    const itemSummary = getSchemaSummary(value.items, document);
    return {
      label: itemSummary?.label ? `array of ${itemSummary.label}` : "array",
      ...(itemSummary?.referenceName
        ? { referenceName: itemSummary.referenceName }
        : {}),
      ...(itemSummary?.unresolvedReference
        ? { unresolvedReference: itemSummary.unresolvedReference }
        : {}),
    };
  }

  const label = getInlineSchemaLabel(value);
  return label ? { label } : undefined;
}

function getInlineSchemaLabel(schema: UnknownRecord): string | undefined {
  return getOptionalString(schema.title) ?? getSchemaTypeLabel(schema.type);
}

function getSchemaTypeLabel(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (Array.isArray(value)) {
    const types = value.filter(
      (item): item is string =>
        typeof item === "string" && Boolean(item.trim()),
    );
    return types.length > 0 ? types.join(" | ") : undefined;
  }

  return undefined;
}

function hasSchemaType(value: unknown, expectedType: string): boolean {
  return (
    value === expectedType ||
    (Array.isArray(value) && value.includes(expectedType))
  );
}

function hasSecurityRequirements(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.some(
      (requirement) =>
        isRecord(requirement) && Object.keys(requirement).length > 0,
    )
  );
}

interface ReferenceResolution {
  value?: UnknownRecord;
  unresolvedReference?: string;
}

function resolveReferencedRecord(
  value: unknown,
  document: UnknownRecord,
  visitedReferences: ReadonlySet<string> = new Set(),
): ReferenceResolution {
  if (!isRecord(value)) {
    return {};
  }

  const reference = getOptionalString(value.$ref);
  if (!reference) {
    return { value };
  }

  if (!reference.startsWith("#/") || visitedReferences.has(reference)) {
    return unresolvedReferenceResolution(value, reference);
  }

  const referencedValue = resolveLocalReference(document, reference);
  if (!isRecord(referencedValue)) {
    return unresolvedReferenceResolution(value, reference);
  }

  const nextVisitedReferences = new Set(visitedReferences);
  nextVisitedReferences.add(reference);
  const nestedResolution = resolveReferencedRecord(
    referencedValue,
    document,
    nextVisitedReferences,
  );
  if (!nestedResolution.value) {
    const siblingResolution = unresolvedReferenceResolution(
      value,
      nestedResolution.unresolvedReference ?? reference,
    );
    return {
      ...nestedResolution,
      ...(siblingResolution.value ? { value: siblingResolution.value } : {}),
    };
  }

  const siblings = Object.fromEntries(
    Object.entries(value).filter(([key]) => key !== "$ref"),
  );
  return { value: { ...nestedResolution.value, ...siblings } };
}

function unresolvedReferenceResolution(
  value: UnknownRecord,
  reference: string,
): ReferenceResolution {
  const siblings = Object.fromEntries(
    Object.entries(value).filter(([key]) => key !== "$ref"),
  );

  return {
    unresolvedReference: reference,
    ...(Object.keys(siblings).length > 0 ? { value: siblings } : {}),
  };
}

function resolveLocalReference(
  document: UnknownRecord,
  reference: string,
): unknown {
  let current: unknown = document;

  for (const rawSegment of reference.slice(2).split("/")) {
    if (!isRecord(current)) {
      return undefined;
    }

    const segment = rawSegment.replace(/~1/g, "/").replace(/~0/g, "~");
    current = current[segment];
  }

  return current;
}

function getReferenceName(reference: string): string | undefined {
  if (!reference.startsWith("#/")) {
    return undefined;
  }

  const segments = reference.split("/");
  const rawName = segments[segments.length - 1];
  return rawName?.replace(/~1/g, "/").replace(/~0/g, "~");
}

function getOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function failure(error: string): OpenApiAnalysisFailure {
  return { ok: false, error };
}
