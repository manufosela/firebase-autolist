# firebase-autolist

Autolistado de los elementos del path de una base de datos de Firebase mostrando el valor de la clave que seleccionemos

## Demo

```
<h2>Basic firebase-autolist Demo</h2>
<h3>Demo</h3>
<firebase-autolist path="FIREBASE_PATH" field-key="KEY_DOCUMENT_TO_SHOW"></firebase-autolist>

```
<!---
```
<custom-element-demo>
  <template>
    <link rel="import" href="firebase-autolist.html">
    <next-code-block></next-code-block>
  </template>
</custom-element-demo>
```
-->

```html
<firebase-autolist path="/peliculas" field-key="titulo"></firebase-autolist>
```

## Dependencies
Is mandatory has login token from firebase.
You can use [firebase-loginbutton](https://github.com/manufosela/firebase-loginbutton) component to do it.

## Events
When element is clicked dispatch **firebase-autolist-selectid** with payload element id and object id

## CSS-VARIABLES
```css
      --font-size: 1rem
      --link-hover: #0A7CAF
      --selected-color: #F30
      --selected-bg: #888
```

## Install the Polymer-CLI

First, make sure you have the [Polymer CLI](https://www.npmjs.com/package/polymer-cli) and npm (packaged with [Node.js](https://nodejs.org)) installed. Run `npm install` to install your element's dependencies, then run `polymer serve` to serve your element locally.

## Viewing Your Element

```
$ polymer serve
```

## Running Tests

```
$ polymer test
```

## Build
```
$ npm run build
```

Your application is already set up to be tested via [web-component-tester](https://github.com/Polymer/web-component-tester). Run `polymer test` to run your application's test suite locally.

##Author
**@manufosela**

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details

## Generated

**generator-lit-element-base** - *yeoman npm package* - by [@manufosela](https://github.com/manufosela/generator-litelement-webcomponent)