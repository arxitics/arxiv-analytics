/**
 * Article metadata.
 */

var db = require('./db');
var regexp = require('./regexp');
var resource = require('./resource');
var analysis = require('./analysis');
var settings = require('../settings');

// Article template
exports.template = {
  'id': '',
  'version': 'v0',
  'published': new Date(0),
  'updated': new Date(0),
  'title': '',
  'authors': [],
  'comment': null,
  'journal': null,
  'doi': null,
  'categories': [],
  'abstract': '',
  'revisions': [
    {
      'version': 'v0',
      'updated': new Date(0)
    }
  ],
  'references': [],
  'resources': [],
  'analyses': {
    'authors': [],
    'subjects': [],
    'themes': [],
    'keywords': [],
    'tags': [],
    'citations': [
      {
        'service': 'NASA ADS',
        'updated': new Date(0),
        'count': 0
      }
    ],
    'feedback': {
      'views': 0,
      'reviews': 0,
      'comments': 0,
      'bookmarks': 0,
      'readers': 0,
      'ratings': 0,
      'score': 0
    },
    'publication': {},
    'note': {
      'typesetting': 'TeX',
      'pages': 0,
      'language': 'en',
      'license': 'arXiv',
      'status': 'editable'
    }
  }
};

// Article classification fields
exports.classifications = [
  'subjects',
  'themes',
  'keywords',
  'tags'
];

// Article metadata filed aliases
exports.aliases = {
  author: 'authors',
  affiliation: 'affiliations',
  category: 'categories',
  subject: 'subjects',
  theme: 'themes',
  topic: 'topics',
  keyword: 'keywords',
  tag: 'tags',
  citation: 'citations'
};

// Timestamp fileds will be converted to ISO date
exports.timestamps = [
  'published',
  'updated',
  'revisions.updated',
  'analyses.citations.updated'
];

// Metadata fields using regular expressions for search
exports.wildcards = [
  'title',
  'comment',
  'journal',
  'abstract',
  'analyses.authors.affiliations'
];

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

// Operators that need an array as its value
exports.operators = [
  '$in',
  '$nin',
  '$all',
  '$and',
  '$or',
  '$nor'
];

// Mapping special string literal
exports.literal = {
  'true': true,
  'false': false,
  'null': null,
  'undefined': {
    '$exists': false
  }
};

// Parse query parameters
exports.parse = function (field, value) {
  var timestamps = exports.timestamps;
  var wildcards = exports.wildcards;
  var operators = exports.operators;
  var literal = exports.literal;
  var type = Object.prototype.toString.call(value).slice(8, -1);
  var result = value;
  if (type === 'String') {
    value = value.trim().replace(/\s+/g, ' ');
    var matches = value.match(regexp.syntax);
    if (matches) {
      result = new RegExp(matches[1], matches[2]);
    } else if (/^".+"$/.test(value)) {
      result = value.replace(/^"|"$/g, '');
    } else if (literal.hasOwnProperty(value)) {
      result = literal[value];
    } else if (timestamps.indexOf(field) !== -1) {
      result = exports.parseDate(value);
    } else if (wildcards.indexOf(field) !== -1) {
      result = new RegExp(String(value).replace(/\s|,/g, ' .*'), 'i');
    } else if (/[,;]/.test(value)) {
      result = value.split(/\s*[,;]\s*/).map(function (item) {
        return exports.parse(field, item);
      });
    } else if (field === 'categories') {
      if (/\.[a-z]{2}$/i.test(value)) {
        result = value.replace(/^[a-z\-]+\./i, function (str) {
          return str.toLowerCase();
        }).replace(/\.[a-z]{2}$/i, function (str) {
          return str.toUpperCase();
        });
      } else {
        result = value.toLowerCase();
      }
    } else {
      var numeric = parseInt(value);
      if (String(numeric) === value) {
        result = numeric;
      }
    }
  } else if (type === 'Array') {
    result = [];
    value.forEach(function (item) {
      result = result.concat(exports.parse(field, item));
    });
  } else if (type === 'Object') {
    for (var key in result) {
      if (result.hasOwnProperty(key)) {
        var term = result[key];
        result[key] = (operators.indexOf(key) === -1) ?
          exports.parse(key, term) : exports.parse(field, [].concat(term));
      }
    }
    if (operators.indexOf(field) !== -1) {
      result = [];
      for (var key in value) {
        if (value.hasOwnProperty(key)) {
          var object = {};
          object[key] = exports.parse(key, value[key]);
          result.push(object);
        }
      }
    }
  }
  return result;
};

// Parse date
exports.parseDate = function (value) {
  var result = {};
  if (/[,;]/.test(value)) {
    var values = value.split(/\s*[,;]\s*/);
    result = {
      '$gte': new Date(values[0] || 0),
      '$lt': new Date(values[1] || Date.now())
    };
  } else {
    var dateFrom = new Date(value);
    var dateTo = new Date(value);
    result['$gte'] = dateFrom;
    if (/^\d{4}$/.test(value)) {
      dateTo.setFullYear(dateFrom.getFullYear() + 1);
    } else if (/^\d{4}\-\d{2}$/.test(value)) {
      dateTo.setMonth(dateFrom.getMonth() + 1);
    } else if (/^\d{4}\-\d{2}\-\d{2}$/.test(value)) {
      dateTo.setDate(dateFrom.getDate() + 1);
    }
    if (dateTo.getTime() < Date.now()) {
      result['$lt'] = dateTo;
    }
  }
  return result;
};

// Parse date range
exports.parseDateRange = function (query) {
  var range = {};
  var date = new Date();
  var value = query['date-range'];
  if (value === 'custom') {
    range = {
      '$gte': new Date(query['date-from'] || 0),
      '$lt': new Date(query['date-to'] || Date.now())
    };
  } else {
    if (value === 'past-week') {
      date.setDate(date.getDate() - 7);
    } else if (value === 'past-month') {
      date.setMonth(date.getMonth() - 1);
    } else if (value === 'past-year') {
      date.setFullYear(date.getFullYear() - 1);
    }
    range = {'$gte': date};
  }
  return range;
};

// Preprocess query parameters
exports.preprocess = function (query) {
  var operators = exports.operators;
  var constraints = query['$and'] || [];
  for (var key in query) {
    if (query.hasOwnProperty(key) && operators.indexOf(key) === -1) {
      var state = 'pass';
      var value = query[key];
      var object = {};
      if (Array.isArray(value)) {
        value = value.join(';');
      }
      value = String(value).trim();
      if (value === '') {
        state = 'deleted';
      } else if (value.indexOf(';') !== -1) {
        var values = value.split(/\s*;\s*/);
        var conjunctions = [];
        var disjunctions = [];
        values.filter(function (item, index) {
          return item !== '' && values.indexOf(item) === index;
        }).forEach(function (item) {
          if (item.indexOf(',') !== -1) {
            disjunctions = disjunctions.concat(item.split(/\s*,\s*/));
          } else {
            conjunctions.push(item);
          }
        });
        object['$all'] = conjunctions;
        if (disjunctions.length) {
          object['$in'] = disjunctions;
        }
        state = 'changed';
      } else if (value.indexOf(',') !== -1) {
        var values = value.split(/\s*,\s*/);
        values = values.filter(function (item, index) {
          return item !== '' && values.indexOf(item) === index;
        });
        object = {'$in': values};
        state = 'changed';
      }
      if (key === 'doi') {
        constraints.push({
          '$or': [{'doi': value}, {'analyses.publication.doi': value}]
        });
        state = 'deleted';
      }
      if (state === 'deleted') {
        delete query[key];
      } else if (state === 'changed') {
        query[key] = object;
      }
    }
  }
  if (constraints.length) {
    query['$and'] = constraints;
  }
  if (!query.sort) {
    query.sort = (query.hasOwnProperty('q')) ? 'relevance' : 'published';
  }
  query.limit = Math.min(parseInt(query.limit) || settings.search.limit, 1000);
  query['date-range'] = query['date-range'] || 'all';
  return query;
};

// Article aggregation
exports.aggregate = function (pipeline, callback) {
  db.eprints.aggregate(pipeline, {
    allowDiskUse: true
  }, function (err, docs) {
    if (err) {
      console.error(err);
      console.log('failed to aggregate the documents.');
    }
    if (docs && docs.length && Array.isArray(docs)) {
      console.log('completed eprint aggregation successfully');
    } else {
      console.log('no doucments returned for the aggregation');
      docs = [];
    }
    return (typeof callback === 'function') ? callback(docs): null;
  });
};

// Find article
exports.find = function (query, callback) {
  var criteria = {};
  var projection = query.projection || {'_id': 0};
  var sort = query.sort || {};
  var order = query.order || 'descending';
  var sortby = (typeof sort === 'string') ? sort : undefined;
  var skip = parseInt(query.skip) || 0;
  var limit = parseInt(query.limit) || 0;
  var template = exports.template;
  var analyses = template.analyses;
  var filters = exports.filters;
  for (var key in query) {
    if (query.hasOwnProperty(key)) {
      var value = query[key];
      key = key.toLowerCase().replace(/[^\w\-\.\$]/g, '');
      if (filters.indexOf(key) === -1) {
        var field = exports.aliases[key] || key;
        var entry = field.replace(/\..+/, '');
        if (analyses.hasOwnProperty(entry)) {
          if (field !== 'authors') {
            field = 'analyses.' + field;
          }
        } else if (field === 'affiliations') {
          field = 'analyses.authors.affiliations';
        } else if (field === 'topics') {
          field = 'analyses.themes.topics';
        } else if (field === 'journal') {
          var collected = resource.journals.some(function (journal) {
            return journal.label === value;
          });
          if (collected) {
            field = 'analyses.publication.journal';
          }
        }
        criteria[field] = exports.parse(field, value);
      } else {
        if (key === 'date-range' && value !== 'all') {
          criteria['published'] = exports.parseDateRange(query);
        }
      }
    }
  }
  // Sorting by textScore comes first for full-text search
  if (criteria.hasOwnProperty('$text')) {
    var expression = criteria['$text'];
    var type = Object.prototype.toString.call(expression).slice(8, -1);
    if (type === 'String') {
      query['search'] = expression;
    } else if (type === 'Object' && expression.hasOwnProperty('$search')) {
      query['search'] = expression['$search'];
    }
  }
  if (query.hasOwnProperty('q') || query.hasOwnProperty('search')) {
    criteria['$text'] = {'$search': query['q'] || query['search']};
    projection['score'] = {'$meta': 'textScore'};
  }
  if (typeof sort === 'string') {
    if (analyses.feedback.hasOwnProperty(sortby)) {
      sortby = 'analyses.feedback.' + sortby;
    } else if (sortby === 'citations') {
      sortby = 'analyses.citations.count';
    }
    sort = {};
    if (criteria.hasOwnProperty('$text')) {
      sort['score'] = {'$meta': 'textScore'};
    } else {
      sort[sortby] = (order === 'ascending') ? 1 : -1;
    }
  }
  db.eprints.find(criteria, projection)
    .sort(sort).skip(skip).limit(limit, function (err, docs) {
    if (err) {
      console.error(err);
      console.log('failed to find the documents.');
    }
    if (docs && docs.length && Array.isArray(docs)) {
      console.log('found ' + docs.length + ' documents successfully');
      if (sort.hasOwnProperty('score')) {
        if (sortby === 'relevance' && order === 'ascending') {
          docs.reverse();
        } else if (sortby) {
          docs.sort(function (a, b) {
            return (order === 'ascending')
              ? +(a[sortby] > b[sortby]) || +(a[sortby] === b[sortby]) - 1
              : +(b[sortby] > a[sortby]) || +(b[sortby] === a[sortby]) - 1;
          });
        }
      }
    } else {
      console.log('no doucments returned for the query');
      docs = [];
    }
    return (typeof callback === 'function') ? callback(docs): null;
  });
};

// Lookup article
exports.lookup = function (query, callback) {
  db.eprints.findOne(query, function (err, eprint) {
    if (err) {
      console.error(err);
      console.log('failed to lookup the eprint');
    }
    if (eprint) {
      console.log('eprint ' + eprint.id + ' exists');
    } else {
      console.log('the eprint does not exist');
    }
    return (typeof callback === 'function') ? callback(eprint) : null;
  });
};

// Create new eprint
exports.create = function (id, callback) {
  var template = exports.template;
  var eprint = {};
  // Avoid the problem of passing object by reference
  for (var key in template) {
    if (template.hasOwnProperty(key)) {
      eprint[key] = template[key];
    }
  }
  eprint.id = id;
  db.eprints.save(eprint, function (err, saved) {
    if (err) {
      console.error(err);
      console.log('failed to create eprint ' + id);
    }
    if (saved) {
      console.log('eprint ' + id + ' created successfully');
    } else {
      console.log('eprint ' + id + ' cannot be saved');
    }
    return (typeof callback === 'function') ? callback(saved) : null;
  });
};

// Update article and create it when it does not exist
exports.upsert = function (id, modifier, callback) {
  callback = (typeof callback === 'function') ? callback : function() {};
  db.eprints.findAndModify({
    'query': {'id': id},
    'update': modifier,
    'new': true,
    'upsert': false
  }, function (err, eprint) {
    if (err) {
      console.error(err);
      console.log('failed to update eprint' + id);
    }
    if (eprint) {
      console.log('eprint ' + id + ' updated successfully');
      return callback(eprint);
    } else {
      exports.create(id, function () {
        exports.update({'id': id}, modifier, callback);
      });
    }
  });
};

// Update article
exports.update = function (query, modifier, callback) {
  callback = (typeof callback === 'function') ? callback : function() {};
  db.eprints.findAndModify({
    'query': query,
    'update': modifier,
    'new': true,
    'upsert': false
  }, function (err, eprint) {
    if (err) {
      console.error(err);
      console.log('failed to update eprint');
    }
    if (eprint) {
      console.log('eprint ' + eprint.id + ' updated successfully');
    } else {
      console.log('no eprint found for the query');
    }
    return (typeof callback === 'function') ? callback(eprint) : null;
  });
};

// Commit article revisions
exports.commit = function (article, callback) {
  callback = (typeof callback === 'function') ? callback : function() {};
  var id = article.id;
  var version = article.revisions.version;
  var analyses = article.analyses;
  exports.lookup({'id': id}, function (eprint) {
    var approved = true;
    if (eprint) {
      var revisions = eprint.revisions;
      approved = revisions.every(function (revision) {
        return revision.version !== version;
      });
      if (approved) {
        var submission = article.revisions;
        var keys = ['title', 'abstract', 'comment', 'journal', 'doi'];
        if (version < eprint.version) {
          keys.forEach(function (key) {
            if (eprint[key] && !article[key]) {
              submission[key] = null;
            } else if (article[key] !== eprint[key]) {
              submission[key] = article[key];
            }
          });
          // Set authors of this revision if they are different from current version
          if (article.authors.join() !== eprint.authors.join()) {
            submission.authors = article.authors;
          }
          console.log('a new version of eprint ' + id + ' exists');
        } else {
          var subjects = eprint.analyses.subjects;
          var tags = eprint.analyses.tags;
          keys.forEach(function (key) {
            var oldValue = eprint[key];
            var newValue = article[key];
            if (oldValue !== newValue) {
              eprint[key] = newValue;
              revisions.forEach(function (entry) {
                entry[key] = entry[key] || oldValue;
              });
            }
          });
          // Use authors of latest version which may include more contributors
          if (article.authors.join() !== eprint.authors.join()) {
            revisions.forEach(function (entry) {
              entry.authors = entry.authors || eprint.authors;
            });
            eprint.authors = article.authors;
          }
          // Push more subjects if they have not been included yet
          article['analyses.subjects'].forEach(function (subject) {
            if (subjects.indexOf(subject) === -1) {
              subjects.push(subject);
            }
          });
          eprint.version = version;
          eprint.updated = article.updated;
          // Use categories of latest version which may include cross-lists
          eprint.categories = article.categories;
          eprint.analyses.subjects = subjects;
          eprint.analyses.tags = tags;
          console.log('an old version of eprint ' + id + ' exists');
        }
        revisions.push(submission);
        // Sort revisions by the increment of versions
        eprint.revisions = revisions.sort(function (a, b) {
          return +(a.version > b.version) || +(a.version === b.version) - 1;
        });
      } else {
        console.log('version ' + version + ' of eprint ' + id + ' exists');
      }
    } else {
      eprint = article;
      eprint.version = version;
      eprint.revisions = [article.revisions];
    }
    if (approved) {
      console.log('updating version ' + version + ' of eprint ' + id);
      exports.upsert(id, {'$set': eprint}, function (updated) {
        analysis.parse(updated, callback);
      });
    } else {
      if (settings.arxiv.patch) {
        exports.patch(article, callback);
      } else {
        return callback(eprint);
      }
    }
  });
};

// Update article patches
exports.patch = function (article, callback) {
  callback = (typeof callback === 'function') ? callback : function() {};
  var id = article.id;
  var changes = {
    'analyses.authors': article['analyses.authors']
  };
  exports.update({'id': id}, {'$set': changes}, function (eprint) {
    if (eprint) {
      console.log('updated patch for eprint ' + id);
    }
    return callback(eprint);
  });
};

// Article citation style
exports.citeAs = function (eprint) {
  var id = eprint.id;
  var string = 'arXiv:' + id;
  if (/^\d{4}|(math|cs|q\-bio|q\-fin|stat)\//.test(id)) {
    string += ' [' + eprint.categories[0] + ']';
  }
  return string;
};

// Bibliography entries
exports.bibEntries = [
  'archivePrefix',
  'eprint',
  'primaryClass',
  'type',
  'author',
  'title',
  'booktitle',
  'chapter',
  'edition',
  'editor',
  'publisher',
  'journal',
  'year',
  'month',
  'volume',
  'number',
  'pages',
  'doi',
  'url'
];

// Export citation in BibTeX
exports.exportBibtex = function (eprint) {
  var content = '@article {' + eprint.id + ',\n';
  var publication = eprint.analyses.publication;
  publication['archivePrefix'] = 'arXiv';
  publication['eprint'] = eprint.id;
  publication['primaryClass'] = eprint.categories[0];
  publication['author'] = eprint.authors.join(' and ');
  publication['title'] = eprint.title;
  if (publication.hasOwnProperty('publisher')) {
    var label = publication['publisher'];
    resource.publishers.some(function (publisher) {
      if (publisher.label === label) {
        publication['publisher'] = publisher.entity;
        return true;
      }
      return false;
    });
  }
  if (eprint.hasOwnProperty('doi') && eprint.doi) {
    publication['doi'] = eprint.doi;
  }
  if (!publication.hasOwnProperty('year')) {
    publication['year'] = eprint.published.getFullYear();
  }
  if (!publication.hasOwnProperty('url')) {
    publication['url'] = 'http://arxiv.org/abs/' + eprint.id;
  }
  exports.bibEntries.forEach(function (entry) {
    if (publication.hasOwnProperty(entry)) {
      content += '  ' + entry + ' = {' + publication[entry] + '},\n';
    }
  });
  return content.replace(/,\n$/, '\n') + '}';
};

// Export metadata as JSON
exports.exportJSON = function (eprint, options) {
  var privileged = options.privileged || false;
  var omissions = ['authors', 'citations', 'feedback'];
  var template = exports.template;
  var analyses = eprint.analyses;
  var metadata = {};
  var inference = {};
  for (var key in template) {
    if (template.hasOwnProperty(key) && key !== 'analyses' && eprint[key]) {
      var value = eprint[key];
      if (!Array.isArray(value) || value.length) {
        metadata[key] = eprint[key];
      }
    }
  }
  for (var key in analyses) {
    if (analyses.hasOwnProperty(key) && (privileged || omissions.indexOf(key) === -1)) {
      var value = analyses[key];
      if (Array.isArray(value) && value.length || Object.keys(value).length) {
        inference[key] = analyses[key];
      }
    }
  }
  metadata.analyses = inference;
  return JSON.stringify(metadata, null, 2);
};

// Parse publication information
exports.parsePublication = function (eprint) {
  var publication = eprint.analyses.publication;
  var doi = eprint.doi || publication.doi;
  var journal = publication.journal;
  if (doi && journal) {
    resource.journals.some(function (entry) {
      if (entry.label === journal) {
        if (entry.hasOwnProperty('pdf')) {
          var pdf = doi.replace(entry.doi, entry.pdf);
          var matches = entry.pdf.match(/\$\{([a-z]+\})/g);
          if (matches && matches.length) {
            matches.forEach(function (match) {
              var field = match.replace(/^\$\{|\}$/g, '');
              var value = publication[field];
              if (value) {
                var pattern = new RegExp('\\$\\{' + field + '\\}', 'g');
                if (typeof value === 'number' && value < 10) {
                  value = '0' + value;
                }
                pdf = pdf.replace(pattern, value);
              }
            });
          }
          if (pdf.indexOf('$') === -1) {
            publication['pdf'] = pdf;
          }
        }
        return true;
      }
      return false;
    });
  }
  return publication;
};

// Subscribe arXiv eprints
exports.subscribe = function (subscription) {
  var query = {};
  var disjunctions = [];
  for (var key in subscription) {
    if (subscription.hasOwnProperty(key)) {
      var values = subscription[key];
      if (Array.isArray(values) && values.length) {
        if (key === 'categories') {
          query['categories'] = {'$in': values};
        } else if (key === 'themes') {
          var topics = [];
          values.forEach(function (theme) {
            topics = topics.concat(theme.topics);
          });
          disjunctions.push({
            'analyses.themes.topics': {'$in': topics}
          });
        } else if (key === 'authors') {
          var object = {'$in': values};
          disjunctions.push({
            'authors': object
          }, {
            'analyses.authors.name': object
          }, {
            'analyses.authors.identifier': object
          });
        } else {
          var object = {};
          object['analyses.' + key] = {'$in': values};
          disjunctions.push(object);
        }
      } else if (key === 'published') {
        query[key] = values;
      }
    }
  }
  if (subscription.extend !== 'true') {
    if (!query.hasOwnProperty('published')) {
      var date = new Date();
      date.setFullYear(date.getFullYear() - 1);
      query['updated'] = {'$gte': date};
    }
    if (disjunctions.length) {
      query['$or'] = disjunctions;
    }
  }
  return query;
};

// Article pagination
exports.paginate = function (query, docs) {
  query.page = parseInt(query.page) || 1;
  query.perpage = Math.max(Math.min(parseInt(query.perpage) || settings.search.perpage, 100), 10);

  var length = docs.length;
  var current = query.page;
  var perpage = query.perpage;
  var start = perpage * (current - 1);
  var end = perpage * current;
  var last = Math.ceil(length / perpage);

  return {
    query: query,
    total: length,
    startIndex: start,
    endIndex: end,
    docs: docs.slice(start, end),
    currentPage: current,
    lastPage: last,
    startPage: Math.max(Math.min(current - 5, last - 9), 1),
    endPage: Math.min(Math.max(current + 4, 10),  last)
  };
};
