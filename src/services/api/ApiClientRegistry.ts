/**
 * API Client Registry for the Wabbit application
 *
 * This file implements a registry pattern for managing different API clients.
 * It allows for dynamic registration and lookup of API clients by name.
 */
import { ApiClient } from "../../interfaces/core";
import { ApiClientFactory, ApiClientRegistry } from "./ApiClientInterface";
import { getGeminiApiClient } from "../../api/gemini";
import { getOpenRouterApiClient } from "../../api/openRouter";
import { getMockApiClient } from "../../api/mock";
import { isMockApiEnabled } from "../../lib/providerConfig";

/** Implementation of the API client registry */
export class ApiClientRegistryImpl implements ApiClientRegistry {
  /** Map of registered API client factories */
  private readonly factories: Map<string, ApiClientFactory> = new Map();

  /** Cache of instantiated API clients */
  private readonly instanceCache: Map<string, ApiClient> = new Map();

  constructor() {
    if (isMockApiEnabled()) {
      this.register("gemini", () => getMockApiClient("gemini"));
      this.register("openrouter", () => getMockApiClient("openrouter"));
      return;
    }

    this.register("gemini", getGeminiApiClient);
    this.register("openrouter", getOpenRouterApiClient);
  }

  /**
   * Register a new API client factory
   *
   * @param name - Unique name for the API client
   * @param factory - Factory function to create instances of the client
   */
  register(name: string, factory: ApiClientFactory): void {
    this.factories.set(name, factory);

    // Clear cache for this client if it exists
    const cacheKey = this.buildCacheKey(name);
    if (this.instanceCache.has(cacheKey)) {
      this.instanceCache.delete(cacheKey);
    }
  }

  /**
   * Get an API client by name
   *
   * @param name - Name of the API client
   * @param apiKey - API key for the client
   * @returns An instance of the API client or undefined if not found
   */
  get(name: string, apiKey: string): ApiClient | undefined {
    const cacheKey = this.buildCacheKey(name, apiKey);
    if (this.instanceCache.has(cacheKey)) {
      return this.instanceCache.get(cacheKey);
    }

    const factory = this.factories.get(name);
    if (!factory) {
      return undefined;
    }

    const client = factory(apiKey);
    this.instanceCache.set(cacheKey, client);
    return client;
  }

  /**
   * Get all registered API client names
   *
   * @returns Array of registered client names
   */
  getAvailableClients(): string[] {
    return Array.from(this.factories.keys());
  }

  /**
   * Build a unique cache key for an API client
   *
   * @param name - Name of the API client
   * @param apiKey - API key (optional)
   * @returns A unique key string
   */
  private buildCacheKey(name: string, apiKey: string = ""): string {
    return `${name}:${apiKey}`;
  }
}

/** Singleton instance of the API client registry */
export const apiClientRegistry = new ApiClientRegistryImpl();
