import { TGraphNode } from "./makeInternalGraphNode";
export declare function resolvedPathToDottedPath(node: TGraphNode<any> | undefined, resolvedPath: string): string;
export declare function resolvedSegmentsToDottedPath(node: TGraphNode<any> | undefined, pathSegments: string[]): string | undefined;
type TMutateGraphSegment<T, V> = {
    node: TGraphNode<T>;
    pathToNode: string;
    updatedSegmentPath: string;
    updateNodeValue: (t: T, mutatedPathToNode: string) => V;
};
export declare function mutateGraphSegment<T, V>({ node, pathToNode, updatedSegmentPath, updateNodeValue }: TMutateGraphSegment<T, V>): TGraphNode<V>;
export declare function flattenToValues<T>(node: TGraphNode<T>): T[];
export {};
