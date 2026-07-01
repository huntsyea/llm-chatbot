import {
  completeRunSuccess,
  createPromptRun,
  createSession,
} from "../../domain/exploration";
import { sessionToFlowGraph } from "./graphAdapter";

interface TestTools {
  assert(condition: unknown, message: string): void;
}

export function runGraphAdapterTests({ assert }: TestTools): void {
  const promptRun = createPromptRun(createSession(1), {
    prompt: "Graph layout",
    routeId: "mock/wabbit-local",
    now: 2,
  });
  const completed = completeRunSuccess(promptRun.session, {
    sourceNodeId: promptRun.sourceNodeId,
    prompt: "Graph layout",
    now: 3,
    response: {
      text: "Response",
      provider: "mock",
      routeId: "mock/wabbit-local",
      model: "mock/wabbit-local",
    },
  });
  const graph = sessionToFlowGraph(completed);

  assert(graph.nodes.length === 2, "Expected two flow nodes");
  assert(graph.edges.length === 1, "Expected one flow edge");
  assert(
    graph.nodes[1].position.x > graph.nodes[0].position.x,
    "Expected response node depth",
  );
}
