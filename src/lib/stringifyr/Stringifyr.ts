import { Api, TString } from "./Api";
import { TGraphNode } from "./parser/graphNode/makeInternalGraphNode";
import { mergeInternalGraphNodesToCommonRoot } from "./parser/graphNode/mergeInternalGraphNodesToCommonRoot";
import { reduceGraphNode } from "./parser/reduceGraphNode";
import { selectGraphPath } from "./parser/selectGraphPath";
import { IStorage } from "./IStorage";
import { PersistLayer } from "./PersistLayer";
import { configure } from 'safe-stable-stringify';
import { getConfig } from "./Config";

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
}

type TRoot = {
  readonly response: Record<string, TString>;
  readonly rootGraphNode: TGraphNode<TString>
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

  private readonly params: TStringifyrParams;

  private readonly api: Api;
  private readonly persist: PersistLayer;

  private lastRoot: TRoot | null = null;

  private listeners: {
    load: Array<() => void>
  } = {
    load: []
  }

  constructor(params: TStringifyrParams) {
    this.params = params;

    this.api = new Api({
      apiKey: this.params.apiKey,
      baseURL: this.params.baseURL ?? getConfig(this.params.isDev, 'baseURL'),
    });

    this.persist = new PersistLayer({
      storage: this.params.storage
    });

    if (this.params.fetchOnLoadWithParams !== false) {
      this.fetchRootCached(this.params.fetchOnLoadWithParams)
    }
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

  async node(template: string): Promise<TString | null> {
    return this.nodeSyncInternal(template, await this.fetchRootCached());
  }

  nodeSync(template: string): TString | null {
    return this.nodeSyncInternal(template, this.lastRoot);
  }

  async waitForRoot() {
    await this.fetchRootCached();
  }

  private nodeSyncInternal(template: string, root: TRoot | undefined | null): TString | null {
    if (!root) {
      this.fetchRootCached();
      return null;
    }

    return selectGraphPath({
      node: root.reducedGraphNode,
      path: template,
    });
  }

  private async fetchRootCached(fetchRootParams: TFetchRootParams = {}) {
    const root = await this.persist.wrap(stringify(fetchRootParams), async (): Promise<TRoot> => {
      const response = await this.api.stringGet();
      const rootGraphNode = mergeInternalGraphNodesToCommonRoot(response);
      const reducedGraphNode = reduceGraphNode({
        nodes: rootGraphNode.children ?? [],
        nodeToSegment: (node) => node.segmentPath,
        nodeToChildren: (node) => node.children,
        nodeToValue: (node) => node.value ?? '' as string
      });

      return {
        response,
        rootGraphNode,
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
