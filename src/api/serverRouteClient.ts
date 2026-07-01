import { ApiClient, ApiClientOptions } from "../interfaces/core";

interface ServerRunResponse {
  ok: boolean;
  result?: {
    response?: {
      text?: string;
    };
  };
  error?: string;
}

export class ServerRouteApiClient implements ApiClient {
  constructor(private readonly routeId: string) {}

  async generateResponse(
    prompt: string,
    options: ApiClientOptions,
  ): Promise<string> {
    return this.run({
      mode: "prompt",
      prompt,
      routeId: options.model || this.routeId,
    });
  }

  async generateTopicResponse(
    topic: string,
    previousContext: string,
    options: ApiClientOptions,
  ): Promise<string> {
    return this.run({
      mode: "topic",
      prompt: topic,
      topic,
      routeId: options.model || this.routeId,
      parentQuery: previousContext,
      parentContext: previousContext,
    });
  }

  private async run(payload: Record<string, string>): Promise<string> {
    const response = await fetch("/api/ai/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const body = (await response.json()) as ServerRunResponse;

    if (!response.ok || !body.ok) {
      throw new Error(body.error ?? "Server AI route request failed");
    }

    const text = body.result?.response?.text;
    if (!text) {
      throw new Error("Empty response from server AI route");
    }

    return text;
  }
}
