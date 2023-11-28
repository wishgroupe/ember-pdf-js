# ember-pdf-js

A simple addon to wrap PDF.js in ember (octane).  
This addon is based on [ember-pdf-js](https://github.com/smith-carson/ember-pdf-js) but converted to Octane.
Search functionalities have been disabled.


## Compatibility

* Ember.js v3.28 or above
* Ember CLI v3.28 or above
* Node.js v14 or above

## Usage

To use it in a really simple way just use the pdf-js component:

```handlebars
<PdfJs @pdf={{this.pdf}} />
```
In most cases, you will want to "extend" the toolbar component, you can develop your own component and make `ember-pdf-js` use it:

```handlebars
<PdfJs
        @pdf={{this.src}}
        @onLoad={{this.onLoadDocument}}
        @toolbarComponent={{component "your-component"
                              args1=this.args1
                              args2=this.args2}}

/>
```
You can subscribe to loading progress by using `@onLoad` argument. The callback will receive the percentageOf Loading and the document when available.
```handlebars
<PdfJs @pdf={{this.src}} @onLoad={{this.onLoadDocument}} />
```
```js
@action
onLoadDocument(percentage, document) {
  this.percentLoaded = percentage;
  this.pdfDocument = document;
}
```
## License

This project is licensed under the [MIT License](LICENSE.md).
