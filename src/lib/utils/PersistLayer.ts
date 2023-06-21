import { IStorage } from "./IStorage";
import { AsyncReturnType } from "./Types";

type TPersistLayerParams = {
  storage?: IStorage
}

function wrapValue(val: any) {
  if (val) {
    return JSON.stringify(val);
  }

  return '__null';
}

function unwrapValue(val: any) {
  if (val === '__null') {
    return null;
  }

  try {
    return JSON.parse(val);
  } catch (e) {
    return null;
  }
}

export class PersistLayer {
  private readonly storage?: IStorage;
  private inMemory?: Record<string, string> = {};

  constructor(params: TPersistLayerParams) {
    this.storage = params.storage;
    this.wrap = this.wrap.bind(this);
  }

  async wrap<T extends (...any: any) => Promise<any>>(cacheKey: string, call: T): Promise<AsyncReturnType<T>> {
    const inMemory = this.inMemory[cacheKey];
    if (inMemory) {
      return unwrapValue(inMemory);
    }

    const inStorage = await this.storage?.getItem(cacheKey)
    if (inStorage) {
      this.inMemory[cacheKey] = inStorage;
      return unwrapValue(inStorage);
    }

    const realCallValue = wrapValue(await call());
    this.inMemory[cacheKey] = realCallValue;
    await this.storage?.setItem(cacheKey, realCallValue);
    return unwrapValue(realCallValue);
  }
}
