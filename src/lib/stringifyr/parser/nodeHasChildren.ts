import * as _ from "lodash";

export function graphNodeHasChildren(node: { children?: any[] | Record<string, any> }) {
  return _.size(node.children) > 0;
}
