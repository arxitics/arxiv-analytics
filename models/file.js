/**
 * File operations.
 */

var fs = require('fs');
var path = require('path');
var settings = require('../settings').file;

// Read file
exports.read = function (file, callback) {
  fs.readFile(file, function (err, data) {
    var basename = path.basename(file);
    if (err) {
      console.error(err);
      console.log('failed to read ' + basename);
    } else {
      console.log('reading ' + basename + ' ...');
    }
    return (typeof callback === 'function') ? callback(data) : null;
  });
};

// Write data to file
exports.write = function (file, data, callback) {
  var directory = path.dirname(file);
  fs.exists(directory, function (exists) {
    if (exists) {
      fs.writeFile(file, data, function (err) {
        var basename = path.basename(file);
        if (err) {
          console.error(err);
          console.log('failed to write ' + basename);
        } else {
          console.log('saved data to ' + basename + ' successfully');
        }
        return (typeof callback === 'function') ? callback(file) : null;
      });
    } else {
      console.log('creating ' + directory + ' ...');
      fs.mkdir(directory, function (err) {
        if (err) {
          console.error(err);
          console.log('failed to create ' + directory);
        } else {
          console.log('created ' + directory + ' successfully');
          exports.write(file, data, callback);
        }
      });
    }
  })
};

// Check whether a given file exists or not
exports.exists = function (file, size, callback) {
  var minSize = settings.minSize;
  if (typeof size === 'function') {
    callback = size;
    size = minSize;
  } else {
    size = Math.min(size, minSize);
  }
  callback = (typeof callback === 'function') ? callback : function () {};
  fs.exists(file, function (exists) {
    var basename = path.basename(file);
    if (exists) {
      fs.stat(file, function (err, stats) {
        if (err) {
          console.error(err);
          console.log('failed to read ' + basename);
          return callback(false);
        }
        if (stats.size >= size) {
          console.log(basename + ' exists and has ' + stats.size + ' bytes');
          return callback(true);
        } else {
          console.log(basename + ' is considered broken');
          fs.unlink(file, function (err) {
            if (err) {
              console.error(err);
              console.log('failed to delete ' + basename);
            } else {
              console.log('deleted ' + basename + ' successfully');
            }
            return callback(false);
          });
        }
      });
    } else {
      console.log(basename + ' does not exist');
      return callback(false);
    }
  });
};
