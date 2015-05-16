/**
 * Eprint analysis.
 */

var db = require('./db');
var regexp = require('./regexp');
var resource = require('./resource');
var glossary = require('./glossary');

// Update analyses data
exports.update = function (criteria, modifier, callback) {
  for (var operator in modifier) {
    if (modifier.hasOwnProperty(operator)) {
      var object = modifier[operator];
      var type = Object.prototype.toString.call(object).slice(8, -1);
      if (type === 'Object') {
        for (var field in object) {
          if (object.hasOwnProperty(field) && !(/^analyses\./.test(field))) {
            object['analyses.' + field] = object[field];
            delete object[field];
          }
        }
      }
    }
  }
  db.eprints.findAndModify({
    'query': criteria,
    'update': modifier,
    'new': true,
    'upsert': false
  }, function (err, doc) {
    if (err) {
      console.error(err);
      console.log('failed to update analyses data');
    }
    if (doc) {
      console.log('updated analyses data successfully');
    } else {
      console.log('analyses data do not exist');
    }
    return (typeof callback === 'function') ? callback(doc) : null;
  });
};

// Parse information from metadata
exports.parse = function (eprint, callback) {
  callback = (typeof callback === 'function') ? callback : function() {};
  var title = eprint.title;
  var comment = eprint.comment || '';
  var journal = eprint.journal || '';
  var doi = eprint.doi || '';
  var abstract = eprint.abstract;
  var keywords = eprint.analyses.keywords;
  var tags = eprint.analyses.tags;
  var analyses = {};

  // Article types
  var clue = title + ' ' + comment;
  regexp.tags.forEach(function (tag) {
    var label = tag.label;
    if (tag.pattern.test(clue) && tags.indexOf(label) === -1) {
      tags.push(label);
    }
  });

  // Journal
  if (journal || doi) {
    var publication = exports.parseJournal(journal, doi);
    var reference = publication && publication.journal;
    for (var entry in publication) {
      if (publication.hasOwnProperty(entry)) {
        analyses['publication.' + entry] = publication[entry];
      }
    }
    if (tags.indexOf('journal article') === -1) {
      tags.push('journal article');
    }
    regexp.tags.forEach(function (tag) {
      if (tag.journals && tag.journals.indexOf(reference) !== -1) {
        var label = tag.label;
        if (tags.indexOf(label) === -1) {
          tags.push(label.toLowerCase());
        }
      }
    });
  }

  // Keywords udpate
  if (!keywords.length) {
    glossary.extract(eprint).forEach(function (keyword) {
      if (keywords.indexOf(keyword) === -1) {
        keywords.push(keyword);
      }
    });
  }

  // Comments
  if (comment) {
    // Typesetting system
    regexp.systems.some(function (system) {
      if (system.pattern.test(comment)) {
        analyses['note.typesetting'] = system.label;
        return true;
      }
      return false;
    });

    // Page number
    var pages = comment.match(regexp.pages);
    if (pages) {
      analyses['note.pages'] = parseInt(pages[0]);
    }

    // Languages
    regexp.languages.some(function (language) {
      if (language.pattern.test(comment)) {
        analyses['note.language'] = language.label;
        return true;
      }
      return false;
    });

    // License
    regexp.licenses.some(function (license) {
      var url = license.url.replace(/\/$/, '');
      if (license.pattern.test(comment) || comment.search(url) !== -1) {
        analyses['note.license'] = license.label;
        return true;
      }
      return false;
    });
  }

  analyses.keywords = keywords;
  analyses.tags = tags;
  exports.update({'id': eprint.id}, {'$set': analyses}, callback);
};

// Parse journal metadata
exports.parseJournal = function (journal, doi) {
  var journals = resource.journals;
  var length = journals.length;
  var publication = {};
  for (var i = 0; i < length; i++) {
    var object = journals[i];
    var matched = object.pattern.test(journal);
    if (object.hasOwnProperty('doi') ) {
      matched = object.doi.test(doi) || !doi && matched;
    }
    if (matched) {
      return {
        'publisher': object.publisher,
        'journal': object.label
      };
    }
  }
  if (doi) {
    var registrant = doi.split('/')[0];
    resource.publishers.some(function (publisher) {
      if (publisher.doi === registrant) {
        publication.publisher = publisher.label;
        return true;
      }
      return false;
    });
  }
  return publication;
};
