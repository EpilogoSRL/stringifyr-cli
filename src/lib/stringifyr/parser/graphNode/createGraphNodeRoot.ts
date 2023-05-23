import { TGraphNode } from "./makeInternalGraphNode";

export const GRAPH_NODE_ROOT_SEGMENT_PATH = '__root';

export function createGraphNodeRoot<T>(children: TGraphNode<T>[] = []): TGraphNode<T> {
  return {
    segmentPath: GRAPH_NODE_ROOT_SEGMENT_PATH,
    children: [
      ...children,
    ],
    value: undefined
  }
}
