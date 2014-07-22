//Dependencies
var zipfile = require('zipfile'),
    fs = require('fs'),
    path = require('path'),
    invalid = require('./invalid');
/**
 * Validates files within zip
 * @param zf (Zipfile)
 * @returns callback(err, projection)
 */
var validate = function(zf, callback) {
    checkFiles(zf.names, function(err, extensions, projectionFile) {
        if (err) return callback(err);
        return callback(null);
    });
};
/**
 * Iterates through files within zip to check for errors
 * @param files (contents of zip)
 * @returns callback(err, extensions, projectionFile)
 */
var checkFiles = function(files, callback) {
    var basename;
    var valid;
    var extensions = [];
    var projectionFile;
    if (files.length === 0) return callback(invalid('Zipfile is empty'));
    //Make sure set valid basename for comparison
    for (var i = 0; i < files.length; i++) {
        var currentFilename = files[i];
        if ((currentFilename.indexOf("__MACOSX") === -1) && ((currentFilename.indexOf(".DS_Store")) === -1)) {
            if (currentFilename.indexOf('/') === -1) {
                basename = currentFilename.slice(0, currentFilename.indexOf("."));
                break;
            } else if ((currentFilename.charAt((currentFilename.length) - 1)) !== '/') {
                basename = currentFilename.slice((currentFilename.indexOf('/') + 1), currentFilename.indexOf("."));
                break;
            };
        };
    };
    //filter out garbage files from zip
    function okFile(file) {
        var slash = file.charAt(file.length - 1);
        var fileBasename = path.basename(file);
        if ((slash !== '/') && (path.extname(file) != "") && (file[0] != '.') && (fileBasename[0] != '.') && (file.indexOf('__MACOSX') === -1)) {
            return true;
        } else return false;
    };
    var filteredFiles = files.filter(okFile);
    if (filteredFiles.length === 0) {
        return callback(invalid('Zipfile does not contain valid files'));
    }
    //Iterate through all files and validate
    valid = filteredFiles.every(function(currentFile) {
        var extension = path.extname(currentFile);
        var filename;
        if (currentFile.indexOf('/') === -1) {
            filename = currentFile.slice(0, currentFile.indexOf("."));
        } else filename = currentFile.slice((currentFile.indexOf('/') + 1), currentFile.indexOf('.'));
        //Check for duplicate extensions
        if (extensions.lastIndexOf(extension) == -1) {
            extensions.push(extension);
        } else {
            return callback(invalid('Duplicate file extensions in the zipfile'));
        }
        //Record projection filename to validate later
        if (extension === '.prj') {
            projectionFile = currentFile;
        }
        //Check for filename differences
        if (filename != basename && (extension === '.shp' || extension === '.prj' || extension === '.dbf' || extension === '.shx')) {
            return callback(invalid('Inconsistent file naming convention in the zipfile'));
        }
        return true;
    });
    if (valid) {
        //Check if all required files are present
        if (!hasRequiredFileTypes(extensions)) return callback(invalid('Missing required file type(s)'));
        else return callback(null, extensions, projectionFile);
    };
};
/**
 * Checks if zipfile has the required extensions (shp, shx, dbf)
 * @param extensions (array)
 * @returns {boolean}
 */
var hasRequiredFileTypes = function(extensions) {
    var requiredFileTypes = ['.shp', '.shx', '.dbf', '.prj'];
    var success = requiredFileTypes.every(function(v, i) {
        return extensions.indexOf(v) !== -1;
    });
    return success;
};
module.exports = {
    validate: validate,
    hasRequiredFileTypes: hasRequiredFileTypes,
    checkFiles: checkFiles
};