/**
 * Aliyun OSS.
 */

var fs = require('fs');
var url = require('url');
var http = require('http');
var path = require('path');
var crypto = require('crypto');
var multer = require('multer');
var file = require('./file');
var mime = require('./mime');
var crawler = require('./crawler');
var settings = require('../settings').oss;

// Handle `multipart/form-data`
exports.upload = function () {
  return multer({
    dest: settings.uploads,
    limits: settings.limits,
    rename: function (fieldname, filename) {
      return filename + '-' + Date.now()
    },
    onParseStart: function () {
      console.log('parsing form ...');
    },
    onParseEnd: function (req, next) {
      console.log('form parsing completed');
      next();
    },
    onFileUploadStart: function (file) {
      console.log('uploading ' + file.fieldname + ' ...');
      return mime.types.hasOwnProperty(file.extension);
    },
    onFileUploadComplete: function (file) {
      console.log(file.fieldname + ' uploaded to  ' + file.path);
    },
    onFileSizeLimit: function (file) {
      console.log(file.originalname + ' is too large');
      fs.unlink(path.join(__dirname, file.path));
    }
  });
};

// Generate authorization
exports.authorize = function (query) {
  var params = [
    query.method,
    query.md5 || '',
    query.type || '',
    query.date
  ];
  if (query.hasOwnProperty('meta')) {
    var meta = query.meta;
    Object.keys(meta).sort().forEach(function (key) {
      params.push('x-oss-' + key + ':' + meta[key]);
    });
  }
  params.push('/' + settings.bucket + query.resource);

  var hmac = crypto.createHmac('sha1', settings.key).update(params.join('\n'));
  return 'OSS ' + settings.id + ':' + hmac.digest('base64');
};

// Get HTTP request headers
exports.getHeaders = function (query) {
  var headers = {
    'Date': new Date().toGMTString()
  };
  if (query.hasOwnProperty('origin')) {
    headers['Content-Type'] = query.type;
    headers['Content-Length'] = query.size;
    headers['Content-MD5'] = query.md5;
  }
  if (query.hasOwnProperty('meta')) {
    var meta = query.meta;
    for (var key in meta) {
      if (meta.hasOwnProperty(key)) {
        headers['x-oss-' + key] = meta[key];
      }
    }
  }
  query.date = headers['Date'];
  headers['Authorization'] = exports.authorize(query);
  return headers;
};

// HTTP request
exports.request = function (query, callback) {
  var options = {
    method: query.method,
    host: settings.host,
    port: settings.port,
    path: query.resource,
    headers: exports.getHeaders(query)
  };
  var req = http.request(options, function (res) {
    var data = '';
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on('error', function (err) {
      console.error(err);
      console.log('problem with request: ' + err.message);
    });
    res.on('end', function () {
      return (typeof callback === 'function') ? callback(data) : null;
    });
  });
  req.on('error', function (err) {
    console.error(err);
    console.log('an error happened while sending OSS request');
  });
  if (query.hasOwnProperty('body')) {
    req.write(query.body);
  }

  req.end();
};

// Get an object from OSS
exports.getObject = function (query, callback) {
  query.method = 'GET';
  exports.request(query, function (data) {
    console.log('get the OSS object ' + query.resource + ' successfully');
    return (typeof callback === 'function') ? callback(data) : null;
  });
};

// Put an object to OSS
exports.putObject = function (query, callback) {
  callback = (typeof callback === 'function') ? callback : function () {};
  query.method = 'PUT';
  if (query.hasOwnProperty('origin')) {
    var origin = query.origin;
    query.type = mime.lookup(path.extname(origin));
    fs.stat(origin, function (err, stats) {
      if (err) {
        console.error(err);
        return callback(false);
      }
      query.size = stats.size;
      file.read(origin, function (content) {
        query.body = content;
        query.md5 = crypto.createHash('md5').update(content).digest('base64');
        exports.request(query, function (data) {
          console.log('put the object ' + origin + ' to OSS successfully');
          return callback(true);
        });
      });
    });
  }
};

// Copy an object of OSS
exports.copyObject = function (query, callback) {
  query.method = 'PUT';
  query.meta = {
    'copy-source': '/' + settings.bucket + query.source
  };
  exports.request(query, function (data) {
    console.log('copy the OSS object ' + query.source + ' successfully');
    return (typeof callback === 'function') ? callback(true) : null;
  });
};

// Delete an object of OSS
exports.deleteObject = function (query, callback) {
  query.method = 'DELETE';
  exports.request(query, function (data) {
    console.log('delete the OSS object ' + query.resource + ' successfully');
    return (typeof callback === 'function') ? callback(true) : null;
  });
};
