import {
  ApiClient,
  ApiClientOptions,
  GeminiApiOptions,
} from "../interfaces/core";

const getMockDelayMs = (): number => {
  const delay = Number(process.env.NEXT_PUBLIC_WABBIT_MOCK_DELAY_MS ?? "0");

  if (!Number.isFinite(delay) || delay <= 0) {
    return 0;
  }

  return Math.min(delay, 10_000);
};

const waitForMockDelay = async (): Promise<void> => {
  const delay = getMockDelayMs();

  if (delay === 0) {
    return;
  }

  await new Promise((resolve) => globalThis.setTimeout(resolve, delay));
};

/** Deterministic client used only when mock mode is enabled. */
class MockApiClient implements ApiClient {
  constructor(private readonly provider: string) {}

  async generateResponse(
    prompt: string,
    options: ApiClientOptions,
  ): Promise<string> {
    await waitForMockDelay();

    const geminiOptions = options as GeminiApiOptions;
    const configSummary =
      this.provider === "gemini"
        ? `temperature=${geminiOptions.temperature ?? "default"}, topK=${geminiOptions.topK ?? "default"}, topP=${geminiOptions.topP ?? "default"}, maxOutputTokens=${geminiOptions.maxOutputTokens ?? "default"}`
        : `temperature=${options.temperature ?? "default"}, maxTokens=${options.maxTokens ?? "default"}`;

    return [
      `# Mock response for ${options.model}`,
      `You asked: ${prompt}`,
      "## Follow-up topic",
      `Provider: ${this.provider}. Configuration: ${configSummary}.`,
      "| Field | Value |",
      "| --- | --- |",
      `| Provider | ${this.provider} |`,
      `| Model | ${options.model} |`,
      "```text",
      "deterministic mock response",
      "```",
    ].join("\n\n");
  }

  async generateTopicResponse(
    topic: string,
    previousContext: string,
    options: ApiClientOptions,
  ): Promise<string> {
    await waitForMockDelay();

    return [
      `# ${topic}`,
      `Mock topic response for ${options.model}.`,
      `Previous query: ${previousContext}`,
      "This confirms heading click drilldown without contacting a provider.",
    ].join("\n\n");
  }
}

export function getMockApiClient(provider: string): ApiClient {
  return new MockApiClient(provider);
}
