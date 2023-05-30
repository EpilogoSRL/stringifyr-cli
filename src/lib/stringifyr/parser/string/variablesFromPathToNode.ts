import { splitResolvedPath } from "./splitResolvedPath";

export function variablesFromPathToNode(resolvedPath: string): Record<string, string> {
  const variables: Record<string, string> = {};
  const parts = splitResolvedPath(resolvedPath);
  if (!parts) {
    return variables;
  }
  for (const part of parts) {
    const variable = segmentToVariable(part);
    if (!variable) {
      continue;
    }
    variables[variable.name] = variable.value;
  }
  return variables;
}

export type TVariable = {
  name: string;
  value: string;
}

export function segmentToVariable(part: string): TVariable | undefined {
  const maybeEql = part.startsWith('{') && part.endsWith('}') && !part.includes('=') ? `${part.substring(0, part.length - 1)}=}` : part;
  const match = maybeEql.match(/^\{(.+?)=(.*?)\}$/);
  if (!match) {
    return undefined
  }

  const [_, name, value] = match;
  return {
    name,
    value
  }
}

export function segmentToPartialVariable(part: string): TVariable | null {
  const varMatchers = [
    /^\{([a-zA-Z][A-Za-z0-9]*)=([a-zA-Z0-9][A-Za-z0-9\-_]*)}$/,
    /^\{([a-zA-Z][A-Za-z0-9]*)=([a-zA-Z0-9][A-Za-z0-9\-_]*)$/,
    /^\{([a-zA-Z][A-Za-z0-9]*)=([a-zA-Z0-9])$/,
    /^\{([a-zA-Z][A-Za-z0-9]*)=$/,
    /^\{([a-zA-Z][A-Za-z0-9]*)$/,
    /^\{([a-zA-Z])$/,
    /^\{$/,
  ];

  for (const m of varMatchers) {
    const match = part.match(m);
    if (match) {
      const [_, name, value] = match;
      return {
        name,
        value
      }
    }
  }

  return null;
}

export function variableToSegment(variable: TVariable): string {
  return `{${variable.name}=${variable.value}}`;
}
