import assert from "node:assert/strict";
import test from "node:test";
import { favoritesStorageKey } from "../src/utils/favorites.ts";
import { recentToolsStorageKey } from "../src/utils/recentTools.ts";
import { selectToolsByIds } from "../src/utils/toolSelection.ts";

const sharedTools = [
  { id: "plantuml-viewer", name: "PlantUML Viewer" },
  { id: "mermaid-viewer", name: "Mermaid Viewer" },
  { id: "openapi-viewer", name: "OpenAPI Viewer" },
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

test("Home v1.1 selections resolve through shared metadata", () => {
  const selectedTools = selectToolsByIds(sharedTools, [
    "plantuml-viewer",
    "mermaid-viewer",
    "openapi-viewer",
    "configuration-converter",
  ]);

  assert.equal(selectedTools.length, 4);
  assert.deepEqual(
    selectedTools.map((tool) => tool.name),
    [
      "PlantUML Viewer",
      "Mermaid Viewer",
      "OpenAPI Viewer",
      "Configuration Converter",
    ],
  );
});

test("Favorites and Recently Used storage remain namespaced and independent", () => {
  assert.match(favoritesStorageKey, /^freeshot:/);
  assert.match(recentToolsStorageKey, /^freeshot:/);
  assert.notEqual(favoritesStorageKey, recentToolsStorageKey);
});
