import { Stringifyr, TStringifyrParams } from "../stringifyr/Stringifyr";
import * as DOMPurify from 'dompurify'
import * as marked from 'marked';
import { TString } from "../stringifyr/Api";
import { getConfig } from "../stringifyr/Config";

type TStringifyrDOMParams = TStringifyrParams & {
  browser?: {
    window: typeof window & {
      stringifyr?: Stringifyr
      StringifyrDOM?: typeof StringifyrDOM
    },
  }
}

export function StringifyrDOM({
                                isDev,
                                apiKey,
                                baseURL,
                                storage = window.localStorage,
                                fetchOnLoadWithParams = {
                                  fileSlug: getConfig(isDev, 'fileSlug'),
                                },
                                browser: {
                                  window: globalWindow = window,
                                } = {
                                  window: window,
                                }
                              }: TStringifyrDOMParams) {
  const stringifyr = new Stringifyr({
    isDev,
    apiKey,
    baseURL,
    storage,
    fetchOnLoadWithParams,
  });

  globalWindow.stringifyr = stringifyr;
  globalWindow.StringifyrDOM = this;

  function escapeRegex(regex: string) {
    return regex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  function makeUnsafeMatcher(str = '([a-zA-Z0-9.{}=]+)') {
    return new RegExp(`\\{sfyr=\\s*${str}\\s*\\}`, 'g')
  }

  function getAllMatches(str: string, regex: RegExp) {
    const matches = [] as string[];
    let match = null;
    while ((match = regex.exec(str)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  }

  function getStringValueFromNode(node: TString) {
    if (node.type === 'markdown') {
      return DOMPurify.sanitize(marked.parse(node.value));
    }

    if (node.type === 'html') {
      return DOMPurify.sanitize(node.value);
    }

    if (node.type === 'text') {
      return DOMPurify.sanitize(node.value);
    }

    if (node.type === 'json') {
      try {
        return JSON.stringify(JSON.parse(node.value));
      } catch (e) {
        return node.value;
      }
    }
  }

  async function refresh(
    el: HTMLElement,
    property: 'outerHTML' | 'innerHTML' | 'innerText' = 'outerHTML'
  ) {
    const unsafeMatches = getAllMatches(el[property], makeUnsafeMatcher());
    await stringifyr.waitForRoot();

    unsafeMatches.forEach((unsafeMatch) => {
      const node = stringifyr.nodeSync(unsafeMatch);
      if (node) {
        el[property] = el[property].replace(
          makeUnsafeMatcher(escapeRegex(unsafeMatch)),
          getStringValueFromNode(node)
        )
      }
    });
  }

  globalWindow.document.addEventListener("DOMContentLoaded", () => {
    refresh(document.documentElement, 'innerHTML');
  });

  return {
    stringifyr,
    refresh,
  };
}
