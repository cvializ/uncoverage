#!/usr/bin/env node

'use strict';

var fs = require('fs');
var program = require('commander');
var es = require('event-stream');
var pkg = require('./package.json');
var uc = require('./');

program
    .version(pkg.version)
    .description(pkg.description)
    .option('-i, --infile [filename]', 'The path of the input JavaScript file to convert. Reads from stdin if unspecified')
    .option('-o, --outfile [filename]', 'The path for the output JavaScript file. Writes to stdout if unspecified.')
    .option('-c, --coverage [filename]', 'The path of the coverage file. Defaults to coverage.json', '.coverage.json')
    .parse(process.argv);

var inputStream = (program.infile && program.infile !== '-' ? fs.createReadStream(program.infile) : process.stdin);
inputStream.on('error', function (err) {
    console.error('Error reading file: ' + err.path);
    console.error('Does that file exist?');
});

var outputStream = (program.outfile && program.outfile !== '-' ? fs.createWriteStream(program.outfile) : process.stdout);
outputStream.on('error', function (err) {
    console.error('Error writing file: ' + err.path);
    console.error('Do you have the correct permissions?');
});

var uncoverageStream = es.map(function (inputFile, cb) {
    cb(null, uc(inputFile.toString('utf8'), program.coverage));
});

inputStream
    .pipe(es.wait())
    .pipe(uncoverageStream)
    .pipe(outputStream);
