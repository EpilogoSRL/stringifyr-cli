export interface IStorage {
  getItem(key: string): Promise<string | undefined | null> | (string | undefined | null);
  setItem(key: string, value: string): Promise<void> | void;
  clear(): Promise<void> | void;
}
