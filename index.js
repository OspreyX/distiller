var omnivore = require('mapnik-omnivore'),
    mapnik = require('mapnik');

module.exports.geojson = function(filename, callback) {
    omnivore.digest(filename, ondigest);

    function ondigest(err, meta) {
        if (err) return callback(err);
        var ds = new mapnik.Datasource({
            type: meta.dstype,
            file: filename
        });
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
