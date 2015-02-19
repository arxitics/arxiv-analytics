/**
 * Eprint analysis.
 */

var db = require('./db');
var regexp = require('./regexp');
var glossary = require('./glossary');

// Update analyses data
exports.update = function (criteria, modifier, callback) {
  for (var operator in modifier) {
    if (modifier.hasOwnProperty(operator)) {
      var object = modifier[operator];
      var type = Object.prototype.toString.call(object).slice(8, -1);
      if (type === 'Object') {
        for (var field in object) {
          if (object.hasOwnProperty(field) && !field.match(/^analyses\./)) {
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
    if (clue.match(tag.pattern) && tags.indexOf(label) === -1) {
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
    regexp.systems.forEach(function (system) {
      if (comment.match(system.pattern)) {
        analyses['note.typesetting'] = system.label;
      }
    });

    // Page number
    var pages = comment.match(regexp.pages);
    if (pages) {
      analyses['note.pages'] = parseInt(pages[0]);
    }

    // License
    regexp.licenses.forEach(function (license) {
      var url = license.url.replace(/\/$/, '');
      if (comment.match(license.pattern) || comment.search(url) !== -1) {
        analyses['note.license'] = license.label;
      }
    });
  }

  analyses.keywords = keywords;
  analyses.tags = tags;
  exports.update({'id': eprint.id}, {'$set': analyses}, callback);
};

// Parse journal metadata
exports.parseJournal = function (journal, doi) {
  var journals = regexp.journals;
  var length = journals.length;
  for (var i = 0; i < length; i++) {
    var matched = false;
    var object = journals[i];
    var pattern = object.pattern;
    if (object.hasOwnProperty('doi') ) {
      matched = doi.match(object.doi) || !doi && journal.match(pattern);
    } else {
      matched = journal.match(pattern);
    }
    if (matched) {
      return {
        'publisher': object.publisher,
        'journal': object.label
      };
    }
  }
};
