var fs = require('fs'),
    zipfile = require('zipfile'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    validateZip = require('./validatezip'),
    invalid = require('./invalid');

module.exports = {};
module.exports.extract = function(filename, callback) {
    try {
        var zf = new zipfile.ZipFile(filename);

        validateZip.validate(zf, function(err, extensions, projectionFile) {
            if (err) return callback(err);

            var shp = projectionFile.split('.prj').join('');

            // extract and use only the files we need
            var tempDir = __dirname + '/' + path.dirname(shp) + randomStr(15) + '/';

            mkdirp(tempDir, 0777, function(err) {
                if (err) return callback(invalid(err));

                var filesRemaining = zf.names.length;
                zf.names.forEach(function(file) {
                    if ((extensions.indexOf(path.extname(file)) !== -1)) {

                        zf.readFile(file, function(err, buffer) {
                            if (err) return callback(invalid(err));

                            file = tempDir + path.basename(file);
                            fs.writeFile(file, buffer, function(err) {
                                if (err) return callback(invalid(err));
                                filesRemaining--;
                                if (filesRemaining === 0) {
                                    return callback(null, tempDir, tempDir + path.basename(shp), extensions);
                                }
                            });
                        });

                    } else {
                        filesRemaining--;
                    }
                });
            });
        });
    } catch (e) {
        return callback(invalid(e));
    }
};

function randomStr(length) {
    var str = '';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    chars += 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
}
