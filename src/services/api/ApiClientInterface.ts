/**
 * API Client Interfaces for the Wabbit application
 *
 * This file defines the interfaces for interacting with different LLM APIs in a
 * consistent manner. It establishes a common contract that all API clients must
 * follow, enabling easy substitution between different providers.
 */

import { ApiClient, ApiClientOptions } from "../../interfaces/core";

/** Extended options specific to OpenRouter API */
export interface OpenRouterApiOptions extends ApiClientOptions {
  /** System prompt to set context for the model */
  systemPrompt?: string;

  /** Maximum number of tokens to generate */
  maxTokens?: number;

  /** Whether to use streaming for responses */
  stream?: boolean;

  /** Response format specification */
  responseFormat?: {
    type: string;
  };
}

/** Extended options specific to Gemini API */
export interface GeminiApiOptions extends ApiClientOptions {
  /** Limits tokens considered based on probability */
  topK?: number;

  /** Nucleus sampling threshold */
  topP?: number;

  /** Maximum number of tokens in response */
  maxOutputTokens?: number;

  /** Sequences that will stop generation */
  stopSequences?: string[];

  /** MIME type of the response */
  responseMimeType?: string;
}

/** Factory function type for creating API clients */
export type ApiClientFactory = (apiKey: string) => ApiClient;

/** Registry for available API clients */
export interface ApiClientRegistry {
  /** Register a new API client factory */
  register: (name: string, factory: ApiClientFactory) => void;

  /** Get an API client by name */
  get: (name: string, apiKey: string) => ApiClient | undefined;

  /** Get all registered API client names */
  getAvailableClients: () => string[];
}
