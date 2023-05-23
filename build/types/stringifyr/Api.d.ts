type TApiParams = {
    apiKey: string;
    baseURL?: string;
};
type TStringsByTemplateParams = {
    template?: string;
};
export type TString = {
    value: string | undefined;
};
export declare class Api {
    private readonly params;
    constructor(params: TApiParams);
    stringGet({ template, }?: TStringsByTemplateParams): Promise<Record<string, TString>>;
}
export {};
