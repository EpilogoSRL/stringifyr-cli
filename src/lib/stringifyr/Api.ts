import { isEmpty } from 'lodash';
import { Sfyr } from "./Sfyr";

type TApiParams = {
  apiKey: string;
  baseURL?: string;
}

type TStringsByTemplateParams = {
  template?: string;
  fileSlug?: string;
  __incUnpublished?: boolean
}

const defaultStringsByTemplateParams: TStringsByTemplateParams = {
  fileSlug: Sfyr.DEFAULT_FILE_SLUG,
  __incUnpublished: undefined
}

export type TString = {
  value: string | undefined;
  type: 'text' | 'json' | 'html' | 'markdown';
}

export class Api {
  private readonly params: TApiParams;

  constructor(params: TApiParams) {
    this.params = params;
    this.setParams = this.setParams.bind(this);
    this.stringGet = this.stringGet.bind(this);
  }

  setParams(params: Partial<TApiParams>) {
    this.params.apiKey = params.apiKey ?? this.params.apiKey;
    this.params.baseURL = params.baseURL ?? this.params.baseURL;
  }

  async stringGet({
                    template = defaultStringsByTemplateParams.template,
                    fileSlug = defaultStringsByTemplateParams.fileSlug,
                    __incUnpublished = defaultStringsByTemplateParams.__incUnpublished
                  }: TStringsByTemplateParams = defaultStringsByTemplateParams): Promise<Record<string, TString>> {

    const url = new URL([
      this.params.baseURL,
      'file',
      fileSlug,
      ...(!isEmpty(template) ? [template] : [])
    ].join('/'));

    if (__incUnpublished) {
      url.searchParams.set('unpublished', 'true');
    }

    const result = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-KEY': this.params.apiKey
      }
    });

    return result.json();
  }
}
