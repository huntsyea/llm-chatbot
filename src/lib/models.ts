import type { ModelRoute, ProviderId } from "../domain/exploration";

export const DEFAULT_MODEL_ROUTE_ID = "mock/wabbit-local";

export interface ModelDefinition {
  name: string;
  value: string;
  provider: string;
  description?: string;
  config?: Record<string, unknown>;
}

export const modelRoutes: ModelRoute[] = [
  {
    id: DEFAULT_MODEL_ROUTE_ID,
    label: "Wabbit Local Mock",
    provider: "mock",
    providerGroup: "local",
    model: "mock/wabbit-local",
    description: "Deterministic offline responses for exploration and QA.",
    available: true,
    isDefault: true,
  },
  {
    id: "gateway/openai-gpt-5.5",
    label: "OpenAI GPT-5.5",
    provider: "gateway",
    providerGroup: "gateway",
    model: "openai/gpt-5.5",
    description: "General research and synthesis route through AI Gateway.",
    available: true,
  },
  {
    id: "gateway/anthropic-claude-sonnet-4.6",
    label: "Claude Sonnet 4.6",
    provider: "gateway",
    providerGroup: "gateway",
    model: "anthropic/claude-sonnet-4.6",
    description: "Long-form reasoning and careful response drafting route.",
    available: true,
  },
  {
    id: "gateway/google-gemini-3.1-pro-preview",
    label: "Gemini 3.1 Pro Preview",
    provider: "gateway",
    providerGroup: "gateway",
    model: "google/gemini-3.1-pro-preview",
    description: "Broad analysis route for multimodal-ready provider coverage.",
    available: true,
  },
];

export function getPublicModelRoutes(): ModelRoute[] {
  return modelRoutes.map((route) => ({ ...route }));
}

export function getDefaultModelRoute(): ModelRoute {
  return (
    modelRoutes.find((route) => route.isDefault) ??
    modelRoutes.find((route) => route.available) ??
    modelRoutes[0]
  );
}

export function getModelRoute(routeId: string): ModelRoute | undefined {
  return modelRoutes.find((route) => route.id === routeId);
}

export function getModelRoutesByProvider(provider: ProviderId): ModelRoute[] {
  return modelRoutes.filter((route) => route.provider === provider);
}

export const modelRegistry: ModelDefinition[] = modelRoutes.map((route) => ({
  name: route.label,
  value: route.id,
  provider:
    route.provider === "gateway" && route.model.startsWith("google/")
      ? "gemini"
      : route.provider === "gateway"
        ? "openrouter"
        : route.provider,
  description: route.description,
}));

export function getModelsByProvider(provider: string): ModelDefinition[] {
  return modelRegistry.filter((model) => model.provider === provider);
}

export function getModelByValue(value: string): ModelDefinition | undefined {
  return modelRegistry.find(
    (model) => model.value === value || model.name === value,
  );
}
