var acorn = require('acorn');
var escodegen = require('escodegen');
var traverse = require('traverse');
var fs = require('fs');

function getPositionKeys(loc) {
    if (loc.loc) loc = loc.loc;

    var start = loc.start;
    var end = loc.end;
    var startHash;

    return {
        start: start.line + ':' + start.column,
        end: end.line + ':' + end.column
    };
}

function getPositionMap(locs) {
    return locs.reduce(function (acc, loc) {
        if (loc) {
            var hashCodes = getPositionKeys(loc);
            acc[hashCodes.start] = {};
            acc[hashCodes.start][hashCodes.end] = true;
        }

        return acc;
    }, {});
}

function getUncalledCoverageLocations(coverageIndices, coverageLocs) {
    var uncalledLocs = coverageIndices.map(function (coverageAtIndex, i) {
        if (coverageAtIndex === 0) {
            // coverageIndex is an uncalled index
            return coverageLocs[i]; // i is important here, because the arrays are associated.
        }
    }).filter(Boolean);

    return getPositionMap(uncalledLocs);
}

function createEmptyFunction(id, isExpression) {
    var template = {
        "start": 0,
        "loc": {
            "start": {
                "line": 0,
                "column": 0
            },
            "end": {
                "line": 0,
                "column": 0
            }
        },
        "id": id,
        "params": [],
        "body": {
            "start": 0,
            "loc": {
                "start": {
                    "line": 0,
                    "column": 0
                },
                "end": {
                    "line": 0,
                    "column": 0
                }
            },
            "body": [],
            "type": "BlockStatement",
            "end": 0
        },
        "expression": false,
        "type": isExpression ? "FunctionExpression" : "FunctionDeclaration",
        "end": 0
    };

    return template;
}

function convertHash(hash) {
    return Object.keys(hash).map(function (key) {
        return hash[key];
    });
}

function uncoverage(code, coverage) {
    // If the args are filenames, get the file contents
    if (fs.existsSync(code)) code = fs.readFileSync(code);
    if (fs.existsSync(coverage)) coverage = fs.readFileSync(coverage);


    var bundleCoverage = coverage[Object.keys(coverage)[0]];
    var uncalledStatementMap = getUncalledCoverageLocations(convertHash(bundleCoverage.s), convertHash(bundleCoverage.statementMap));
    var uncalledFunctionMap = getUncalledCoverageLocations(convertHash(bundleCoverage.f), convertHash(bundleCoverage.fnMap));

    var ast = acorn.parse(code, {locations: true});

    var newAst = traverse(ast).map(function (node) {
        if (node && node.type) {
            var hashCodes = getPositionKeys(node.loc);

            if (~node.type.indexOf('Function')) {
                // I'm not sure why, but the end doesn't always line up with what coverage says : ?
                if (uncalledFunctionMap[hashCodes.start]/* && uncalledFunctionMap[hashCodes.start][hashCodes.end]*/) {
                    var isExpression;

                    if (~node.type.indexOf('Expression')) {
                        isExpression = true;
                    }

                    this.update(createEmptyFunction(node.id, isExpression));
                }
            } else if (~node.type.indexOf('Statement')) {
                if (uncalledStatementMap[hashCodes.start] && uncalledStatementMap[hashCodes.start][hashCodes.end]) {
                    this.update({
                        type: 'EmptyStatement'
                    });
                }
            }
        }
    });

    return escodegen.generate(newAst);
}

uncoverage.transform = require('./transform');

module.exports = uncoverage;
