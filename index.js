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
        if (meta.filetype === '.geo.json') ds.layer_by_index = 0;
        ds = new mapnik.Datasource(ds);
        var geojson = featuresetToGeoJSON(ds.featureset());
        callback(null, geojson);
    }
};

function featuresetToGeoJSON(featureset) {
    var geojson = {
        type: 'FeatureCollection',
        features: []
    };
    var feat = featureset.next();
    while (feat) {
        geojson.features.push(JSON.parse(feat.toJSON()));
        feat = featureset.next();
    }
    return geojson;
}
