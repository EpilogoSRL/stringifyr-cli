import * as _ from 'lodash';
import { splitResolvedPath } from "./string/splitResolvedPath";
import { segmentToVariable } from "./string/variablesFromPathToNode";

type TSelectGraphPath = {
  path: string;
  node: Record<string, any>;
}

export function selectGraphPath({
                                  path,
                                  node
                                }: TSelectGraphPath) {
  if (node == null) {
    return null;
  }

  const [first, ...rest] = splitResolvedPath(path);

  if (_.isEmpty(first)) {
    return node;
  }

  const variable = segmentToVariable(first);
  const variableValue = variable?.value;
  const isMultiValue = !!variable && _.isEmpty(variableValue);

  if (!isMultiValue) {
    const accessor = !!variableValue
      ? variableValue
      : first;
    return selectGraphPath({
      path: rest.join('.'),
      node: node[accessor]
    });
  }

  // Has a variable value
  const result = {} as Record<string, any>;

  for (const key of _.keys(node)) {
    result[key] = selectGraphPath({
      path: rest.join('.'),
      node: node[key]
    })
  }

  return result;
}
