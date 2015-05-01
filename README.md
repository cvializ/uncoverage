uncoverage
==========

Abuse a code coverage tool to super-minify your code.

Usage
-----

This is still in development, so these instructions only show how to compare
the size of the demo bundle before and after removing unused code.

0. First install the global and local dependencies:

    `npm install -g browserify uglify-js istanbul exorcist`

    `npm install`

1. Open your terminal and run `npm run coverage && npm run server`.
This will build the bundle and start the demo server

2. Next, navigate your browser to the demo page (probably `localhost:9000`).

3. Look at the page and click the `Save Coverage to file` button.

4. Next enter `run npm start` in the terminal. This step generates `bundle.min.js`

5. Now run `npm run bundle` to generate `bundle.js` with standard minification.

6. Compare the size of `bundle.min.js` and `bundle.js`.

7. But wait, there's more! `bundle.min.js` hasn't been uglified. Run `npm run uglify` to minify it.

8. Now compare the sizes of `bundle.min.min.js` and `bundle.js` and stand in awe of how awful this idea is.
