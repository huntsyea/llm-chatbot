"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  clearSession,
  loadSession,
  saveSession,
} from "../lib/explorationStore";
import {
  completeRunError,
  completeRunSuccess,
  createPromptRun,
  createSession,
  createTopicRun,
  getSelectedNode,
  promoteArtifactSuggestion,
  selectNode,
  type ExplorationNode,
  type ExplorationSession,
  type RunResult,
} from "../domain/exploration";
import { getDefaultModelRoute, getPublicModelRoutes } from "../lib/models";

interface ApiRunResponse {
  ok: boolean;
  result?: RunResult;
  error?: string;
}

export interface ExplorationWorkspaceState {
  session: ExplorationSession;
  selectedNode?: ExplorationNode;
  routeId: string;
  routes: ReturnType<typeof getPublicModelRoutes>;
  isRunning: boolean;
  lastError?: string;
  setRouteId: (routeId: string) => void;
  submitPrompt: (prompt: string) => Promise<void>;
  followHeading: (responseNodeId: string, heading: string) => Promise<void>;
  promoteSuggestion: (suggestionId: string) => void;
  selectNode: (nodeId: string) => void;
  newSession: () => void;
}

const readApiJson = async (response: Response): Promise<ApiRunResponse> => {
  const body = (await response.json()) as ApiRunResponse;

  if (!response.ok || !body.ok) {
    return {
      ok: false,
      error: body.error ?? `Request failed with status ${response.status}`,
    };
  }

  return body;
};

export function useExplorationWorkspace(): ExplorationWorkspaceState {
  const routes = useMemo(() => getPublicModelRoutes(), []);
  const defaultRouteId = getDefaultModelRoute().id;
  const [session, setSessionState] = useState<ExplorationSession>(() =>
    createSession(),
  );
  const [routeId, setRouteId] = useState(defaultRouteId);
  const [isRunning, setIsRunning] = useState(false);
  const [lastError, setLastError] = useState<string>();
  const sessionRef = useRef(session);

  const setSession = useCallback((nextSession: ExplorationSession) => {
    sessionRef.current = nextSession;
    setSessionState(nextSession);
    saveSession(nextSession);
  }, []);

  useEffect(() => {
    const restoredSession = loadSession();
    sessionRef.current = restoredSession;
    setSessionState(restoredSession);
  }, []);

  const submitPrompt = useCallback(
    async (prompt: string) => {
      const trimmedPrompt = prompt.trim();

      if (!trimmedPrompt || isRunning) {
        return;
      }

      setIsRunning(true);
      setLastError(undefined);

      const optimisticRun = createPromptRun(sessionRef.current, {
        prompt: trimmedPrompt,
        routeId,
      });
      setSession(optimisticRun.session);

      try {
        const response = await fetch("/api/ai/run", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode: "prompt",
            prompt: trimmedPrompt,
            routeId,
          }),
        });
        const body = await readApiJson(response);

        if (!body.ok || !body.result) {
          throw new Error(body.error ?? "Provider request failed");
        }

        setSession(
          completeRunSuccess(sessionRef.current, {
            sourceNodeId: optimisticRun.sourceNodeId,
            prompt: body.result.prompt,
            response: body.result.response,
          }),
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Provider request failed";
        setLastError(message);
        setSession(
          completeRunError(sessionRef.current, {
            sourceNodeId: optimisticRun.sourceNodeId,
            prompt: trimmedPrompt,
            routeId,
            message,
          }),
        );
      } finally {
        setIsRunning(false);
      }
    },
    [isRunning, routeId, setSession],
  );

  const followHeading = useCallback(
    async (responseNodeId: string, heading: string) => {
      const parentNode = sessionRef.current.nodes.find(
        (node) => node.id === responseNodeId,
      );
      const parentPrompt = parentNode?.parentId
        ? sessionRef.current.nodes.find(
            (node) => node.id === parentNode.parentId,
          )
        : undefined;

      if (!parentNode || isRunning) {
        return;
      }

      setIsRunning(true);
      setLastError(undefined);

      const optimisticRun = createTopicRun(sessionRef.current, {
        prompt: heading,
        topic: heading,
        routeId,
        parentResponseNodeId: responseNodeId,
        parentQuery: parentPrompt?.body ?? parentNode.title,
      });
      setSession(optimisticRun.session);

      try {
        const response = await fetch("/api/ai/run", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode: "topic",
            prompt: heading,
            topic: heading,
            routeId,
            parentNodeId: responseNodeId,
            parentQuery: parentPrompt?.body ?? parentNode.title,
            parentContext: parentNode.body.slice(0, 12_000),
          }),
        });
        const body = await readApiJson(response);

        if (!body.ok || !body.result) {
          throw new Error(body.error ?? "Provider request failed");
        }

        setSession(
          completeRunSuccess(sessionRef.current, {
            sourceNodeId: optimisticRun.sourceNodeId,
            prompt: body.result.prompt,
            response: body.result.response,
          }),
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Provider request failed";
        setLastError(message);
        setSession(
          completeRunError(sessionRef.current, {
            sourceNodeId: optimisticRun.sourceNodeId,
            prompt: heading,
            routeId,
            message,
          }),
        );
      } finally {
        setIsRunning(false);
      }
    },
    [isRunning, routeId, setSession],
  );

  const promoteSuggestion = useCallback(
    (suggestionId: string) => {
      setSession(promoteArtifactSuggestion(sessionRef.current, suggestionId));
    },
    [setSession],
  );

  const handleSelectNode = useCallback(
    (nodeId: string) => {
      setSession(selectNode(sessionRef.current, nodeId));
    },
    [setSession],
  );

  const newSession = useCallback(() => {
    const nextSession = clearSession();
    sessionRef.current = nextSession;
    setSessionState(nextSession);
    setLastError(undefined);
  }, []);

  return {
    session,
    selectedNode: getSelectedNode(session),
    routeId,
    routes,
    isRunning,
    lastError,
    setRouteId,
    submitPrompt,
    followHeading,
    promoteSuggestion,
    selectNode: handleSelectNode,
    newSession,
  };
}
