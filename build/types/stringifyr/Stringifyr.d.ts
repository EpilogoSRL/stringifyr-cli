import { TString } from "./Api";
import { IStorage } from "./IStorage";
export type TStringifyrParams = {
    apiKey: string;
    baseURL: string;
    defaultFileSlug: string;
    storage?: IStorage;
};
export type TLeafObject<T, X> = {
    [K: string]: TLeafObject<T, X> | X;
};
export declare class Stringifyr {
    static nodeValues(node: TLeafObject<string, TString>): TLeafObject<string, string>;
    private readonly params;
    private readonly api;
    private readonly persist;
    private lastRoot;
    private listeners;
    constructor(params: TStringifyrParams);
    addListener(event: 'load', cb: () => void): () => any;
    removeListener(event: 'load', cb: () => void): void;
    node(template: string): Promise<TString | null>;
    nodeSync(template: string): TString | null;
    private nodeSyncInternal;
    private fetchRootCached;
}
