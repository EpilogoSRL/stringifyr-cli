import { Stringifyr } from "../lib/stringifyr/Stringifyr";

const stringifyr = new Stringifyr({
  apiKey: '6bj17r642arwpnaochcwr22pbiyhlz0ijijvxdm10hqka7jm',
  baseURL: 'https://us-central1-stringifyr-develop.cloudfunctions.net/publicApi',
  fileSlug: '',
  storage: undefined
});

(async () => {
  const result = await stringifyr.node('blog.{lang=it}.{id=prototyping}.subtitle');
  console.log(result);
  document.querySelector("body").innerHTML = result?.value;
})()
