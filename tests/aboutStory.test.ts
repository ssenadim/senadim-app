import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readProjectFile = (relativePath: string) =>
  readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");

const aboutSource = readProjectFile("src/pages/About/AboutPage.tsx");

test("About tells the current product story through four balanced areas", () => {
  const headings = [
    "Product Journey",
    "Current Capabilities",
    "Product Principles",
    "Product Information",
    "Product Direction",
  ];

  headings.forEach((heading) => assert.match(aboutSource, new RegExp(heading)));
  [
    "Developer Productivity",
    "Platform Engineering",
    "Architecture & Design",
    "Tool Discovery & Personalization",
  ].forEach((area) => assert.match(aboutSource, new RegExp(area)));
  assert.equal(
    (aboutSource.match(/points:\s*\[/g) ?? []).length,
    4,
    "Each capability area should use the same point structure.",
  );
});

test("About represents implemented v1.2 workflows without unsupported claims", () => {
  [
    "data-formatter",
    "configuration-converter",
    "openapi-viewer",
    "data-model-generator",
    "plantuml-viewer",
    "mermaid-viewer",
    "architecture-notes",
    "adr-generator",
    "threat-modeling-helper",
  ].forEach((toolId) => assert.match(aboutSource, new RegExp(toolId)));

  assert.match(aboutSource, /JSON to YAML, YAML to JSON/);
  assert.match(aboutSource, /without executing APIs/);
  assert.match(aboutSource, /creates C# or Java models from JSON\/XML/);
  assert.match(aboutSource, /const currentVersion = "v1\.2"/);
  assert.match(aboutSource, /do not replace formal design or security review/);
  assert.match(aboutSource, /Personalization is stored locally in the browser/);
  assert.doesNotMatch(aboutSource, /Event Bus Calculator/);
  assert.doesNotMatch(
    aboutSource,
    /Try It|code generation|remote reference loading/i,
  );
});

test("About keeps its route and current SEO description", () => {
  const routesSource = readProjectFile("src/utils/routes.ts");
  const routerSource = readProjectFile("src/routes/appRouter.tsx");
  const metadataSource = readProjectFile("src/hooks/usePageTitle.ts");

  assert.match(routesSource, /about:\s*"\/about"/);
  assert.match(routerSource, /path:\s*routePaths\.about/);
  assert.match(
    metadataSource,
    /Discover how Freeshot supports developer productivity, platform engineering, architecture workflows, and browser-local tool discovery\./,
  );
});

test("public milestone labels consistently identify v1.2", () => {
  const sidebarSource = readProjectFile("src/components/layout/Sidebar.tsx");

  assert.match(sidebarSource, /Freeshot v1\.2/);
  assert.doesNotMatch(
    `${aboutSource}\n${sidebarSource}`,
    /v1\.1|In Development/,
  );
});
