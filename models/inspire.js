/**
 * INSPIRE-HEP API.
 */

var path = require('path');
var file = require('./file');
var crawler = require('./crawler');
var article = require('./article');
var security = require('./security');
var regexp = require('./regexp').inspire;
var settings = require('../settings').inspire;

// Directory for InspireHEP HTML files
exports.directory = settings.directory;

// Generate InspireHEP search API query string
exports.generate = function (query) {
  var prefixes = exports.prefixes;
  var queryString = 'p=arXiv';
  if (!query.hasOwnProperty('format')) {
    query.format = 'hd';
  }
  if (!query.hasOwnProperty('sort')) {
    query.sort = 'earliestdate';
  }
  query.order = (query.order || 'ascending').charAt(0);
  query.limit = parseInt(query.limit) || settings.limit;
  query.skip = (parseInt(query.skip) || 0) + 1;
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

// Fetch InspireHEP metadata
exports.fetch = function (query, callback) {
  var limit = settings.limit || 250;
  var interval = settings.interval;
  var start = parseInt(query.start) || 0;
  var end = parseInt(query.end) || -1;
  var length = Math.ceil(settings.count / limit);
  // Use closures inside loop
  Array.apply(null, {length: length}).slice(start, end).forEach(function(value, index) {
    setTimeout(function () {
      var criteria = {
        limit: limit,
        skip: limit * (start + index)
      };
      if (query.hasOwnProperty('sort')) {
        var sort = query.sort;
        if (sort !== 'earliestdate') {
          criteria.sort = sort;
          if (query.hasOwnProperty('order')) {
            var order = query.order;
            if (order === 'descending') {
              criteria.order = order;
            }
          }
        }
      }
      exports.update(criteria, function (success) {
        if (success) {
          console.log('fetched INSPIRE-HEP metadata for ' + limit + ' eprints');
        }
      });
    }, interval * index);
  });
  return (typeof callback === 'function') ? callback(true) : null;
};

// Update InspireHEP metadata
exports.update = function (query, callback) {
  var queryTarget = 'arXiv';
  for (var key in query) {
    if (query.hasOwnProperty(key) && query[key]) {
      queryTarget += '-' + key + '-' + query[key];
    }
  }

  var directory = path.join(exports.directory, 'search');
  var fileName = security.sanitize(queryTarget) + '.html';
  var filePath = path.join(directory, fileName);
  file.exists(filePath, function (exists) {
    var parse = settings.parse;
    if (exists) {
      if (parse) {
        crawler.parseHTML(filePath, function (result) {
          exports.output(result, callback);
        });
      } else {
        console.log('HTML file exists but is not parsed');
      }
    } else {
      var queryString = exports.generate(query);
      var urlString = exports.api.search.replace('${query}', queryString);
      crawler.get(urlString, filePath, function (htmlFile) {
        if (parse) {
          crawler.parseHTML(htmlFile, function (result) {
            exports.output(result, callback);
          });
        } else {
          console.log('HTML file has been downloaded but not parsed');
        }
      });
    }
  });
};

// Output eprint data to database
exports.output = function ($, callback) {
  callback = (typeof callback === 'function') ? callback : function () {};
  var $_records = $('.detailedrecordbox');
  if ($_records.length) {
    var last = $_records.length - 1;
    $_records.each(function (index) {
      var record = {};
      var authors = [];
      var subjects = [];
      $(this).find('a[href]').each(function () {
        var href = $(this).attr('href');
        var text = $(this).text().trim();
        if (regexp.record.test(href)) {
          if (!record.hasOwnProperty('recid')) {
            record.recid = parseInt(href.replace(/\D/g, ''));
          }
          if (regexp.citations.test(href)) {
            record.citations = parseInt(text.replace(/\D/g, ''));
          }
        } else if (regexp.author.test(href)) {
          authors.push({
            'name': text,
            'affiliations': []
          });
        } else if (regexp.search.test(href)) {
          if (regexp.institution.test(href)) {
            var length = authors.length;
            var affiliation = null;
            if (length) {
              affiliation = authors[length - 1].affiliations.join(' & ');
            }
            authors.forEach(function (author) {
              if (author.affiliations.join(' & ') === affiliation) {
                author.affiliations.push(text);
              }
            });
          } else if (regexp.pacs.test(text)) {
            subjects.push(text);
          }
        } else if (/^https?\:\/\//.test(href)) {
          if (regexp.doi.test(href)) {
            record.doi = href.match(regexp.doi)[1];
          } else if (regexp.eprint.test(href) && !record.hasOwnProperty('id')) {
            record.id = (href.match(regexp.eprint)[1]).replace(/arXiv\:/i, '');
          }
        }
      });
      authors = authors.filter(function (author) {
        return author.affiliations.length >= 1;
      });
      if (authors.length) {
        record.authors = authors;
      }
      if (subjects.length) {
        record.subjects = subjects;
      }
      exports.commit(record, function () {
        if (index === last) {
          return callback(true);
        }
      });
    });
  } else {
    console.log('no detailed INSPIRE-HEP records found for arXiv eprints');
    return callback(false);
  }
};

// Commit INSPIRE-HEP metadata
exports.commit = function (record, callback) {
  callback = (typeof callback === 'function') ? callback : function() {};
  var id = record.id;
  var recid = record.recid;
  if (id) {
    article.lookup({'id': id}, function (eprint) {
      if (eprint) {
        var analyses = eprint.analyses;
        var changes = {
          'analyses.note.inspire': recid
        };

        // Authors
        if (record.hasOwnProperty('authors')) {
          var authors = analyses.authors;
          record.authors.forEach(function (author) {
            var name = author.name;
            var affiliations = author.affiliations;
            authors.some(function (person) {
              if (person.name === name) {
                if (person.hasOwnProperty('affiliations')) {
                  person.affiliations.forEach(function (affiliation) {
                    if (affiliations.indexOf(affiliation) === -1) {
                      affiliations.unshift(affiliation);
                    }
                  });
                }
                if (person.hasOwnProperty('affiliation')) {
                  var affiliation = person.affiliation;
                  if (affiliation && affiliations.indexOf(affiliation) === -1) {
                    affiliations.unshift(affiliation);
                  }
                  delete person.affiliation;
                }
                person.affiliations = affiliations;
                return true;
              }
              return false;
            });
          });
          changes['analyses.authors'] = authors;
        }

        // Citations
        if (record.hasOwnProperty('citations')) {
          var citations = analyses.citations;
          var exists = citations.some(function (citation) {
            if (citation.service === 'INSPIRE-HEP') {
              citation.updated = new Date();
              citation.count = record.citations;
              return true;
            }
            return false;
          });
          if (!exists) {
            citations.push({
              'service': 'INSPIRE-HEP',
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

        article.update({'id': id}, {'$set': changes}, function () {
          console.log('updated eprint ' + id + ' successfully');
          return callback(true);
        });
      } else {
        console.error('failed to find eprint ' + id + ' for INSPIRE-HEP record ' + recid);
        return callback(false);
      }
    });
  } else {
    console.error('INSPIRE-HEP record ' + recid + ' does not relate to any eprints');
    return callback(false);
  }
};

// INSPIRE-HEP API
exports.api = {
  search: 'http://inspirehep.net/search?${query}',
  record: 'http://inspirehep.net/record/${recid}',
  references: 'http://inspirehep.net/record/${recid}/references',
  citations: 'http://inspirehep.net/record/${recid}/citations',
  profile: 'http://inspirehep.net/author/profile/${identifier}'
};

// InspireHEP search field prefixes
exports.prefixes = {
  format: 'of',
  sort: 'sf',
  order: 'so',
  limit: 'rg',
  skip: 'jrec'
};
