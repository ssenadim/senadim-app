import assert from "node:assert/strict";
import test from "node:test";
import {
  getToolIdForPath,
  loadRecentTools,
  markRecentToolUsed,
  maximumRecentTools,
  normalizeRecentTools,
  recentToolsStorageKey,
  resolveRecentTools,
  storeRecentTools,
} from "../src/utils/recentTools.ts";

const toolIds = [
  "base64",
  "jwt-decoder",
  "mermaid-viewer",
  "uuid",
  "regex",
  "timestamp",
  "hash",
];
const availableToolIds = new Set(toolIds);

test("new users and malformed storage start with no recent tools", () => {
  assert.deepEqual(
    loadRecentTools(
      { getItem: () => null, setItem: () => undefined },
      availableToolIds,
    ),
    [],
  );
  assert.deepEqual(
    loadRecentTools(
      { getItem: () => "not-json", setItem: () => undefined },
      availableToolIds,
    ),
    [],
  );
  assert.deepEqual(
    loadRecentTools(
      {
        getItem: () => {
          throw new Error("Storage access denied");
        },
        setItem: () => undefined,
      },
      availableToolIds,
    ),
    [],
  );
});

test("normalization removes malformed, unknown and duplicate entries", () => {
  const normalized = normalizeRecentTools(
    [
      { toolId: "jwt-decoder", lastUsedAt: 100, title: "Do not persist" },
      { toolId: "jwt-decoder", lastUsedAt: 300 },
      { toolId: "removed-tool", lastUsedAt: 500 },
      { toolId: "mermaid-viewer", lastUsedAt: 200 },
      { toolId: "uuid", lastUsedAt: "invalid" },
      null,
    ],
    availableToolIds,
  );

  assert.deepEqual(normalized, [
    { toolId: "jwt-decoder", lastUsedAt: 300 },
    { toolId: "mermaid-viewer", lastUsedAt: 200 },
  ]);
});

test("equal timestamps use tool id as a stable ordering fallback", () => {
  assert.deepEqual(
    normalizeRecentTools(
      [
        { toolId: "uuid", lastUsedAt: 100 },
        { toolId: "base64", lastUsedAt: 100 },
      ],
      availableToolIds,
    ),
    [
      { toolId: "base64", lastUsedAt: 100 },
      { toolId: "uuid", lastUsedAt: 100 },
    ],
  );
});

test("opening and reopening a tool records one most-recent entry", () => {
  const firstOpen = markRecentToolUsed(
    [{ toolId: "mermaid-viewer", lastUsedAt: 200 }],
    "jwt-decoder",
    300,
    availableToolIds,
  );
  const reopened = markRecentToolUsed(
    firstOpen,
    "mermaid-viewer",
    300,
    availableToolIds,
  );

  assert.deepEqual(firstOpen, [
    { toolId: "jwt-decoder", lastUsedAt: 300 },
    { toolId: "mermaid-viewer", lastUsedAt: 200 },
  ]);
  assert.deepEqual(reopened, [
    { toolId: "mermaid-viewer", lastUsedAt: 301 },
    { toolId: "jwt-decoder", lastUsedAt: 300 },
  ]);
  assert.equal(
    reopened.filter((entry) => entry.toolId === "mermaid-viewer").length,
    1,
  );
});

test("history keeps six entries and removes the oldest distinct tool", () => {
  const sixEntries = toolIds
    .slice(0, maximumRecentTools)
    .map((toolId, index) => ({
      toolId,
      lastUsedAt: 600 - index * 100,
    }));
  const result = markRecentToolUsed(
    sixEntries,
    toolIds[6],
    700,
    availableToolIds,
  );

  assert.equal(result.length, maximumRecentTools);
  assert.equal(result[0]?.toolId, "hash");
  assert.equal(
    result.some((entry) => entry.toolId === "timestamp"),
    false,
  );
});

test("unknown tool ids are never recorded", () => {
  const entries = [{ toolId: "jwt-decoder", lastUsedAt: 100 }];

  assert.deepEqual(
    markRecentToolUsed(entries, "unknown-tool", 200, availableToolIds),
    entries,
  );
});

test("storage persists only tool id and timestamp and hides write errors", () => {
  let persistedKey = "";
  let persistedValue = "";
  const storage = {
    getItem: () => null,
    setItem: (key: string, value: string) => {
      persistedKey = key;
      persistedValue = value;
    },
  };
  const entryWithMetadata = {
    toolId: "jwt-decoder",
    lastUsedAt: 100,
    title: "Do not persist",
  };

  storeRecentTools(storage, [entryWithMetadata], availableToolIds);

  assert.equal(persistedKey, recentToolsStorageKey);
  assert.equal(
    persistedValue,
    JSON.stringify([{ toolId: "jwt-decoder", lastUsedAt: 100 }]),
  );
  assert.doesNotThrow(() =>
    storeRecentTools(
      {
        getItem: () => null,
        setItem: () => {
          throw new Error("Storage quota exceeded");
        },
      },
      [{ toolId: "jwt-decoder", lastUsedAt: 100 }],
      availableToolIds,
    ),
  );
});

test("clearing recent history removes its localStorage key", () => {
  let removedKey = "";
  let writeCount = 0;

  storeRecentTools(
    {
      getItem: () => null,
      setItem: () => {
        writeCount += 1;
      },
      removeItem: (key: string) => {
        removedKey = key;
      },
    },
    [],
    availableToolIds,
  );

  assert.equal(removedKey, recentToolsStorageKey);
  assert.equal(writeCount, 0);
});

test("recent entries resolve through shared-style registry data in order", () => {
  const registryTools = [
    { id: "jwt-decoder", route: "/developer-tools/jwt-decoder" },
    { id: "mermaid-viewer", route: "/architecture-design/mermaid-viewer" },
  ];

  assert.deepEqual(
    resolveRecentTools(
      [
        { toolId: "mermaid-viewer", lastUsedAt: 200 },
        { toolId: "removed-tool", lastUsedAt: 100 },
        { toolId: "jwt-decoder", lastUsedAt: 50 },
      ],
      registryTools,
    ),
    [registryTools[1], registryTools[0]],
  );
});

test("direct and basename-prefixed tool routes resolve while static pages do not", () => {
  const registryTools = [
    { id: "jwt-decoder", route: "/developer-tools/jwt-decoder" },
    { id: "mermaid-viewer", route: "/architecture-design/mermaid-viewer" },
  ];

  assert.equal(
    getToolIdForPath(registryTools, "/developer-tools/jwt-decoder"),
    "jwt-decoder",
  );
  assert.equal(
    getToolIdForPath(
      registryTools,
      "/freeshot/architecture-design/mermaid-viewer/",
      "/freeshot/",
    ),
    "mermaid-viewer",
  );
  assert.equal(getToolIdForPath(registryTools, "/about"), null);
  assert.equal(getToolIdForPath(registryTools, "/developer-tools"), null);
});
