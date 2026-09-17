import assert from "node:assert/strict";
import test from "node:test";
import { analyzeOpenApi, detectOpenApiFormat } from "../src/utils/openApi.ts";

const jsonDocument = JSON.stringify({
  openapi: "3.0.3",
  info: {
    title: "Customer API",
    version: "1.2.0",
    description: "Customer operations",
  },
  servers: [{ url: "https://api.example.test" }],
  paths: {
    "/customers/{id}": {
      parameters: [{ name: "id", in: "path" }],
      get: { summary: "Get customer" },
    },
    "/customers": {
      post: { summary: "Create customer" },
      $ref: "#/components/pathItems/Customers",
    },
  },
  components: {
    schemas: {
      Customer: { type: "object" },
      Error: { type: "object" },
    },
  },
  tags: [{ name: "Customers" }],
});

const yamlDocument = `openapi: 3.1.0
info:
  title: Customer API
  version: 2.0.0
paths:
  /customers/{id}:
    get:
      summary: Get customer
  /customers:
    post:
      summary: Create customer`;

test("auto detection uses straightforward JSON and YAML syntax", () => {
  assert.equal(detectOpenApiFormat(`  ${jsonDocument}`), "json");
  assert.equal(detectOpenApiFormat(`\n${yamlDocument}`), "yaml");
});

test("valid OpenAPI 3.0 JSON produces overview counts and endpoints", () => {
  const result = analyzeOpenApi(jsonDocument, "auto");

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.analysis.detectedFormat, "json");
  assert.deepEqual(result.analysis.overview, {
    title: "Customer API",
    version: "1.2.0",
    openApiVersion: "3.0.3",
    description: "Customer operations",
    serverCount: 1,
    pathCount: 2,
    operationCount: 2,
    schemaCount: 2,
    tagCount: 1,
  });
  assert.deepEqual(result.analysis.endpoints, [
    {
      method: "GET",
      path: "/customers/{id}",
      summary: "Get customer",
    },
    {
      method: "POST",
      path: "/customers",
      summary: "Create customer",
    },
  ]);
});

test("valid OpenAPI 3.1 YAML is parsed with Auto Detect", () => {
  const result = analyzeOpenApi(yamlDocument);

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.analysis.detectedFormat, "yaml");
  assert.equal(result.analysis.overview.openApiVersion, "3.1.0");
  assert.equal(result.analysis.overview.operationCount, 2);
});

test("explicit JSON and YAML formats are supported", () => {
  assert.equal(analyzeOpenApi(jsonDocument, "json").ok, true);
  assert.equal(analyzeOpenApi(yamlDocument, "yaml").ok, true);
});

test("all common HTTP methods count while path metadata does not", () => {
  const methods = [
    "get",
    "post",
    "put",
    "patch",
    "delete",
    "options",
    "head",
    "trace",
  ];
  const result = analyzeOpenApi(
    JSON.stringify({
      openapi: "3.1.1",
      info: { title: "Methods", version: "1" },
      paths: {
        "/methods": Object.fromEntries([
          ...methods.map((method) => [method, {}]),
          ["parameters", []],
          ["summary", "Path summary"],
        ]),
      },
    }),
    "json",
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.analysis.overview.operationCount, methods.length);
  assert.deepEqual(
    result.analysis.endpoints.map(({ method }) => method),
    methods.map((method) => method.toUpperCase()),
  );
});

test("empty input and malformed JSON or YAML return controlled errors", () => {
  assert.deepEqual(analyzeOpenApi(""), {
    ok: false,
    error: "Enter an OpenAPI definition to analyze.",
  });
  assert.deepEqual(analyzeOpenApi("{ invalid", "json"), {
    ok: false,
    error: "The OpenAPI definition is not valid JSON.",
  });
  assert.deepEqual(analyzeOpenApi("openapi: [", "yaml"), {
    ok: false,
    error: "The OpenAPI definition is not valid YAML.",
  });
});

test("non-object input is rejected", () => {
  assert.deepEqual(analyzeOpenApi("[]", "json"), {
    ok: false,
    error: "The OpenAPI definition must contain a document object.",
  });
});

test("required OpenAPI structure reports each missing section", () => {
  assert.match(analyzeFailure("{}"), /openapi property/);
  assert.match(analyzeFailure('{"openapi":"3.0.0"}'), /required info object/);
  assert.match(
    analyzeFailure('{"openapi":"3.0.0","info":{}}'),
    /required paths object/,
  );
});

test("OpenAPI 2.0 and other unsupported versions are rejected", () => {
  assert.match(
    analyzeFailure('{"swagger":"2.0","info":{},"paths":{}}'),
    /OpenAPI 2.0 is not supported/,
  );
  assert.match(
    analyzeFailure('{"openapi":"3.2.0","info":{},"paths":{}}'),
    /Unsupported OpenAPI version/,
  );
});

test("optional overview values safely fall back without affecting analysis", () => {
  const result = analyzeOpenApi(
    '{"openapi":"3.0.0","info":{},"paths":{}}',
    "json",
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.analysis.overview.title, undefined);
  assert.equal(result.analysis.overview.version, undefined);
  assert.equal(result.analysis.overview.serverCount, 0);
  assert.equal(result.analysis.overview.schemaCount, 0);
  assert.equal(result.analysis.overview.tagCount, 0);
  assert.deepEqual(result.analysis.endpoints, []);
});

function analyzeFailure(source: string): string {
  const result = analyzeOpenApi(source, "json");
  assert.equal(result.ok, false);
  return result.ok ? "" : result.error;
}
