export declare function variablesFromPathToNode(resolvedPath: string): Record<string, string>;
export type TVariable = {
    name: string;
    value: string;
};
export declare function segmentToVariable(part: string): TVariable | undefined;
export declare function segmentToPartialVariable(part: string): TVariable | null;
export declare function variableToSegment(variable: TVariable): string;
