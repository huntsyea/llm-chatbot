"use client";

import { Boxes, CircleAlert, FileText, MessageSquareText } from "lucide-react";
import type { ReactElement } from "react";
import type {
  ExplorationNode,
  ExplorationSession,
} from "../domain/exploration";

const iconByKind = {
  prompt: MessageSquareText,
  response: FileText,
  artifact: Boxes,
};

const getIcon = (node: ExplorationNode) =>
  node.status === "error" ? CircleAlert : iconByKind[node.kind];

interface SessionTrailProps {
  session: ExplorationSession;
  onSelectNode: (nodeId: string) => void;
}

export function SessionTrail({
  session,
  onSelectNode,
}: SessionTrailProps): ReactElement {
  return (
    <aside className="flex min-h-0 flex-col border-r border-border bg-card/70">
      <div className="border-b border-border p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Trail
        </p>
        <h2 className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">
          {session.title}
        </h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {session.nodes.length === 0 ? (
          <p className="p-2 text-sm text-muted-foreground">
            No exploration runs yet.
          </p>
        ) : (
          <ol className="space-y-1">
            {session.nodes.map((node) => {
              const Icon = getIcon(node);
              const isSelected = session.selectedNodeId === node.id;

              return (
                <li key={node.id}>
                  <button
                    type="button"
                    onClick={() => onSelectNode(node.id)}
                    className={`flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm transition ${
                      isSelected
                        ? "bg-primary/15 text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="mt-0.5 h-4 w-4 flex-none" />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {node.title}
                      </span>
                      <span className="block text-xs">{node.status}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </aside>
  );
}
