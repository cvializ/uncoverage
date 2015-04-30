var acorn = require('acorn');
var escodegen = require('escodegen');
var traverse = require('traverse');
var fs = require('fs');
var ast = acorn.parse(fs.readFileSync('bundle.unins.js'));
var coverage = require('./coverage.json');
var fileRoot = coverage['/Users/cvializ/workspace/poc/closure/bundle.unins.js'];
var statements = fileRoot.s;

// coverage.json statements are 1-indexed
var statementIndex = 1;

var newAst = traverse(ast).map(function (node) {
    if (node && node.type && ~node.type.indexOf('Statement')) {
        if (statements[statementIndex + ''] === 0) {
            this.type = 'EmptyStatement';
        }
        statementIndex++;
    }
});

fs.writeFileSync('bundle.min.js', escodegen.generate(newAst));
