import HelloWorld from './component';
import React from 'react';
import domready from 'domready';

domready(function () {
    var wowCool = "This is my last wish";
    React.render(<HelloWorld title="Hello" text="world!" />, document.querySelector('#main'));
});
