import { TReact } from './ReactTypes';
import { Stringifyr } from '../stringifyr/Stringifyr';
import { makeUseNode } from './makeUseNode';

export function makeUseNodeValue(stringifyr: Stringifyr, React: TReact) {
  const useNode = makeUseNode(stringifyr, React);

  return function useNodeValue<T extends string, R>(template: T, defaultValue?: R): R {
    const node = useNode(template);

    return React.useMemo(() => {
      if (node == null) {
        return defaultValue;
      }

      return Stringifyr.nodeValues(node) as R;
    }, [node]);
  }
}
