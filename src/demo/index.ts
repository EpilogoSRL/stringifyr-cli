// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Cookies from 'js-cookie';
import { StringifyrDOM } from "../lib/stringifyr/StringifyrDOM";

const apiKey = Cookies.get('stringifyer-api-key') || prompt("Enter your Stringifyer apiKey (Can be found at http://stringifyer.com/app/settings):");
Cookies.set('stringifyer-api-key', apiKey);
const defaultFileSlug = Cookies.get('stringifyer-default-slug') || prompt("Enter your default file slug (defaults to latest file):");
Cookies.set('stringifyer-default-slug', defaultFileSlug);


const {
  stringifyr,
  render
} = StringifyrDOM({
  apiKey,
  baseURL: 'https://us-central1-stringifyr-develop.cloudfunctions.net/publicApi',
  defaultFileSlug,
  storage: undefined,
  browser: {
    window: window,
  }
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
window.onSetTemplate = function () {
  const template = prompt('Enter a Stringifyer template');
  document.getElementById('template').innerText = template;

  document.getElementById('apiResponse').innerText = 'Loading...';
  stringifyr.node(template).then((result) => {
    document.getElementById('apiResponse').innerText = JSON.stringify(result, undefined, 2);
    render(document.getElementById('resolvedValue'), result);
  })
};

(async () => {
  document.querySelector("body").innerHTML = `
  <div style="padding: 24px;">
    <button onclick="window.onSetTemplate()">Change template</button>
    
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
  `
})()
