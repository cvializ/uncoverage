uncoverage
==========

Use [Dynamic Dead Code Elimination](http://en.wikipedia.org/wiki/Dead_code_elimination#Dynamic_dead_code_elimination
) to super-minify your code.

*this is just a POC, use at your own risk*

Overview
--------

Your web apps use a lot of libraries, and you probably don't use every
piece of every library. So why should you ship _all_ of that code when your
users won't run all of it?

You don't have to ship it all! Enter `uncoverage`.

Just write an exhaustive automated run-through of your app, then generate a
`coverage.json`. `coverage.json` tells `uncoverage` which code you're using, and which code is
just dead weight.

Demo Usage
----------

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

Actual Usage
------------

Integrating with `uncoverage` has two steps:

1. Generating `coverage.json`

2. Removing dead code which `coverage.json` indicates was not run.

### Generating `coverage.json`

To accomplish the first step, use `istanbul` to instrument your app with extra coverage-detecting code.

```shell
# This example uses a browserify bundle,
# but it doesn't have to be one
istanbul instrument demo-app/bundle.unins.js > demo-app/bundle.js"
```

Then, run your app using the instrumented package instead of the usual un-instrumented code. And here is the tricky part: it is essential that you run through __each and every use case__, or `uncoverage` will remove the code for use cases that are not run.

You should automate this process with a tool like `selenium` or `dalek`.

When you run your instrumented app manually, you can access the coverage data in the console. It's stored as the global variable `window.__coverage__` by default.

To automatically save coverage data, use a collecting server for the test runner to phone home to. See `uncoverage/server.js` and `uncoverage/demo-app/dalek.js` for sample details.

### Removing dead code

Now that `coverage.json` is saved, `uncoverage` can free our users from dead code.

Again, a `browserify` transform is available, but the package can be used directly in code.

```javascript
// Use it in code ...
var fs = require('fs');
var uc = require('uncoverage');
var uninstrumented = 'bundle.unins.js';
var coverage = 'coverage.json';
fs.writeFileSync('bundle.min.js', uc(uninstrumented, coverage));
```

```shell
# ... or in browserify
browserify bundle.unins.js -t [ uncoverage/transform --coverage overage.json ] -o bundle.min.js
```
