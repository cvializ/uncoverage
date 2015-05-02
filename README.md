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

1. Open your terminal and run `npm run coverage && npm run start`.
This will build the bundle and start the demo server

2. Next, navigate your browser to the demo page (probably `localhost:9000/demo-app/`).

3. Look at the page and click the `Save Coverage to file` button.

4. Next enter `npm run uncoverage in the terminal. This step generates `demo-app/bundle.min.js`

5. Now run `npm run bundle` to generate `demo-app/bundle.js` with a standard minification process.

6. Compare the size of `demo-app/bundle.min.js` and `demo-app/bundle.js`. Try using `ls -lh demo-app` from the project root.

7. Stand in awe of how wicked-awful this idea is!

About
-----

Your web app builds use a lot of libraries, and you probably don't use every
piece of every library. So why should you ship code your users won't run?

You don't have to!

Just exhaustively run through all the use cases of your app with the
coverage-instrumented code using Istanbul, then generate the coverage.json.
`coverage.json` tells `uncoverage` which code you're using, and which code is
just dead weight.
