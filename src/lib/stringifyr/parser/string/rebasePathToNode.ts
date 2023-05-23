import { templateToPathToNode } from "./templateToPathToNode";
import { templateFromPathToNode } from "./templateFromPathToNode";
import { variablesFromPathToNode } from "./variablesFromPathToNode";

export function rebasePathToNode(
  initialPathToNode: string,
  newPathToNode: string
): string {
  return templateToPathToNode(
    templateFromPathToNode(initialPathToNode),
    {
      ...variablesFromPathToNode(initialPathToNode),
      ...variablesFromPathToNode(newPathToNode)
    }
  )
}
