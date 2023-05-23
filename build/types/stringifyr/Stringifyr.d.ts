import { IStorage } from "./storage/IStorage";
type TStringifyrParams = {
    apiKey: string;
    baseURL: string;
    fileSlug: string;
    storage: IStorage;
};
export declare class Stringifyr {
    private readonly params;
    private readonly api;
    private readonly persist;
    constructor(params: TStringifyrParams);
    node(template: string): Promise<any>;
    private fetchRootCached;
}
export {};
