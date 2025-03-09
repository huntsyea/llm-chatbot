/**
 * Core type definitions for the Wabbit application
 *
 * This file contains the centralized type definitions that are used throughout
 * the application. These types establish the foundation for consistent data
 * structures and extension points.
 */

/** Represents a response from an LLM */
export interface Response {
  /** The original user query */
  query: string;

  /** The response content from the model */
  response: string;

  /** Identifier for the model that generated the response */
  model: string;

  /** Unix timestamp when the response was generated */
  timestamp: number;

  /** Extension point: additional metadata about the response */
  metadata?: Record<string, unknown>;
}

/** Configuration options for API clients */
export interface ApiClientOptions {
  /** The model identifier to use for generation */
  model: string;

  /** Controls randomness in generation (0.0 to 1.0) */
  temperature?: number;

  /** Maximum number of tokens to generate */
  maxTokens?: number;

  /** Extension point: additional parameters for specific models */
  [key: string]: unknown;
}

/** Base interface for all API clients */
export interface ApiClient {
  /**
   * Generate a response from the model
   *
   * @param prompt - The user's prompt or query
   * @param options - Configuration options for the generation
   * @returns A promise resolving to the generated text
   */
  generateResponse(prompt: string, options: ApiClientOptions): Promise<string>;

  /**
   * Generate a response for a specific topic based on previous context
   *
   * @param topic - The specific topic to address
   * @param previousContext - Previous conversation context
   * @param options - Configuration options for the generation
   * @returns A promise resolving to the generated text
   */
  generateTopicResponse?(
    topic: string,
    previousContext: string,
    options: ApiClientOptions,
  ): Promise<string>;
}
