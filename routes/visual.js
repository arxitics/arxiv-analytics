/**
 * Data visualization instance.
 */

var express = require('express');
var visual = express.Router();
var cache = require('../models/cache');
var article = require('../models/article');
var analytics = require('../models/analytics');
var settings = require('../settings').search;

// GET default page
visual.get('/', function (req, res) {
  res.render('visual/categories');
});

// GET `keywords` page
visual.get('/keywords', function (req, res) {
  var query = req.query;
  if (!query.hasOwnProperty('q')) {
    query.q = 'topological insulator';
  }
  res.render('visual/keywords', {
    query: query
  });
});

// GET `journals` page
visual.get('/journals', function (req, res) {
  res.render('visual/journals');
});

// GET `authors` page
visual.get('/authors', function (req, res) {
  res.render('visual/authors');
});

// Export primaryCategories.json
visual.get('/data/primaryCategories.json', function (req, res) {
  analytics.lookup({'name': 'primaryCategories'}, function (doc) {
    if (doc) {
      res.json(analytics.treemap(doc.stats));
    } else {
      console.error('failed to generate primaryCategories.json');
      res.render('500', {
        message: 'The server failed to generate data for visualization.'
      });
    }
  });
});

// Export data
visual.get('/data', function (req, res) {
  var query = article.preprocess(req.query);
  if (query.hasOwnProperty('q')) {
    query.q = String(query.q).trim().replace(/^\"?|\"?$/g, '"');
  } else {
    query.q = 'topological insulator';
  }
  query.projection = {
    '_id': 0,
    'published': 1,
    'authors': 1
  };
  query.limit = 10000;

  var url = req.originalUrl;
  var start = Date.now();
  cache.search(url, query, function (docs) {
    var end = Date.now();
    if (docs) {
      if ((end - start) > settings.timeout) {
        cache.save(url, docs);
      }
      res.json(analytics.countByDate(docs));
    } else {
      console.error('failed to generate data for visualization');
      res.render('500', {
        message: 'The server failed to generate data for visualization.'
      });
    }
  });
});

// Export variable
module.exports = visual;
