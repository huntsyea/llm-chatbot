import { createSession, type ExplorationSession } from "../domain/exploration";

const STORAGE_KEY = "wabbit.exploration.session.v1";

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const getBrowserStorage = (): StorageLike | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.localStorage;
};

const isExplorationSession = (value: unknown): value is ExplorationSession => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ExplorationSession>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    Array.isArray(candidate.nodes) &&
    Array.isArray(candidate.edges) &&
    typeof candidate.createdAt === "number" &&
    typeof candidate.updatedAt === "number"
  );
};

export function loadSession(storage = getBrowserStorage()): ExplorationSession {
  if (!storage) {
    return createSession();
  }

  const rawSession = storage.getItem(STORAGE_KEY);
  if (!rawSession) {
    return createSession();
  }

  try {
    const parsedSession = JSON.parse(rawSession) as unknown;
    return isExplorationSession(parsedSession)
      ? parsedSession
      : createSession();
  } catch {
    return createSession();
  }
}

export function saveSession(
  session: ExplorationSession,
  storage = getBrowserStorage(),
): void {
  storage?.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(
  storage = getBrowserStorage(),
): ExplorationSession {
  storage?.removeItem(STORAGE_KEY);
  return createSession();
}

export function createMemoryStorage(
  initialValue?: ExplorationSession,
): StorageLike {
  const values = new Map<string, string>();

  if (initialValue) {
    values.set(STORAGE_KEY, JSON.stringify(initialValue));
  }

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
  };
}
