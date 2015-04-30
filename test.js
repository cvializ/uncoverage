var acorn = require('acorn');
var escodegen = require('escodegen');
var traverse = require('traverse');
var fs = require('fs');
var ast = acorn.parse(fs.readFileSync('bundle.unins.js'), {locations: true});
var coverage = require('./coverage.json');
var bundleCoverage = coverage['/Users/cvializ/workspace/poc/closure/bundle.unins.js'];
var statementMap = bundleCoverage.statementMap;
var statements = bundleCoverage.s;
var functions = bundleCoverage.f;
var branches = bundleCoverage.b;

function getPositionKeys(loc) {
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
            startHash = acc[hashCodes.start] = {};
            startHash[hashCodes.end] = true;
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
        return coverageLocs[uncalledIndex + ''];
    });

    return getPositionMap(uncalledLocs);
}

var uncalledStatementMap = getUncalledCoverageLocations(bundleCoverage.s, bundleCoverage.statementMap);
var uncalledBranchMap = getUncalledCoverageLocations(bundleCoverage.b, bundleCoverage.branchMap);

var newAst = traverse(ast).map(function (node) {
    if (node && node.type) {
        var hashCodes = getPositionKeys(node.loc);
        if ((uncalledStatementMap[hashCodes.start] && uncalledStatementMap[hashCodes.start][hashCodes.end]) ||
            (uncalledBranchMap[hashCodes.start] && uncalledBranchMap[hashCodes.start][hashCodes.end])) {
            this.update({
                type: 'EmptyStatement'
            });
        }
    }
});

fs.writeFileSync('bundle.ecg.js', escodegen.generate(ast));
fs.writeFileSync('bundle.min.js', escodegen.generate(newAst));
