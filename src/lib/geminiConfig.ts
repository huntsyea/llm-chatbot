import { GeminiModelConfig } from "../interfaces/core";

type GeminiConfigParam = keyof Required<GeminiModelConfig>;

export const defaultGeminiConfig: Required<GeminiModelConfig> = {
  temperature: 0.7,
  topK: 40,
  topP: 0.9,
  maxOutputTokens: 2048,
};

const bounds: Record<GeminiConfigParam, { min: number; max: number }> = {
  temperature: { min: 0, max: 1 },
  topK: { min: 1, max: 100 },
  topP: { min: 0, max: 1 },
  maxOutputTokens: { min: 1, max: 8192 },
};

const integerParams = new Set<GeminiConfigParam>(["topK", "maxOutputTokens"]);

export function normalizeGeminiConfigValue(
  param: GeminiConfigParam,
  value: number | string,
  fallback: number = defaultGeminiConfig[param],
): number {
  if (typeof value === "string" && value.trim() === "") {
    return fallback;
  }

  const numericValue = typeof value === "string" ? Number(value) : value;

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  const { min, max } = bounds[param];
  const clampedValue = Math.min(max, Math.max(min, numericValue));

  return integerParams.has(param) ? Math.round(clampedValue) : clampedValue;
}

export function getDefaultGeminiConfig(
  config: GeminiModelConfig = {},
): Required<GeminiModelConfig> {
  return {
    temperature: normalizeGeminiConfigValue(
      "temperature",
      config.temperature ?? defaultGeminiConfig.temperature,
    ),
    topK: normalizeGeminiConfigValue(
      "topK",
      config.topK ?? defaultGeminiConfig.topK,
    ),
    topP: normalizeGeminiConfigValue(
      "topP",
      config.topP ?? defaultGeminiConfig.topP,
    ),
    maxOutputTokens: normalizeGeminiConfigValue(
      "maxOutputTokens",
      config.maxOutputTokens ?? defaultGeminiConfig.maxOutputTokens,
    ),
  };
}
