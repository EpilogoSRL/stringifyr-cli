import { Stringifyr, TStringifyrParams } from "./Stringifyr";
import * as DOMPurify from 'dompurify'
import * as marked from 'marked';
import { TString } from "./Api";

const DEFAULT_TARGET_CLASSNAME = 'stringifyr'

type TStringifyrDOMParams = TStringifyrParams & {
  browser?: {
    window: typeof window & {
      stringifyr?: Stringifyr
      StringifyrDOM?: typeof StringifyrDOM
    },
    targetClassname?: string;
    renderers?: Partial<{
      markdown?: (el: HTMLElement, markdown: string) => void,
      html?: (el: HTMLElement, html: string) => void,
      text?: (el: HTMLElement, text: string) => void,
      json?: (el: HTMLElement, json: string) => void,
    }>
  }
}

export function StringifyrDOM({
                                apiKey,
                                baseURL,
                                defaultFileSlug,
                                storage,
                                browser: {
                                  window,
                                  targetClassname = DEFAULT_TARGET_CLASSNAME,
                                  renderers
                                }
                              }: TStringifyrDOMParams) {
  window.StringifyrDOM = this;

  const stringifyr = new Stringifyr({
    apiKey,
    baseURL,
    defaultFileSlug,
    storage,
  });

  window.stringifyr = stringifyr;

  const allRenderers = {
    markdown: (el, markdown) => {
      el.innerHTML = DOMPurify.sanitize(marked.parse(markdown));
    },
    html: (el, html) => {
      el.innerHTML = DOMPurify.sanitize(html)
    },
    text: (el, plainText) => {
      el.textContent = plainText;
    },
    json: (el, json) => {
      el.textContent = JSON.stringify(json, undefined, 2);
    },
    ...renderers,
  }

  function render(el: HTMLElement, node: TString) {
    allRenderers[node.type]?.(el, node?.value);
  }

  function waitForAddedNode(params) {
    new MutationObserver(function () {
      const elements = window.document.getElementsByClassName(params.className);
      for (let i = 0; i < elements.length; i++) {
        params.onNode(elements[i]);
      }
    }).observe(params.parent || window.document, {
      subtree: !!params.recursive || !params.parent,
      childList: true,
    });
  }

  waitForAddedNode({
    className: targetClassname,
    parent: window.document.body,
    recursive: true,
    onNode: function (el) {
      el.classList.remove(targetClassname);
      stringifyr.node(el.textContent).then((node) => {
        if (!node || !node?.type) {
          return;
        }

        render(el, node);
      })
    }
  });

  return {
    stringifyr,
    render,
  };
}
