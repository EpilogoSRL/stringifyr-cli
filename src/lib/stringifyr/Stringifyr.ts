import * as _ from 'lodash';
import { Api, TString } from "./Api";
import { IStorage } from "../utils/IStorage";
import { PersistLayer } from "../utils/PersistLayer";
import { configure } from 'safe-stable-stringify';
import { getConfig } from "./Config";
import { Sfyr } from "./Sfyr";

const stringify = configure({
  bigint: true,
  circularValue: '[Circular]',
  deterministic: true,
  maximumDepth: 1,
  maximumBreadth: 4
})

export type TStringifyrParams = {
  apiKey: string;
  baseURL?: string;
  isDev?: boolean;
  storage?: IStorage,
  fetchOnLoadWithParams?: TFetchRootParams | false
}

export type TLeafObject<T, X> = {
  [K: string]: TLeafObject<T, X> | X
}

type TFetchRootParams = {
  fileSlug?: string;
  __incUnpublished?: boolean
}

type TRoot = {
  readonly response: Record<string, TString>;
  readonly reducedGraphNode: Record<string, Record<string, any> | string>
}

export class Stringifyr {
  static nodeValues(node: TLeafObject<string, TString>): TLeafObject<string, string> {
    const result = {} as TLeafObject<string, string>;

    for (const key in node) {
      const item = node[key];

      if (item?.value) {
        // is leaf
        result[key] = (item?.value ?? '') as string;
      } else {
        // is branch
        result[key] = Stringifyr.nodeValues(item as TLeafObject<string, TString>);
      }
    }

    return result;
  }

  private fetchParams: TFetchRootParams = {
    fileSlug: Sfyr.DEFAULT_FILE_SLUG,
    __incUnpublished: undefined
  }

  private readonly api: Api;
  private readonly persist: PersistLayer;

  private lastRoot: TRoot | null = null;

  private listeners: {
    load: Array<() => void>
  } = {
    load: []
  }

  constructor(params: TStringifyrParams) {
    this.api = new Api({
      apiKey: params.apiKey,
      baseURL: params.baseURL ?? getConfig(params.isDev, 'baseURL'),
    });

    this.persist = new PersistLayer({
      storage: params.storage
    });

    Object.assign(this.fetchParams, params.fetchOnLoadWithParams);

    if (params.fetchOnLoadWithParams !== false) {
      this.fetchRootCached()
    }
  }

  setFileSlug(fileSlug: string | undefined) {
    this.fetchParams.fileSlug = !_.isEmpty(fileSlug) ? fileSlug : Sfyr.DEFAULT_FILE_SLUG;
    return this;
  }

  setApiKey(apiKey: string | undefined) {
    this.api.setParams({apiKey})
    return this;
  }

  addListener(event: 'load', cb: () => void) {
    if (event === 'load' && this.lastRoot != null) {
      cb();
      return () => undefined;
    }
    this.listeners[event].push(cb);
    return () => this.removeListener(event, cb);
  }

  removeListener(event: 'load', cb: () => void) {
    const events = this.listeners[event];
    for (let i = 0; i < events.length; i++) {
      if (events[i] === cb) {
        this.listeners[event].splice(i, 1);
        return;
      }
    }
  }

  async node(template: string | undefined): Promise<TString | null> {
    return this.nodeSyncInternal(template ?? '', await this.fetchRootCached());
  }

  nodeSync(template: string | undefined): TString | null {
    return this.nodeSyncInternal(template ?? '', this.lastRoot);
  }

  async waitForRoot() {
    await this.fetchRootCached();
  }

  private nodeSyncInternal(template: string, root: TRoot | undefined | null): TString | null {
    if (!root) {
      this.fetchRootCached();
      return null;
    }

    return Sfyr.selectGraphPath({
      node: root.reducedGraphNode,
      path: template,
    });
  }

  private async fetchRootCached() {
    const root = await this.persist.wrap(stringify(this.fetchParams), async (): Promise<TRoot> => {
      const response = await this.api.stringGet({
        fileSlug: this.fetchParams.fileSlug,
        __incUnpublished: this.fetchParams.__incUnpublished
      });
      const reducedGraphNode = Sfyr.resolveFromPathToNode({
        nodes: response,
        nodeToValue(node) {
          return node.value ?? null as string;
        }
      })

      return {
        response,
        reducedGraphNode
      }
    })

    this.lastRoot = root;
    for (const cb of this.listeners.load) {
      cb();
    }

    return root;
  }
}
