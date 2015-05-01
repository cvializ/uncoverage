var fs = require('fs');
var through = require('through');
var uncoverage = require('./');

function transform(file, options) {
    options = options || {};
    options.coverage = options.coverage || './coverage.json';

    var data = '';

    return through(write, end);

    function write(buf) {
        data += buf;
    }

    function end() {
        var coverage = JSON.parse(fs.readFileSync(options.coverage));

        this.queue(uncoverage(data, coverage));
        return this.queue(null);
    }
}

module.exports = transform;
