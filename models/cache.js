/**
 * Cache management.
 */

var url = require('url');
var querystring = require('querystring');
var article = require('./article');
var settings = require('../settings').search;

 // Search results
 exports.results = [];

 // Generate cache key
 exports.generateKey = function (path) {
   var object = url.parse(path);
   var query = querystring.parse(object.query);
   var filters = ['page', 'perpage'];
   var params = {};
   Object.keys(query).sort().forEach(function (key) {
     var value = query[key];
     key = String(key).toLowerCase();
     if (filters.indexOf(key) === -1 && value !== '') {
       if (Array.isArray(value)) {
         value = value.sort().filter(function (entry, index, array) {
           return array.indexOf(entry) === index;
         });
       }
       params[key] = value;
     }
   });
   return object.pathname + '?' + querystring.stringify(params);
 };

 // Cache lookup
 exports.lookup = function (path) {
   var results = exports.results;
   var key = exports.generateKey(path);
   var maxAge = settings.cache.maxAge;
   var data = null;
   results.some(function (result, index) {
     if (result.key === key) {
       if (Date.now() - result.updated.getTime() < maxAge) {
         data = result;
         result.count += 1;
       } else {
         results.splice(index, 1);
       }
       return true;
     }
     return false;
   });
   return data;
 };

 // Save docs for cache
 exports.save = function (path, data) {
   var results = exports.results;
   if (exports.lookup(path)) {
     return results;
   }
   if (results.length >= settings.cache.maxItems) {
     results.pop();
   }
   results.unshift({
     'key': exports.generateKey(path),
     'data': data,
     'updated': new Date(),
     'count': 1
   });
   results.sort(function (a, b) {
     return b.count - a.count;
   });
   return results;
 };

 // Cache search
 exports.search = function (path, query, callback) {
   var result = exports.lookup(path);
   callback = (typeof callback === 'function') ? callback : function () {};
   if (result) {
     console.log('return cached data for ' + result.key);
     return callback(result.data);
   } else {
     article.find(query, function (docs) {
       return callback(docs);
     });
   }
 };
