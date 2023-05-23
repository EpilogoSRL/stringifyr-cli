export interface IStorage {
    getItem(key: string): Promise<string | undefined>;
    setItem(key: string, value: string): Promise<void>;
    clear(): Promise<void>;
    setCookie(key: string): Promise<string>;
    getCookie(key: string): Promise<void>;
}
