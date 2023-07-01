import { TReact } from './ReactTypes';
import { Stringifyr, TLeafObject } from '../stringifyr/Stringifyr';
import { TString } from '../stringifyr/Api';

export function makeUseNode(stringifyr: Stringifyr, React: TReact) {
  return function useNode<T extends string>(template: T, variables?: any): TLeafObject<string, TString> | null {
    const [value, setValue] = React.useState(stringifyr.nodeSync(template));

    React.useEffect(() => {
      const unsubscribe = stringifyr.addListener('load', () => {
        const nodeSync = stringifyr.nodeSync(template);
        setValue(nodeSync);
      })

      return () => unsubscribe?.();
    }, [template]);

    return value ?? null;
  }
}
