import { Api, TString } from "./Api";
import { TGraphNode } from "./parser/graphNode/makeInternalGraphNode";
import { mergeInternalGraphNodesToCommonRoot } from "./parser/graphNode/mergeInternalGraphNodesToCommonRoot";
import { reduceGraphNode } from "./parser/reduceGraphNode";
import { selectGraphPath } from "./parser/selectGraphPath";
import { IStorage } from "./IStorage";
import { PersistLayer } from "./PersistLayer";
import { configure } from 'safe-stable-stringify';

const stringify = configure({
  bigint: true,
  circularValue: '[Circular]',
  deterministic: true,
  maximumDepth: 1,
  maximumBreadth: 4
})

type TStringifyrParams = {
  apiKey: string;
  baseURL: string;
  fileSlug: string;
  storage?: IStorage
}

type TFetchRootParams = {
  //
}

type TRoot = {
  readonly response: Record<string, TString>;
  readonly rootGraphNode: TGraphNode<TString>
  readonly reducedGraphNode: Record<string, Record<string, any> | string>
}

export class Stringifyr {
  private readonly params: TStringifyrParams;

  private readonly api: Api;
  private readonly persist: PersistLayer;

  constructor(params: TStringifyrParams) {
    this.params = params;

    this.api = new Api({
      apiKey: this.params.apiKey,
      baseURL: this.params.baseURL
    });

    this.persist = new PersistLayer({
      storage: this.params.storage
    })
  }

  async node(template: string): Promise<TString | null> {
    const root = await this.fetchRootCached();

    const result = selectGraphPath({
      node: root.reducedGraphNode,
      path: template,
    });

    return result;
  }

  private async fetchRootCached(fetchRootParams: TFetchRootParams = {}) {
    return this.persist.wrap(stringify(fetchRootParams), async (): Promise<TRoot> => {
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
  }
}
