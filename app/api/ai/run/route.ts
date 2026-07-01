import { NextResponse } from "next/server";
import { runGatewayModel } from "../../../../src/server/ai/gatewayRuntime";
import { getServerModelRoute } from "../../../../src/server/ai/modelRoutes";
import { runMockModel } from "../../../../src/server/ai/mockRuntime";
import { normalizeProviderError } from "../../../../src/server/ai/providerErrors";
import {
  buildProviderPrompt,
  parseRunRequest,
} from "../../../../src/server/ai/runRequest";

export const runtime = "nodejs";

const isMockForced = (): boolean => process.env.WABBIT_USE_MOCK_AI === "true";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const payload = (await request.json()) as unknown;
    const runRequest = parseRunRequest(payload);
    const route = getServerModelRoute(runRequest.routeId);

    if (!route) {
      return NextResponse.json(
        { ok: false, error: "Unknown model route" },
        { status: 404 },
      );
    }

    const providerPrompt = buildProviderPrompt(runRequest);
    const response =
      route.provider === "mock" || isMockForced()
        ? await runMockModel(providerPrompt, route)
        : await runGatewayModel(providerPrompt, route);

    return NextResponse.json({
      ok: true,
      result: {
        prompt: runRequest.prompt,
        response,
      },
    });
  } catch (error) {
    const safeError = normalizeProviderError(error);

    return NextResponse.json(
      { ok: false, error: safeError.message },
      { status: safeError.status },
    );
  }
}
