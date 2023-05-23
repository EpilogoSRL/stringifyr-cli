export type TGraphNode<T> = {
    segmentPath: string;
    value?: T;
    children: TGraphNode<T>[];
};
export declare function makeInternalGraphNode<T>(resolvedPath: string, value: T): TGraphNode<T>;
