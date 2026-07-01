import { createSession } from "../domain/exploration";
import {
  clearSession,
  createMemoryStorage,
  loadSession,
  saveSession,
} from "./explorationStore";

interface TestTools {
  assert(condition: unknown, message: string): void;
}

export function runExplorationStoreTests({ assert }: TestTools): void {
  const session = createSession(100);
  const storage = createMemoryStorage();

  saveSession(session, storage);
  assert(loadSession(storage).id === session.id, "Expected saved session");

  storage.setItem("wabbit.exploration.session.v1", "{bad json");
  assert(
    loadSession(storage).id !== session.id,
    "Expected invalid JSON fallback",
  );
  assert(clearSession(storage).nodes.length === 0, "Expected clear fallback");
}
