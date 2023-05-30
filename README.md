# Stringifyr

A polymorphic JS library for integrating with the [Stringifyr](https://stringifyr.com) platform.

## ReactJS & ReactNative integration

```ts
import * as React from 'react';

export const Stringifyr = StringifyrReact({
  apiKey: 'REQUIRED_API_KEY',
  react: { React },
});
```

The initialization above exposes some hooks to be used in your components.

Let's say we have a Stringifyr file with the following keys and values
```json
{
  "blog.{lang=en}.{id=welcome}.title": "Welcome to my blog",
  "blog.{lang=en}.{id=welcome}.content": "...",
  "blog.{lang=en}.{id=tutorial}.title": "How to use Stringifyr",
  "blog.{lang=en}.{id=tutorial}.content": "..."
}
```

You can use `useNodeValue` to get all our blog posts in english
```ts
/**
 * Will resolve to 
 * posts = {
 *   welcome: {
 *     title: 'Welcome to my blog',
 *     content: '...',
 *   },
 *   tutorial: {
 *     title: 'How to use Stringifyr',
 *     content: '...',
 *   },
 * }
 */
const posts = Stringifyr.useNodeValue(`blog.en.{id}`);
```

`useNodeValue` will return an object with keys whenever you provide an unresolved variable
like `{lang}` or `{id}` and it will resolve the value when you define the variable. eg `blog.en`
  
If you provide the full path to a node only the string value will be returned.
E.g `blog.en.tutorial.title` will resolve to `How to use Stringifyr`.
```ts
/**
 * tutorialContent = "How to use Stringifyr"
 */
const tutorialContent = Stringifyr.useNodeValue(`blog.en.tutorial.title`);
```

## Pure HTML / JS integration
You can also include the library in other ways  
Checkout the [Skypack docs](https://docs.skypack.dev/skypack-cdn/getting-started) for more info
```html
<!DOCTYPE html>
<html>
<script type="module">
    import Stringifyr from 'https://cdn.skypack.dev/@epilogo/stringifyr';

    new Stringifyr.StringifyrDOM({
        apiKey: "REQUIRED_API_KEY",
        fetchOnLoadWithParams: {
            fileSlug: 'OPTIONAL_FILE_SLUG'
        },
    });
</script>
<body>

<-- "{sfyr=${blog.en.title}}" will be replaced with the related string value -->
<div>{sfyr=${blog.en.title}}</div>

</body>
</html>
```
