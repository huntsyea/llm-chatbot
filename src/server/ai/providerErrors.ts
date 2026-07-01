import { ZodError } from "zod";

export interface SafeProviderError {
  status: number;
  message: string;
}

export function normalizeProviderError(error: unknown): SafeProviderError {
  if (error instanceof ZodError) {
    return {
      status: 400,
      message: "Invalid request payload",
    };
  }

  if (error instanceof Error) {
    if (error.message === "Unknown model route") {
      return {
        status: 404,
        message: "Unknown model route",
      };
    }

    if (error.message.includes("AI_GATEWAY_API_KEY")) {
      return {
        status: 503,
        message: "AI Gateway is not configured for this environment",
      };
    }

    if (error.message.includes("Topic is required")) {
      return {
        status: 400,
        message: "Topic is required for topic runs",
      };
    }
  }

  return {
    status: 502,
    message: "Provider request failed",
  };
}
