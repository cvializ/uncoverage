var acorn = require('acorn');
var escodegen = require('escodegen');
var traverse = require('traverse');
var fs = require('fs');

var ast = acorn.parse(fs.readFileSync('bundle.unins.js'), {locations: true});
var coverage = require('./coverage.json');
var bundleCoverage = coverage[Object.keys(coverage)[0]];

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
    var uncalledIndices = [];
    var uncalledLocs;
    // Get uncalled indices
    // The istanbul coverage lists are 1-indexed
    for (var i = 1; coverageIndices[i] !== undefined; i++) {
        if (coverageIndices[i] === 0) {
            uncalledIndices.push(i);
        }
    }

    // convert indices to matching locations
    uncalledLocs = uncalledIndices.map(function (uncalledIndex) {
        return coverageLocs[uncalledIndex];
    });

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

// Branches need some massaging first
bundleCoverage.b.length = 9999999999; // do this so Array.reduce works : )
bundleCoverageMap.length = 9999999999;
var flatB = Array.prototype.reduce.call(bundleCoverage.b, function (acc, node) {
    acc = acc.concat(node);
    return acc;
}, []);
var flatBranchMap = Array.prototype.reduce.call(bundleCoverage.branchMap, function (acc, node) {
    var t = traverse(node);
    var left = t.clone();
    var right = t.clone();

    left.loc = left.locations[0];
    right.loc = right.locations[1];
    acc.push(left, right);
    return acc;
}, []);

var uncalledStatementMap = getUncalledCoverageLocations(bundleCoverage.s, bundleCoverage.statementMap);
var uncalledFunctionMap = getUncalledCoverageLocations(bundleCoverage.f, bundleCoverage.fnMap);

var uncalledBranchMap = getUncalledCoverageLocations(flatB, flatBranchMap);

var newAst = traverse(ast).map(function (node) {
    if (node && node.type) {
        var hashCodes = getPositionKeys(node.loc);

        if (~node.type.indexOf('Function')) {
            // I'm not sure why, but the end doesn't always line up with what coverage says : ?
            if ((uncalledFunctionMap[hashCodes.start]/* && uncalledFunctionMap[hashCodes.start][hashCodes.end]*/)){
                var isExpression;

                if (~node.type.indexOf('Expression')) {
                    isExpression = true;
                }

                this.update(createEmptyFunction(node.id, isExpression));
            }
        } else if (~node.type.indexOf('Statement')) {
            if ((uncalledStatementMap[hashCodes.start] && uncalledStatementMap[hashCodes.start][hashCodes.end])) {
                this.update({
                    type: 'EmptyStatement'
                });
            }
        }
    }
});

fs.writeFileSync('bundle.ecg.js', escodegen.generate(ast));
fs.writeFileSync('bundle.min.js', escodegen.generate(newAst));
