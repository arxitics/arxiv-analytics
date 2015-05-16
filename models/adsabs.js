/**
 * NASA ADS API.
 */

var path = require('path');
var file = require('./file');
var crawler = require('./crawler');
var article = require('./article');
var security = require('./security');
var statistics = require('./statistics');
var regexp = require('./regexp').arxiv;
var settings = require('../settings').adsabs;

// Directory for ADS JSON files
exports.directory = settings.directory;

// Generate ADS search API query string
exports.generate = function (query) {
  var prefixes = exports.prefixes;
  var queryString = 'q=arXiv';
  if (query.hasOwnProperty('year')) {
    query.filter = 'year:' + query.year;
  } else if (query.hasOwnProperty('month')) {
    query.filter = 'pubdate:' + query.month + '-00';
  }
  if (!query.hasOwnProperty('order') || query.order.charAt(0) === 'd') {
    query.order = 'desc';
  } else {
    query.order = 'asc';
  }
  query.sort = (query.sort || 'cited').toUpperCase() + '+' + query.order;
  query.limit = parseInt(query.limit) || settings.limit;
  query.skip = parseInt(query.skip) || 0;
  query.format = 'json';
  query.key = settings.key;
  for (var key in prefixes) {
    if (prefixes.hasOwnProperty(key)) {
      if (query.hasOwnProperty(key) && query[key]) {
        var value = String(query[key]).trim();
        queryString += '&' + prefixes[key] + '=' + value;
      }
    }
  }
  return queryString;
};

// Fetch ADS metadata
exports.fetch = function (query, callback) {
  var limit = settings.limit || 200;
  var interval = settings.interval;
  var month = query.month || new Date().toISOString().slice(0, 7);
  var length = 0;
  statistics.submissions.some(function (item) {
    if (item.month === month) {
      length = Math.ceil(item.count / limit);
      return true;
    }
    return false;
  });
  // Use closures inside loop
  Array.apply(null, {length: length}).forEach(function(value, index) {
    setTimeout(function () {
      var criteria = {
        month: month,
        limit: limit,
        skip: limit * index
      };
      exports.update(criteria, function (success) {
        if (success) {
          console.log('fetched ADS metadata in month ' + month);
        }
      });
    }, interval * Math.pow(index, 1.5));
  });
  return (typeof callback === 'function') ? callback(true) : null;
};

// Update ADS metadata
exports.update = function (query, callback) {
  var queryTarget = 'arXiv';
  for (var key in query) {
    if (query.hasOwnProperty(key) && query[key]) {
      queryTarget += '-' + key + '-' + query[key];
    }
  }

  var directory = path.join(exports.directory, 'search');
  var fileName = security.sanitize(queryTarget) + '.json';
  var filePath = path.join(directory, fileName);
  file.exists(filePath, function (exists) {
    var parse = settings.parse;
    if (exists) {
      if (parse) {
        crawler.parseJSON(filePath, function (result) {
          exports.output(result, callback);
        });
      } else {
        console.log('JSON file exists but is not parsed');
      }
    } else {
      var queryString = exports.generate(query);
      var urlString = exports.api.search.replace('${query}', queryString);
      crawler.get(urlString, filePath, function (jsonFile) {
        if (parse) {
          crawler.parseJSON(jsonFile, function (result) {
            exports.output(result, callback);
          });
        } else {
          console.log('JSON file has been downloaded but not parsed');
        }
      });
    }
  });
};

// Output eprint data to database
exports.output = function (result, callback) {
  callback = (typeof callback === 'function') ? callback : function () {};
  var docs = result.results && result.results.docs;
  if (!(Array.isArray(docs) && docs.length)) {
    console.log('no ADS records found for arXiv eprints');
    return callback(false);
  }
  var last = docs.length - 1;
  docs.forEach(function (doc, index) {
    var record = {
      bibcode: doc.bibcode,
      citations: doc.citation_count
    };

    // arXiv article ID
    doc.identifier.some(function (identifier) {
      identifier = identifier.replace(/^arXiv\:/i, '');
      if (regexp.identifier.test(identifier)) {
        record.id = identifier;
        return true;
      }
      return false;
    });

    // Subjects
    if (Array.isArray(doc.keyword)) {
      var subjects = doc.keyword.filter(function (keyword) {
        return ['pacs', 'msc', 'ccs', 'jel'].some(function (code) {
          return regexp[code].test(keyword);
        });
      });
      if (subjects.length) {
        record.subjects = subjects;
      }
    }

    // Publication information
    var refereed = doc.property.indexOf('REFEREED') !== -1;
    if (refereed) {
      var months = regexp.publication.month.toString().slice(3,-3).split('|');
      var publication = {
        journal: doc.pub,
        year: doc.year,
        month: months[parseInt(doc.pubdate.slice(5, 7) - 1)],
        volume: doc.volume,
        number: doc.issue
      }
      if (Array.isArray(doc.doi)) {
        record.doi = doc.doi.join(' ');
      }
      if (Array.isArray(doc.page)) {
        publication.pages = doc.page.slice(0, 2).join('-');
      }
      record.publication = publication;
    }

    exports.commit(record, function () {
      if (index === last) {
        return callback(true);
      }
    });
  });
};

// Commit ADS metadata
exports.commit = function (record, callback) {
  callback = (typeof callback === 'function') ? callback : function() {};
  var id = record.id;
  var bibcode = record.bibcode;
  if (id) {
    article.lookup({'id': id}, function (eprint) {
      if (eprint) {
        var analyses = eprint.analyses;
        var changes = {
          'analyses.note.adsabs': bibcode
        };

        // Citations
        if (record.hasOwnProperty('citations')) {
          var citations = analyses.citations;
          var exists = citations.some(function (citation) {
            if (citation.service === 'NASA ADS') {
              citation.updated = new Date();
              citation.count = record.citations;
              return true;
            }
            return false;
          });
          if (!exists) {
            citations.push({
              'service': 'NASA ADS',
              'updated': new Date(),
              'count': record.citations
            });
          }
          changes['analyses.citations'] = citations;
        }

        // DOI
        if (record.hasOwnProperty('doi') && record.doi) {
          if (eprint.doi === null && analyses.publication.doi === undefined) {
            changes['analyses.publication.doi'] = record.doi;
          }
        }

        // Subjects
        if (record.hasOwnProperty('subjects')) {
          var subjects = analyses.subjects;
          record.subjects.forEach(function (subject) {
            if (subjects.indexOf(subject) === -1) {
              subjects.push(subject);
            }
          });
          changes['analyses.subjects'] = subjects;
        }

        // Publication
        if (record.hasOwnProperty('publication')) {
          var publication = record.publication;
          article.bibEntries.forEach(function (entry) {
            if (publication.hasOwnProperty(entry)) {
              var value = String(publication[entry]).trim();
              var pattern = regexp.publication[entry];
              if (!pattern || pattern.test(value)) {
                if (/^[1-9]\d*$/.test(value)) {
                  value = parseInt(value);
                }
                if (value) {
                  changes['analyses.publication.' + entry] = value;
                }
              }
            }
          });
        }

        article.update({'id': id}, {'$set': changes}, function () {
          console.log('updated eprint ' + id + ' successfully');
          return callback(true);
        });
      } else {
        console.error('failed to find eprint ' + id + ' for ADS record ' + bibcode);
        return callback(false);
      }
    });
  } else {
    console.error('ADS record ' + bibcode + ' does not relate to any eprints');
    return callback(false);
  }
};

// ADS API
exports.api = {
  search: 'http://adslabs.org/adsabs/api/search/?${query}',
  record: 'http://adslabs.org/adsabs/abs/${identifier}/?${query}',
  metrics: 'http://adslabs.org/adsabs/api/search/metrics/?${query}',
  references: 'http://adslabs.org/adsabs/abs/${bibcode}/references/?${query}',
  citations: 'http://adslabs.org/adsabs/abs/${bibcode}/citations/?${query}'
};

// ADS search field prefixes
exports.prefixes = {
  filter: 'filter',
  fields: 'fl',
  sort: 'sort',
  limit: 'rows',
  skip: 'start',
  format: 'fmt',
  key: 'dev_key'
};
