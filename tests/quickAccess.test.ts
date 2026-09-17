import assert from "node:assert/strict";
import test from "node:test";
import {
  buildQuickAccessItems,
  buildQuickAccessTools,
  maximumQuickAccessTools,
} from "../src/utils/quickAccess.ts";

const tools = [
  { id: "favorite-a", name: "Favorite A" },
  { id: "favorite-b", name: "Favorite B" },
  { id: "recent-a", name: "Recent A" },
  { id: "recent-b", name: "Recent B" },
  { id: "default-a", name: "Default A" },
  { id: "default-b", name: "Default B" },
  { id: "default-c", name: "Default C" },
];

const toolIds = (selectedTools: readonly { id: string }[]) =>
  selectedTools.map((tool) => tool.id);

test("new users receive the ordered default Quick Access tools", () => {
  const result = buildQuickAccessTools({
    tools,
    favoriteIds: [],
    recentToolIds: [],
    defaultToolIds: [
      "default-a",
      "default-b",
      "default-c",
      "recent-a",
      "recent-b",
      "favorite-a",
    ],
  });

  assert.deepEqual(toolIds(result), [
    "default-a",
    "default-b",
    "default-c",
    "recent-a",
    "recent-b",
    "favorite-a",
  ]);
});

test("favorites appear before recent and default tools", () => {
  const result = buildQuickAccessTools({
    tools,
    favoriteIds: ["favorite-b", "favorite-a"],
    recentToolIds: ["recent-a"],
    defaultToolIds: ["default-a", "default-b", "default-c"],
  });

  assert.deepEqual(toolIds(result), [
    "favorite-b",
    "favorite-a",
    "recent-a",
    "default-a",
    "default-b",
    "default-c",
  ]);
});

test("recent tools preserve their ordering and do not duplicate favorites", () => {
  const result = buildQuickAccessTools({
    tools,
    favoriteIds: ["recent-b"],
    recentToolIds: ["recent-a", "recent-b", "favorite-a"],
    defaultToolIds: ["default-a", "recent-a", "default-b"],
  });

  assert.deepEqual(toolIds(result), [
    "recent-b",
    "recent-a",
    "favorite-a",
    "default-a",
    "default-b",
  ]);
});

test("default tools fill only the remaining slots without duplicates", () => {
  const result = buildQuickAccessTools({
    tools,
    favoriteIds: ["favorite-a"],
    recentToolIds: ["recent-a"],
    defaultToolIds: [
      "favorite-a",
      "recent-a",
      "default-a",
      "default-a",
      "default-b",
      "default-c",
    ],
  });

  assert.deepEqual(toolIds(result), [
    "favorite-a",
    "recent-a",
    "default-a",
    "default-b",
    "default-c",
  ]);
});

test("unknown ids are ignored and the result never exceeds six tools", () => {
  const result = buildQuickAccessTools({
    tools,
    favoriteIds: ["removed-favorite", "favorite-a", "favorite-b"],
    recentToolIds: ["removed-recent", "recent-a", "recent-b"],
    defaultToolIds: ["removed-default", "default-a", "default-b", "default-c"],
  });

  assert.equal(result.length, maximumQuickAccessTools);
  assert.deepEqual(toolIds(result), [
    "favorite-a",
    "favorite-b",
    "recent-a",
    "recent-b",
    "default-a",
    "default-b",
  ]);
});

test("favorite changes immediately produce a new priority order", () => {
  const input = {
    tools,
    recentToolIds: ["recent-a", "recent-b"],
    defaultToolIds: ["default-a", "default-b", "default-c"],
  };
  const beforeFavorite = buildQuickAccessTools({
    ...input,
    favoriteIds: [],
  });
  const afterFavorite = buildQuickAccessTools({
    ...input,
    favoriteIds: ["recent-b"],
  });

  assert.deepEqual(toolIds(beforeFavorite).slice(0, 2), [
    "recent-a",
    "recent-b",
  ]);
  assert.deepEqual(toolIds(afterFavorite).slice(0, 2), [
    "recent-b",
    "recent-a",
  ]);
});

test("context labels use Favorite precedence over Recent", () => {
  const items = buildQuickAccessItems({
    tools,
    favoriteIds: ["recent-b"],
    recentToolIds: ["recent-b", "recent-a"],
    defaultToolIds: ["default-a"],
  });

  assert.deepEqual(
    items.map(({ tool, source }) => ({ id: tool.id, source })),
    [
      { id: "recent-b", source: "favorite" },
      { id: "recent-a", source: "recent" },
      { id: "default-a", source: "default" },
    ],
  );
});

test("removing a favorite restores its Recent context without losing a slot", () => {
  const input = {
    tools,
    recentToolIds: ["recent-b", "recent-a"],
    defaultToolIds: ["default-a", "default-b", "default-c"],
  };
  const favoritedItems = buildQuickAccessItems({
    ...input,
    favoriteIds: ["recent-b"],
  });
  const unfavoritedItems = buildQuickAccessItems({
    ...input,
    favoriteIds: [],
  });

  assert.equal(favoritedItems[0]?.source, "favorite");
  assert.equal(unfavoritedItems[0]?.source, "recent");
  assert.equal(favoritedItems.length, unfavoritedItems.length);
});
