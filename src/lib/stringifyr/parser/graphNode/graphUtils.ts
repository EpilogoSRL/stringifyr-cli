import * as _ from "lodash";
import * as fp from "lodash/fp";
import { TGraphNode } from "./makeInternalGraphNode";
import { splitResolvedPath } from "../string/splitResolvedPath";
import { maybeJoinFirst } from "../maybeJoinFirst";

export function resolvedPathToDottedPath(
  node: TGraphNode<any> | undefined,
  resolvedPath: string,
) {
  return resolvedSegmentsToDottedPath(node, splitResolvedPath(resolvedPath))
}

export function resolvedSegmentsToDottedPath(
  node: TGraphNode<any> | undefined,
  pathSegments: string[],
): string | undefined {

  if (!node) {
    return undefined;
  }

  const [first, ...other] = pathSegments;

  if (first != node.segmentPath) {

    for (const child of node.children) {
      const path = resolvedSegmentsToDottedPath(child, other);
      if (path) {
        return `${node.segmentPath}.${path}`
      }
    }

  }

  return undefined;
}

type TMutateGraphSegment<T, V> = {
  node: TGraphNode<T>,
  pathToNode: string;
  updatedSegmentPath: string;
  updateNodeValue: (t: T, mutatedPathToNode: string) => V;
}

export function mutateGraphSegment<T, V>({
                                           node,
                                           pathToNode,
                                           updatedSegmentPath,
                                           updateNodeValue
                                         }: TMutateGraphSegment<T, V>): TGraphNode<V> {
  const dottedPathToNode = resolvedPathToDottedPath(node, pathToNode);

  const parts = splitResolvedPath(pathToNode);
  parts.pop();
  const updatedPathToNode = maybeJoinFirst('.', parts.join('.'), updatedSegmentPath);

  const updatedNode: TGraphNode<T> = {
    ..._.get(node, dottedPathToNode),
    value: updateNodeValue(_.get(node, `${dottedPathToNode}.value`), updatedPathToNode),
    segmentPath: updatedSegmentPath,
    children: node.children.map((child) => {
      return mutateGraphSegment({
        node: child,
        pathToNode: maybeJoinFirst('.', updatedPathToNode, child.segmentPath),
        updatedSegmentPath: child.segmentPath,
        updateNodeValue
      })
    })
  };

  const root = fp.set(dottedPathToNode, updatedNode, node);

  // @ts-ignore
  return root;
}

export function flattenToValues<T>(node: TGraphNode<T>) {
  const result = [] as T[];

  if (node.value) {
    result.push(node.value);
  }

  for (const child of node.children) {
    const flatChildren = flattenToValues(child);
    for (const childValue of flatChildren) {
      result.push(childValue);
    }
  }

  return result;
}
