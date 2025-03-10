import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiClient, ApiClientOptions } from "../interfaces/core";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY is not set in .env file");
}

const genAI = new GoogleGenerativeAI(API_KEY);

/** Configuration options specific to Gemini API */
export interface GeminiModelConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

/** Extended options specific to Gemini API */
export interface GeminiApiOptions extends ApiClientOptions {
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
  responseMimeType?: string;
}

/**
 * Gemini API client implementing the ApiClient interface
 */
class GeminiApiClient implements ApiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(prompt: string, options: ApiClientOptions): Promise<string> {
    try {
      const generativeModel = genAI.getGenerativeModel({
        model: options.model,
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          topK: (options as any).topK ?? 40,
          topP: (options as any).topP ?? 0.9,
          maxOutputTokens: (options as any).maxOutputTokens ?? 3900,
        },
      });

      const fullPrompt = options.systemPrompt
        ? `${options.systemPrompt}\n\n${prompt}`
        : prompt;

      const result = await generativeModel.generateContent(fullPrompt);
      const responseText = result.response.text();

      if (!responseText) {
        throw new Error("Empty response from Gemini API");
      }

      return responseText;
    } catch (error: unknown) {
      console.error("Gemini API error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`[GoogleGenerativeAI Error]: Failed to generate content - ${errorMessage}`);
    }
  }

  async generateTopicResponse(
    topic: string,
    previousContext: string,
    options: ApiClientOptions
  ): Promise<string> {
    const prompt = `Based on the previous query: "${previousContext}", provide a detailed response following previous format about "${topic}".`;
    return this.generateResponse(prompt, options);
  }
}

/**
 * Factory function to create a Gemini API client
 * @param apiKey - The API key for Gemini
 * @returns An instance of GeminiApiClient
 */
export function getGeminiApiClient(apiKey: string): ApiClient {
  return new GeminiApiClient(apiKey);
}