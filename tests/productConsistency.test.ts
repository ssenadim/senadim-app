import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { favoritesStorageKey } from "../src/utils/favorites.ts";
import { recentToolsStorageKey } from "../src/utils/recentTools.ts";
import { selectToolsByIds } from "../src/utils/toolSelection.ts";

const sharedTools = [
  { id: "plantuml-viewer", name: "PlantUML Viewer" },
  { id: "mermaid-viewer", name: "Mermaid Viewer" },
  { id: "openapi-viewer", name: "OpenAPI Viewer" },
  { id: "data-model-generator", name: "Data Model Generator" },
  { id: "configuration-converter", name: "Configuration Converter" },
];

test("ordered metadata selection ignores unknown and duplicate ids", () => {
  const selectedTools = selectToolsByIds(sharedTools, [
    "mermaid-viewer",
    "unknown-tool",
    "openapi-viewer",
    "mermaid-viewer",
  ]);

  assert.deepEqual(
    selectedTools.map((tool) => tool.id),
    ["mermaid-viewer", "openapi-viewer"],
  );
});

test("Home balanced selections resolve through shared metadata", () => {
  const selectedTools = selectToolsByIds(sharedTools, [
    "plantuml-viewer",
    "mermaid-viewer",
    "openapi-viewer",
    "data-model-generator",
  ]);

  assert.equal(selectedTools.length, 4);
  assert.deepEqual(
    selectedTools.map((tool) => tool.name),
    [
      "PlantUML Viewer",
      "Mermaid Viewer",
      "OpenAPI Viewer",
      "Data Model Generator",
    ],
  );
});

test("Home highlights Data Model Generator through shared metadata", () => {
  const homeSource = readFileSync(
    new URL("../src/pages/Home/HomePage.tsx", import.meta.url),
    "utf8",
  );
  const recentlyAddedIds =
    homeSource.match(
      /const recentlyAddedTools = selectToolsByIds\(searchableTools, \[([\s\S]*?)\]\);/,
    )?.[1] ?? "";
  const defaultQuickAccessIds =
    homeSource.match(
      /const defaultQuickAccessToolIds = \[([\s\S]*?)\];/,
    )?.[1] ?? "";
  assert.match(recentlyAddedIds, /"data-model-generator"/);
  assert.match(recentlyAddedIds, /"openapi-viewer"/);
  assert.doesNotMatch(recentlyAddedIds, /"configuration-converter"/);
  assert.doesNotMatch(defaultQuickAccessIds, /"data-model-generator"/);
  assert.match(homeSource, /data model generation and API exploration/);
  assert.match(homeSource, /Platform Engineering/);
  assert.match(homeSource, /Architecture & Design/);
  assert.match(homeSource, /"plantuml-viewer",\s*"mermaid-viewer"/);
  assert.doesNotMatch(homeSource, /title="Data Model Generator"/);
});

test("Data Model Generator participates in shared discovery and personalization metadata", () => {
  const developerToolsSource = readFileSync(
    new URL("../src/data/developerTools.ts", import.meta.url),
    "utf8",
  );
  const catalogSource = readFileSync(
    new URL("../src/data/toolCatalog.ts", import.meta.url),
    "utf8",
  );
  const trackerSource = readFileSync(
    new URL(
      "../src/components/discovery/RecentToolTracker.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const cardSource = readFileSync(
    new URL("../src/components/cards/ToolCard.tsx", import.meta.url),
    "utf8",
  );
  const dataModelMetadata =
    developerToolsSource.match(
      /id: "data-model-generator",([\s\S]*?)status: "available",/,
    )?.[0] ?? "";

  assert.match(dataModelMetadata, /path: routePaths\.dataModelGenerator/);
  assert.match(dataModelMetadata, /Generate C# or Java models from JSON\/XML/);
  [
    "data model",
    "json class",
    "xml class",
    "c#",
    "java",
    "dto",
    "pojo",
  ].forEach((keyword) =>
    assert.match(
      dataModelMetadata,
      new RegExp(`"${keyword.replace("#", "\\#")}"`),
    ),
  );
  assert.match(catalogSource, /tools\.filter\(hasAvailableRoute\)/);
  assert.match(trackerSource, /searchableTools/);
  assert.match(cardSource, /FavoriteToggle/);
});

test("Favorites and Recently Used storage remain namespaced and independent", () => {
  assert.match(favoritesStorageKey, /^freeshot:/);
  assert.match(recentToolsStorageKey, /^freeshot:/);
  assert.notEqual(favoritesStorageKey, recentToolsStorageKey);
});
