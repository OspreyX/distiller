var test = require('tape'),
    distiller = require('../');

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
    distiller.geojson(__dirname + '/fixture/csv/valid_csv.csv', function(err, res) {
        t.notOk(err, 'no error');
        t.ok(res, 'creates a result');
        t.equal(res.type, 'FeatureCollection', 'creates a featurecollection');
        t.end();
    });
});

test('succeed: shp', function(t) {
    distiller.geojson(__dirname + '/fixture/shp/world_merc.shp', function(err, res) {
        t.notOk(err, 'no error');
        t.ok(res, 'creates a result');
        t.equal(res.type, 'FeatureCollection', 'creates a featurecollection');
        t.end();
    });
});

test('succeed: geojson', function(t) {
    distiller.geojson(__dirname + '/fixture/geojson/valid_geojson.geo.json', function(err, res) {
        t.notOk(err, 'no error');
        t.ok(res, 'creates a result');
        t.equal(res.type, 'FeatureCollection', 'creates a featurecollection');
        t.end();
    });
});
