"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Boxes, CircleAlert, FileText, MessageSquareText } from "lucide-react";
import type { ReactElement } from "react";
import type { ExplorationNodeData } from "./graphAdapter";

const statusClassName = {
  idle: "border-border bg-card",
  running: "border-sky-400 bg-sky-950/40",
  complete: "border-emerald-500/60 bg-card",
  error: "border-destructive bg-destructive/10",
};

const iconByKind = {
  prompt: MessageSquareText,
  response: FileText,
  artifact: Boxes,
};

export function ExplorationFlowNode({ data }: NodeProps): ReactElement {
  const nodeData = data as ExplorationNodeData;
  const { node, selected } = nodeData;
  const Icon = node.status === "error" ? CircleAlert : iconByKind[node.kind];
  const selectedClassName = selected ? "ring-2 ring-primary" : "";

  return (
    <div
      className={`rounded-md border p-3 shadow-sm ${statusClassName[node.status]} ${selectedClassName}`}
    >
      <Handle type="target" position={Position.Left} />
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 flex-none text-primary" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {node.title}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {node.body}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span>{node.kind}</span>
        <span>{node.status}</span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
