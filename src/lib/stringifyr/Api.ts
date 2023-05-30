import { isEmpty } from 'lodash';

type TApiParams = {
  apiKey: string;
  baseURL?: string;
}

type TStringsByTemplateParams = {
  template?: string;
}

const defaultStringsByTemplateParams: TStringsByTemplateParams = {}

export type TString = {
  value: string | undefined;
  type: 'text' | 'json' | 'html' | 'markdown';
}

export class Api {
  private readonly params: TApiParams;

  constructor(params: TApiParams) {
    this.params = params;
    this.stringGet = this.stringGet.bind(this);
  }

  async stringGet({
                    template = defaultStringsByTemplateParams.template,
                  }: TStringsByTemplateParams = defaultStringsByTemplateParams): Promise<Record<string, TString>> {
    const url = new URL(`${this.params.baseURL}/strings${!isEmpty(template) ? `/${template}` : ''}`);

    const result = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-KEY': this.params.apiKey
      }
    });

    return result.json();
  }
}
