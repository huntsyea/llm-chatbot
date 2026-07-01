import {
  completeRunSuccess,
  createPromptRun,
  createSession,
  createTopicRun,
  getSelectedNode,
  promoteArtifactSuggestion,
} from "./exploration";

interface TestTools {
  assert(condition: unknown, message: string): void;
}

export function runExplorationDomainTests({ assert }: TestTools): void {
  const session = createSession(1_000);
  const promptRun = createPromptRun(session, {
    prompt: "Map the current app architecture",
    routeId: "mock/wabbit-local",
    now: 2_000,
  });
  const completed = completeRunSuccess(promptRun.session, {
    sourceNodeId: promptRun.sourceNodeId,
    prompt: "Map the current app architecture",
    now: 3_000,
    response: {
      text: "# Result\n\n## Follow-up angle\n\n- Wabbit Workspace\n- AI Gateway",
      provider: "mock",
      routeId: "mock/wabbit-local",
      model: "mock/wabbit-local",
      latencyMs: 1,
    },
  });
  const selected = getSelectedNode(completed);

  assert(completed.nodes.length === 2, "Expected prompt plus response nodes");
  assert(completed.edges.length === 1, "Expected provider edge");
  assert(selected?.kind === "response", "Expected response selected");
  assert(
    Number(selected?.suggestions?.length ?? 0) > 0,
    "Expected artifact suggestions",
  );

  const suggestionId = selected?.suggestions?.[0]?.id;
  assert(suggestionId, "Expected suggestion id");

  const promoted = promoteArtifactSuggestion(
    completed,
    suggestionId ?? "",
    4_000,
  );
  assert(
    promoted.nodes.some((node) => node.kind === "artifact"),
    "Expected promoted artifact node",
  );

  const responseNode = completed.nodes.find((node) => node.kind === "response");
  assert(responseNode, "Expected response node for topic run");

  const topicRun = createTopicRun(completed, {
    prompt: "Follow-up angle",
    topic: "Follow-up angle",
    routeId: "mock/wabbit-local",
    parentResponseNodeId: responseNode?.id ?? "",
    parentQuery: "Map the current app architecture",
    now: 5_000,
  });

  assert(topicRun.session.nodes.length === 3, "Expected topic prompt node");
  assert(
    topicRun.session.edges.some(
      (edge) => edge.source === responseNode?.id && edge.label === "explore",
    ),
    "Expected explore edge from response",
  );
}
