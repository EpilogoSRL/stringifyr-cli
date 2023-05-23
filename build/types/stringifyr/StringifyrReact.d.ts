import { Stringifyr, TLeafObject, TStringifyrParams } from "./Stringifyr";
import { TString } from "./Api";
type TStringifyrReactParams = TStringifyrParams & {
    react?: {
        React: {
            useState: any;
            useEffect: any;
            useMemo: any;
        };
        window: typeof window & {
            stringifyr?: Stringifyr;
            StringifyrReact?: typeof StringifyrReact;
        };
        renderers?: Partial<{
            markdown?: (el: HTMLElement, markdown: string) => void;
            html?: (el: HTMLElement, html: string) => void;
            text?: (el: HTMLElement, text: string) => void;
            json?: (el: HTMLElement, json: string) => void;
        }>;
    };
};
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
export declare function StringifyrReact({ apiKey, baseURL, defaultFileSlug, storage, react: { window, React, renderers } }: TStringifyrReactParams): {
    stringifyr: Stringifyr;
    useNode: <T extends string>(template: T) => TLeafObject<string, TString> | null;
    useNodeValue: <T_1 extends string, R>(template: T_1, defaultValue?: R) => R;
};
export {};
