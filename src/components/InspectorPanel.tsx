"use client";

import { Plus, RotateCw } from "lucide-react";
import type { ReactElement } from "react";
import type { ExplorationNode } from "../domain/exploration";
import EnhancedMarkdown from "./markdown/EnhancedMarkdown";

interface InspectorPanelProps {
  node?: ExplorationNode;
  isRunning: boolean;
  onFollowHeading: (responseNodeId: string, heading: string) => Promise<void>;
  onPromoteSuggestion: (suggestionId: string) => void;
}

export function InspectorPanel({
  node,
  isRunning,
  onFollowHeading,
  onPromoteSuggestion,
}: InspectorPanelProps): ReactElement {
  if (!node) {
    return (
      <aside className="flex min-h-0 flex-col border-l border-border bg-card/70 p-4">
        <p className="text-sm font-medium text-foreground">Inspector</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Select a node to inspect prompts, responses, and artifacts.
        </p>
      </aside>
    );
  }

  const handleElementClick = (element: string, text: string) => {
    if (element === "heading" && node.kind === "response" && !isRunning) {
      void onFollowHeading(node.id, text);
    }
  };

  return (
    <aside className="flex min-h-0 flex-col border-l border-border bg-card/70">
      <div className="border-b border-border p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Inspector
        </p>
        <h2 className="mt-1 text-sm font-semibold text-foreground">
          {node.title}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded border border-border px-2 py-1">
            {node.kind}
          </span>
          <span className="rounded border border-border px-2 py-1">
            {node.status}
          </span>
          {node.routeId ? (
            <span className="rounded border border-border px-2 py-1">
              {node.routeId}
            </span>
          ) : null}
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        {node.status === "running" ? (
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            <RotateCw className="h-4 w-4 animate-spin" />
            Running provider request
          </div>
        ) : null}
        {node.kind === "response" ? (
          <EnhancedMarkdown
            content={node.body}
            onElementClick={handleElementClick}
            className="markdown-content text-sm"
          />
        ) : (
          <pre className="whitespace-pre-wrap rounded-md border border-border bg-background p-3 text-sm text-foreground">
            {node.body}
          </pre>
        )}
        {node.response ? (
          <section className="rounded-md border border-border p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Provider
            </p>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <dt className="text-muted-foreground">Route</dt>
              <dd className="text-right text-foreground">
                {node.response.routeId}
              </dd>
              <dt className="text-muted-foreground">Model</dt>
              <dd className="text-right text-foreground">
                {node.response.model}
              </dd>
              <dt className="text-muted-foreground">Latency</dt>
              <dd className="text-right text-foreground">
                {node.response.latencyMs ?? 0}ms
              </dd>
            </dl>
          </section>
        ) : null}
        {node.suggestions?.length ? (
          <section>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Artifact Suggestions
            </p>
            <div className="mt-2 space-y-2">
              {node.suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => onPromoteSuggestion(suggestion.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-left text-sm transition hover:border-primary"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-foreground">
                      {suggestion.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {suggestion.kind}
                    </span>
                  </span>
                  <Plus className="h-4 w-4 flex-none text-primary" />
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </aside>
  );
}
