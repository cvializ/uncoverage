var fs = require('fs');
var portscanner = require('portscanner');
var im = require('istanbul-middleware');
var express = require('express');
var app = express();


// add the coverage handler
app.use('/coverage', im.createHandler());
app.post('/save', function (req, res) {
    req.pipe(fs.createWriteStream('coverage.json'));
    req.on('end', function () {
        res.status(200).end();
    });
});
app.use(express.static('./'));

portscanner.findAPortNotInUse(9000, 9999, 'localhost', function (err, port) {
    console.log('uncoverage server started on port', port);
    app.listen(port);
});
