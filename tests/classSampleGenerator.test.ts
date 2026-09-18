import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  createDefaultClassSampleGenerationOptions,
  generateJsonSampleFromClass,
  getFirstParsedClassName,
  type ClassSampleGenerationOptions,
} from "../src/utils/classSampleGenerator.ts";

function expectSample(
  source: string,
  language: "csharp" | "java",
  rootClassName?: string,
  requireRootClass = false,
  generationOptions: ClassSampleGenerationOptions = {},
) {
  const result = generateJsonSampleFromClass(source, language, {
    rootClassName,
    requireRootClass,
    ...generationOptions,
  });
  assert.equal(result.ok, true);

  if (!result.ok) {
    throw new Error(result.error);
  }

  return { ...result, value: JSON.parse(result.json) as unknown };
}

test("C# flat properties produce camelCase JSON sample values", () => {
  const result = expectSample(
    `public class Customer {
      public int Id { get; set; }
      public string Name { get; set; }
      public bool Active { get; set; }
    }`,
    "csharp",
  );

  assert.deepEqual(result.value, { id: 0, name: "", active: false });
  assert.equal(
    result.json,
    '{\n  "id": 0,\n  "name": "",\n  "active": false\n}',
  );
});

test("C# resolves nested classes from the same source", () => {
  const result = expectSample(
    `public class Customer {
      public Address Address { get; set; }
    }
    public class Address {
      public string City { get; set; }
    }`,
    "csharp",
  );

  assert.deepEqual(result.value, { address: { city: "" } });
});

test("C# lists and arrays contain one representative item", () => {
  const result = expectSample(
    `public class Customer {
      public List<string> Roles { get; set; }
      public List<Address> Addresses { get; set; }
      public int[] Scores { get; set; }
    }
    public class Address {
      public string City { get; set; }
    }`,
    "csharp",
  );

  assert.deepEqual(result.value, {
    roles: [""],
    addresses: [{ city: "" }],
    scores: [0],
  });
});

test("C# nullable and common structural types keep useful samples", () => {
  const result = expectSample(
    `public class Record {
      public int? Count { get; set; }
      public string? Description { get; set; }
      public DateTime CreatedAt { get; set; }
      public Guid Id { get; set; }
      public object Metadata { get; set; }
    }`,
    "csharp",
  );

  assert.deepEqual(result.value, {
    count: 0,
    description: "",
    createdAt: "1970-01-01T00:00:00Z",
    id: "00000000-0000-0000-0000-000000000000",
    metadata: {},
  });
});

test("class sample option defaults preserve the existing output", () => {
  const source =
    "public class Customer { public int Id { get; set; } public List<string> Roles { get; set; } }";
  const implicit = generateJsonSampleFromClass(source, "csharp");
  const explicit = generateJsonSampleFromClass(source, "csharp", {
    ...createDefaultClassSampleGenerationOptions(),
  });

  assert.deepEqual(explicit, implicit);
});

test("JSON property naming can preserve class member names", () => {
  const csharp = expectSample(
    "public class Customer { public int CustomerId { get; set; } }",
    "csharp",
    undefined,
    false,
    { jsonPropertyNaming: "preserve" },
  );
  const java = expectSample(
    "public class Customer { private String DisplayName; }",
    "java",
    undefined,
    false,
    { jsonPropertyNaming: "preserve" },
  );

  assert.deepEqual(csharp.value, { CustomerId: 0 });
  assert.deepEqual(java.value, { DisplayName: "" });
});

test("nullable sample option uses null only for reliably nullable C# members", () => {
  const result = expectSample(
    `public class Record {
      public int? Count { get; set; }
      public Nullable<bool> Active { get; set; }
      public string Name { get; set; }
    }`,
    "csharp",
    undefined,
    false,
    { nullableSampleValue: "null" },
  );

  assert.deepEqual(result.value, { count: null, active: null, name: "" });
});

test("collection sample option emits empty arrays for lists and arrays", () => {
  const result = expectSample(
    `public class Customer {
      public List<string> Roles { get; set; }
      public int[] Scores { get; set; }
    }`,
    "csharp",
    undefined,
    false,
    { collectionSampleValue: "empty" },
  );

  assert.deepEqual(result.value, { roles: [], scores: [] });
});

test("C# unknown custom types warn without blocking output", () => {
  const result = expectSample(
    "public class Customer { public AddressDetails Address { get; set; } }",
    "csharp",
  );

  assert.deepEqual(result.value, { address: {} });
  assert.deepEqual(result.warnings, [
    "Unknown referenced model: AddressDetails. Used an empty object.",
  ]);
});

test("C# recursive references use null and cannot recurse forever", () => {
  const result = expectSample(
    "public class Node { public Node Parent { get; set; } }",
    "csharp",
  );

  assert.deepEqual(result.value, { parent: null });
  assert.match(result.warnings[0], /Recursive reference to Node/);
});

test("C# explicit root selects among multiple classes", () => {
  const result = expectSample(
    `public class Customer { public int Id { get; set; } }
     public class Order { public string Number { get; set; } }`,
    "csharp",
    "Order",
    true,
  );

  assert.equal(result.rootClassName, "Order");
  assert.deepEqual(result.value, { number: "" });
});

test("C# inheritance uses declared members and reports its limitation", () => {
  const result = expectSample(
    `public class Customer : Party { public int Id { get; set; } }
     public class Party { public string Name { get; set; } }`,
    "csharp",
  );

  assert.deepEqual(result.value, { id: 0 });
  assert.match(result.warnings[0], /Inheritance for Customer was not expanded/);
});

test("Java flat POJO fields map primitives and wrappers", () => {
  const result = expectSample(
    `public class Customer {
      private int id;
      private String name;
      private Boolean active;
      private Double balance;
    }`,
    "java",
  );

  assert.deepEqual(result.value, {
    id: 0,
    name: "",
    active: false,
    balance: 0,
  });
});

test("Java resolves nested models and ignores getter bodies", () => {
  const result = expectSample(
    `public class Customer {
      private Address address;
      public Address getAddress() { return address; }
    }
    public class Address { private String postalCode; }`,
    "java",
  );

  assert.deepEqual(result.value, { address: { postalCode: "" } });
});

test("Java lists and arrays contain one representative item", () => {
  const result = expectSample(
    `public class Customer {
      private List<String> roles;
      private List<Address> addresses;
      private long[] identifiers;
    }
    public class Address { private String city; }`,
    "java",
  );

  assert.deepEqual(result.value, {
    roles: [""],
    addresses: [{ city: "" }],
    identifiers: [0],
  });
});

test("Java unknown types and unsupported generics use safe warnings", () => {
  const result = expectSample(
    `public class Response {
      private AddressDetails address;
      private PagedResponse<Customer> customers;
    }`,
    "java",
  );

  assert.deepEqual(result.value, { address: {}, customers: {} });
  assert.equal(result.warnings.length, 2);
  assert.match(result.warnings[0], /Unknown referenced model/);
  assert.match(result.warnings[1], /Unsupported generic type/);
});

test("Java circular models use null at the repeated path", () => {
  const result = expectSample(
    `public class Customer { private Account account; }
     public class Account { private Customer customer; }`,
    "java",
  );

  assert.deepEqual(result.value, { account: { customer: null } });
  assert.match(result.warnings[0], /Recursive reference to Customer/);
});

test("Java explicit root selection is deterministic", () => {
  const source = `public class Customer { private int id; }
    public class Order { private String number; }`;
  const result = expectSample(source, "java", "Order", true);

  assert.equal(getFirstParsedClassName(source, "java"), "Customer");
  assert.equal(result.rootClassName, "Order");
  assert.deepEqual(result.value, { number: "" });
});

test("missing explicit roots and invalid class structures fail concisely", () => {
  const missingRoot = generateJsonSampleFromClass(
    "public class Customer { private int id; }",
    "java",
    { rootClassName: "Order", requireRootClass: true },
  );
  const noClass = generateJsonSampleFromClass("private int id;", "java");
  const unmatched = generateJsonSampleFromClass(
    "public class Customer { public int Id { get; set; }",
    "csharp",
  );

  assert.equal(missingRoot.ok, false);
  assert.equal(noClass.ok, false);
  assert.equal(unmatched.ok, false);
  assert.doesNotMatch(
    JSON.stringify([missingRoot, noClass, unmatched]),
    /stack/i,
  );
});

test("tool page exposes class mode and clears mode-specific state", () => {
  const pageSource = readFileSync(
    new URL(
      "../src/pages/DeveloperTools/DataModelGenerator/DataModelGeneratorPage.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(pageSource, /Generate From/);
  assert.match(
    pageSource,
    /<option value="class">Class → Sample Data<\/option>/,
  );
  assert.match(pageSource, /Class → Sample Data/);
  assert.match(pageSource, /Sample Root Class/);
  assert.match(pageSource, /Generated JSON Sample/);
  assert.match(pageSource, /Copy JSON/);
  assert.doesNotMatch(pageSource, /data-model-generator-output-format/);
  assert.match(pageSource, /function handleModeChange/);
  assert.match(pageSource, /resetGenerationState\(\)/);
  assert.match(pageSource, /setWarnings\(\[\]\)/);
  assert.match(pageSource, /disabled=\{!hasCurrentOutput\}/);
});

test("shared metadata includes class-to-sample search terms", () => {
  const catalogSource = readFileSync(
    new URL("../src/data/developerTools.ts", import.meta.url),
    "utf8",
  );

  ["sample json", "class to json", "csharp to json", "java to json"].forEach(
    (keyword) => assert.match(catalogSource, new RegExp(`"${keyword}"`)),
  );
});
