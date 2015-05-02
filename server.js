var fs = require('fs');
var path = require('path');
var program = require('commander');
var portscanner = require('portscanner');
var im = require('istanbul-middleware');
var express = require('express');
var cors = require('cors');
var pkg = require('./package.json');
var app = express();

function range(val) {
    return val.split('..').map(Number);
}

program
    .version(pkg.version)
    .description(pkg.description)
    .option('-d, --directory [path]',
            'The path of folder to server. Default: $PWD',
            process.cwd())
    .option('-c, --coverage [url]',
            'The root of the API URLs. Default: /coverage',
            '/coverage')
    .option('-o, --output [path]',
            'Where to save coverage data. Default: coverage.json',
            'coverage.json')
    .option('-p, --port [start..end]',
            'Port or port range. Default: 9000..9999',
            range)
    .parse(process.argv);

program.port = program.port || [];
if (!program.port[0]) {
    program.port[0] = 9000;
    program.port[1] = 9999;
}

app.use(cors());

// Add this first, so this gets the request before
// the istanbul-middleware consumes it.
app.post(path.join(program.coverage, 'save'), function (req, res) {
    req.pipe(fs.createWriteStream(program.output));
    req.on('end', function () {
        res.status(200).end();
    });
});
// Add the istanbul middleware
app.use(program.coverage, im.createHandler());
app.use(express.static(program.directory));

portscanner.findAPortNotInUse(program.port[0], program.port[1] || program.port[0], 'localhost', function (err, port) {
    console.log('uncoverage server started on port', port);
    app.listen(port);
});
