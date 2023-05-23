import { parseResolvedPath } from "./parseResolvedPath";

export function templateFromPathToNode(resolvedPath: string): string {
  const parts = parseResolvedPath(resolvedPath);
  return parts?.map((part) => {
    if (part.variable) {
      return `{${part.variable.name}}`
    }

    return part.segmentPath;
  })
    .join('.')
}
