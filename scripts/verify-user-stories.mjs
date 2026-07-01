import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const moduleCache = new Map();
const testResults = [];

function resolveLocalModule(parentFile, specifier) {
  const basePath = specifier.startsWith("/")
    ? specifier
    : path.resolve(path.dirname(parentFile), specifier);
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.tsx"),
    path.join(basePath, "index.js"),
  ];
  const match = candidates.find((candidate) => fs.existsSync(candidate));

  if (!match) {
    throw new Error(
      `Unable to resolve local module ${specifier} from ${parentFile}`,
    );
  }

  return match;
}

function loadSourceModule(relativePath) {
  const absolutePath = path.isAbsolute(relativePath)
    ? relativePath
    : path.join(repoRoot, relativePath);

  if (moduleCache.has(absolutePath)) {
    return moduleCache.get(absolutePath).exports;
  }

  const module = { exports: {} };
  moduleCache.set(absolutePath, module);

  const source = fs.readFileSync(absolutePath, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: absolutePath,
  }).outputText;

  const localRequire = (specifier) => {
    if (specifier.startsWith(".") || specifier.startsWith("/")) {
      return loadSourceModule(resolveLocalModule(absolutePath, specifier));
    }

    return require(specifier);
  };

  const runModule = new Function(
    "require",
    "module",
    "exports",
    "__dirname",
    "__filename",
    "process",
    compiled,
  );

  runModule(
    localRequire,
    module,
    module.exports,
    path.dirname(absolutePath),
    absolutePath,
    process,
  );

  return module.exports;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertThrows(fn, expectedMessage) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    assert(
      message.includes(expectedMessage),
      `Expected error to include "${expectedMessage}", received "${message}"`,
    );
    return;
  }

  throw new Error(`Expected function to throw "${expectedMessage}"`);
}

async function test(name, run) {
  try {
    await run();
    testResults.push({ name, status: "PASS" });
  } catch (error) {
    testResults.push({
      name,
      status: "FAIL",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

await test("MarkdownService normalizes model markdown edge cases", () => {
  const { MarkdownService } = loadSourceModule(
    "src/services/markdown/MarkdownNormalizer.ts",
  );
  const service = new MarkdownService();
  const input = [
    "Heading",
    "=======",
    "",
    "*one",
    "+ two",
    "-three",
    "",
    "<script>alert(1)</script>",
    "",
    "~~~TS",
    "let Y = 2;",
    "~~~",
  ].join("\n");
  const output = service.normalizeMarkdown(input);

  assert(output.includes("# Heading"), "Expected underline H1 conversion");
  assert(output.includes("- one"), "Expected star bullet normalization");
  assert(output.includes("- two"), "Expected plus bullet normalization");
  assert(output.includes("- three"), "Expected dash spacing normalization");
  assert(!output.includes("<script>"), "Expected script tag stripping");
  assert(!output.includes("alert(1)"), "Expected script body stripping");
  assert(output.includes("```ts\nlet Y = 2;\n```"), "Expected code tag case");
});

await test("Model route catalog exposes mock and Gateway routes", () => {
  const {
    DEFAULT_MODEL_ROUTE_ID,
    getDefaultModelRoute,
    getModelRoute,
    getPublicModelRoutes,
  } = loadSourceModule("src/lib/models.ts");
  const routes = getPublicModelRoutes();

  assert(routes.length >= 4, "Expected mock plus Gateway routes");
  assert(
    getDefaultModelRoute().id === DEFAULT_MODEL_ROUTE_ID,
    "Expected mock route as default",
  );
  assert(
    getModelRoute("gateway/openai-gpt-5.5")?.provider === "gateway",
    "Expected Gateway route lookup",
  );
  assert(getModelRoute("missing") === undefined, "Expected missing route miss");
});

await test("Recommended prompts are available for command flow", () => {
  const { recommendedPrompts } = loadSourceModule("src/lib/prompts.ts");

  assert(
    recommendedPrompts.length >= 3,
    "Expected command bar recommended prompts",
  );
  assert(
    recommendedPrompts.includes("Map the current app architecture"),
    "Expected architecture recommendation",
  );
});

await test("Exploration domain module covers graph and artifact behavior", () => {
  const { runExplorationDomainTests } = loadSourceModule(
    "src/domain/exploration.test.ts",
  );

  runExplorationDomainTests({ assert });
});

await test("Run request test module covers validation and topic prompts", () => {
  const { runRequestValidationTests } = loadSourceModule(
    "src/server/ai/runRequest.test.ts",
  );

  runRequestValidationTests({ assert, assertThrows });
});

await test("Exploration store test module covers local persistence", () => {
  const { runExplorationStoreTests } = loadSourceModule(
    "src/lib/explorationStore.test.ts",
  );

  runExplorationStoreTests({ assert });
});

await test("Graph adapter test module covers canvas view model layout", () => {
  const { runGraphAdapterTests } = loadSourceModule(
    "src/components/canvas/graphAdapter.test.ts",
  );

  runGraphAdapterTests({ assert });
});

await test("Prompt run creates response node and artifact suggestions", () => {
  const {
    completeRunSuccess,
    createPromptRun,
    createSession,
    getSelectedNode,
    promoteArtifactSuggestion,
  } = loadSourceModule("src/domain/exploration.ts");
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
  const suggestionId = selected.suggestions[0].id;
  const promoted = promoteArtifactSuggestion(completed, suggestionId, 4_000);

  assert(completed.nodes.length === 2, "Expected prompt plus response nodes");
  assert(completed.edges.length === 1, "Expected provider edge");
  assert(selected.kind === "response", "Expected response selected");
  assert(selected.suggestions.length > 0, "Expected artifact suggestions");
  assert(
    promoted.nodes.some((node) => node.kind === "artifact"),
    "Expected promoted artifact node",
  );
});

await test("Topic run branches from selected response context", () => {
  const { completeRunSuccess, createPromptRun, createSession, createTopicRun } =
    loadSourceModule("src/domain/exploration.ts");
  const session = createSession(10);
  const promptRun = createPromptRun(session, {
    prompt: "Initial question",
    routeId: "mock/wabbit-local",
    now: 20,
  });
  const completed = completeRunSuccess(promptRun.session, {
    sourceNodeId: promptRun.sourceNodeId,
    prompt: "Initial question",
    now: 30,
    response: {
      text: "## Follow-up topic\n\nDetails",
      provider: "mock",
      routeId: "mock/wabbit-local",
      model: "mock/wabbit-local",
    },
  });
  const responseNode = completed.nodes.find((node) => node.kind === "response");
  const topicRun = createTopicRun(completed, {
    prompt: "Follow-up topic",
    topic: "Follow-up topic",
    routeId: "mock/wabbit-local",
    parentResponseNodeId: responseNode.id,
    parentQuery: "Initial question",
    now: 40,
  });

  assert(topicRun.session.nodes.length === 3, "Expected topic prompt node");
  assert(
    topicRun.session.edges.some(
      (edge) => edge.source === responseNode.id && edge.label === "explore",
    ),
    "Expected explore edge from response",
  );
});

await test("Run request validation blocks unknown routes and oversized prompts", () => {
  const { buildProviderPrompt, parseRunRequest } = loadSourceModule(
    "src/server/ai/runRequest.ts",
  );
  const request = parseRunRequest({
    mode: "topic",
    prompt: "Follow-up angle",
    topic: "Follow-up angle",
    routeId: "mock/wabbit-local",
    parentQuery: "Original query",
    parentContext: "Previous response",
  });
  const providerPrompt = buildProviderPrompt(request);

  assert(
    providerPrompt.includes("Focused topic: Follow-up angle"),
    "Expected topic prompt composition",
  );
  assertThrows(
    () =>
      parseRunRequest({
        mode: "prompt",
        prompt: "x",
        routeId: "unknown",
      }),
    "Unknown model route",
  );
  assertThrows(
    () =>
      parseRunRequest({
        mode: "prompt",
        prompt: "x".repeat(8_001),
        routeId: "mock/wabbit-local",
      }),
    "Too big",
  );
});

await test("Local persistence round-trips and rejects invalid sessions", () => {
  const { createSession } = loadSourceModule("src/domain/exploration.ts");
  const { clearSession, createMemoryStorage, loadSession, saveSession } =
    loadSourceModule("src/lib/explorationStore.ts");
  const session = createSession(100);
  const storage = createMemoryStorage();

  saveSession(session, storage);
  assert(loadSession(storage).id === session.id, "Expected saved session");
  storage.setItem("wabbit.exploration.session.v1", "{bad json");
  assert(
    loadSession(storage).id !== session.id,
    "Expected invalid JSON fallback",
  );
  assert(clearSession(storage).nodes.length === 0, "Expected clear fallback");
});

await test("Graph adapter produces deterministic depth-based layout", () => {
  const { completeRunSuccess, createPromptRun, createSession } =
    loadSourceModule("src/domain/exploration.ts");
  const { sessionToFlowGraph } = loadSourceModule(
    "src/components/canvas/graphAdapter.ts",
  );
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
    "Expected depth",
  );
});

for (const result of testResults) {
  if (result.status === "PASS") {
    process.stdout.write(`PASS ${result.name}\n`);
  } else {
    process.stderr.write(`FAIL ${result.name}: ${result.error}\n`);
  }
}

const failureCount = testResults.filter(
  (result) => result.status === "FAIL",
).length;
if (failureCount > 0) {
  process.exit(1);
}
