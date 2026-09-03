import assert from "node:assert/strict";
import test from "node:test";
import {
  favoritesStorageKey,
  loadFavorites,
  normalizeFavoriteIds,
  storeFavorites,
  toggleFavoriteId,
} from "../src/utils/favorites.ts";

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
