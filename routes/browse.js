/**
 * Browse router instance.
 */

var express = require('express');
var article = require('../models/article');
var security = require('../models/security');
var settings = require('../settings');

var browse = express.Router();

// GET default page
browse.get('/', function (req, res) {
  var query = req.query;
  var keys = Object.keys(query);
  var subscription = req.user.subscription;
  var search = {};
  var filter = {
    'categories': [],
    'subjects': [],
    'topics': [],
    'keywords': [],
    'tags': [],
    'authors': []
  };
  if (keys.length && query[keys[0]] !== '') {
    for (var key in query) {
      if (query.hasOwnProperty(key)) {
        var value = String(query[key]).trim();
        if (filter.hasOwnProperty(key)) {
          value = [].concat(value.split(/\s*[,;]\s*/));
        }
        filter[key] = value;
      }
    }
  } else {
    for (var key in subscription) {
      if (subscription.hasOwnProperty(key)) {
        if (key === 'themes') {
          var topics = [];
          subscription.themes.forEach(function (theme) {
            topics = topics.concat(theme.topics);
          });
          filter.topics = topics;
        } else {
          filter[key] = subscription[key];
        }
      }
    }
  }
  // Set filters by cookies
  if (query.hasOwnProperty('categories')) {
    res.cookie('categories', query.categories, settings.cookie);
  } else if (filter.categories.length === 0) {
    var categories = req.signedCookies.categories;
    if (categories) {
      filter.categories = [].concat(categories.split(/\s*[,;]\s*/));
    }
  }
  query.page = parseInt(query.page) || 1;
  query.perpage = Math.min(parseInt(query.perpage) || settings.search.perpage, 100);
  query.skip = query.perpage * (query.page - 1);
  search = article.subscribe(filter);
  search['sort'] = {'updated': -1};
  search['skip'] = query.skip;
  search['limit'] = query.perpage;
  article.find(search, function (docs) {
    var queryString = security.serialize(filter, {paramsCombined: true});
    res.render('browse', {
      query: query,
      filter: filter,
      eprints: docs,
      count: query.skip + docs.length,
      startIndex: query.skip,
      endIndex: query.skip + query.perpage,
      currentPage: query.page,
      location: '/browse?' + queryString
    });
  });
});

// Export variable
module.exports = browse;
