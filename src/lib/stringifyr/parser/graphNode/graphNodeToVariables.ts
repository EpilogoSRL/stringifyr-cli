import * as _ from 'lodash';
import { TGraphNode } from "./makeInternalGraphNode";
import { variablesFromPathToNode } from "../string/variablesFromPathToNode";

export function graphNodeToVariables<T>(node: TGraphNode<T>) {
  const result = {} as Record<string, Record<string, string>>;

  const nodeVariables = variablesFromPathToNode(node.segmentPath)

  for (const variableName in nodeVariables) {
    if (result[variableName] == null) {
      result[variableName] = {}
    }

    const variableValue = nodeVariables[variableName];
    result[variableName][variableValue] = variableValue;
  }

  for (const childKey in node.children) {
    const childResult = graphNodeToVariables(node.children[childKey]);
    _.merge(result, childResult)
  }

  return result;
}
