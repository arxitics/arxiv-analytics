/**
 * Database administration.
 */

var express = require('express');
var account = require('../models/account');
var arxiv = require('../models/arxiv');
var article = require('../models/article');
var scheme = require('../models/scheme');
var statistics = require('../models/statistics');
var settings = require('../settings').admin;

var admin = express.Router();

// Account authentication
admin.use(function (req, res, next) {
  var uid = req.user.uid;
  if (uid === account.reservations.admin.uid) {
    next();
  } else {
    res.render('403', {
      message: 'You are not authorized to access this page.'
    });
  }
});

// GET admin page
admin.get('/', function (req, res) {
  res.render('admin');
});

// GET eprint updates
admin.get('/eprints/update', function (req, res) {
  arxiv.update(req.query, function (success) {
    res.render('admin');
  });
});

// GET eprint RSS feeds
admin.get('/eprints/feed', function (req, res) {
  var query = req.query;
  var archive = query.archive;
  var archives = scheme.archives;
  if (archives.indexOf(archive) !== -1) {
    arxiv.feed(query, function (success) {
      if (success) {
        console.log('fetched RSS feed for ' + archive + ' successfully');
      }
    });
  } else {
    archives.forEach(function (archive, index) {
      query.archive = archive;
      arxiv.feed(query, function (success) {
        if (success) {
          console.log('fetched RSS feed for ' + archive + ' successfully');
        }
      });
    });
  }
  res.render('admin');
});

// GET method for eprint check
admin.get('/eprints/check', function (req, res) {
  article.find(req.query, function (docs) {
    if (docs.length) {
      var last = docs.length - 1;
      docs.forEach(function (doc, index) {
        var id = doc.id;
        var version = parseInt(doc.version.slice(1));
        while (version--) {
          var identifier = id + 'v' + (version + 1);
          arxiv.retrieve(identifier, function () {
            console.log('retrieved eprint ' + identifier + ' successfully');
          });
        }
        if (index === last) {
          res.render('admin');
        }
      });
    } else {
      res.render('admin');
    }
  });
});

// GET method for fetching eprints
admin.get('/eprints/fetch', function (req, res) {
  if (settings.eprints.fetch) {
    var query = req.query;
    var category = query.category;
    var skip = parseInt(query.skip) || 0;
    var categories = statistics.categories.map(function (item) {
      return item.category;
    }).slice(skip);
    if (category && categories.indexOf(category) !== -1) {
      arxiv.fetch(query, function (success) {
        if (success) {
          console.log('requested to fetch eprints for ' + category);
        }
      });
    } else {
      var interval = settings.eprints.interval || 0;
      categories.forEach(function (category, index) {
        setTimeout(function () {
          query.category = category;
          arxiv.fetch(query, function (success) {
            if (success) {
              console.log('requested to fetch eprints for ' + category);
            }
          });
        }, 60 * interval * index);
      });
    }
    res.render('admin');
  } else {
    res.render('403', {
      message: 'This page has been locked by administrator.'
    });
  }
});

// Create a user account
admin.get('/users/create', function (req, res) {
  var query = req.query;
  var email = query.email || 'guest';
  account.create(email, function (user) {
    res.redirect('/admin/users');
  });
});

// Export variable
module.exports = admin;
