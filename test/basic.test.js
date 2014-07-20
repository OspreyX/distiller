var test = require('tape'),
    distiller = require('../'),
    path = require('path'),
    testData = path.dirname(require.resolve('mapnik-test-data'));

test('fail: does not exist', function(t) {
    distiller.geojson('does-not-exist', function(err, res) {
        t.ok(err instanceof Error, 'returns error for non-exist');
        t.equal(err.code, 'EINVALID', 'is invalid');
        t.notOk(res, 'and no result');
        t.end();
    });
});

test('fail: bad type', function(t) {
    distiller.geojson(__dirname + '/fixture/bad.txt', function(err, res) {
        t.ok(err instanceof Error, 'returns error for non-exist');
        t.equal(err.code, 'EINVALID', 'is invalid');
        t.notOk(res, 'and no result');
        t.end();
    });
});

test('succeed: csv', function(t) {
    distiller.geojson(testData + '/data/csv/bbl_current_csv.csv', function(err, res) {
        t.notOk(err, 'no error');
        t.ok(res, 'creates a result');
        t.equal(res.type, 'FeatureCollection', 'creates a featurecollection');
        t.end();
    });
});

test('succeed: shp', function(t) {
    distiller.geojson(testData + '/data/shp/world_merc/world_merc.shp', function(err, res) {
        t.notOk(err, 'no error');
        t.ok(res, 'creates a result');
        t.equal(res.type, 'FeatureCollection', 'creates a featurecollection');
        t.end();
    });
});

test('succeed: geojson', function(t) {
    distiller.geojson(testData + '/data/geojson/places.geo.json', function(err, res) {
        t.notOk(err, 'no error');
        t.ok(res, 'creates a result');
        t.equal(res.type, 'FeatureCollection', 'creates a featurecollection');
        t.end();
    });
});

test('succeed: kml', function(t) {
    distiller.geojson(testData + '/data/kml/1week_earthquake.kml', function(err, res) {
        t.notOk(err, 'no error');
        t.ok(res, 'creates a result');
        t.equal(res.type, 'FeatureCollection', 'creates a featurecollection');
        t.end();
    });
});

test('succeed: gpx', function(t) {
    distiller.geojson(testData + '/data/gpx/fells_loop.gpx', function(err, res) {
        t.notOk(err, 'no error');
        t.ok(res, 'creates a result');
        t.equal(res.type, 'FeatureCollection', 'creates a featurecollection');
        t.end();
    });
});
