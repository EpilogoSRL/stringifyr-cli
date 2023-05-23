import { splitResolvedPath } from "../string/splitResolvedPath";

export type TGraphNode<T> = {
  segmentPath: string;
  value?: T;
  children: TGraphNode<T>[];
}

export function makeInternalGraphNode<T>(
  resolvedPath: string,
  value: T,
): TGraphNode<T> {
  const [first, ...postfixOfParent] = splitResolvedPath(resolvedPath);

  const root: TGraphNode<T> = {
    segmentPath: first,
    children: []
  }

  if (postfixOfParent.length <= 0) {
    root.value = value;
  } else {
    const childNode = makeInternalGraphNode(
      postfixOfParent.join('.'),
      value,
    )

    root.children.push(childNode)
  }

  return root;
}
