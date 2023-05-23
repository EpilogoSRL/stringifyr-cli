export function templateToPathToNode(
  templatePath: string,
  variables: Record<string, string>
): string {
  const regex = /\{(\w+)\}/g;
  // @ts-ignore
  const resolvedString = templatePath
    .replace(regex, (match, p1) => `{${p1}=${variables[p1]}}`);
  return resolvedString;
}
