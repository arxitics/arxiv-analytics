/**
 * arXiv API.
 */

var path = require('path');
var file = require('./file');
var crawler = require('./crawler');
var article = require('./article');
var security = require('./security');
var statistics = require('./statistics');
var regexp = require('./regexp').arxiv;
var settings = require('../settings').arxiv;

// Directory for eprint XML files
exports.directory = settings.directory;

// Generate arXiv API query string
exports.generate = function (query) {
  var api = exports.api;
  var prefixes = exports.prefixes;
  var queryString = api['search'] + '=';
  for (var key in prefixes) {
    if (prefixes.hasOwnProperty(key)) {
      if (query.hasOwnProperty(key) && query[key]) {
        var value = String(query[key]).trim();
        queryString += '+AND+' + prefixes[key] + ':' + value;
      }
    }
  }
  for (var parameter in api) {
    if (api.hasOwnProperty(parameter) && parameter !== 'search') {
      if (query.hasOwnProperty(parameter) && query[parameter]) {
        var value = String(query[parameter]).trim();
        queryString += '&' + api[parameter] + '=' + value;
      }
    }
  }
  return queryString.replace('=+AND+', '=').replace(/\s+/g, '+');
};

// Retrieve eprint metadata
exports.retrieve = function (identifier, callback) {
  callback = (typeof callback === 'function') ? callback : function () {};
  if (regexp.identifier.test(identifier)) {
    var query = {list: identifier};
    exports.update(query, function () {
      console.log('retrieved eprint ' + identifier + ' successfully');
      return callback(true);
    });
  } else {
    console.log('failed to retrieve eprint ' + identifier);
    return callback(false);
  }
};

// Fetch all eprints in a category
exports.fetch = function (query, callback) {
  var limit = settings.limit || 1000;
  var interval = settings.interval;
  var category = query.category || 'hep-th';
  var length = 0;
  statistics.categories.some(function (item) {
    if (item.category === category) {
      length = Math.ceil(item.count / limit);
      return true;
    }
    return false;
  });
  // Use closures inside loop
  Array.apply(null, {length: length}).forEach(function(value, index) {
    setTimeout(function () {
      var criteria = {
        category: category,
        skip: limit * index,
        limit: limit
      };
      if (query.hasOwnProperty('sort')) {
        var sort = query.sort;
        if (sort === 'submittedDate' || sort === 'lastUpdatedDate') {
          criteria.sort = sort;
          if (query.hasOwnProperty('order')) {
            var order = query.order;
            if (order === 'ascending') {
              criteria.order = order;
            }
          }
        }
      }
      exports.update(criteria, function (success) {
        if (success) {
          console.log('fetched eprints for ' + category);
        }
      });
    }, interval * Math.pow(index, 1.5));
  });
  return (typeof callback === 'function') ? callback(true) : null;
};

// Update eprint abstract data
exports.update = function (query, callback) {
  var subdirectory = '';
  var queryTarget = '';
  if (query.hasOwnProperty('list') && !query.hasOwnProperty('search')) {
    var matches = query.list.match(regexp.archive);
    subdirectory = path.join('id_list', (matches && matches[0]) || 'all');
    queryTarget = query.list;
  } else {
    subdirectory = path.join('search_query', query.category || 'all');
    for (var key in query) {
      if (query.hasOwnProperty(key) && key !== 'search' && query[key]) {
        queryTarget += '-' + key + '-' + query[key];
      }
    }
    queryTarget = queryTarget.replace(/^\-/, '');
  }

  var directory = path.join(exports.directory, 'api', subdirectory);
  var fileName = security.sanitize(queryTarget) + '.xml';
  var filePath = path.join(directory, fileName);
  file.exists(filePath, function (exists) {
    var parse = settings.parse;
    if (exists) {
      if (parse) {
        crawler.parseXML(filePath, function (result) {
          exports.output(result, callback);
        });
      } else {
        console.log('XML file exists but is not parsed');
      }
    } else {
      var queryString = exports.generate(query);
      var urlString = exports.services.api.replace('${query}', queryString);
      crawler.get(urlString, filePath, function (xmlFile) {
        if (parse) {
          crawler.parseXML(xmlFile, function (result) {
            exports.output(result, callback);
          });
        } else {
          console.log('XML file has been downloaded but not parsed');
        }
      });
    }
  });
};

// Get RSS new feeds
exports.feed = function (query, callback) {
  var archive = query.archive || 'hep-th';
  var date = Date.parse(query.date) || Date.now();
  var today = new Date(date).toISOString().slice(0, 10);
  var fileName = security.sanitize(archive) + '-' + today + '.xml';
  var filePath = path.join(exports.directory, 'rss', today, fileName);
  file.exists(filePath, function (exists) {
    if (exists) {
      crawler.parseXML(filePath, function (result) {
        exports.process(result, callback);
      });
    } else {
      var urlString = exports.services.rss.replace('${archive}', archive);
      crawler.get(urlString, filePath, function (xmlFile) {
        crawler.parseXML(xmlFile, function (result) {
          exports.process(result, callback);
        });
      });
    }
  });
};

// Check metadata integrity through OAI
exports.check = function (query, callback) {
  var date = Date.parse(query.date) || Date.now();
  var today = new Date(date).toISOString().slice(0, 10);
  var oai = exports.oai;
  var method = query.method || 'ListIdentifiers';
  var prefix = query.prefix;
  var queryString = oai.method + '=' + method;
  var queryTarget = '';
  if (method === 'ListIdentifiers' || method === 'ListRecords') {
    var archive = query.archive;
    var from = query.from || today;
    var to = query.to;
    if (!(regexp.group.test(archive))) {
      archive = 'physics:' + archive;
    }
    queryString += '&' + oai.archive + '=' + archive +
      '&' + oai.from + '=' + from;
    queryTarget += archive + '-from-' + from;
    if (to && from <= to) {
      queryString += '&' + oai.to + '=' + to;
      queryTarget += '-to-' + to;
    }
    queryString += '&' + oai.prefix + '=' + (prefix || 'arXiv');
  } else if (method === 'GetRecord') {
    var id = query.id.replace(regexp.version, '');
    queryString += '&' + oai.id + '=oai:arXiv.org:' + id +
      '&' + oai.prefix + '=' + (prefix || 'arXivRaw');
    queryTarget += id;
  }
  queryTarget += (prefix ? '-' + prefix : '');

  var directory = path.join(exports.directory, 'oai', method);
  var fileName = security.sanitize(queryTarget) + '.xml';
  var filePath = path.join(directory, today, fileName);
  file.exists(filePath, function (exists) {
    if (exists) {
      crawler.parseXML(filePath, function (result) {
        exports.harvest(result, callback);
      });
    } else {
      var urlString = exports.services.oai.replace('${query}', queryString);
      crawler.get(urlString, filePath, function (xmlFile) {
        crawler.parseXML(xmlFile, function (result) {
          exports.harvest(result, callback);
        });
      });
    }
  });
};

// Harvest eprint metadata by OAI
exports.harvest = function (result, callback) {
  callback = (typeof callback === 'function') ? callback : function () {};
  var resource = result && result['OAI-PMH'];
  var items = [];
  if (resource.hasOwnProperty('ListIdentifiers')) {
    items = items.concat(resource.ListIdentifiers.header);
  } else if (resource.hasOwnProperty('ListRecords')) {
    items = items.concat(resource.ListRecords.record);
  } else if (resource.hasOwnProperty('GetRecord')) {
    items = items.concat(resource.GetRecord.record);
  } else {
    return callback(false);
  }
  var last = items.length - 1;
  items.forEach(function (item, index) {
    var identifier = item.identifier || item.header.identifier;
    var id = identifier.replace('oai:arXiv.org:', '');
    exports.retrieve(id, function () {
      if (index === last) {
        return callback(true);
      }
    });
  });
};

// Process eprint updates by RSS
exports.process = function (result, callback) {
  callback = (typeof callback === 'function') ? callback : function () {};
  var base = exports.services.abs.replace('${identifier}', '');
  var items = result && result.rss.channel && result.rss.channel.item;
  var archive = '';
  if (items) {
    items = [].concat(items);
    archive = result.rss.channel.title.split(' ')[0];
  } else {
    return callback(false);
  }
  var last = items.length - 1;
  items.forEach(function (item, index) {
    var id = item.link.replace(base, '');
    var pattern = new RegExp('arXiv\:(' + id + ')v\\d+\\s*\\[(.+)\\]');
    var matches = item.title.match(pattern);
    if (matches && matches[2].search(archive) === 0) {
      exports.retrieve(id, function () {
        if (index === last) {
          return callback(true);
        }
      });
    }
  });
};

// Output eprint data to database
exports.output = function (result, callback) {
  callback = (typeof callback === 'function') ? callback : function () {};
  var base = exports.services.abs.replace('${identifier}', '');
  var entries = result && result.feed && result.feed.entry;
  if (entries) {
    entries = [].concat(entries).filter(function (entry) {
      return entry.hasOwnProperty('id');
    });
  }
  if (!(Array.isArray(entries) && entries.length)) {
    return callback(false);
  }
  var last = entries.length - 1;
  entries.forEach(function (entry, index) {
    var identifier = entry.id.replace(base, '');
    var published = new Date(entry.published);
    var updated = new Date(entry.updated);
    var eprint = {
      id: identifier.replace(regexp.version, ''),
      published: published,
      updated: updated,
      title: entry.title.replace(/\s+/g, ' '),
      authors: [],
      abstract: entry.summary.replace(/\s+/g, ' '),
      revisions: {
        version: identifier.match(regexp.version)[0],
        updated: updated
      }
    };
    var analyses = {
      authors: [],
      subjects: []
    };
    var authors = [].concat(entry.author).filter(function (author) {
      return /^([\.\:\;]|\d+)$/.test(author) === false;
    });
    authors.forEach(function (author) {
      var pattern = regexp.author;
      var fullName = security.latinize(author['name']);
      var western = fullName.replace(pattern.eastern, '$2 $1');
      var variant = western.replace(pattern.surname, ' $1');
      var segments = variant.replace(/\'/g, '').split(/[\s\.\-,]+/);
      var lastIndex = segments.length - 1;
      var profile = {
        'name': fullName,
        'identifier': segments.map(function (segment, index) {
          return (index !== lastIndex) ? segment.charAt(0).toUpperCase() : segment;
        }).join('.')
      };
      if (author.hasOwnProperty('arxiv:affiliation')) {
        var affiliations = [].concat(author['arxiv:affiliation']);
        profile['affiliations'] = affiliations.map(function (affiliation) {
          return affiliation._;
        });
      }
      eprint.authors.push(author['name']);
      analyses.authors.push(profile);
    });
    if (entry.hasOwnProperty('arxiv:comment')) {
      eprint.comment = entry['arxiv:comment']._;
    }
    if (entry.hasOwnProperty('arxiv:journal_ref')) {
      eprint.journal = entry['arxiv:journal_ref']._;
    }
    if (entry.hasOwnProperty('arxiv:doi')) {
      var doi = entry['arxiv:doi']._.replace(/[\,\;]/g, ' ').trim();
      if (/\s/.test(doi)) {
        doi = doi.split(/\s+/).filter(function (value, index, array) {
          return regexp.doi.test(value) && array.indexOf(value) === index;
        }).map(function (value) {
          return value.replace(/\.$/, '');
        }).join(' ');
      }
      eprint.doi = doi.replace(/\.$/, '');
    }

    var primaryCategory = entry['arxiv:primary_category'].$.term;
    eprint.categories = [primaryCategory];
    if (Array.isArray(entry.category)) {
      entry.category.forEach(function (category) {
        var term = category.$.term;
        if (term !== primaryCategory) {
          // Ensure that only valid categories are pushed
          if (regexp.category.test(term)) {
            eprint.categories.push(term);
          } else {
            var subjects = term.split(/[^a-zA-Z0-9\-\+\.]+|\.\s+/);
            subjects = subjects.filter(function (subject) {
              return ['pacs', 'msc', 'ccs', 'jel'].some(function (code) {
                return regexp[code].test(subject);
              });
            });
            analyses.subjects = analyses.subjects.concat(subjects);
          }
        }
      });
    }
    eprint['analyses.authors'] = analyses.authors;
    eprint['analyses.subjects'] = analyses.subjects;
    article.commit(eprint, function () {
      console.log('updated eprint ' + identifier + ' successfully');
      if (index === last) {
        return callback(true);
      }
    });
  });
};

// arXiv services
exports.services = {
  abs: 'http://arxiv.org/abs/${identifier}',
  pdf: 'http://arxiv.org/pdf/${identifier}',
  tex: 'http://arxiv.org/e-print/${identifier}',
  api: 'http://export.arxiv.org/api/query?${query}',
  rss: 'http://export.arxiv.org/rss/${archive}?version=2.0',
  oai: 'http://export.arxiv.org/oai2?${query}'
};

// arXiv API field prefixes
exports.prefixes = {
  title: 'ti',
  author: 'au',
  abstract: 'abs',
  comment: 'co',
  journal: 'jr',
  category: 'cat',
  report: 'rn',
  id: 'id',
  all: 'all'
};

// arXiv API query interface parameters
exports.api = {
  search: 'search_query',
  list: 'id_list',
  skip: 'start',
  limit: 'max_results',
  sort: 'sortBy',
  order: 'sortOrder'
};

// arXiv OAI query interface parameters
exports.oai = {
  method: 'verb',
  archive: 'set',
  id: 'identifier',
  from: 'from',
  to: 'until',
  prefix: 'metadataPrefix'
};
