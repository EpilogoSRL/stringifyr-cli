import { Stringifyr, TLeafObject, TStringifyrParams } from "../stringifyr/Stringifyr";
import { TString } from "../stringifyr/Api";
import { getConfig } from "../stringifyr/Config";

type TStringifyrReactParams = TStringifyrParams & {
  react?: {
    React: {
      useState: any
      useEffect: any
      useMemo: any
    },

    // Only required if on browser
    window?: typeof window & {
      stringifyr?: Stringifyr
      StringifyrReact?: typeof StringifyrReact
    }
  }
}

export function StringifyrReact({
                                  isDev,
                                  apiKey,
                                  baseURL,
                                  storage = window?.localStorage,
                                  fetchOnLoadWithParams = {
                                    fileSlug: getConfig(isDev, 'fileSlug'),
                                  },
                                  react: {
                                    window: globalWindow,
                                    React,
                                  }
                                }: TStringifyrReactParams) {
  const stringifyr = new Stringifyr({
    isDev,
    apiKey,
    baseURL,
    fetchOnLoadWithParams,
    storage,
  });

  if (globalWindow) {
    globalWindow.stringifyr = stringifyr;
    globalWindow.StringifyrReact = this;
  }

  function useNode<T extends string>(template: T): TLeafObject<string, TString> | null {
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

  function useNodeValue<T extends string, R>(template: T, defaultValue?: R): R {
    const node = useNode(template);
    return React.useMemo(() => {
      if (node == null) {
        return defaultValue;
      }

      return Stringifyr.nodeValues(node);
    }, [node]);
  }

  return {
    stringifyr,
    useNode,
    useNodeValue,
  };
}
