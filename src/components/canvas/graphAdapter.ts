import type { Edge, Node } from "@xyflow/react";
import type {
  ExplorationEdge,
  ExplorationNode,
  ExplorationSession,
} from "../../domain/exploration";

export interface ExplorationNodeData extends Record<string, unknown> {
  node: ExplorationNode;
  selected: boolean;
}

const NODE_WIDTH = 260;
const COLUMN_GAP = 320;
const ROW_GAP = 150;

const getNodeDepth = (
  node: ExplorationNode,
  nodesById: Map<string, ExplorationNode>,
): number => {
  let depth = 0;
  let currentNode = node;

  while (currentNode.parentId) {
    const parentNode = nodesById.get(currentNode.parentId);
    if (!parentNode) {
      break;
    }

    depth += 1;
    currentNode = parentNode;
  }

  return depth;
};

export function sessionToFlowGraph(session: ExplorationSession): {
  nodes: Node<ExplorationNodeData>[];
  edges: Edge[];
} {
  const nodesById = new Map(
    session.nodes.map((node) => [node.id, node] as const),
  );
  const rowCounters = new Map<number, number>();
  const flowNodes = session.nodes.map((node) => {
    const depth = getNodeDepth(node, nodesById);
    const row = rowCounters.get(depth) ?? 0;
    rowCounters.set(depth, row + 1);

    return {
      id: node.id,
      type: "exploration",
      position: {
        x: depth * COLUMN_GAP,
        y: row * ROW_GAP,
      },
      style: {
        width: NODE_WIDTH,
      },
      data: {
        node,
        selected: session.selectedNodeId === node.id,
      },
    } satisfies Node<ExplorationNodeData>;
  });
  const flowEdges = session.edges.map((edge: ExplorationEdge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: edge.label === "explore",
    type: "smoothstep",
  }));

  return {
    nodes: flowNodes,
    edges: flowEdges,
  };
}
