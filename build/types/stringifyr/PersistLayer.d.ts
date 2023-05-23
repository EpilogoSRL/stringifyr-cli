import { IStorage } from "./IStorage";
import { AsyncReturnType } from "../Types";
type TPersistLayerParams = {
    storage?: IStorage;
};
export declare class PersistLayer {
    private readonly storage?;
    private inMemory?;
    constructor(params: TPersistLayerParams);
    wrap<T extends (...any: any) => Promise<any>>(cacheKey: string, call: T): Promise<AsyncReturnType<T>>;
}
export {};
