var fs = require('fs'),
    zipfile = require('zipfile'),
    path = require('path'),
    mkdirp = require('mkdirp');

module.exports = {};
module.exports.extract = function(filename, callback) {
    try {
        var zf = new zipfile.ZipFile(filename);
        var prj = dbf = shx = shp = false;

        zf.names.forEach(function(name) {
            if (path.extname(name) == '.shp') shp = path.basename(name, '.shp');
            if (path.extname(name) == '.prj') prj = path.basename(name, '.prj');
            if (path.extname(name) == '.dbf') dbf = path.basename(name, '.dbf');
            if (path.extname(name) == '.shx') shx = path.basename(name, '.shx');
        });

        // we need at least a shp file
        if (!shp) return callback(error('Missing required file type(s)'));

        // do all the files have the same basename?
        if ((shp !== prj) || (shp !== dbf) || (shp !== shx)) {
            return callback(error('Inconsistent file naming convention in the zipfile'));
        }

        // extract and use only the files we need
        var tempDir = __dirname + '/' + randomStr(30) + '/';

        mkdirp(tempDir, 0777, function(err) {
            if (err) return callback(error(err));

            var filesRemaining = zf.names.length;
            zf.names.forEach(function(file) {
                if ((['.shp', '.prj', '.dbf', '.shx'].indexOf(path.extname(file)) !== -1)) {

                    zf.readFile(file, function(err, buffer) {
                        if (err) return callback(error(err));

                        file = tempDir + path.basename(file);
                        fs.writeFile(file, buffer, function(err) {
                            if (err) return callback(error(err));
                            filesRemaining--;
                            if (filesRemaining === 0) {
                                return callback(null, tempDir, tempDir + shp + '.shp');
                            }
                        });

                    });
                } else {
                    filesRemaining--;
                }
            });

        });
    } catch (e) {
        return callback(error(e));
    }
};

function error(message) {
    var err = message instanceof Error ? message : new Error(message);
    err.code = 'EINVALID';
    return err;
}

function randomStr(length) {
    var str = '';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    chars += 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
}
