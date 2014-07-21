var fs = require('fs'),
    zipfile = require('zipfile'),
    path = require('path'),
    mkdirp = require('mkdirp');

module.exports = {};
module.exports.extract = function(filename, callback) {
    try {
        var zf = new zipfile.ZipFile(filename);
        var prj = dbf = shx = shp = false;
        var dir;

        zf.names.forEach(function(name) {
            if (name.slice(-1) === '/') dir = name;
            if (path.extname(name) == '.shp') shp = path.basename(name, '.shp');
            if (path.extname(name) == '.prj') prj = path.basename(name, '.prj');
            if (path.extname(name) == '.dbf') dbf = path.basename(name, '.dbf');
            if (path.extname(name) == '.shx') shx = path.basename(name, '.shx');
        });

        // do all the files have the same basename?
        if (!shp ||
            !(shp === prj) ||
            !(shp === dbf) ||
            !(shp === shx)
        ) {
            return callback({
                code: 400,
                message: 'invalid shapefile'
            });
        }

        // extract and use only the files we need
        var tempDir = __dirname + '/' + dir.slice(0, dir.length-1) + randomStr(30) + '/';
        mkdirp(tempDir, 0777, function(err) {
            if (err) return callback({
                code: 400,
                message: err
            });

            var filesRemaining = zf.names.length;
            zf.names.forEach(function(file) {
                if ((['.shp', '.prj', '.dbf', '.shx'].indexOf(path.extname(file)) !== -1)) {

                    zf.readFile(file, function(err, buffer) {
                        if (err) return callback({
                            code: 400,
                            message: err
                        });

                        file = file.split(dir).join(tempDir);

                        fs.writeFile(file, buffer, function(err) {
                            if (err) return callback({
                                code: 400,
                                message: err
                            });
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
        return callback({
            code: 400,
            message: e
        });
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
