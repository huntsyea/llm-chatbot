import { z } from "zod";
import type { RunRequest } from "../../domain/exploration";
import { getServerModelRoute } from "./modelRoutes";

export const MAX_PROMPT_LENGTH = 8_000;
export const MAX_CONTEXT_LENGTH = 12_000;

const runRequestSchema = z.object({
  mode: z.enum(["prompt", "topic"]),
  prompt: z.string().trim().min(1).max(MAX_PROMPT_LENGTH),
  routeId: z.string().trim().min(1).max(120),
  parentNodeId: z.string().trim().max(160).optional(),
  parentQuery: z.string().trim().max(MAX_PROMPT_LENGTH).optional(),
  parentContext: z.string().trim().max(MAX_CONTEXT_LENGTH).optional(),
  topic: z.string().trim().max(240).optional(),
});

export interface ValidatedRunRequest extends RunRequest {
  routeId: string;
  prompt: string;
}

export function parseRunRequest(input: unknown): ValidatedRunRequest {
  const parsed = runRequestSchema.parse(input);
  const route = getServerModelRoute(parsed.routeId);

  if (!route || !route.available) {
    throw new Error("Unknown model route");
  }

  if (parsed.mode === "topic" && !parsed.topic) {
    throw new Error("Topic is required for topic runs");
  }

  return parsed;
}

export function buildProviderPrompt(request: ValidatedRunRequest): string {
  if (request.mode === "prompt") {
    return request.prompt;
  }

  return [
    "Continue this exploration without repeating the full previous answer.",
    "",
    `Original query: ${request.parentQuery ?? request.prompt}`,
    "",
    request.parentContext
      ? `Previous response context:\n${request.parentContext}`
      : undefined,
    "",
    `Focused topic: ${request.topic ?? request.prompt}`,
  ]
    .filter(Boolean)
    .join("\n");
}
