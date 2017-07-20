# jQuery edbox
Responsive and lightweight modal plugin.
Check for examples at the **[plugin page here](https://eduardocmoreno.github.io/jquery.edbox/)**

#### Download
**bower:** bower install jquery.edbox --save
**npm:** npm install jquery.edbox --save
**zip:** [download .zip file](https://eduardocmoreno.github.io/jquery.edbox/jquery.edbox.zip)

#### Options
Option | Tag attribute | Type | Default | Description
--- | --- | --- | --- | ---
target | data-box-target | string | null | DOM element
html | data-box-html | string | null | html and/or text
image | data-box-image | string | null | image path
url | data-box-url | string | null | url path (files, pages, etc...)
success | data-box-success | string | null | Alert success
info | data-box-info | string | null | Alert info
warning | data-box-warning | string | null | Alert warning
danger | data-box-danger | string | null | Alert danger
header | data-box-header | string | null | Optional header tag - accepts html and/or text
footer | data-box-footer | string | null | Optional footer tag - accepts html and/or text
width | data-box-width | number | null | Set a fixed width value to the modal
height | data-box-height | number | null | Set a fixed height value to the modal
addClass | data-box-add-class | string | null | Adds a especific class to the modal
close | data-box-close | boolean | true | Makes the modal closable or not.
animation | data-box-animation | boolean | true | Makes the modal animable or not.
animateOpen | data-box-animate-open | string | 'edbox-animate-open' | CSS animation class on open
animateClose | data-box-animate-close | string | 'edbox-animate-close' | CSS animation class on close
beforeOpen | data-box-before-open | function | function() {} | Function callback before open the modal
afterOpen | data-box-after-open | function | function() {} | Function callback after open the modal
beforeClose | data-box-before-close | function | function() {} | Function callback before close the modal
afterClose | data-box-after-close | function | function() {} | Function callback after close the modal

#### Methods
```javascript
//set edbox for the set of matched elements
$('.myModalLink').edbox({ options });

//Init without assigning any element
$.edbox({ options });

//Make custom settings as defaults
$.edboxSettings({ options });

//Close event
$.edbox('close');
```

#### Change Log
**v2.3.0**
* [JS] - Now it's possible to use all options as tag attribute

**v2.2.3**
* [JS] [CSS] - Some adjustments for better browser compatibility

**v2.2.2**
* [JS] - CSSImproved close button positioning based on scrollbar width
* [JS] - Other small improvements
* [CSS] - New helper class added to the parent box if option close is false

**v2.2.1**
* [JS] - Improved url option;
* [JS] - Improved header option;
* [JS] - Improved validations;
* [CSS] - Adjustments;

**v2.2.0**
* [JS] - Fixed image load;
* [JS] - Fixed callback afterClose;
* [JS] - New alert options like bootstrap;
* [CSS] - New CSS properties and adjustments;

**v2.1.0**
* [JS] [HTML] - New settable attributes "data-box-header" and "data-box-footer";
* [CSS] - Adjustments;

**v2.0.0**
* New features;
* Easy to use;
* Easy customization;
* CSS animations;
* SASS file;