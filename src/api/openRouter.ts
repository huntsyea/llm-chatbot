import { ApiClient } from "../interfaces/core";
import { ServerRouteApiClient } from "./serverRouteClient";

export function getOpenRouterApiClient(_apiKey: string): ApiClient {
  void _apiKey;

  return new ServerRouteApiClient("gateway/openai-gpt-5.5");
}
