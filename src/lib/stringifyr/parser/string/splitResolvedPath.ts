export function splitResolvedPath(
  resolvedPath: string,
): string[] {
  const regex = /\{([^\}]*)\}/g;
  const variableIndexes = [] as number[];
  let match;

  // Find all variable indexes
  while (match = regex.exec(resolvedPath)) {
    variableIndexes.push(match.index);
  }

  const splitString = [] as string[];
  let prevIndex = 0;

  // Split the string at "." and add to splitString array
  for (let i = 0; i < resolvedPath.length; i++) {
    if (resolvedPath[i] === "." && !variableIndexes.includes(i)) {
      splitString.push(resolvedPath.slice(prevIndex, i));
      prevIndex = i + 1;
    }
  }

  // Add the last segment to the splitString array
  splitString.push(resolvedPath.slice(prevIndex));

  return splitString;
}
