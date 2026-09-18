import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  generateDataModel,
  getRootClassNameError,
  getXmlRootClassName,
} from "../src/utils/dataModelGenerator.ts";

function expectCode(
  source: string,
  language: "csharp" | "java" = "csharp",
  rootClassName = "Root",
  inputFormat: "json" | "xml" = "json",
) {
  const result = generateDataModel(
    source,
    language,
    rootClassName,
    inputFormat,
  );
  assert.equal(result.ok, true);

  if (!result.ok) {
    throw new Error(result.error);
  }

  return result.code;
}

function expectXmlCode(
  source: string,
  language: "csharp" | "java" = "csharp",
  rootClassName = "Customer",
) {
  return expectCode(source, language, rootClassName, "xml");
}

test("C# generation maps flat JSON values and property names", () => {
  const code = expectCode(
    '{"id":1,"name":"Customer","active":true,"account_balance":12.5}',
    "csharp",
    "Customer",
  );

  assert.match(code, /public class Customer/);
  assert.match(code, /public int Id \{ get; set; \}/);
  assert.match(code, /public string Name \{ get; set; \}/);
  assert.match(code, /public bool Active \{ get; set; \}/);
  assert.match(code, /public double AccountBalance \{ get; set; \}/);
});

test("nested objects generate deterministic classes across multiple levels", () => {
  const code = expectCode(
    '{"customer":{"id":1,"address":{"location":{"city":"Istanbul"}}}}',
  );

  assert.match(code, /public Customer Customer \{ get; set; \}/);
  assert.match(code, /public Address Address \{ get; set; \}/);
  assert.match(code, /public Location Location \{ get; set; \}/);
  assert.equal((code.match(/public class Customer/g) ?? []).length, 1);
});

test("primitive arrays use collection types", () => {
  const csharp = expectCode('{"roles":["user","admin"]}');
  const java = expectCode('{"roles":["user","admin"]}', "java");

  assert.match(csharp, /using System\.Collections\.Generic;/);
  assert.match(csharp, /public List<string> Roles/);
  assert.match(java, /import java\.util\.List;/);
  assert.match(java, /private List<String> roles;/);
});

test("object arrays use a predictable singular model name", () => {
  const code = expectCode(
    '{"customers":[{"id":1,"name":"John"}]}',
    "csharp",
    "ApiResponse",
  );

  assert.match(code, /public List<Customer> Customers/);
  assert.match(code, /public class Customer/);
});

test("empty and incompatible arrays use conservative fallbacks", () => {
  const csharp = expectCode('{"items":[],"mixed":[1,"two"]}');
  const java = expectCode('{"items":[],"mixed":[1,"two"]}', "java");

  assert.match(csharp, /public List<object> Items/);
  assert.match(csharp, /public List<object> Mixed/);
  assert.match(java, /private List<Object> items;/);
  assert.match(java, /private List<Object> mixed;/);
});

test("null values use Object-style conservative fallbacks", () => {
  const csharp = expectCode('{"description":null}');
  const java = expectCode('{"description":null}', "java");

  assert.match(csharp, /public object Description/);
  assert.match(java, /private Object description;/);
});

test("Java generation creates private fields with public getters and setters", () => {
  const code = expectCode(
    '{"id":1,"name":"Customer","active":true}',
    "java",
    "Customer",
  );

  assert.match(code, /^public class Customer/);
  assert.match(code, /private int id;/);
  assert.match(code, /public int getId\(\)/);
  assert.match(code, /public void setId\(int id\)/);
  assert.match(code, /private boolean active;/);
  assert.doesNotMatch(code, /Lombok|Builder|constructor/i);
});

test("matching nested shapes reuse one generated class", () => {
  const code = expectCode(
    '{"shipping":{"city":"Istanbul"},"billing":{"city":"Ankara"}}',
  );

  assert.equal((code.match(/public class Shipping/g) ?? []).length, 1);
  assert.match(code, /public Shipping Billing/);
});

test("invalid, empty, and non-object JSON do not generate output", () => {
  const empty = generateDataModel("", "csharp", "Root");
  const invalid = generateDataModel('{"id":}', "csharp", "Root");
  const array = generateDataModel("[]", "csharp", "Root");

  assert.deepEqual(empty, {
    ok: false,
    error: "Enter JSON to generate a model.",
  });
  assert.equal(invalid.ok, false);
  assert.equal(array.ok, false);
});

test("invalid and reserved root class names are rejected", () => {
  assert.match(getRootClassNameError("123Customer") ?? "", /starts with/);
  assert.match(getRootClassNameError("Customer-Model") ?? "", /contains only/);
  assert.match(getRootClassNameError("") ?? "", /Enter/);
  assert.match(getRootClassNameError("class") ?? "", /reserved/);
  assert.equal(getRootClassNameError("ApiResponse"), null);
});

test("simple XML generates C# and Java properties", () => {
  const source = `<customer>
  <id>1</id>
  <name>John</name>
  <active>true</active>
</customer>`;
  const csharp = expectXmlCode(source);
  const java = expectXmlCode(source, "java");

  assert.match(csharp, /public class Customer/);
  assert.match(csharp, /public int Id \{ get; set; \}/);
  assert.match(csharp, /public string Name \{ get; set; \}/);
  assert.match(csharp, /public bool Active \{ get; set; \}/);
  assert.match(java, /private int id;/);
  assert.match(java, /private String name;/);
  assert.match(java, /private boolean active;/);
});

test("XML attributes become properties and element conflicts use an Element suffix", () => {
  const code = expectXmlCode(
    `<customer id="15" active="true">
  <id>20</id>
  <name>John</name>
</customer>`,
  );

  assert.match(code, /public int Id \{ get; set; \}/);
  assert.match(code, /public bool Active \{ get; set; \}/);
  assert.match(code, /public int IdElement \{ get; set; \}/);
});

test("nested XML elements generate nested model classes", () => {
  const code = expectXmlCode(`<customer>
  <address>
    <location>
      <city>Istanbul</city>
    </location>
  </address>
</customer>`);

  assert.match(code, /public Address Address \{ get; set; \}/);
  assert.match(code, /public Location Location \{ get; set; \}/);
  assert.match(code, /public string City \{ get; set; \}/);
});

test("repeated primitive XML elements generate collection types", () => {
  const csharp = expectXmlCode(
    "<roles><role>user</role><role>admin</role></roles>",
    "csharp",
    "Roles",
  );
  const java = expectXmlCode(
    "<roles><role>user</role><role>admin</role></roles>",
    "java",
    "Roles",
  );

  assert.match(csharp, /public List<string> Role/);
  assert.match(java, /private List<String> role;/);
});

test("repeated complex XML elements generate a model collection", () => {
  const code = expectXmlCode(
    `<customers>
  <customer><id>1</id><name>John</name></customer>
  <customer><id>2</id><name>Jane</name></customer>
</customers>`,
    "csharp",
    "Customers",
  );

  assert.match(code, /public List<Customer> Customer/);
  assert.match(code, /public class Customer/);
  assert.equal((code.match(/public class Customer\n/g) ?? []).length, 1);
});

test("a single plural-named XML element is not inferred as a collection", () => {
  const code = expectXmlCode(
    "<customer><roles><role>user</role></roles></customer>",
  );

  assert.match(code, /public Roles Roles/);
  assert.match(code, /public string Role/);
  assert.doesNotMatch(code, /List</);
});

test("leading-zero and empty XML values remain strings", () => {
  const code = expectXmlCode(`<customer>
  <postalCode>00123</postalCode>
  <description />
  <balance>30.5</balance>
</customer>`);

  assert.match(code, /public string PostalCode/);
  assert.match(code, /public string Description/);
  assert.match(code, /public double Balance/);
});

test("namespace prefixes, comments, and CDATA stay model-safe", () => {
  const code = expectXmlCode(`<ns:customer xmlns:ns="urn:example">
  <!-- customer name -->
  <ns:name>John</ns:name>
  <ns:description><![CDATA[Some text]]></ns:description>
</ns:customer>`);

  assert.match(code, /public string Name/);
  assert.match(code, /public string Description/);
  assert.doesNotMatch(code, /Namespace|Comment|Cdata|Xmlns/i);
  assert.equal(
    getXmlRootClassName('<ns:customer xmlns:ns="urn:example" />'),
    "Customer",
  );
});

test("a custom root class name takes precedence over the XML root", () => {
  const code = expectXmlCode(
    "<customer><id>1</id></customer>",
    "csharp",
    "ApiResponse",
  );

  assert.match(code, /^public class ApiResponse/);
  assert.doesNotMatch(code, /public class Customer/);
});

test("mixed XML content uses a conservative string fallback", () => {
  const code = expectXmlCode(
    "<customer><description>Text <strong>important</strong> text</description></customer>",
  );

  assert.match(code, /public string Description/);
  assert.doesNotMatch(code, /class Strong/);
});

test("malformed XML returns a controlled location-aware error", () => {
  const result = generateDataModel(
    "<customer><name>John</customer>",
    "csharp",
    "Customer",
    "xml",
  );

  assert.equal(result.ok, false);

  if (result.ok) {
    throw new Error("Malformed XML unexpectedly generated code.");
  }

  assert.match(result.error, /^Invalid XML/);
  assert.match(result.error, /line \d+, column \d+/);
  assert.doesNotMatch(result.error, /stack|xmldom/i);
});

test("tool page switches formats, clears changed output, and disables stale copying", () => {
  const pageSource = readFileSync(
    new URL(
      "../src/pages/DeveloperTools/DataModelGenerator/DataModelGeneratorPage.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(pageSource, /function invalidateGeneratedCode\(\)/);
  assert.match(pageSource, /setGeneratedCode\(""\)/);
  assert.match(pageSource, /disabled=\{!hasCurrentOutput\}/);
  assert.match(pageSource, /if \(!hasCurrentOutput\)/);
  assert.match(pageSource, /<option value="xml">XML<\/option>/i);
  assert.match(pageSource, /function handleInputFormatChange/);
  assert.match(pageSource, /setErrorMessage\(""\)/);
  assert.match(pageSource, /getXmlRootClassName/);

  const ids = [...pageSource.matchAll(/\bid="([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.equal(new Set(ids).size, ids.length, "Static ids should be unique.");
});

test("tool metadata registers the shared discovery route and keywords", () => {
  const routesSource = readFileSync(
    new URL("../src/utils/routes.ts", import.meta.url),
    "utf8",
  );
  const catalogSource = readFileSync(
    new URL("../src/data/developerTools.ts", import.meta.url),
    "utf8",
  );

  assert.match(
    routesSource,
    /dataModelGenerator:\s*"\/developer-tools\/data-model-generator"/,
  );
  assert.match(catalogSource, /id:\s*"data-model-generator"/);
  [
    "json",
    "xml",
    "class",
    "model",
    "pojo",
    "csharp",
    "c#",
    "java",
    "dto",
  ].forEach((keyword) =>
    assert.match(catalogSource, new RegExp(`"${keyword}"`)),
  );
});
