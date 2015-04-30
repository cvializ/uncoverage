var fs = require('fs');
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
app.listen(9000);
