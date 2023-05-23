import { Stringifyr, TLeafObject, TStringifyrParams } from "./Stringifyr";
import { TString } from "./Api";

type TStringifyrReactParams = TStringifyrParams & {
  react?: {
    React: {
      useState: any
      useEffect: any
      useMemo: any
    },
    window: typeof window & {
      stringifyr?: Stringifyr
      StringifyrReact?: typeof StringifyrReact
    },
    renderers?: Partial<{
      markdown?: (el: HTMLElement, markdown: string) => void,
      html?: (el: HTMLElement, html: string) => void,
      text?: (el: HTMLElement, text: string) => void,
      json?: (el: HTMLElement, json: string) => void,
    }>
  }
}

/**
 * Usage
 * ---
 * StringifyrReact({
 *   apiKey: '',
 *   baseURL: 'https://us-central1-stringifyr-develop.cloudfunctions.net/publicApi',
 *   defaultFileSlug: '',
 *   storage: undefined,
 *   react: {
 *     window: window,
 *     React: null as any,
 *   }
 * });
 */
export function StringifyrReact({
                                  apiKey,
                                  baseURL,
                                  defaultFileSlug,
                                  storage,
                                  react: {
                                    window,
                                    React,
                                    renderers
                                  }
                                }: TStringifyrReactParams) {
  const stringifyr = new Stringifyr({
    apiKey,
    baseURL,
    defaultFileSlug,
    storage,
  });

  function useNode<T extends string>(template: T): TLeafObject<string, TString> | null {
    const [value, setValue] = React.useState(stringifyr.nodeSync(template));

    React.useEffect(() => {
      const unsubscribe = stringifyr.addListener('load', () => {
        const nodeSync = stringifyr.nodeSync(template);
        console.log("loaded", nodeSync);
        setValue(nodeSync);
      })

      return () => unsubscribe?.();
    }, [template]);

    return value ?? null;
  }

  function useNodeValue<T extends string, R>(template: T, defaultValue?: R): R {
    const node = useNode(template);
    return React.useMemo(() => {
      if (node == null) {
        return defaultValue;
      }

      return Stringifyr.nodeValues(node);
    }, [node]);
  }

  window.stringifyr = stringifyr;

  return {
    stringifyr,
    useNode,
    useNodeValue
  };
}
