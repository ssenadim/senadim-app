import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeOpenApi,
  detectOpenApiFormat,
  filterOpenApiEndpoints,
  filterOpenApiSchemas,
  getAvailableOpenApiMethods,
} from "../src/utils/openApi.ts";

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
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
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
      parameters: [
        {
          name: "id",
          location: "path",
          required: true,
          schema: { label: "string" },
        },
      ],
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
  assert.deepEqual(result.analysis.schemas, []);
});

test("endpoint details combine parameters and expose operation metadata", () => {
  const result = analyzeOpenApi(
    JSON.stringify({
      openapi: "3.0.3",
      info: { title: "Explorer", version: "1" },
      paths: {
        "/customers/{id}": {
          parameters: [
            { $ref: "#/components/parameters/CustomerId" },
            { name: "trace-id", in: "header", schema: { type: "string" } },
          ],
          get: {
            operationId: "getCustomer",
            summary: "Get customer",
            description: "Retrieve a customer by identifier.",
            tags: ["Customers", "Read"],
            deprecated: true,
            security: [{ bearerAuth: [] }],
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                description: "Operation-level identifier",
                schema: { type: "integer" },
              },
              {
                name: "includeHistory",
                in: "query",
                required: false,
                schema: { type: "boolean" },
              },
            ],
            responses: { "200": { description: "Found" } },
          },
        },
      },
      components: {
        parameters: {
          CustomerId: {
            name: "id",
            in: "path",
            required: true,
            description: "Path-level identifier",
            schema: { type: "string" },
          },
        },
      },
    }),
    "json",
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;
  const endpoint = result.analysis.endpoints[0];
  assert.equal(endpoint?.operationId, "getCustomer");
  assert.equal(endpoint?.description, "Retrieve a customer by identifier.");
  assert.deepEqual(endpoint?.tags, ["Customers", "Read"]);
  assert.equal(endpoint?.deprecated, true);
  assert.equal(endpoint?.securityRequired, true);
  assert.deepEqual(endpoint?.parameters, [
    {
      name: "id",
      location: "path",
      required: true,
      description: "Operation-level identifier",
      schema: { label: "integer" },
    },
    {
      name: "trace-id",
      location: "header",
      required: false,
      schema: { label: "string" },
    },
    {
      name: "includeHistory",
      location: "query",
      required: false,
      schema: { label: "boolean" },
    },
  ]);
});

test("root security is inherited while explicitly empty operation security is not", () => {
  const result = analyzeOpenApi(
    '{"openapi":"3.1.0","info":{},"security":[{"bearerAuth":[]}],"paths":{"/secure":{"get":{}},"/public":{"get":{"security":[]}}}}',
    "json",
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.analysis.endpoints[0]?.securityRequired, true);
  assert.equal(result.analysis.endpoints[1]?.securityRequired, undefined);
});

test("request body and response metadata resolve local component references", () => {
  const result = analyzeOpenApi(
    JSON.stringify({
      openapi: "3.1.0",
      info: { title: "Bodies", version: "1" },
      paths: {
        "/customers": {
          post: {
            requestBody: { $ref: "#/components/requestBodies/CreateCustomer" },
            responses: {
              default: { description: "Unexpected error" },
              "400": {
                description: "Invalid request",
                content: {
                  "application/json": {
                    schema: { type: "object" },
                  },
                },
              },
              "201": { $ref: "#/components/responses/CustomerCreated" },
            },
          },
        },
      },
      components: {
        schemas: {
          Customer: { type: "object" },
          CreateCustomerRequest: { type: "object" },
        },
        requestBodies: {
          CreateCustomer: {
            required: true,
            description: "Customer details",
            content: {
              "multipart/form-data": { schema: { type: "object" } },
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateCustomerRequest",
                },
              },
            },
          },
        },
        responses: {
          CustomerCreated: {
            description: "Customer created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Customer" },
              },
              "application/xml": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Customer" },
                },
              },
            },
          },
        },
      },
    }),
    "json",
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;
  const endpoint = result.analysis.endpoints[0];
  assert.deepEqual(endpoint?.requestBody, {
    required: true,
    description: "Customer details",
    content: [
      {
        mediaType: "application/json",
        schema: {
          label: "CreateCustomerRequest",
          referenceName: "CreateCustomerRequest",
        },
      },
      {
        mediaType: "multipart/form-data",
        schema: { label: "object" },
      },
    ],
  });
  assert.deepEqual(
    endpoint?.responses?.map(({ statusCode }) => statusCode),
    ["201", "400", "default"],
  );
  assert.deepEqual(endpoint?.responses?.[0], {
    statusCode: "201",
    description: "Customer created",
    content: [
      {
        mediaType: "application/json",
        schema: { label: "Customer", referenceName: "Customer" },
      },
      {
        mediaType: "application/xml",
        schema: {
          label: "array of Customer",
          referenceName: "Customer",
        },
      },
    ],
  });
});

test("unresolved local and external references produce safe fallbacks", () => {
  const result = analyzeOpenApi(
    JSON.stringify({
      openapi: "3.0.0",
      info: {},
      paths: {
        "/missing": {
          post: {
            parameters: [{ $ref: "#/components/parameters/Missing" }],
            requestBody: { $ref: "https://example.test/request-body.yaml" },
            responses: {
              "200": { $ref: "#/components/responses/Missing" },
              "400": {
                description: "Invalid",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Missing" },
                  },
                },
              },
            },
          },
        },
      },
    }),
    "json",
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;
  const endpoint = result.analysis.endpoints[0];
  assert.equal(
    endpoint?.parameters?.[0]?.unresolvedReference,
    "#/components/parameters/Missing",
  );
  assert.equal(
    endpoint?.requestBody?.unresolvedReference,
    "https://example.test/request-body.yaml",
  );
  assert.equal(
    endpoint?.responses?.[0]?.unresolvedReference,
    "#/components/responses/Missing",
  );
  assert.equal(
    endpoint?.responses?.[1]?.content[0]?.schema?.unresolvedReference,
    "#/components/schemas/Missing",
  );
});

test("path item references resolve locally without mutating the document", () => {
  const document = {
    openapi: "3.1.0",
    info: {},
    paths: {
      "/health": { $ref: "#/components/pathItems/Health" },
    },
    components: {
      pathItems: {
        Health: {
          get: {
            summary: "Health check",
            responses: { "204": { description: "Healthy" } },
          },
        },
      },
    },
  };
  const before = JSON.stringify(document);
  const result = analyzeOpenApi(JSON.stringify(document), "json");

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.analysis.endpoints[0]?.summary, "Health check");
  assert.equal(JSON.stringify(document), before);
});

test("component schemas expose object properties and metadata without flattening", () => {
  const result = analyzeOpenApi(
    JSON.stringify({
      openapi: "3.0.3",
      info: { title: "Models", version: "1" },
      paths: {},
      components: {
        schemas: {
          CustomerBase: {
            type: "object",
            properties: {
              createdAt: {
                type: "string",
                format: "date-time",
                readOnly: true,
              },
            },
          },
          Customer: {
            type: "object",
            description: "Reusable customer record.",
            required: ["id", "status"],
            additionalProperties: false,
            deprecated: true,
            properties: {
              id: {
                type: "string",
                format: "uuid",
                description: "Customer identifier",
                example: "customer-123",
              },
              status: {
                type: "string",
                enum: ["active", "disabled"],
                default: "active",
              },
              parent: { $ref: "#/components/schemas/CustomerBase" },
              labels: {
                type: "array",
                items: { type: "string" },
                nullable: true,
              },
              secret: { type: "string", writeOnly: true },
            },
          },
        },
      },
    }),
    "json",
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.analysis.overview.schemaCount, 2);
  assert.deepEqual(
    result.analysis.schemas.map(({ name }) => name),
    ["Customer", "CustomerBase"],
  );

  const customer = result.analysis.schemas[0];
  assert.equal(customer?.type, "object");
  assert.equal(customer?.description, "Reusable customer record.");
  assert.equal(customer?.deprecated, true);
  assert.deepEqual(customer?.requiredProperties, ["id", "status"]);
  assert.deepEqual(customer?.additionalProperties, { allowed: false });
  assert.deepEqual(customer?.properties[0], {
    name: "id",
    required: true,
    type: "string",
    description: "Customer identifier",
    format: "uuid",
    examples: ['"customer-123"'],
  });
  assert.deepEqual(customer?.properties[1], {
    name: "labels",
    required: false,
    type: "array",
    nullable: true,
    arrayItem: { label: "string" },
  });
  assert.deepEqual(customer?.properties[2], {
    name: "parent",
    required: false,
    type: "object",
    referenceName: "CustomerBase",
  });
  assert.deepEqual(customer?.properties[3], {
    name: "secret",
    required: false,
    type: "string",
    writeOnly: true,
  });
  assert.deepEqual(customer?.properties[4], {
    name: "status",
    required: true,
    type: "string",
    enumValues: ['"active"', '"disabled"'],
    defaultValue: '"active"',
  });
});

test("arrays, composition, additional properties, and OpenAPI 3.1 types stay shallow", () => {
  const result = analyzeOpenApi(
    JSON.stringify({
      openapi: "3.1.0",
      info: { title: "Schema shapes", version: "1" },
      paths: {},
      components: {
        schemas: {
          Customer: { type: "object" },
          CustomerDetails: { type: "object" },
          CustomerList: {
            type: "array",
            items: { $ref: "#/components/schemas/Customer" },
          },
          CustomerView: {
            allOf: [
              { $ref: "#/components/schemas/Customer" },
              { $ref: "#/components/schemas/CustomerDetails" },
            ],
            oneOf: [{ type: "string" }, { type: "integer" }],
            not: { type: "null" },
          },
          FlexibleLabels: {
            type: "object",
            additionalProperties: { type: "string" },
          },
          OptionalName: {
            type: ["string", "null"],
            examples: ["Ada", "Grace"],
          },
        },
      },
    }),
    "json",
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;
  const findSchema = (name: string) =>
    result.analysis.schemas.find((schema) => schema.name === name);

  assert.deepEqual(findSchema("CustomerList")?.arrayItem, {
    label: "Customer",
    referenceName: "Customer",
  });
  assert.deepEqual(findSchema("FlexibleLabels")?.additionalProperties, {
    allowed: true,
    schema: { label: "string" },
  });
  assert.deepEqual(findSchema("OptionalName"), {
    name: "OptionalName",
    requiredProperties: [],
    properties: [],
    type: "string | null",
    nullable: true,
    examples: ['"Ada"', '"Grace"'],
  });
  assert.deepEqual(findSchema("CustomerView")?.compositions, [
    {
      keyword: "allOf",
      members: [
        { label: "Customer", referenceName: "Customer" },
        { label: "CustomerDetails", referenceName: "CustomerDetails" },
      ],
    },
    {
      keyword: "oneOf",
      members: [{ label: "string" }, { label: "integer" }],
    },
  ]);
});

test("schema search matches names, property names, and descriptions case-insensitively", () => {
  const schemas = [
    {
      name: "Customer",
      description: "Primary account record",
      requiredProperties: [],
      properties: [
        { name: "emailAddress", required: false, description: "Contact EMAIL" },
      ],
    },
    {
      name: "Invoice",
      requiredProperties: [],
      properties: [],
    },
  ];

  assert.deepEqual(
    filterOpenApiSchemas(schemas, "CUSTOM").map(({ name }) => name),
    ["Customer"],
  );
  assert.deepEqual(
    filterOpenApiSchemas(schemas, "email").map(({ name }) => name),
    ["Customer"],
  );
  assert.deepEqual(
    filterOpenApiSchemas(schemas, "account").map(({ name }) => name),
    ["Customer"],
  );
  assert.deepEqual(filterOpenApiSchemas(schemas, "missing"), []);
  assert.equal(filterOpenApiSchemas(schemas, "").length, 2);
});

test("endpoint search matches path, summary, operation id, and tags", () => {
  const endpoints = [
    {
      method: "GET",
      path: "/customers/{id}",
      summary: "Get account owner",
      operationId: "getCustomer",
      tags: ["Customers"],
    },
    {
      method: "POST",
      path: "/invoices",
      summary: "Create invoice",
      operationId: "createInvoice",
      tags: ["Billing"],
    },
  ];

  for (const query of ["customers", "ACCOUNT", "getCustomer", "billing"]) {
    assert.deepEqual(
      filterOpenApiEndpoints(endpoints, query).map(
        ({ operationId }) => operationId,
      ),
      [query.toLowerCase() === "billing" ? "createInvoice" : "getCustomer"],
    );
  }
  assert.deepEqual(filterOpenApiEndpoints(endpoints, "missing"), []);
});

test("endpoint method filtering combines with search and lists available methods", () => {
  const endpoints = [
    { method: "POST", path: "/customers", summary: "Create customer" },
    { method: "GET", path: "/customers", summary: "List customers" },
    { method: "DELETE", path: "/customers/{id}", summary: "Delete customer" },
  ];

  assert.deepEqual(getAvailableOpenApiMethods(endpoints), [
    "GET",
    "POST",
    "DELETE",
  ]);
  assert.deepEqual(
    filterOpenApiEndpoints(endpoints, "customer", "GET").map(
      ({ method }) => method,
    ),
    ["GET"],
  );
  assert.deepEqual(filterOpenApiEndpoints(endpoints, "invoice", "GET"), []);
  assert.equal(filterOpenApiEndpoints(endpoints, "", "ALL").length, 3);
});

test("unresolved schema references and oversized examples remain safe", () => {
  const result = analyzeOpenApi(
    JSON.stringify({
      openapi: "3.1.0",
      info: {},
      paths: {},
      components: {
        schemas: {
          MissingAlias: { $ref: "#/components/schemas/DoesNotExist" },
          LargeExample: {
            type: "object",
            example: { payload: "x".repeat(300) },
          },
        },
      },
    }),
    "json",
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;
  const missing = result.analysis.schemas.find(
    ({ name }) => name === "MissingAlias",
  );
  const large = result.analysis.schemas.find(
    ({ name }) => name === "LargeExample",
  );
  assert.equal(
    missing?.unresolvedReference,
    "#/components/schemas/DoesNotExist",
  );
  assert.equal(large?.examples, undefined);
});

function analyzeFailure(source: string): string {
  const result = analyzeOpenApi(source, "json");
  assert.equal(result.ok, false);
  return result.ok ? "" : result.error;
}
