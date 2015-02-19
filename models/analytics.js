/**
 * Datebase analytics.
 */

var db = require('./db');
var scheme = require('./scheme');

// Search options as filters
exports.filters = [
  'q',
  'search',
  'projection',
  'sort',
  'order',
  'skip',
  'limit',
  'perpage',
  'page',
  'date-range',
  'date-from',
  'date-to'
];

// Find analytics data
exports.find = function (query, callback) {
  var criteria = {};
  var projection = query.projection || {};
  var sort = query.sort || {'updated': -1};
  var skip = parseInt(query.skip) || 0;
  var limit = parseInt(query.limit) || 0;
  var filters = exports.filters;
  for (var key in query) {
    if (query.hasOwnProperty(key)) {
      var value = query[key];
      if (filters.indexOf(key) === -1) {
        criteria[key] = value;
      }
    }
  }
  db.analytics.find(criteria, projection)
    .sort(sort).skip(skip).limit(limit, function (err, docs) {
    if (err) {
      console.error(err);
      console.log('failed to find analytics datasets.');
    }
    if (docs && docs.length && Array.isArray(docs)) {
      console.log('found ' + docs.length + ' analytics datasets successfully');
    } else {
      console.log('no analytics datasets returned for the query');
      docs = [];
    }
    return (typeof callback === 'function') ? callback(docs): null;
  });
};

// Lookup analytics data
exports.lookup = function (query, callback) {
  db.analytics.findOne(query, function (err, data) {
    if (err) {
      console.error(err);
      console.log('failed to lookup analytics data');
    }
    if (data) {
      console.log('analytics data ' + data.name + ' exists');
    } else {
      console.log('analytics data does not exist');
    }
    return (typeof callback === 'function') ? callback(data) : null;
  });
};

// Update analytics data
exports.update = function (query, modifier, callback) {
  db.analytics.findAndModify({
    'query': query,
    'update': modifier,
    'new': true,
    'upsert': true
  }, function (err, doc) {
    if (err) {
      console.error(err);
      console.log('failed to update analytics data');
    }
    if (doc) {
      console.log('updated analytics data successfully');
    } else {
      console.log('analytics data do not exist');
    }
    return (typeof callback === 'function') ? callback(doc) : null;
  });
};

// Article treemapping by primary categories
exports.treemap = function (stats) {
  var children = [];
  scheme.groups.forEach(function (entry) {
    var archives = [];
    entry.archives.forEach(function (archive) {
      var subject = archive.category;
      var themes = [];
      if (archive.hasOwnProperty('themes')) {
        stats.every(function (item) {
          if (item.category === subject) {
            themes.push({
              'category': subject,
              'size': item.count
            });
            return false;
          }
          return true;
        });
        archive.themes.forEach(function (theme) {
          var category = theme.category;
          stats.every(function (item) {
            if (item.category === category) {
              themes.push({
                'category': category,
                'size': item.count
              });
              return false;
            }
            return true;
          });
          if (theme.hasOwnProperty('subsumption')) {
            category = theme.subsumption.category;
            stats.every(function (item) {
              if (item.category === category) {
                themes.push({
                  'category': category,
                  'size': item.count
                });
                return false;
              }
              return true;
            });
          }
        });
        archives.push({
          'category': subject,
          'size': themes.reduce(function (sum, current) {
            return sum + current.size;
          }, 0),
          'children': themes
        });
      } else {
        stats.every(function (item) {
          if (item.category === subject) {
            archives.push({
              'category': subject,
              'size': item.count
            });
            return false;
          }
          return true;
        });
      }
    });
    children.push({
      'category': entry.group,
      'size': archives.reduce(function (sum, current) {
        return sum + current.size;
      }, 0),
      'children': (archives.length === 1) ? archives[0].children : archives
    });
  });
  return {
    'category': 'Total',
    'size': children.reduce(function (sum, current) {
      return sum + current.size;
    }, 0),
    'children': children
  };
};
