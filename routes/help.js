/**
 * Help router instance.
 */

var express = require('express');
var article = require('../models/article');
var scheme = require('../models/scheme');
var resource = require('../models/resource');
var interpreter = require('../models/interpreter');

var help = express.Router();

var pages = [
  'general',
  'browsers',
  'keyboard',
  'tips',
  'faq',
  'accounts',
  'authentication',
  'subscription',
  'bookmarks',
  'ratings',
  'publications',
  'documents',
  'messages',
  'reputation',
  'search',
  'interfaces',
  'view',
  'metadata',
  'bibtex',
  'mongodb',
  'reviews',
  'posts',
  'markdown',
  'mathjax',
  'interactions',
  'references',
  'updates'
];

// GET table of contents
help.get('/', function (req, res) {
  res.render('help');
});

// GET `help/categories` page
help.get('/categories', function (req, res) {
  var tab = req.query.group || 'physics';
  var groups = scheme.groups;
  var themes = [];
  groups.some(function (entry) {
    if (entry.label === tab) {
      entry.archives.forEach(function (archive) {
        if (archive.hasOwnProperty('themes')) {
          archive.themes.forEach(function (theme) {
            themes.push({
              category: theme.category,
              description: theme.description
            });
          });
        } else {
          themes.push({
            category: archive.category,
            description: archive.description
          });
        }
      });
      return true;
    }
    return false;
  });
  res.render('help/categories', {
    tab: tab,
    groups: groups,
    themes: themes
  });
});

// GET `help/topics` page
help.get('/topics', function (req, res) {
  var tab = req.query.group || 'physics';
  var groups = scheme.groups;
  var themes = [];
  groups.some(function (entry) {
    if (entry.label === tab) {
      entry.archives.forEach(function (archive) {
        if (archive.hasOwnProperty('themes')) {
          archive.themes.forEach(function (theme) {
            themes.push({
              category: theme.category,
              topics: theme.topics
            });
          });
        } else {
          themes.push({
            category: archive.category,
            topics: archive.topics
          });
        }
      });
      return true;
    }
    return false;
  });
  res.render('help/topics', {
    tab: tab,
    groups: groups,
    themes: themes
  });
});

// GET `help/journals` page
help.get('/journals', function (req, res) {
  var tab = req.query.group || 'physics';
  var publishers = resource.publishers;
  res.render('help/journals', {
    tab: tab,
    groups: scheme.groups,
    journals: resource.journals.filter(function (journal) {
      return journal.group === tab;
    }).map(function (journal) {
      publishers.some(function (publisher) {
        if (publisher.label === journal.publisher) {
          journal.publisher = publisher.entity;
          return true;
        }
        return false;
      });
      return journal;
    })
  });
});

// GET `help/tags` page
help.get('/tags', function (req, res) {
  res.render('help/tags', {
    tags: scheme.tags
  });
});

// GET `help/types` page
help.get('/types', function (req, res) {
  res.render('help/types', {
    types: resource.types
  });
});

// GET `help/commands` page
help.get('/commands', function (req, res) {
  res.render('help/commands', {
    commands: interpreter.references
  });
});

// GET static page
help.get('/:page', function (req, res) {
  var page = req.params.page.trim().toLowerCase();
  if (pages.indexOf(page) !== -1) {
    res.render('help/' + page);
  } else {
    res.render('404');
  }
});

// Export variable
module.exports = help;
