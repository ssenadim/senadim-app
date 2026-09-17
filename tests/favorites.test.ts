import assert from "node:assert/strict";
import test from "node:test";
import {
  favoritesStorageKey,
  loadFavorites,
  normalizeFavoriteIds,
  storeFavorites,
  toggleFavoriteId,
} from "../src/utils/favorites.ts";
import {
  filterToolsByFavorites,
  getToolSearchEmptyState,
} from "../src/utils/favoriteSearch.ts";

const availableToolIds = new Set(["jwt-decoder", "mermaid-viewer"]);

test("new users start with no favorites", () => {
  const storage = {
    getItem: () => null,
    setItem: () => undefined,
  };

  assert.deepEqual(loadFavorites(storage, availableToolIds), []);
});

test("malformed storage content falls back to an empty list", () => {
  const invalidJsonStorage = {
    getItem: () => "not-json",
    setItem: () => undefined,
  };
  const inaccessibleStorage = {
    getItem: () => {
      throw new Error("Storage access denied");
    },
    setItem: () => undefined,
  };

  assert.deepEqual(loadFavorites(invalidJsonStorage, availableToolIds), []);
  assert.deepEqual(loadFavorites(inaccessibleStorage, availableToolIds), []);
  assert.deepEqual(normalizeFavoriteIds({ ids: [] }, availableToolIds), []);
});

test("unknown, duplicate and non-string ids are ignored", () => {
  const storage = {
    getItem: () =>
      JSON.stringify(["jwt-decoder", "removed-tool", "jwt-decoder", 42, null]),
    setItem: () => undefined,
  };

  assert.deepEqual(loadFavorites(storage, availableToolIds), ["jwt-decoder"]);
});

test("only stable available tool ids are persisted", () => {
  let persistedKey = "";
  let persistedValue = "";
  const storage = {
    getItem: () => null,
    setItem: (key: string, value: string) => {
      persistedKey = key;
      persistedValue = value;
    },
  };

  storeFavorites(
    storage,
    ["mermaid-viewer", "removed-tool", "mermaid-viewer"],
    availableToolIds,
  );

  assert.equal(persistedKey, favoritesStorageKey);
  assert.equal(persistedValue, JSON.stringify(["mermaid-viewer"]));
  assert.doesNotThrow(() =>
    storeFavorites(
      {
        getItem: () => null,
        setItem: () => {
          throw new Error("Storage quota exceeded");
        },
      },
      ["jwt-decoder"],
      availableToolIds,
    ),
  );
});

test("a favorite id can be added and removed without mutating prior state", () => {
  const initialIds = ["jwt-decoder"];
  const addedIds = toggleFavoriteId(initialIds, "mermaid-viewer");
  const removedIds = toggleFavoriteId(addedIds, "jwt-decoder");

  assert.deepEqual(initialIds, ["jwt-decoder"]);
  assert.deepEqual(addedIds, ["jwt-decoder", "mermaid-viewer"]);
  assert.deepEqual(removedIds, ["mermaid-viewer"]);
});

test("Favorites only filters the supplied search results by stable id", () => {
  const tools = [
    { id: "jwt-decoder", name: "JWT Decoder" },
    { id: "mermaid-viewer", name: "Mermaid Viewer" },
    { id: "yaml-converter", name: "YAML Converter" },
  ];

  assert.deepEqual(
    filterToolsByFavorites(tools, ["jwt-decoder", "yaml-converter"], true),
    [tools[0], tools[2]],
  );
});

test("Favorites only composes with an already filtered text search", () => {
  const yamlSearchResults = [
    { id: "yaml-converter", name: "YAML Converter" },
    { id: "data-formatter", name: "Data Formatter" },
  ];

  assert.deepEqual(
    filterToolsByFavorites(
      yamlSearchResults,
      ["data-formatter", "jwt-decoder"],
      true,
    ),
    [yamlSearchResults[1]],
  );
  assert.deepEqual(
    filterToolsByFavorites(yamlSearchResults, [], false),
    yamlSearchResults,
  );
});

test("Favorites-only empty states distinguish no favorites from no matches", () => {
  assert.equal(
    getToolSearchEmptyState({
      favoritesOnly: true,
      favoriteCount: 0,
      hasQuery: true,
      resultCount: 0,
    }),
    "no-favorites",
  );
  assert.equal(
    getToolSearchEmptyState({
      favoritesOnly: true,
      favoriteCount: 2,
      hasQuery: true,
      resultCount: 0,
    }),
    "no-matching-favorites",
  );
  assert.equal(
    getToolSearchEmptyState({
      favoritesOnly: true,
      favoriteCount: 2,
      hasQuery: false,
      resultCount: 2,
    }),
    null,
  );
});

test("normal search prompt and no-result states remain unchanged", () => {
  assert.equal(
    getToolSearchEmptyState({
      favoritesOnly: false,
      favoriteCount: 0,
      hasQuery: false,
      resultCount: 0,
    }),
    "search-prompt",
  );
  assert.equal(
    getToolSearchEmptyState({
      favoritesOnly: false,
      favoriteCount: 0,
      hasQuery: true,
      resultCount: 0,
    }),
    "no-tools",
  );
});
