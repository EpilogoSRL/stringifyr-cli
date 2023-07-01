import { Stringifyr, TStringifyrParams } from "../stringifyr/Stringifyr";
import { getConfig } from "../stringifyr/Config";
import { TReact } from '../react/ReactTypes';
import { makeUseNode } from '../react/makeUseNode';
import { makeUseNodeValue } from '../react/makeUseNodeValue';
import * as _ from 'lodash';

type TStringifyrReactParams = TStringifyrParams & {
  react?: {
    React: TReact,

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

  return {
    stringifyr,
    useNode: makeUseNode(stringifyr, React),
    useNodeValue: makeUseNodeValue(stringifyr, React),

    value: function(template: string, variables: object = {}) {
      const node = stringifyr.nodeSync(template);
      return Stringifyr.nodeValues(node);
    },

    /**
     * @deprecated
     * Instead of exposing as array and losing the key information
     * expose another type eg a .map({...info}) function
     * @param template
     * @param variables
     */
    array: function(template: string, variables: object = {}) {
      return _.values(this.value(template, variables));
    }

    // todo expose a JSX component that can render strings
  };
}
