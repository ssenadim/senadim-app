import { parse } from "yaml";

export type OpenApiInputFormat = "auto" | "json" | "yaml";
export type OpenApiDetectedFormat = Exclude<OpenApiInputFormat, "auto">;

export interface OpenApiEndpoint {
  method: string;
  path: string;
  summary?: string;
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

  const endpoints = extractEndpoints(parsed.value.paths);
  const pathCount = Object.entries(parsed.value.paths).filter(
    ([path, pathItem]) => path.startsWith("/") && isRecord(pathItem),
  ).length;
  const components = isRecord(parsed.value.components)
    ? parsed.value.components
    : undefined;
  const schemas =
    components && isRecord(components.schemas) ? components.schemas : undefined;

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
        schemaCount: schemas ? Object.keys(schemas).length : 0,
        tagCount: Array.isArray(parsed.value.tags)
          ? parsed.value.tags.length
          : 0,
      },
      endpoints,
    },
  };
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

function extractEndpoints(paths: UnknownRecord): OpenApiEndpoint[] {
  const endpoints: OpenApiEndpoint[] = [];

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!path.startsWith("/") || !isRecord(pathItem)) {
      continue;
    }

    for (const method of httpMethods) {
      const operation = pathItem[method];
      if (!isRecord(operation)) {
        continue;
      }

      endpoints.push({
        method: method.toUpperCase(),
        path,
        summary: getOptionalString(operation.summary),
      });
    }
  }

  return endpoints;
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
