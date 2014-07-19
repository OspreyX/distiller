var omnivore = require('mapnik-omnivore'),
    mapnik = require('mapnik');

module.exports.geojson = function(filename, callback) {
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
        if (meta.filetype === '.kml') {
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
