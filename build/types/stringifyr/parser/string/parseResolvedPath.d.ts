import { TVariable } from "./variablesFromPathToNode";
export type TResolvedPathPart = {
    segmentPath: string;
    index: number;
    variable?: TVariable;
};
export declare function parseResolvedPath(resolvedPath: string): TResolvedPathPart[];
