var fs = require('fs'),
    rmdir = require('rimraf'),
    omnivore = require('mapnik-omnivore'),
    mapnik = require('mapnik'),
    shpzip = require('./lib/shpzip');

module.exports.geojson = function(filename, callback) {
    if (filename.toLowerCase().indexOf('.zip') !== -1) {
        return shpzip.extract(filename, function(err, dir, file) {
            if (err) return callback(err);
            module.exports.geojson(file, function(err, geojson) {
                rmdir(dir, function() {
                    callback(err, geojson);
                });
            });
        });
    }

    omnivore.digest(filename, ondigest);

    function ondigest(err, meta) {
        if (err) return callback(err);

        var ds = {
            type: meta.dstype,
            file: filename
        };

        var geojson = {
            type: 'FeatureCollection'
        };

        if (meta.filetype === '.geo.json') ds.layer_by_index = 0;
        if (meta.filetype === '.kml' ||
            meta.filetype === '.gpx') {
                geojson.features = [];
                meta.layers.forEach(function(layer) {
                    ds.layer = layer;
                    var mapnikDS = new mapnik.Datasource(ds);
                    geojson.features.push(featuresetTofeatures(mapnikDS.featureset()));
                });
                callback(null, geojson);
        } else {
            ds = new mapnik.Datasource(ds);
            geojson.features = featuresetTofeatures(ds.featureset());
            callback(null, geojson);
        }
    }
};

function featuresetTofeatures(featureset) {
    var features = [];
    var feat = featureset.next();
    while (feat) {
        features.push(JSON.parse(feat.toJSON()));
        feat = featureset.next();
    }
    return features;
}
