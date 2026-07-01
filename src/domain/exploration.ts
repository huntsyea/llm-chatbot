export type ProviderId = "mock" | "gateway";

export type ModelProviderGroup = "local" | "gateway";

export type RunMode = "prompt" | "topic";

export type RunStatus = "idle" | "running" | "complete" | "error";

export type ExplorationNodeKind = "prompt" | "response" | "artifact";

export type ArtifactKind = "concept" | "entity" | "question";

export interface ModelRoute {
  id: string;
  label: string;
  provider: ProviderId;
  providerGroup: ModelProviderGroup;
  model: string;
  description: string;
  available: boolean;
  isDefault?: boolean;
}

export interface ProviderState {
  routeId: string;
  status: RunStatus;
  lastError?: string;
  updatedAt: number;
}

export interface ExplorationResponse {
  text: string;
  provider: ProviderId;
  routeId: string;
  model: string;
  latencyMs?: number;
  metadata?: Record<string, unknown>;
}

export interface ArtifactSuggestion {
  id: string;
  kind: ArtifactKind;
  label: string;
  sourceNodeId: string;
  confidence: number;
}

export interface ExplorationNode {
  id: string;
  kind: ExplorationNodeKind;
  title: string;
  body: string;
  routeId?: string;
  status: RunStatus;
  parentId?: string;
  createdAt: number;
  response?: ExplorationResponse;
  artifactKind?: ArtifactKind;
  artifactSourceNodeId?: string;
  artifactPromoted?: boolean;
  suggestions?: ArtifactSuggestion[];
}

export interface ExplorationEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ExplorationSession {
  id: string;
  title: string;
  nodes: ExplorationNode[];
  edges: ExplorationEdge[];
  selectedNodeId?: string;
  providerStates: Record<string, ProviderState>;
  createdAt: number;
  updatedAt: number;
}

export interface RunRequest {
  mode: RunMode;
  prompt: string;
  routeId: string;
  parentNodeId?: string;
  parentQuery?: string;
  parentContext?: string;
  topic?: string;
}

export interface RunResult {
  response: ExplorationResponse;
  prompt: string;
}

export interface PromptRunInput {
  prompt: string;
  routeId: string;
  now?: number;
}

export interface TopicRunInput extends PromptRunInput {
  topic: string;
  parentResponseNodeId: string;
  parentQuery: string;
}

export interface CompleteRunInput {
  sourceNodeId: string;
  prompt: string;
  response: ExplorationResponse;
  now?: number;
}

export interface CompleteRunErrorInput {
  sourceNodeId: string;
  prompt: string;
  routeId: string;
  message: string;
  now?: number;
}

export const DEFAULT_SESSION_TITLE = "Exploration workspace";

const MAX_TITLE_LENGTH = 72;

const createId = (prefix: string, now: number): string =>
  `${prefix}-${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const trimTitle = (value: string): string => {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= MAX_TITLE_LENGTH) {
    return compact || DEFAULT_SESSION_TITLE;
  }

  return `${compact.slice(0, MAX_TITLE_LENGTH - 1).trim()}...`;
};

const cloneSession = (session: ExplorationSession): ExplorationSession => ({
  ...session,
  nodes: session.nodes.map((node) => ({
    ...node,
    response: node.response ? { ...node.response } : undefined,
    suggestions: node.suggestions
      ? node.suggestions.map((suggestion) => ({ ...suggestion }))
      : undefined,
  })),
  edges: session.edges.map((edge) => ({ ...edge })),
  providerStates: Object.fromEntries(
    Object.entries(session.providerStates).map(([key, value]) => [
      key,
      { ...value },
    ]),
  ),
});

export function createSession(now = Date.now()): ExplorationSession {
  const id = createId("session", now);

  return {
    id,
    title: DEFAULT_SESSION_TITLE,
    nodes: [],
    edges: [],
    providerStates: {},
    createdAt: now,
    updatedAt: now,
  };
}

export function createPromptRun(
  session: ExplorationSession,
  input: PromptRunInput,
): { session: ExplorationSession; sourceNodeId: string } {
  const now = input.now ?? Date.now();
  const prompt = input.prompt.trim();

  if (!prompt) {
    throw new Error("Prompt is required");
  }

  const sourceNodeId = createId("prompt", now);
  const nextSession = cloneSession(session);
  const promptNode: ExplorationNode = {
    id: sourceNodeId,
    kind: "prompt",
    title: trimTitle(prompt),
    body: prompt,
    routeId: input.routeId,
    status: "running",
    createdAt: now,
  };

  nextSession.nodes.push(promptNode);
  nextSession.selectedNodeId = sourceNodeId;
  nextSession.title =
    nextSession.nodes.length === 1 ? trimTitle(prompt) : nextSession.title;
  nextSession.updatedAt = now;
  nextSession.providerStates[input.routeId] = {
    routeId: input.routeId,
    status: "running",
    updatedAt: now,
  };

  return { session: nextSession, sourceNodeId };
}

export function createTopicRun(
  session: ExplorationSession,
  input: TopicRunInput,
): { session: ExplorationSession; sourceNodeId: string } {
  const now = input.now ?? Date.now();
  const topic = input.topic.trim();

  if (!topic) {
    throw new Error("Topic is required");
  }

  const sourceNodeId = createId("topic", now);
  const nextSession = cloneSession(session);
  const promptNode: ExplorationNode = {
    id: sourceNodeId,
    kind: "prompt",
    title: trimTitle(topic),
    body: [
      `Topic: ${topic}`,
      "",
      `Previous query: ${input.parentQuery.trim()}`,
    ].join("\n"),
    routeId: input.routeId,
    status: "running",
    parentId: input.parentResponseNodeId,
    createdAt: now,
  };

  nextSession.nodes.push(promptNode);
  nextSession.edges.push({
    id: createId("edge", now),
    source: input.parentResponseNodeId,
    target: sourceNodeId,
    label: "explore",
  });
  nextSession.selectedNodeId = sourceNodeId;
  nextSession.updatedAt = now;
  nextSession.providerStates[input.routeId] = {
    routeId: input.routeId,
    status: "running",
    updatedAt: now,
  };

  return { session: nextSession, sourceNodeId };
}

export function completeRunSuccess(
  session: ExplorationSession,
  input: CompleteRunInput,
): ExplorationSession {
  const now = input.now ?? Date.now();
  const nextSession = cloneSession(session);
  const sourceNode = nextSession.nodes.find(
    (node) => node.id === input.sourceNodeId,
  );

  if (!sourceNode) {
    throw new Error(`Source node ${input.sourceNodeId} was not found`);
  }

  const responseNodeId = createId("response", now);
  const suggestions = extractArtifactSuggestions(
    input.response.text,
    responseNodeId,
  );
  const responseNode: ExplorationNode = {
    id: responseNodeId,
    kind: "response",
    title: trimTitle(input.prompt),
    body: input.response.text,
    routeId: input.response.routeId,
    status: "complete",
    parentId: input.sourceNodeId,
    createdAt: now,
    response: input.response,
    suggestions,
  };

  sourceNode.status = "complete";
  nextSession.nodes.push(responseNode);
  nextSession.edges.push({
    id: createId("edge", now),
    source: input.sourceNodeId,
    target: responseNodeId,
    label: input.response.provider,
  });
  nextSession.providerStates[input.response.routeId] = {
    routeId: input.response.routeId,
    status: "complete",
    updatedAt: now,
  };
  nextSession.selectedNodeId = responseNodeId;
  nextSession.updatedAt = now;

  return nextSession;
}

export function completeRunError(
  session: ExplorationSession,
  input: CompleteRunErrorInput,
): ExplorationSession {
  const now = input.now ?? Date.now();
  const nextSession = cloneSession(session);
  const sourceNode = nextSession.nodes.find(
    (node) => node.id === input.sourceNodeId,
  );

  if (!sourceNode) {
    throw new Error(`Source node ${input.sourceNodeId} was not found`);
  }

  const errorNodeId = createId("error", now);
  sourceNode.status = "error";
  nextSession.nodes.push({
    id: errorNodeId,
    kind: "response",
    title: "Provider error",
    body: input.message,
    routeId: input.routeId,
    status: "error",
    parentId: input.sourceNodeId,
    createdAt: now,
  });
  nextSession.edges.push({
    id: createId("edge", now),
    source: input.sourceNodeId,
    target: errorNodeId,
    label: "error",
  });
  nextSession.providerStates[input.routeId] = {
    routeId: input.routeId,
    status: "error",
    lastError: input.message,
    updatedAt: now,
  };
  nextSession.selectedNodeId = errorNodeId;
  nextSession.updatedAt = now;

  return nextSession;
}

export function promoteArtifactSuggestion(
  session: ExplorationSession,
  suggestionId: string,
  now = Date.now(),
): ExplorationSession {
  const nextSession = cloneSession(session);
  const sourceNode = nextSession.nodes.find((node) =>
    node.suggestions?.some((suggestion) => suggestion.id === suggestionId),
  );
  const suggestion = sourceNode?.suggestions?.find(
    (candidate) => candidate.id === suggestionId,
  );

  if (!sourceNode || !suggestion) {
    return nextSession;
  }

  const existingArtifact = nextSession.nodes.find(
    (node) =>
      node.kind === "artifact" &&
      node.artifactSourceNodeId === suggestion.sourceNodeId &&
      node.title === suggestion.label,
  );

  if (existingArtifact) {
    nextSession.selectedNodeId = existingArtifact.id;
    nextSession.updatedAt = now;
    return nextSession;
  }

  const artifactNodeId = createId("artifact", now);
  nextSession.nodes.push({
    id: artifactNodeId,
    kind: "artifact",
    title: suggestion.label,
    body: `Promoted ${suggestion.kind} from response.`,
    routeId: sourceNode.routeId,
    status: "complete",
    parentId: suggestion.sourceNodeId,
    createdAt: now,
    artifactKind: suggestion.kind,
    artifactSourceNodeId: suggestion.sourceNodeId,
    artifactPromoted: true,
  });
  nextSession.edges.push({
    id: createId("edge", now),
    source: suggestion.sourceNodeId,
    target: artifactNodeId,
    label: suggestion.kind,
  });
  nextSession.selectedNodeId = artifactNodeId;
  nextSession.updatedAt = now;

  return nextSession;
}

export function selectNode(
  session: ExplorationSession,
  nodeId: string,
  now = Date.now(),
): ExplorationSession {
  if (!session.nodes.some((node) => node.id === nodeId)) {
    return session;
  }

  return {
    ...session,
    selectedNodeId: nodeId,
    updatedAt: now,
  };
}

export function getSelectedNode(
  session: ExplorationSession,
): ExplorationNode | undefined {
  return session.nodes.find((node) => node.id === session.selectedNodeId);
}

export function extractArtifactSuggestions(
  content: string,
  sourceNodeId: string,
): ArtifactSuggestion[] {
  const suggestions: ArtifactSuggestion[] = [];
  const seen = new Set<string>();

  const addSuggestion = (
    kind: ArtifactKind,
    label: string,
    confidence = 0.72,
  ) => {
    const normalizedLabel = label.replace(/[`*_#:[\]]/g, "").trim();
    if (normalizedLabel.length < 3 || normalizedLabel.length > 80) {
      return;
    }

    const key = `${kind}:${normalizedLabel.toLowerCase()}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    suggestions.push({
      id: `${sourceNodeId}-${kind}-${suggestions.length + 1}`,
      kind,
      label: normalizedLabel,
      sourceNodeId,
      confidence,
    });
  };

  const headingMatches = content.matchAll(/^#{2,3}\s+(.+)$/gm);
  for (const match of headingMatches) {
    addSuggestion("question", match[1], 0.82);
  }

  const listMatches = content.matchAll(
    /^\s*[-*]\s+([A-Z][A-Za-z0-9 /-]{2,})$/gm,
  );
  for (const match of listMatches) {
    addSuggestion("concept", match[1], 0.76);
  }

  const entityMatches = content.matchAll(
    /\b([A-Z][A-Za-z0-9]+(?:\s+[A-Z][A-Za-z0-9]+){1,3})\b/g,
  );
  for (const match of entityMatches) {
    addSuggestion("entity", match[1], 0.64);
    if (suggestions.length >= 8) {
      break;
    }
  }

  return suggestions.slice(0, 8);
}
