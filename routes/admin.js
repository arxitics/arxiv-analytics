/**
 * Database administration.
 */

var express = require('express');
var account = require('../models/account');
var arxiv = require('../models/arxiv');
var inspire = require('../models/inspire');
var adsabs = require('../models/adsabs');
var article = require('../models/article');
var scheme = require('../models/scheme');
var statistics = require('../models/statistics');
var settings = require('../settings');

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

// GET default page
admin.get('/', function (req, res) {
  res.render('admin/articles');
});

// GET `articles` page
admin.get('/articles', function (req, res) {
  res.render('admin/articles');
});

// GET `users` page
admin.get('/users', function (req, res) {
  res.render('admin/users');
});

// GET `reviews` page
admin.get('/reviews', function (req, res) {
  res.render('admin/reviews');
});

// GET eprint updates
admin.get('/eprints/update', function (req, res) {
  arxiv.update(req.query, function (success) {
    res.redirect('/admin/articles');
  });
});

// GET method for eprint patches
admin.get('/eprints/patch', function (req, res) {
  if (settings.arxiv.patch) {
    var query = req.query;
    var count = query.count || 0;
    var skip = Math.max(parseInt(query.skip) || 0, 0);
    var limit = Math.min(parseInt(query.limit) || 5, 10);
    var length = Math.ceil(count / limit);
    if (length) {
      var interval = settings.arxiv.interval;
      Array.apply(null, {length: length}).forEach(function(value, index) {
        setTimeout(function () {
          article.find({
            'analyses.authors.affiliation': {'$exists': true},
            'skip': skip,
            'limit': limit
          }, function (eprints) {
            if (eprints.length) {
              eprints.forEach(function (eprint) {
                var id = eprint.id;
                arxiv.update({'list': id}, function (success) {
                  console.log('update eprint ' + id + ' successfully');
                });
              });
            } else {
              console.log('no eprints need patches');
            }
          });
        }, interval * index);
      });
    }
    res.redirect('/admin/articles');
  } else {
    res.render('403', {
      message: 'This page has been locked by administrator.'
    });
  }
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
  res.redirect('/admin/articles');
});

// GET method for eprint check
admin.get('/eprints/check', function (req, res) {
  article.find(req.query, function (eprints) {
    if (eprints.length) {
      var last = eprints.length - 1;
      eprints.forEach(function (eprint, index) {
        var id = eprint.id;
        var version = parseInt(eprint.version.slice(1));
        while (version--) {
          var identifier = id + 'v' + (version + 1);
          arxiv.retrieve(identifier, function () {
            console.log('retrieved eprint ' + identifier + ' successfully');
          });
        }
        if (index === last) {
          res.redirect('/admin/articles');
        }
      });
    } else {
      res.redirect('/admin/articles');
    }
  });
});

// GET method for fetching eprints
admin.get('/eprints/fetch', function (req, res) {
  if (settings.arxiv.fetch) {
    var query = req.query;
    var category = query.category;
    var start = parseInt(query.start) || 0;
    var end = parseInt(query.end) || -1;
    var categories = statistics.categories.map(function (item) {
      return item.category;
    }).slice(start, end);
    if (category && categories.indexOf(category) !== -1) {
      arxiv.fetch(query, function (success) {
        if (success) {
          console.log('requested to fetch eprints for ' + category);
        }
      });
    } else {
      var interval = settings.arxiv.interval || 0;
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
    res.redirect('/admin/articles');
  } else {
    res.render('403', {
      message: 'This page has been locked by administrator.'
    });
  }
});

// GET method for fetching InspireHEP metadata
admin.get('/inspire/fetch', function (req, res) {
  if (settings.inspire.fetch) {
    var query = req.query;
    if (query && query.hasOwnProperty('skip')) {
      inspire.update(query, function (success) {
        if (success) {
          console.log('requested to update INSPIRE-HEP metadata');
        }
      });
    } else {
      inspire.fetch(query, function (success) {
        if (success) {
          console.log('requested to fetch INSPIRE-HEP metadata');
        }
      });
    }
    res.redirect('/admin/articles');
  } else {
    res.render('403', {
      message: 'This page has been locked by administrator.'
    });
  }
});

// GET method for fetching ADS metadata
admin.get('/adsabs/fetch', function (req, res) {
  if (settings.adsabs.fetch) {
    var query = req.query;
    if (query && query.hasOwnProperty('skip')) {
      adsabs.update(query, function (success) {
        if (success) {
          console.log('requested to update ADS metadata');
        }
      });
    } else {
      var interval = settings.adsabs.interval || 0;
      var start = parseInt(query.start) || 0;
      var end = parseInt(query.end) || -1;
      statistics.submissions.map(function (item) {
        return item.month;
      }).slice(start, end).forEach(function (month, index) {
        setTimeout(function () {
          query.month = month;
          adsabs.fetch(query, function (success) {
            if (success) {
              console.log('requested to fetch ADS metadata in month ' + month);
            }
          });
        }, interval * index);
      });
    }
    res.redirect('/admin/articles');
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
