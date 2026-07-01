"use client";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type NodeMouseHandler,
} from "@xyflow/react";
import { useMemo } from "react";
import type { ReactElement } from "react";
import type { ExplorationSession } from "../../domain/exploration";
import { ExplorationFlowNode } from "./ExplorationNode";
import { sessionToFlowGraph } from "./graphAdapter";

const nodeTypes = {
  exploration: ExplorationFlowNode,
};

interface ExplorationCanvasProps {
  session: ExplorationSession;
  onSelectNode: (nodeId: string) => void;
}

export function ExplorationCanvas({
  session,
  onSelectNode,
}: ExplorationCanvasProps): ReactElement {
  const graph = useMemo(() => sessionToFlowGraph(session), [session]);
  const handleNodeClick: NodeMouseHandler = (_event, node) => {
    onSelectNode(node.id);
  };

  if (session.nodes.length === 0) {
    return (
      <div className="flex h-full min-h-[360px] items-center justify-center rounded-md border border-dashed border-border bg-muted/20 p-8 text-center">
        <div>
          <p className="text-sm font-medium text-foreground">
            Start with a prompt
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Results will appear as a graph with prompts, responses, and promoted
            artifacts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[520px] overflow-hidden rounded-md border border-border bg-background">
      <ReactFlow
        nodes={graph.nodes}
        edges={graph.edges}
        nodeTypes={nodeTypes}
        fitView
        onNodeClick={handleNodeClick}
      >
        <Background />
        <Controls />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  );
}
