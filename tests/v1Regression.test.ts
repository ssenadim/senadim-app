import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import {
  decodeBase64,
  encodeBase64,
  isBase64Error,
} from "../src/utils/base64.ts";
import { convertConfiguration } from "../src/utils/configurationConverter.ts";
import { compareContent } from "../src/utils/dataCompare.ts";
import { decodeJwt, isJwtFailure } from "../src/utils/jwt.ts";
import { validatePlantUmlSource } from "../src/utils/plantuml.ts";
import { isRegexFailure, testRegex } from "../src/utils/regex.ts";
import { getAdjacentResultIndex } from "../src/utils/searchNavigation.ts";
import {
  convertTimestampToDate,
  isTimestampFailure,
} from "../src/utils/timestamp.ts";
import {
  decodeUrlValue,
  encodeUrlValue,
  isUrlEncodingFailure,
} from "../src/utils/urlEncoding.ts";

const readProjectFile = (relativePath: string) =>
  readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");

test("Base64 preserves UTF-8 text and rejects invalid input", () => {
  const encoded = encodeBase64("Freeshot ✓");
  assert.equal(isBase64Error(encoded), false);
  if (isBase64Error(encoded)) return;

  const decoded = decodeBase64(encoded.value);
  assert.equal(isBase64Error(decoded), false);
  if (!isBase64Error(decoded)) assert.equal(decoded.value, "Freeshot ✓");

  assert.equal(isBase64Error(decodeBase64("not@base64")), true);
});

test("URL encoding round-trips reserved characters and handles malformed input", () => {
  const encoded = encodeUrlValue("a b&c");
  assert.deepEqual(encoded, { value: "a%20b%26c" });

  const decoded = decodeUrlValue("a%20b%26c");
  assert.deepEqual(decoded, { value: "a b&c" });
  assert.equal(isUrlEncodingFailure(decodeUrlValue("%E0%A4%A")), true);
});

test("JWT inspection handles valid and malformed token structures", () => {
  const decoded = decodeJwt(
    "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjMifQ.",
  );
  assert.equal(isJwtFailure(decoded), false);
  if (!isJwtFailure(decoded)) {
    assert.equal(decoded.header.alg, "none");
    assert.equal(decoded.payload.sub, "123");
  }

  assert.equal(isJwtFailure(decodeJwt("invalid-token")), true);
});

test("timestamp conversion detects seconds and reports a stable UTC value", () => {
  const result = convertTimestampToDate("0");
  assert.equal(isTimestampFailure(result), false);
  if (!isTimestampFailure(result)) {
    assert.equal(result.unit, "seconds");
    assert.equal(result.utc, "1970-01-01 00:00:00");
  }
});

test("regex testing supports case-insensitive global matches and safe failures", () => {
  const result = testRegex("free\\w+", "Freeshot freeshot", ["i"]);
  assert.equal(isRegexFailure(result), false);
  if (!isRegexFailure(result)) {
    assert.deepEqual(
      result.matches.map((match) => match.value),
      ["Freeshot", "freeshot"],
    );
  }

  assert.equal(isRegexFailure(testRegex("[", "value", [])), true);
});

test("data comparison can ignore JSON formatting without hiding value changes", () => {
  const options = {
    ignoreWhitespace: false,
    ignoreCase: false,
    ignoreFormatting: true,
  };

  assert.equal(
    compareContent('{"value":1}', '{ "value": 1 }', "json", options)
      .isIdentical,
    true,
  );
  assert.equal(
    compareContent('{"value":1}', '{"value":2}', "json", options).isIdentical,
    false,
  );
});

test("configuration conversion preserves nested Properties values", () => {
  const result = convertConfiguration(
    "server.port=8080\nserver.enabled=true",
    "properties",
    "json",
  );

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(JSON.parse(result.value), {
      server: { port: 8080, enabled: true },
    });
  }

  assert.equal(convertConfiguration("{", "json", "yaml").ok, false);
});

test("configuration conversion keeps the supported v1.2 matrix", () => {
  const jsonToYaml = convertConfiguration(
    '{"server":{"port":8080}}',
    "json",
    "yaml",
  );
  const yamlToJson = convertConfiguration(
    "server:\n  port: 8080",
    "yaml",
    "json",
  );
  const propertiesToYaml = convertConfiguration(
    "server.port=8080",
    "properties",
    "yaml",
  );
  const propertiesToJson = convertConfiguration(
    "server.port=8080",
    "properties",
    "json",
  );

  assert.equal(jsonToYaml.ok, true);
  assert.equal(yamlToJson.ok, true);
  assert.equal(propertiesToYaml.ok, true);
  assert.equal(propertiesToJson.ok, true);
  if (jsonToYaml.ok) assert.match(jsonToYaml.value, /server:[\s\S]*port: 8080/);
  if (yamlToJson.ok) {
    assert.deepEqual(JSON.parse(yamlToJson.value), { server: { port: 8080 } });
  }
  if (propertiesToYaml.ok) {
    assert.match(propertiesToYaml.value, /server:[\s\S]*port: 8080/);
  }
  if (propertiesToJson.ok) {
    assert.deepEqual(JSON.parse(propertiesToJson.value), {
      server: { port: 8080 },
    });
  }
});

test("PlantUML validation requires a complete diagram envelope", () => {
  assert.equal(
    validatePlantUmlSource("@startuml\nAlice -> Bob : Hello\n@enduml"),
    "",
  );
  assert.match(validatePlantUmlSource("Alice -> Bob"), /@startuml/i);
});

test("search keyboard navigation wraps deterministically", () => {
  assert.equal(getAdjacentResultIndex(-1, 3, 1), 0);
  assert.equal(getAdjacentResultIndex(2, 3, 1), 0);
  assert.equal(getAdjacentResultIndex(0, 3, -1), 2);
  assert.equal(getAdjacentResultIndex(0, 0, 1), -1);
});

test("public routes, catalog registrations, and sitemap remain aligned", () => {
  const routeSource = readProjectFile("src/utils/routes.ts");
  const routerSource = readProjectFile("src/routes/appRouter.tsx");
  const sitemapSource = readProjectFile("public/sitemap.xml");
  const routeEntries = [
    ...routeSource.matchAll(/^\s{2}(\w+):\s*(?:\r?\n\s*)?"([^"]+)"/gm),
  ].map((match) => ({ key: match[1], path: match[2] }));
  const registeredRouteKeys = new Set(
    [...routerSource.matchAll(/path:\s*routePaths\.(\w+)/g)].map(
      (match) => match[1],
    ),
  );
  const sitemapPaths = new Set(
    [...sitemapSource.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => new URL(match[1]).pathname,
    ),
  );

  assert.ok(routeEntries.length > 0);
  routeEntries.forEach(({ key, path }) => {
    assert.equal(
      registeredRouteKeys.has(key),
      true,
      `Missing router entry: ${key}`,
    );
    assert.equal(sitemapPaths.has(path), true, `Missing sitemap path: ${path}`);
  });

  const catalogSources = [
    "src/data/developerTools.ts",
    "src/data/platformTools.ts",
    "src/data/architectureDesignTools.ts",
  ].map(readProjectFile);
  const catalogText = catalogSources.join("\n");
  const catalogIds = [...catalogText.matchAll(/\bid:\s*"([^"]+)"/g)].map(
    (match) => match[1],
  );
  const catalogRouteKeys = [
    ...catalogText.matchAll(/path:\s*routePaths\.(\w+)/g),
  ].map((match) => match[1]);
  const metadataCounts = {
    titles: [...catalogText.matchAll(/\btitle:\s*"/g)].length,
    descriptions: [...catalogText.matchAll(/\bdescription:\s*/g)].length,
    categories: [...catalogText.matchAll(/\bcategory:\s*"/g)].length,
    keywords: [...catalogText.matchAll(/\bkeywords:\s*\[/g)].length,
    statuses: [...catalogText.matchAll(/\bstatus:\s*"/g)].length,
    available: [...catalogText.matchAll(/\bstatus:\s*"available"/g)].length,
  };

  assert.equal(new Set(catalogIds).size, catalogIds.length);
  Object.entries(metadataCounts)
    .filter(([name]) => name !== "available")
    .forEach(([name, count]) =>
      assert.equal(count, catalogIds.length, `Incomplete catalog ${name}`),
    );
  assert.equal(catalogRouteKeys.length, metadataCounts.available);
  catalogRouteKeys.forEach((key) =>
    assert.equal(
      registeredRouteKeys.has(key),
      true,
      `Unregistered catalog route: ${key}`,
    ),
  );
  [
    "openapi-viewer",
    "configuration-converter",
    "data-model-generator",
    "mermaid-viewer",
  ].forEach((toolId) => assert.equal(catalogIds.includes(toolId), true));
});

test("diagramming release controls preserve current-source export safety", () => {
  const plantUmlSource = readProjectFile(
    "src/pages/ArchitectureDesign/PlantUmlViewer/PlantUmlViewerPage.tsx",
  );
  const mermaidSource = readProjectFile(
    "src/pages/ArchitectureDesign/MermaidViewer/MermaidViewerPage.tsx",
  );

  [
    [plantUmlSource, "Copy PlantUML Source"],
    [mermaidSource, "Copy Mermaid Source"],
  ].forEach(([source, label]) => assert.match(source, new RegExp(label)));
  [plantUmlSource, mermaidSource].forEach((source) => {
    assert.match(source, /Download SVG/);
    assert.match(source, /Download PNG/);
    assert.match(source, /disabled=\{!canExportDiagram/);
  });
  assert.match(plantUmlSource, /setRenderedDiagram\(null\)/);
  assert.match(mermaidSource, /setRenderedSvg\(""\)/);
});

test("release metadata, public assets, and OpenShift tab contract are present", () => {
  const indexSource = readProjectFile("index.html");
  const calculatorSource = readProjectFile(
    "src/pages/PlatformEngineering/ContainerPlatformCalculator/ContainerPlatformCalculatorPage.tsx",
  );
  const formatterSource = readProjectFile(
    "src/pages/DeveloperTools/Formatter/FormatterToolPage.tsx",
  );

  assert.match(indexSource, /<title>Freeshot \| Engineering Toolkit<\/title>/);
  assert.match(
    indexSource,
    /rel="canonical" href="https:\/\/freeshot\.online\/"/,
  );
  assert.match(indexSource, /property="og:title" content="Freeshot/);
  [
    "public/freeshot.svg",
    "public/freeshot-icon-192.png",
    "public/freeshot-icon-512.png",
    "public/freeshot-social-preview.png",
    "public/robots.txt",
    "public/sitemap.xml",
  ].forEach((path) =>
    assert.equal(
      existsSync(new URL(`../${path}`, import.meta.url)),
      true,
      path,
    ),
  );

  [
    "Capacity Planning",
    "Pod Resources",
    "HPA",
    "Container Memory",
    "PVC Size",
  ].forEach((tab) => assert.match(calculatorSource, new RegExp(`"${tab}"`)));
  assert.match(
    calculatorSource,
    /useState<CalculatorTab>\("Capacity Planning"\)/,
  );
  assert.match(
    formatterSource,
    /function handleInputChange[\s\S]*?setOutputText\(""\)[\s\S]*?setDiagnostic\(null\)/,
  );
  assert.match(
    formatterSource,
    /function handleFormatTypeChange[\s\S]*?setOutputText\(""\)[\s\S]*?setDiagnostic\(null\)/,
  );
});
