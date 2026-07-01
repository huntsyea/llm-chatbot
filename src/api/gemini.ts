import { ApiClient } from "../interfaces/core";
import { ServerRouteApiClient } from "./serverRouteClient";

export function getGeminiApiClient(_apiKey: string): ApiClient {
  void _apiKey;

  return new ServerRouteApiClient("gateway/google-gemini-3.1-pro-preview");
}
