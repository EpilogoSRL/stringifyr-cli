// @ts-ignore
import Cookies from 'js-cookie';
import { isEmpty } from 'lodash';
import { StringifyrDOM } from "../lib/entry/StringifyrDOM";
import { TString } from "../lib/stringifyr/Api";
import { Sfyr } from "../lib/stringifyr/Sfyr";

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
    prompt: `Enter your default file slug (defaults to '${Sfyr.DEFAULT_FILE_SLUG}'):`
  },
  template: {
    cookie: 'stringifyer-last-template',
    prompt: "Enter a Stringifyer template:"
  },
}

const values = Object.keys(params).reduce((acc, key) => {
  const def = params[key];

  let _value: any = Cookies.get(def.cookie);

  const set = (value) => {
    _value = value;
    Cookies.set(def.cookie, _value);
    return _value;
  }

  const value = () => {
    return _value;
  }

  acc[key] = {
    set,
    value,
  };

  return acc;
}, {} as Record<keyof typeof params, {
  set: (value: string) => void,
  value: () => string,
}>);

// @ts-ignore
window.values = values;

const {
  stringifyr,
  refresh
} = StringifyrDOM({
  isDev: true,
  apiKey: values.apiKey.value(),
  fetchOnLoadWithParams: {
    fileSlug: isEmpty(values.fileSlug.value()) ? undefined : values.fileSlug.value(),
    __incUnpublished: true,
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
  handleSyncValues();

  const apiKeyInput = document.getElementById("apiKey");
  const fileSlugInput = document.getElementById("fileSlug");
  const templateInput = document.getElementById("template");
  const refreshButton = document.getElementById("refresh");

  apiKeyInput.addEventListener('input', function(event) {
    // @ts-ignore
    values.apiKey.set(event.target.value);
  })

  fileSlugInput.addEventListener('input', function(event) {
    // @ts-ignore
    values.fileSlug.set(event.target.value);
  })

  templateInput.addEventListener('input', function(event) {
    // @ts-ignore
    values.template.set(event.target.value);
  })

  apiKeyInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      fileSlugInput.focus();
    }
  })

  fileSlugInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      templateInput.focus();
    }
  })

  templateInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      refreshButton.click();
    }
  })
}

function handleSyncValues() {
  const apiKey = values.apiKey.value();
  const fileSlug = values.fileSlug.value();
  const template = values.template.value();

  console.log("Refreshing with", {
    template,
    fileSlug,
    apiKey
  });

  function setNode(sync: TString) {
    document.getElementById('apiResponse').innerText = JSON.stringify(sync, undefined, 2);
    const resolvedValueEl = document.getElementById('resolvedValue');
    resolvedValueEl.innerText = `{sfyr=${template}}`;
    refresh(resolvedValueEl);
    document.getElementById('e2e2e').setAttribute('srcdoc', buildIframeDoc({
      ...buildIframeDocDefault,
      apiKey,
      fileSlug,
      template
    }))
  }

  stringifyr.setFileSlug(fileSlug);
  stringifyr.setApiKey(apiKey);
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

// @ts-ignore
window.handleSyncValues = handleSyncValues;

(async () => {
  document.querySelector("body").innerHTML = `
  <div style="padding: 24px;display: flex; flex: 1; flex-direction: row"">
    <div style="display: flex; flex: 0.5; flex-direction: column">
      <div style="margin-top: 20px">
        
        <label>Api key:</label>
        <input style="width: 512px" type="text" id="apiKey" value="${values.apiKey.value()}"><br><br>
        
        <label>File slug:</label>
        <input style="width: 512px" type="text" id="fileSlug" value="${values.fileSlug.value()}"><br><br>
        
        <label>Template:</label>
        <input style="width: 512px" type="text" id="template" ${values.template.value()}><br><br>
      
        <button onclick="window.handleSyncValues()" id="refresh">REFRESH</button>
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
          fetchOnLoadWithParams: {
            fileSlug: '${p.fileSlug}',
            __incUnpublished: true,
          },
        });
      </script>
      <body>
        <h1>{sfyr=${p.template}}</h1>
        
        XSS test
        <br />
        {sfyr=${p.template}}
      </body>
    </html>
  `;

}
