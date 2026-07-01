import { buildProviderPrompt, parseRunRequest } from "./runRequest";

interface TestTools {
  assert(condition: unknown, message: string): void;
  assertThrows(fn: () => void, expectedMessage: string): void;
}

export function runRequestValidationTests({
  assert,
  assertThrows,
}: TestTools): void {
  const request = parseRunRequest({
    mode: "topic",
    prompt: "Follow-up angle",
    topic: "Follow-up angle",
    routeId: "mock/wabbit-local",
    parentQuery: "Original query",
    parentContext: "Previous response",
  });
  const providerPrompt = buildProviderPrompt(request);

  assert(
    providerPrompt.includes("Focused topic: Follow-up angle"),
    "Expected topic prompt composition",
  );
  assertThrows(
    () =>
      parseRunRequest({
        mode: "prompt",
        prompt: "x",
        routeId: "unknown",
      }),
    "Unknown model route",
  );
  assertThrows(
    () =>
      parseRunRequest({
        mode: "prompt",
        prompt: "x".repeat(8_001),
        routeId: "mock/wabbit-local",
      }),
    "Too big",
  );
}
