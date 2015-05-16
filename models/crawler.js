/**
 * Web crawler.
 */

var url = require('url');
var http = require('http');
var path = require('path');
var xml2js = require('xml2js');
var cheerio = require('cheerio');
var file = require('./file');

// Get resources form web
exports.get = function (urlString, filePath, callback) {
  var urlObject = url.parse(urlString);
  var options = {
    host: urlObject.host,
    path: urlObject.path,
    headers: {'User-Agent': 'Mozilla/5.0'}
  };
  http.get(options, function (res) {
    console.log('downloading ' + urlString + ' ...');
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
      return file.write(filePath, data, callback);
    });
  }).on('error', function (err) {
    console.error(err);
    console.log('an error happened while downloading ' + urlString);
  });
};

// Parse XML files
exports.parseXML = function (xmlFile, callback) {
  var parser = new xml2js.Parser({
    trim: true,
    normalize: true,
    explicitArray: false,
    async: true,
    strict: true
  });
  file.read(xmlFile, function (data) {
    parser.parseString(data, function (err, result) {
      var basename = path.basename(xmlFile);
      if (err) {
        console.error(err);
        console.log('failed to parse ' + basename);
      }
      if (result) {
        console.log(basename + ' parsed successfully');
      } else {
        console.log('no results returned');
      }
      return (typeof callback === 'function') ? callback(result) : null;
    });
  });
};

// Parse HTML files
exports.parseHTML = function (htmlFile, callback) {
  file.read(htmlFile, function (data) {
    var $ = cheerio.load(data, {
      normalizeWhitespace: true,
      xmlMode: false,
      decodeEntities: true,
      lowerCaseTags: true
    });
    return (typeof callback === 'function') ? callback($) : null;
  });
};

// Parse JSON files
exports.parseJSON = function (jsonFile, callback) {
  file.read(jsonFile, function (data) {
    var result = {};
    try {
      result = JSON.parse(data);
    } catch (error) {
      console.error(error);
    }
    return (typeof callback === 'function') ? callback(result) : null;
  });
};
