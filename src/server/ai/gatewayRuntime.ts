import { gateway } from "@ai-sdk/gateway";
import { generateText } from "ai";
import type { ExplorationResponse, ModelRoute } from "../../domain/exploration";

export async function runGatewayModel(
  prompt: string,
  route: ModelRoute,
): Promise<ExplorationResponse> {
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
    throw new Error("AI_GATEWAY_API_KEY is not configured");
  }

  const startedAt = Date.now();
  const result = await generateText({
    model: gateway(route.model),
    prompt,
  });

  return {
    text: result.text,
    provider: "gateway",
    routeId: route.id,
    model: route.model,
    latencyMs: Date.now() - startedAt,
    metadata: {
      finishReason: result.finishReason,
      usage: result.usage,
    },
  };
}
