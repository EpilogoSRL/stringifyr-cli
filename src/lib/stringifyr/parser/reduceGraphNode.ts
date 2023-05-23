import { segmentToVariable } from "./string/variablesFromPathToNode";

type TReduceGraphNode<T, X> = {
  nodes: T[];
  nodeToSegment: (s: T) => string;
  nodeToChildren: (s: T) => T[];
  nodeToValue: (s: T) => X;
}

type TResult<T, X> = {
  [K: string]: TResult<T, X> | X
}

export function reduceGraphNode<T, X>({
                                        nodes,
                                        nodeToSegment,
                                        nodeToChildren,
                                        nodeToValue
                                      }: TReduceGraphNode<T, X>) {
  const current = {} as TResult<T, X>;

  for (const node of nodes) {
    const segment = nodeToSegment(node);
    const variable = segmentToVariable(segment);
    const key = variable?.value ?? segment;

    const children = nodeToChildren(node);
    const value = children.length > 0
      ? reduceGraphNode({
        nodes: children,
        nodeToSegment,
        nodeToChildren,
        nodeToValue,
      })
      : nodeToValue(node);

    current[key] = value;
  }

  return current;
}
