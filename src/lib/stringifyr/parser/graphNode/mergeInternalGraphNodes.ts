import * as _ from 'lodash';
import { TGraphNode } from "./makeInternalGraphNode";

export function mergeInternalGraphNodes<T>(
  _a: TGraphNode<T>,
  _b: TGraphNode<T> | undefined
): TGraphNode<T>[] {
  const a = _.cloneDeep(_a);
  const b = _b ? _.cloneDeep(_b) : undefined;

  if (!b || a.segmentPath != b.segmentPath) {
    // Different root nodes

    const result = [a]
    if (b) {
      result.push(b);
    }
    return result;
  }

  const merged: TGraphNode<T> = {
    ...a,
    children: []
  }

  const aChildren = _.keyBy(a.children, (child) => child.segmentPath);
  const bChildren = _.keyBy(b.children, (child) => child.segmentPath);
  const allKeys = _.uniq([
    ..._.keys(aChildren),
    ..._.keys(bChildren),
  ]);

  for (const childKey of allKeys) {
    const childA = aChildren[childKey] ?? bChildren[childKey];
    const childB = bChildren[childKey];
    if (_.isEqual(childA, childB)) {
      merged.children.push(childA)
      continue;
    }

    const mergedChildren = mergeInternalGraphNodes<T>(childA, childB);
    for (const mergedChild of mergedChildren) {
      merged.children.push(mergedChild)
    }
  }

  return [
    merged
  ]
}

