import { StringifyrBase, TStringifyrBaseParams } from './StringifyrBase';
import { TString } from './Api';

export type TStringifyrParams = TStringifyrBaseParams;

export type TLeafObject<T, X> = X | {
  [K: string]: TLeafObject<T, X>
}

export class Stringifyr extends StringifyrBase {
  static nodeValues(node: TLeafObject<string, TString>): any {
    if (typeof node?.value === 'string') {
      return node.value;
    }

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

  value(template: string, variables: object = {}) {
    const node = this.nodeSync(template);
    return Stringifyr.nodeValues(node);
  }
}
