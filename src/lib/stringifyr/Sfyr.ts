import * as _ from 'lodash';

/**
 * StringParser version 1.0.0
 * All string parsing function should be in this class
 * this simplifies keeping things alinged in the public and private repo.
 * ---
 * At some point this will become an npm library
 */

export type TPathStaticSegment<A extends string, Result = A> = A extends `{${string}` ? never
  : A extends `${string}.${string}` ? never
    : Result;

export type TPathVariableSegment<A extends string = `{${string}=${string}}`, Result = A> = A extends
  `{${string}=${string}}` ? Result
  : never;

export type TStringKeyValue = string;

export type TPathToVariable<A extends string> = A extends `{${infer Name}=${infer Value}}`
  ? { name: Name; value: Value }
  : never;

export type TVariableToPath<Variable extends TVariable> = `{${Variable['name']}=${Variable['value']}}`;

export type TVariable = {
  name: string;
  value: string;
};

export enum EPathToNodeRelation {
  shadow = 'shadow',
  sibling = 'sibling',
  parent = 'parent',
  child = 'child',
  unrelated = 'unrelated',
  parentShadow = 'parentShadow',
  self = 'self',
}

export type TResolvedPathPart = {
  segmentPath: string;
  index: number;
  variable?: TVariable;
};

export type TGraphNode<T = unknown> = {
  inferredFrom: string;
  segmentPath: string;
  value?: T;
  children: TGraphNode<T>[];
};

export type TShadowNodeMap<T = unknown> = Record<
  string,
  Array<{
    resolvedPath: string;
    node: TGraphNode<T>;
  }>
>;

type TReduceGraphNodeResult<T, X> = {
  [K: string]: TReduceGraphNodeResult<T, X> | X;
};

class SfyrParser {
  readonly DEFAULT_FILE_SLUG = 'default';
  readonly DEFAULT_STRING_SLUG = 'default';
  readonly GRAPH_NODE_ROOT_SEGMENT_PATH = '__root';
  readonly ANY_SEGMENT = '___';

  constructor() {
    // Singleton for caching purposes
  }

  readonly splitResolvedPath = (
    resolvedPath: string,
  ): string[] => {
    const regex = /\{([^\}]*)\}/g;
    const variableIndexes = [] as number[];
    let match;

    // Find all variable indexes
    while (match = regex.exec(resolvedPath)) {
      variableIndexes.push(match.index);
    }

    const splitString = [] as string[];
    let prevIndex = 0;

    // Split the string at "." and add to splitString array
    for (let i = 0; i < resolvedPath.length; i++) {
      if (resolvedPath[i] === '.' && !variableIndexes.includes(i)) {
        splitString.push(resolvedPath.slice(prevIndex, i));
        prevIndex = i + 1;
      }
    }

    // Add the last segment to the splitString array
    splitString.push(resolvedPath.slice(prevIndex));

    return splitString;
  };

  readonly segmentToVariable = (part: string): TVariable | undefined => {
    const maybeEql = part.startsWith('{') && part.endsWith('}') && !part.includes('=')
      ? `${part.substring(0, part.length - 1)}=}`
      : part;
    const match = maybeEql.match(/^\{(.+?)=(.*?)\}$/);
    if (!match) {
      return undefined;
    }

    const [_, name, value] = match;
    return {
      name,
      value,
    };
  };

  readonly selectGraphPath = ({
                                path,
                                node = {},
                              }: {
    path: string;
    node: Record<string, any>;
  }) => {
    const [first, ...rest] = this.splitResolvedPath(path);

    if (_.isEmpty(first)) {
      return node;
    }

    const variable = this.segmentToVariable(first);
    const variableValue = variable?.value;
    const isMultiValue = !!variable && _.isEmpty(variableValue);

    if (!isMultiValue) {
      const accessor = !!variableValue
        ? variableValue
        : first;

      return this.selectGraphPath({
        path: rest.join('.'),
        node: node[accessor] ?? {},
      });
    }

    // Has a variable value
    const result = {} as Record<string, any>;

    for (const key of _.keys(node)) {
      result[key] = this.selectGraphPath({
        path: rest.join('.'),
        node: node[key] ?? {},
      });
    }

    return result;
  };

  readonly variablesFromPathToNode = (resolvedPath: string): Record<string, string> => {
    const variables: Record<string, string> = {};
    const parts = this.splitResolvedPath(resolvedPath);
    if (!parts) {
      return variables;
    }
    for (const part of parts) {
      const variable = this.segmentToVariable(part);
      if (!variable) {
        continue;
      }
      variables[variable.name] = variable.value;
    }
    return variables;
  };

  readonly segmentToPartialVariable = (part: string): TVariable | null => {
    const varMatchers = [
      /^\{([a-zA-Z][A-Za-z0-9]*)=([a-zA-Z0-9][A-Za-z0-9\-_]*)}$/,
      /^\{([a-zA-Z][A-Za-z0-9]*)=([a-zA-Z0-9][A-Za-z0-9\-_]*)$/,
      /^\{([a-zA-Z][A-Za-z0-9]*)=([a-zA-Z0-9])$/,
      /^\{([a-zA-Z][A-Za-z0-9]*)=$/,
      /^\{([a-zA-Z][A-Za-z0-9]*)$/,
      /^\{([a-zA-Z])$/,
      /^\{$/,
    ];

    for (const m of varMatchers) {
      const match = part.match(m);
      if (match) {
        const [_, name, value] = match;
        return {
          name,
          value,
        };
      }
    }

    return null;
  };

  readonly variableToSegment = (variable: TVariable): string => {
    return `{${variable.name}=${variable.value}}`;
  };

  readonly graphNodeHasChildren = (node: { children?: any[] | Record<string, any>}) => {
    return _.size(node.children) > 0;
  };

  readonly maybeJoinFirst = (joinChar: string, ...items: string[]) => {
    const [item, ...others] = items;
    const start = item?.length > 0 && others.length > 0 ? `${item}${joinChar}` : item ?? '';
    return `${start}${others.join(joinChar)}`;
  };

  readonly lastSegment = (resolvedPath: string) => {
    const parts = Sfyr.splitResolvedPath(resolvedPath);
    return parts[parts.length - 1] ?? '';
  };

  readonly templateToPathToNode = (
    templatePath: string,
    variables: Record<string, string>,
  ): string => {
    const regex = /\{(\w+)\}/g;
    // @ts-ignore
    const resolvedString = templatePath
      .replace(regex, (match, p1) => `{${p1}=${variables[p1]}}`);
    return resolvedString;
  };

  readonly templateFromPathToNode = (resolvedPath: string): string => {
    const parts = this.parseResolvedPath(resolvedPath);
    return parts?.map((part) => {
      if (part.variable) {
        return `{${part.variable.name}}`;
      }

      return part.segmentPath;
    })
      .join('.');
  };

  readonly comparePathToNode = (p1: string, p2: string): EPathToNodeRelation => {
    if (p1 === p2) {
      return EPathToNodeRelation.self;
    }

    const p1t = this.templateFromPathToNode(p1);
    const p2t = this.templateFromPathToNode(p2);

    if (p1.startsWith(p2) && p1t.length > p2t.length) {
      return EPathToNodeRelation.child;
    }

    if (p2.startsWith(p1) && p2t.length > p1t.length) {
      return EPathToNodeRelation.parent;
    }

    if (p2t.startsWith(p1t) && p2t.length > p1t.length) {
      return EPathToNodeRelation.parentShadow;
    }

    // Two nodes are shadows if they have the same template and length
    if (p1t === p2t) {
      return EPathToNodeRelation.shadow;
    }

    // two nodes are siblings if they only differ by the last segment
    const withoutLast1 = p1.replace(/[^.]$/, '');
    const withoutLast2 = p2.replace(/[^.]$/, '');
    if (withoutLast1 === withoutLast2) {
      return EPathToNodeRelation.sibling;
    }

    return EPathToNodeRelation.unrelated;
  };

  readonly updatePathToNode = (
    oldPathToNode: string,
    newPathToNode: string,
    targets: string[],
  ): (string | null)[] => {
    const oldParts = this.splitResolvedPath(oldPathToNode);
    const newParts = this.splitResolvedPath(newPathToNode);

    return targets.map((target) => {
      const relationToOld = this.comparePathToNode(oldPathToNode, target);
      const relationToNew = this.comparePathToNode(newPathToNode, target);

      const allowedRelations = [
        relationToOld === EPathToNodeRelation.parent,
        relationToOld === EPathToNodeRelation.self,

        relationToOld === EPathToNodeRelation.shadow
        && relationToNew !== EPathToNodeRelation.shadow,

        // If both old and new are parent shadows it's a completely
        // unrelated change (see tests)
        relationToOld === EPathToNodeRelation.parentShadow
        && relationToNew !== EPathToNodeRelation.parentShadow,
      ];

      if (!allowedRelations.some((a) => a)) {
        return null;
      }

      const targetParts = this.splitResolvedPath(target);
      let result = [] as string[];
      for (let i = 0; i < targetParts.length; i++) {
        let next = targetParts[i];

        if (oldParts[i] != newParts[i] && this.sameSegmentOrVariable(oldParts[i], targetParts[i])) {
          next = newParts[i];
        }

        result.push(next);
      }

      return this.maybeJoinFirst('.', ...result);
    });
  };

  readonly sameSegmentOrVariable = (seg1: string, seg2: string) => {
    if (seg1 === seg2) {
      return true;
    }

    if (seg1.startsWith('{') && seg2.startsWith('{')) {
      const var1 = this.segmentToVariable(seg1);
      const var2 = this.segmentToVariable(seg2);
      return var1?.name === var2?.name;
    }

    return false;
  };

  readonly parseResolvedPath = (
    resolvedPath: string,
  ): TResolvedPathPart[] => {
    const parts = this.splitResolvedPath(resolvedPath);
    return parts.map((segmentPath, index) => {
      const part: TResolvedPathPart = {
        segmentPath,
        index,
      };

      part.variable = this.segmentToVariable(segmentPath);

      return part;
    });
  };

  readonly reduceGraphNode = <T, X>({
                                      nodes,
                                      nodeToSegment,
                                      nodeToChildren,
                                      nodeToValue,
                                    }: {
    nodes: T[];
    nodeToSegment: (s: T) => string;
    nodeToChildren: (s: T) => T[];
    nodeToValue: (s: T) => X;
  }): TReduceGraphNodeResult<T, X> => {
    const current = {} as TReduceGraphNodeResult<T, X>;

    for (const node of nodes) {
      const segment = nodeToSegment(node);
      const variable = this.segmentToVariable(segment);
      const key = variable?.value ?? segment;

      const children = nodeToChildren(node);
      const value = children.length > 0
        ? this.reduceGraphNode({
          nodes: children,
          nodeToSegment,
          nodeToChildren,
          nodeToValue,
        })
        : nodeToValue(node);

      current[key] = value;
    }

    return current;
  };

  readonly createGraphNodeRoot = <T>(children: TGraphNode<T>[] = []): TGraphNode<T> => {
    return {
      inferredFrom:this.GRAPH_NODE_ROOT_SEGMENT_PATH,
      segmentPath: this.GRAPH_NODE_ROOT_SEGMENT_PATH,
      children: [
        ...children,
      ],
      value: undefined,
    };
  };

  readonly mergeInternalGraphNodesToCommonRoot = <T>(values: Record<string, T>): TGraphNode<T> => {
    const internalGraphRoot: TGraphNode<T> = this.createGraphNodeRoot<T>();

    for (const resolvedPath in values) {
      const graphNode = this.makeInternalGraphNode(resolvedPath, values[resolvedPath]);

      const graphNodeWithRoot = this.createGraphNodeRoot([graphNode]);
      const merged = this.mergeInternalGraphNodes(internalGraphRoot, graphNodeWithRoot);

      // both nodes have createRootGraphNode as a parent
      // so it's guaranteed there's only 1 node in the result [0]
      internalGraphRoot.children = merged[0].children;
    }

    return internalGraphRoot;
  };

  readonly makeInternalGraphNode = <T>(
    resolvedPath: string,
    value: T,
  ): TGraphNode<T> => {
    const [first, ...postfixOfParent] = this.splitResolvedPath(resolvedPath);

    const root: TGraphNode<T> = {
      inferredFrom: resolvedPath,
      segmentPath: first,
      children: [],
    };

    if (postfixOfParent.length <= 0) {
      root.value = value;
    } else {
      const childNode = this.makeInternalGraphNode(
        postfixOfParent.join('.'),
        value,
      );

      root.children.push(childNode);
    }

    return root;
  };

  readonly mergeInternalGraphNodes = <T>(
    _a: TGraphNode<T>,
    _b: TGraphNode<T> | undefined,
  ): TGraphNode<T>[] => {
    const a = _.cloneDeep(_a);
    const b = _b ? _.cloneDeep(_b) : undefined;

    if (!b || a.segmentPath != b.segmentPath) {
      // Different root nodes

      const result = [a];
      if (b) {
        result.push(b);
      }
      return result;
    }

    const merged: TGraphNode<T> = {
      ...a,
      children: [],
    };

    const aChildren = _.keyBy(a.children, (child) => child.segmentPath);
    const bChildren = _.keyBy(b.children, (child) => child.segmentPath);
    const allKeys = _.uniq([
      ..._.keys(aChildren),
      ..._.keys(bChildren),
    ]);

    for (const childKey of allKeys) {
      const childA = aChildren[childKey] ?? bChildren[childKey];
      const childB = bChildren[childKey];
      if (_.isEqual(childA, childB)) {
        merged.children.push(childA);
        continue;
      }

      const mergedChildren = this.mergeInternalGraphNodes<T>(childA, childB);
      for (const mergedChild of mergedChildren) {
        merged.children.push(mergedChild);
      }
    }

    return [
      merged,
    ];
  };

  readonly graphNodeToVariables = <T>(node: TGraphNode<T>) => {
    const result = {} as Record<string, Record<string, string>>;

    const nodeVariables = this.variablesFromPathToNode(node.segmentPath);

    for (const variableName in nodeVariables) {
      if (result[variableName] == null) {
        result[variableName] = {};
      }

      const variableValue = nodeVariables[variableName];
      result[variableName][variableValue] = variableValue;
    }

    for (const childKey in node.children) {
      const childResult = this.graphNodeToVariables(node.children[childKey]);
      _.merge(result, childResult);
    }

    return result;
  };

  readonly flattenToValues = <T>(node: TGraphNode<T>) => {
    const result = [] as T[];

    if (node.value) {
      result.push(node.value);
    }

    for (const child of node.children) {
      const flatChildren = this.flattenToValues(child);
      for (const childValue of flatChildren) {
        result.push(childValue);
      }
    }

    return result;
  };

  readonly resolveFromPathToNode = <T, R>(params: {
    nodes: Record<TStringKeyValue, T>;
    nodeToValue: (t: TGraphNode<T>) => R;
  }) => {
    const rootGraphNode = Sfyr.mergeInternalGraphNodesToCommonRoot(params.nodes);
    return Sfyr.reduceGraphNode({
      nodes: rootGraphNode.children ?? [],
      nodeToSegment(node) {
        return node.segmentPath;
      },
      nodeToChildren(node) {
        return node.children;
      },
      nodeToValue: params.nodeToValue,
    });
  };

  readonly shadowSegmentFromSegment = (segment: string) => {
    const variable = Sfyr.segmentToVariable(segment);
    return variable ? `{${variable.name}}` : segment;
  };

  readonly shadowPathFromResolvedPath = (resolvedPath: string) => {
    const parts = this.splitResolvedPath(resolvedPath);
    const mappedParts = parts.map((part) => {
      return this.shadowSegmentFromSegment(part);
    });
    return Sfyr.maybeJoinFirst('.', ...mappedParts);
  };

  readonly buildShadowMap = (
    node: TGraphNode,
    nodeResolvedPath = '',
    parentShadowPath = '',
    shadowMap = {} as TShadowNodeMap,
  ): TShadowNodeMap => {
    if (shadowMap[parentShadowPath] == null) {
      shadowMap[parentShadowPath] = [];
    }

    shadowMap[parentShadowPath].push({
      resolvedPath: nodeResolvedPath,
      node: node,
    });

    for (const child of node.children) {
      const segment = this.shadowSegmentFromSegment(child.segmentPath);
      const childResolvedPath = Sfyr.maybeJoinFirst('.', nodeResolvedPath, child.segmentPath);
      const childShadowPath = Sfyr.maybeJoinFirst('.', parentShadowPath, segment);

      this.buildShadowMap(child, childResolvedPath, childShadowPath, shadowMap);
    }

    return shadowMap;
  };

  readonly resetGraphNode = <T = unknown>(graphNode: TGraphNode): TGraphNode<T> => {
    return {
      inferredFrom: graphNode.inferredFrom,
      segmentPath: graphNode.segmentPath,
      value: undefined,
      children: graphNode.children?.map((child) => this.resetGraphNode(child))
        ?? [],
    };
  };
}

export const Sfyr = new SfyrParser();
