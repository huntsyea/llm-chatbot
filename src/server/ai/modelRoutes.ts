import type { ModelRoute } from "../../domain/exploration";
import {
  getDefaultModelRoute,
  getModelRoute,
  getPublicModelRoutes,
} from "../../lib/models";

export function getServerModelRoute(routeId: string): ModelRoute | undefined {
  return getModelRoute(routeId);
}

export function getServerDefaultModelRoute(): ModelRoute {
  return getDefaultModelRoute();
}

export function getServerPublicModelRoutes(): ModelRoute[] {
  return getPublicModelRoutes();
}
