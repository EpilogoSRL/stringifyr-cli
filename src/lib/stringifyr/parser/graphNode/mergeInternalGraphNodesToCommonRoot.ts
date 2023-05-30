import { makeInternalGraphNode, TGraphNode } from "./makeInternalGraphNode";
import { mergeInternalGraphNodes } from "./mergeInternalGraphNodes";
import { createGraphNodeRoot } from "./createGraphNodeRoot";

export function mergeInternalGraphNodesToCommonRoot<T>(values: Record<string, T>): TGraphNode<T> {
  const internalGraphRoot: TGraphNode<T> = createGraphNodeRoot<T>();

  for (const resolvedPath in values) {
    const graphNode = makeInternalGraphNode(resolvedPath, values[resolvedPath]);

    const graphNodeWithRoot = createGraphNodeRoot([graphNode])
    const merged = mergeInternalGraphNodes(internalGraphRoot, graphNodeWithRoot);

    // both nodes have createRootGraphNode as a parent
    // so it's guaranteed there's only 1 node in the result [0]
    internalGraphRoot.children = merged[0].children;
  }

  return internalGraphRoot;
}

