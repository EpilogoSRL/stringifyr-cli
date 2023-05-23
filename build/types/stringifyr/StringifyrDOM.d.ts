import { Stringifyr, TStringifyrParams } from "./Stringifyr";
import { TString } from "./Api";
type TStringifyrDOMParams = TStringifyrParams & {
    browser?: {
        window: typeof window & {
            stringifyr?: Stringifyr;
            StringifyrDOM?: typeof StringifyrDOM;
        };
        targetClassname?: string;
        renderers?: Partial<{
            markdown?: (el: HTMLElement, markdown: string) => void;
            html?: (el: HTMLElement, html: string) => void;
            text?: (el: HTMLElement, text: string) => void;
            json?: (el: HTMLElement, json: string) => void;
        }>;
    };
};
export declare function StringifyrDOM({ apiKey, baseURL, defaultFileSlug, storage, browser: { window, targetClassname, renderers } }: TStringifyrDOMParams): {
    stringifyr: Stringifyr;
    render: (el: HTMLElement, node: TString) => void;
};
export {};
