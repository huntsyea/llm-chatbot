/**
 * Centralized registry for LLM models to enable easy extension with new providers and models.
 */
import { GeminiModelConfig } from "../api/gemini";

/** Interface for a model definition */
export interface ModelDefinition {
  /** Display name of the model */
  name: string;
  /** Unique value/identifier for the model */
  value: string;
  /** Provider identifier (e.g., 'openrouter', 'gemini') */
  provider: string;
  /** Optional description for UI display */
  description?: string;
  /** Optional configuration specific to the model */
  config?: Partial<GeminiModelConfig> | Record<string, unknown>;
}

/** Registry of all available models */
export const modelRegistry: ModelDefinition[] = [
  // OpenRouter models
  { name: "Llama 3.3", value: "meta-llama/llama-3.3-70b-instruct:free", provider: "openrouter" },
  { name: "DeepSeek R1", value: "deepseek/deepseek-r1:free", provider: "openrouter" },
  { name: "Phi-4", value: "microsoft/phi-4:free", provider: "openrouter" },

  // Gemini models
  {
    name: "Gemini 2.0 Flash",
    value: "gemini-2.0-flash",
    provider: "gemini",
    description: "Next generation features, speed, and multimodal generation for a diverse variety of tasks"
  },
  {
    name: "Gemini 2.0 Flash-Lite",
    value: "gemini-2.0-flash-lite",
    provider: "gemini",
    description: "A Gemini 2.0 Flash model optimized for cost efficiency and low latency"
  },
  {
    name: "Gemini 2.0 Pro",
    value: "gemini-2.0-pro-exp",
    provider: "gemini",
    description: "Improved quality, especially for world knowledge, code, and long context"
  },
  {
    name: "Gemini 2.0 Flash Thinking",
    value: "gemini-2.0-flash-thinking-exp",
    provider: "gemini",
    description: "Reasoning for complex problems, features new thinking capabilities"
  },
  {
    name: "LearnLM 1.5 Pro Experimental",
    value: "learnlm-1.5-pro-exp",
    provider: "gemini",
    description: "Experimental model with audio, image, video, and text inputs"
  }
];

/**
 * Get models by provider
 * @param provider - The provider ID to filter by
 * @returns Array of models for the specified provider
 */
export function getModelsByProvider(provider: string): ModelDefinition[] {
  return modelRegistry.filter(model => model.provider === provider);
}

/**
 * Get a model by its value
 * @param value - The unique model value
 * @returns The model definition or undefined if not found
 */
export function getModelByValue(value: string): ModelDefinition | undefined {
  return modelRegistry.find(model => model.value === value);
}