import type { ExplorationResponse, ModelRoute } from "../../domain/exploration";

const summarizePrompt = (prompt: string): string => {
  const compact = prompt.replace(/\s+/g, " ").trim();
  if (compact.length <= 180) {
    return compact;
  }

  return `${compact.slice(0, 177).trim()}...`;
};

export async function runMockModel(
  prompt: string,
  route: ModelRoute,
): Promise<ExplorationResponse> {
  const startedAt = Date.now();
  const summary = summarizePrompt(prompt);

  return {
    text: [
      `# Exploration result for ${route.label}`,
      "",
      `The workspace captured this query as a durable exploration branch: ${summary}`,
      "",
      "## Follow-up angle",
      "",
      "- Compare candidate answers",
      "- Extract reusable artifacts",
      "- Test assumptions against source material",
      "",
      "## Entities",
      "",
      "- Wabbit",
      "- AI Gateway",
      "- Exploration Graph",
      "",
      "## Suggested next question",
      "",
      "What evidence would change the current direction?",
    ].join("\n"),
    provider: "mock",
    routeId: route.id,
    model: route.model,
    latencyMs: Date.now() - startedAt,
    metadata: {
      deterministic: true,
    },
  };
}
