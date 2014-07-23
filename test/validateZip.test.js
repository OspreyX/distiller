var test = require('tape'),
    validateZip = require('../lib/validateZip.js');

var errorTests = {
    '0': {
        message: 'Zipfile is empty',
        desc: 'should return an error because there are no files to validate',
        files: []
    },
    '1': {
        message: 'Inconsistent file naming convention in the zipfile',
        desc: 'should return an error because of inconsistent file names',
        files: ['oops.shp', 'test.shx', 'test.dbf', 'test.prj']
    },
    '2': {
        message: 'Duplicate file extensions in the zipfile',
        desc: 'should return an error because of duplicate file extensions',
        files: ['test.shp', 'test.shp', 'test.shx', 'test.dbf', 'test.prj']
    },
    '3': {
        message: 'Zipfile does not contain valid files',
        desc: 'should return an error because the zip only contains garbage files',
        files: ['__MACOSX']
    },
    '4': {
        message: 'Missing required file type(s)',
        desc: 'should return an error because .prj is missing',
        files: ['test.shp', 'test.shx', 'test.dbf']
    }
};
for (var scenario in errorTests)(function(scenario, testy) {
    test(testy.desc, function(t) {
        validateZip.checkFiles(testy.files, function(err) {
            t.ok(err instanceof Error, 'creates an error');
            t.equal(err.message, testy.message);
            t.equal('EINVALID', err.code);
            t.end();
        });
    });
})(scenario, errorTests[scenario]);

test('fail: no files to validate', function(t) {
    validateZip.checkFiles([], function(err) {
        t.ok(err instanceof Error, 'creates an error');
        t.equal(err.message, 'Zipfile is empty');
        t.equal('EINVALID', err.code);
        t.end();
    });
});

test('fail: inconsistent file names', function(t) {
    validateZip.checkFiles(['oops.shp', 'test.shx', 'test.dbf', 'test.prj'], function(err) {
        t.ok(err instanceof Error, 'creates an error');
        t.equal(err.message, 'Inconsistent file naming convention in the zipfile');
        t.equal('EINVALID', err.code);
        t.end();
    });
});

test('fail: inconsistent file names', function(t) {
    validateZip.checkFiles(['oops.shp', 'test.shx', 'test.dbf', 'test.prj'], function(err) {
        t.ok(err instanceof Error, 'creates an error');
        t.equal(err.message, 'Inconsistent file naming convention in the zipfile');
        t.equal('EINVALID', err.code);
        t.end();
    });
});

test('success: returns extension and projection file', function(t) {
    var files = ['test.shp', 'test.shx', 'test.dbf', 'test.prj'];
    validateZip.checkFiles(files, function(err, extensions, projectionFile) {
        if (err) return done(err);
        t.ok(extensions, 'extensions exist');
        t.ok(extensions.length === 4, 'four extensions');
        t.ok(projectionFile, 'projection file exists');
        t.equal(projectionFile, 'test.prj');
        t.strictEqual(err, null);
        t.end();
    });
});

test('should succeed even with a garbage file', function(t) {
    var files = ['test.shp', '__MACOSX', 'test.shx', 'test.dbf', 'test.prj'];
    validateZip.checkFiles(files, function(err, extensions, projectionFile) {
        if (err) return done(err);
        t.ok(extensions, 'extensions exists');
        t.ok(extensions.length === 4, 'four extensions');
        t.ok(projectionFile, 'projection file exists');
        t.equal(projectionFile, 'test.prj');
        t.strictEqual(err, null);
        t.end();
    });
});
