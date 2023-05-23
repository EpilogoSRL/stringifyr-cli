type TReduceGraphNode<T, X> = {
    nodes: T[];
    nodeToSegment: (s: T) => string;
    nodeToChildren: (s: T) => T[];
    nodeToValue: (s: T) => X;
};
type TResult<T, X> = {
    [K: string]: TResult<T, X> | X;
};
export declare function reduceGraphNode<T, X>({ nodes, nodeToSegment, nodeToChildren, nodeToValue }: TReduceGraphNode<T, X>): TResult<T, X>;
export {};
