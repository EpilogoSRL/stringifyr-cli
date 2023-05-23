import { splitResolvedPath } from "./splitResolvedPath";
import { segmentToVariable, TVariable } from "./variablesFromPathToNode";

export type TResolvedPathPart = {
  segmentPath: string;
  index: number;
  variable?: TVariable;
}

export function parseResolvedPath(
  resolvedPath: string,
): TResolvedPathPart[] {
  const parts = splitResolvedPath(resolvedPath);
  return parts.map((segmentPath, index) => {
    const part: TResolvedPathPart = {
      segmentPath,
      index,
    }

    part.variable = segmentToVariable(segmentPath);

    return part;
  })
}
