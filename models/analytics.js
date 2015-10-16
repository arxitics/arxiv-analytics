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
        stats.some(function (item) {
          if (item.category === subject) {
            themes.push({
              'category': subject,
              'count': item.count
            });
            return true;
          }
          return false;
        });
        archive.themes.forEach(function (theme) {
          var category = theme.category;
          stats.some(function (item) {
            if (item.category === category) {
              themes.push({
                'category': category,
                'count': item.count
              });
              return true;
            }
            return false;
          });
          if (theme.hasOwnProperty('subsumption')) {
            category = theme.subsumption.category;
            stats.some(function (item) {
              if (item.category === category) {
                themes.push({
                  'category': category,
                  'count': item.count
                });
                return true;
              }
              return false;
            });
          }
        });
        archives.push({
          'category': subject,
          'count': themes.reduce(function (sum, current) {
            return sum + current.count;
          }, 0),
          'children': themes
        });
      } else {
        stats.some(function (item) {
          if (item.category === subject) {
            archives.push({
              'category': subject,
              'count': item.count
            });
            return true;
          }
          return false;
        });
      }
    });
    children.push({
      'category': entry.group,
      'count': archives.reduce(function (sum, current) {
        return sum + current.count;
      }, 0),
      'children': (archives.length === 1) ? archives[0].children : archives
    });
  });
  return {
    'category': 'Total',
    'count': children.reduce(function (sum, current) {
      return sum + current.count;
    }, 0),
    'children': children
  };
};

// Count eprints by published year
exports.countByDate = function (eprints) {
  var stats = [];
  var map = {};
  eprints.forEach(function (eprint) {
    var year = eprint.published.toISOString().slice(0, 4);
    var authors = eprint.authors.length;
    if (map.hasOwnProperty(year)) {
      var value = map[year];
      value[0] += 1;
      value[1] += authors;
    } else {
      map[year] = [1, authors];
    }
  });
  for (var key in map) {
    if (map.hasOwnProperty(key)) {
      var value = map[key];
      stats.push({
        year: +key,
        count: value[0],
        authors: value[1]
      });
    }
  }
  stats.sort(function (a, b) {
    return a.year - b.year;
  });
  return stats;
};
