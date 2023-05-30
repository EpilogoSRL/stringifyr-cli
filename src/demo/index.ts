// @ts-ignore
import Cookies from 'js-cookie';
import { isEmpty } from 'lodash';
import { StringifyrDOM } from "../lib/stringifyr/StringifyrDOM";
import { TString } from "../lib/stringifyr/Api";

const buildIframeDocDefault = {
  cliVersion: require('../../package.json').version,
  apiKey: '',
  fileSlug: '',
  template: ''
}

const params = {
  apiKey: {
    cookie: 'stringifyer-api-key',
    prompt: "Enter your Stringifyer apiKey (Can be found at http://stringifyer.com/app/settings):"
  },
  fileSlug: {
    cookie: 'stringifyer-file-slug',
    prompt: "Enter your default file slug (defaults to latest file):"
  },
  template: {
    cookie: 'stringifyer-last-template',
    prompt: "Enter a Stringifyer template:"
  },
}

const values = Object.keys(params).reduce((acc, key) => {
  const def = params[key];

  const value = () => {
    _value = Cookies.get(def.cookie);
    return _value;
  }

  let _value: any = null;
  value();

  const trigger = () => {
    _value = prompt(def.prompt);
    Cookies.set(def.cookie, _value);
    return _value;
  }
  acc[key] = {
    value,
    trigger,
    maybeTrigger: () => {
      _value == null && trigger();
      return _value;
    }
  };
  return acc;
}, {} as Record<keyof typeof params, { value: () => string, trigger: () => string, maybeTrigger: () => string }>);

values.apiKey.maybeTrigger();
values.fileSlug.maybeTrigger();

const {
  stringifyr,
  refresh
} = StringifyrDOM({
  isDev: true,
  apiKey: values.apiKey.value(),
  fetchOnLoadWithParams: {
    fileSlug: isEmpty(values.fileSlug.value()) ? undefined : values.fileSlug.value(),
  },
  storage: {
    setItem: (...params) => window.localStorage.setItem(...params),
    getItem: (...params) => window.localStorage.getItem(...params),
    clear: (...params) => window.localStorage.clear(...params),
  },
  browser: {
    window: window,
  }
});

window.onload = function () {
  if (values.fileSlug.value() != null) {
    handleTemplateChange(values.fileSlug.value());
  }
}

function handleTemplateChange(template: string) {
  document.getElementById('template').innerText = template;

  function setNode(sync: TString) {
    document.getElementById('apiResponse').innerText = JSON.stringify(sync, undefined, 2);
    const resolvedValueEl = document.getElementById('resolvedValue');
    resolvedValueEl.innerText = `{sfyr=${template}}`;
    refresh(resolvedValueEl);
    document.getElementById('e2e2e').setAttribute('srcdoc', buildIframeDoc({
      ...buildIframeDocDefault,
      apiKey: values.apiKey.value() ?? '',
      fileSlug: values.fileSlug.value() ?? '',
      template
    }))
  }

  const sync = stringifyr.nodeSync(template);
  if (sync) {
    return setNode(sync);
  } else {
    console.log(`Cache miss for ${template}`);
  }

  document.getElementById('apiResponse').innerText = 'Loading...';
  stringifyr.node(template).then((result) => {
    return setNode(result);
  })
}

// @ts-expect-error
window.onSetTemplate = function () {
  const trigger = values.template.trigger();
  if (trigger?.length > 0) {
    handleTemplateChange(trigger);
  }
};

(async () => {
  document.querySelector("body").innerHTML = `
  <div style="padding: 24px;display: flex; flex: 1; flex-direction: row"">
    <div style="display: flex; flex: 0.5; flex-direction: column">
      <div style="margin-top: 20px">
        <div>Your current file slug: <span id="fileSlug"/>${values.template.value() || '(default)'}</div>
      </div>
      
      <div style="margin-top: 20px">
      <button onclick="window.onSetTemplate()">Change template</button>
      </div>
      
      <div style="margin-top: 20px">
        <div>Your current template: <span id="template"/></div>
      </div>
      
      <div style="margin-top: 20px">
        <div>API Response: </div>
        <pre id="apiResponse"></pre>
      </div>
      
      <div style="margin-top: 20px">
        <div>Resolved value: </div>
        <pre id="resolvedValue"></pre>
      </div>
      
    </div>
    <div style="display: flex; flex: 0.5; flex-direction: column">
      <iframe id="e2e2e" srcdoc="${buildIframeDoc(buildIframeDocDefault)}" style="width: 100%;height: 100%;"/>
    </div>
  </div>
  `
})()

function buildIframeDoc(p: {
  apiKey: string,
  cliVersion: string,
  baseURL?: string,
  fileSlug: string,
  template: string,
}) {
  return `
    <!DOCTYPE html>
    <html>
    <script type="module">
      import Stringifyr from 'https://cdn.skypack.dev/@epilogo/stringifyr@${p.cliVersion}';
      new Stringifyr.StringifyrDOM({
        apiKey: "${p.apiKey}",
        baseURL: ${p.baseURL ? `"${p.baseURL}"` : 'undefined'},
        fetchOnLoadWithParams: {
          fileSlug: '${p.fileSlug}'
        },
        browser: {window}
      });
    </script>
    <body>
    
    <h1>{sfyr=${p.template}}</h1>
    
    XSS test
    <br />
    {sfyr=${p.template}}
    
    </div>
    </body>
    </html>
  `;

}
