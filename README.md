uncoverage
==========

Abuse a code coverage tool to super-minify your code.

Usage
-----

This is still in development, so these instructions only show how to compare
the size of the demo bundle before and after removing unused code.

0. First install the global and local dependencies:

    `npm install -g browserify istanbul exorcist dalek`

    `npm install`

1. Open your terminal and run `npm run start &`.
This will run the coverage collecting server. This will receive the coverage results
from the run, and then save them into a `coverage.json`.

2. Next, run `npm run flow` in the terminal. This will build an instrumented bundle
to collect coverage, then run the app in Chrome automagically, then send the coverage to
the server. Then `uncoverage` will remove the code that your app doesn't use!

3. Now run `npm run bundle` to generate `demo-app/bundle.js` with a standard minification process.
We will use this standard bundle to compare with the uncoveraged bundle.

4. Compare the size of the uncoveraged `demo-app/bundle.min.js` and the standard `demo-app/bundle.js`. Try using `ls -lh demo-app` from the project root.

5. Stand in awe of how wicked-awful this idea is!

About
-----

Your web app builds use a lot of libraries, and you probably don't use every
piece of every library. So why should you ship code your users won't run?

You don't have to!

Just exhaustively run through all the use cases of your app with the
coverage-instrumented code using Istanbul, then generate the coverage.json.
`coverage.json` tells `uncoverage` which code you're using, and which code is
just dead weight.
