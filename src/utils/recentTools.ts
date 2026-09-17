export const recentToolsStorageKey = "freeshot:recent-tools";
export const maximumRecentTools = 6;

export interface RecentToolEntry {
  toolId: string;
  lastUsedAt: number;
}

type RecentToolsStorage = Pick<Storage, "getItem" | "setItem"> &
  Partial<Pick<Storage, "removeItem">>;

export function normalizeRecentTools(
  value: unknown,
  availableToolIds: ReadonlySet<string>,
  limit = maximumRecentTools,
): RecentToolEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const newestEntryByToolId = new Map<string, RecentToolEntry>();

  value.forEach((candidate) => {
    if (
      !isRecentToolEntry(candidate) ||
      !availableToolIds.has(candidate.toolId)
    ) {
      return;
    }

    const currentEntry = newestEntryByToolId.get(candidate.toolId);
    if (!currentEntry || candidate.lastUsedAt > currentEntry.lastUsedAt) {
      newestEntryByToolId.set(candidate.toolId, {
        toolId: candidate.toolId,
        lastUsedAt: candidate.lastUsedAt,
      });
    }
  });

  return [...newestEntryByToolId.values()]
    .sort(compareRecentToolEntries)
    .slice(0, Math.max(0, limit));
}

export function loadRecentTools(
  storage: RecentToolsStorage | null,
  availableToolIds: ReadonlySet<string>,
): RecentToolEntry[] {
  if (!storage) {
    return [];
  }

  try {
    const storedValue = storage.getItem(recentToolsStorageKey);
    return storedValue
      ? normalizeRecentTools(JSON.parse(storedValue), availableToolIds)
      : [];
  } catch {
    return [];
  }
}

export function storeRecentTools(
  storage: RecentToolsStorage | null,
  entries: readonly RecentToolEntry[],
  availableToolIds: ReadonlySet<string>,
) {
  if (!storage) {
    return;
  }

  try {
    const normalizedEntries = normalizeRecentTools(entries, availableToolIds);

    if (normalizedEntries.length === 0 && storage.removeItem) {
      storage.removeItem(recentToolsStorageKey);
      return;
    }

    storage.setItem(recentToolsStorageKey, JSON.stringify(normalizedEntries));
  } catch {
    // Recent tracking remains usable for this session if storage is unavailable.
  }
}

export function markRecentToolUsed(
  entries: readonly RecentToolEntry[],
  toolId: string,
  usedAt: number,
  availableToolIds: ReadonlySet<string>,
): RecentToolEntry[] {
  const normalizedEntries = normalizeRecentTools(entries, availableToolIds);

  if (!availableToolIds.has(toolId)) {
    return normalizedEntries;
  }

  const latestTimestamp = normalizedEntries[0]?.lastUsedAt ?? -1;
  const requestedTimestamp =
    Number.isFinite(usedAt) && usedAt >= 0 ? usedAt : Date.now();
  const lastUsedAt = Math.max(requestedTimestamp, latestTimestamp + 1);

  return normalizeRecentTools(
    [
      { toolId, lastUsedAt },
      ...normalizedEntries.filter((entry) => entry.toolId !== toolId),
    ],
    availableToolIds,
  );
}

export function resolveRecentTools<Tool extends { id: string }>(
  entries: readonly RecentToolEntry[],
  tools: readonly Tool[],
): Tool[] {
  const toolById = new Map(tools.map((tool) => [tool.id, tool]));
  return entries
    .map((entry) => toolById.get(entry.toolId))
    .filter((tool): tool is Tool => Boolean(tool));
}

export function getToolIdForPath<Tool extends { id: string; route: string }>(
  tools: readonly Tool[],
  pathname: string,
  baseUrl = "/",
): string | null {
  const normalizedPath = normalizePath(pathname);
  const normalizedBase = normalizePath(baseUrl);
  const appPath =
    normalizedBase !== "/" &&
    (normalizedPath === normalizedBase ||
      normalizedPath.startsWith(`${normalizedBase}/`))
      ? normalizePath(normalizedPath.slice(normalizedBase.length))
      : normalizedPath;

  return (
    tools.find((tool) => normalizePath(tool.route) === appPath)?.id ?? null
  );
}

function compareRecentToolEntries(
  left: RecentToolEntry,
  right: RecentToolEntry,
) {
  return (
    right.lastUsedAt - left.lastUsedAt ||
    left.toolId.localeCompare(right.toolId)
  );
}

function isRecentToolEntry(value: unknown): value is RecentToolEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as Record<string, unknown>;
  return (
    typeof entry.toolId === "string" &&
    typeof entry.lastUsedAt === "number" &&
    Number.isFinite(entry.lastUsedAt) &&
    entry.lastUsedAt >= 0
  );
}

function normalizePath(value: string) {
  const [pathname = "/"] = value.split(/[?#]/, 1);
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLeadingSlash.length > 1
    ? withLeadingSlash.replace(/\/+$/, "")
    : withLeadingSlash;
}
