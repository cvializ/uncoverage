var acorn = require('acorn');
var escodegen = require('escodegen');
var traverse = require('traverse');
var fs = require('fs');
var ast = acorn.parse(fs.readFileSync('bundle.unins.js'), {locations: true});
var coverage = require('./coverage.json');
var fileRoot = coverage['/Users/cvializ/workspace/poc/closure/bundle.unins.js'];
var statementMap = fileRoot.statementMap;
var statements = fileRoot.s;
var functions = fileRoot.f;
var branches = fileRoot.b;

function getHashCodes(loc) {
    var start = loc.start;
    var end = loc.end;
    var startHash;

    return {
        start: start.line + ':' + start.column,
        end: end.line + ':' + end.column
    };
}

function getPositionMap(nodes) {
    return nodes.reduce(function (acc, loc) {
        if (loc) {
            var hashCodes = getHashCodes(loc);
            startHash = acc[hashCodes.start] = {};
            startHash[hashCodes.end] = true;
        }

        return acc;
    }, {});
}

// coverage.json statements are 1-indexed
var statementIndex = 1;
var emptyStatementIndices = [];
while (statements[statementIndex + ''] !== undefined) {
    if (statements[statementIndex] === 0) {
        emptyStatementIndices.push(statementIndex);
    }
    statementIndex++;
}

var emptyStatements = emptyStatementIndices.map(function (emptyStatementIndex) {
    return statementMap[emptyStatementIndex + ''];
});

var emptyStatementMap = getPositionMap(emptyStatements);

var newAst = traverse(ast).map(function (node) {
    if (node && node.type && ~node.type.indexOf('ExpressionStatement')) {
        var hashCodes = getHashCodes(node.loc);
        if (emptyStatementMap[hashCodes.start] && emptyStatementMap[hashCodes.start][hashCodes.end]) {
            this.update({
                type: 'EmptyStatement'
            });
        }
    }
});

fs.writeFileSync('bundle.ecg.js', escodegen.generate(ast));
fs.writeFileSync('bundle.min.js', escodegen.generate(newAst));
