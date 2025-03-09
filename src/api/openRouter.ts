import axios from "axios";
import { ApiClient, ApiClientOptions } from "../interfaces/core";

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
if (!API_KEY) {
  throw new Error("VITE_OPENROUTER_API_KEY is not set in .env file");
}
// Log the first few characters of the API key for debugging (avoid logging full key for security)
console.log("OpenRouter API Key (partial):", API_KEY.substring(0, 5) + "...");

/**
 * OpenRouter API client implementing the ApiClient interface
 */
class OpenRouterApiClient implements ApiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(prompt: string, options: ApiClientOptions): Promise<string> {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: options.model,
          messages: [
            { role: "system", content: options.systemPrompt || "" },
            { role: "user", content: prompt },
          ],
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 2048,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const responseText = response.data.choices[0].message.content;
      if (!responseText) {
        throw new Error("Empty response from OpenRouter API");
      }

      return responseText;
    } catch (error: unknown) {
      console.error("OpenRouter API error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`[OpenRouter Error]: Failed to generate content - ${errorMessage}`);
    }
  }

  async generateTopicResponse(
    topic: string,
    previousContext: string,
    options: ApiClientOptions
  ): Promise<string> {
    const prompt = `Based on the previous query: "${previousContext}", provide a detailed response about "${topic}".`;
    return this.generateResponse(prompt, options);
  }
}

/**
 * Factory function to create an OpenRouter API client
 * @param apiKey - The API key for OpenRouter
 * @returns An instance of OpenRouterApiClient
 */
export function getOpenRouterApiClient(apiKey: string): ApiClient {
  return new OpenRouterApiClient(apiKey);
}