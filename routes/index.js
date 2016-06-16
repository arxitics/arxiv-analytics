/**
 * Index router instance.
 */

var express = require('express');
var account = require('../models/account');
var session = require('../models/session');
var article = require('../models/article');
var security = require('../models/security');
var settings = require('../settings');

var index = express.Router();

// Set session variables and local variables
index.use(function (req, res, next) {
  var guest = account.reservations.guest.uid;
  var sess = req.session;
  var uid = sess.uid;
  var oid = sess.oid;
  if (uid === null || uid === undefined) {
    uid = guest;
  }
  req.session.views = session.track(sess, req);
  req.session.requests = session.sampling(sess);
  req.session.stats = session.collect(sess);
  res.locals.csrfToken = req.csrfToken();
  req.report = security.generate(req);
  account.access(uid, oid, function (user) {
    var logged = (user.uid !== guest);
    var privilege = account.grant(user);
    user.notifications = user.messages.filter(function (message) {
      return message.status === 'unread';
    });
    req.session.uid = user.uid;
    req.session.oid = user._id;
    req.user = user;
    req.logged = logged;
    req.privilege = privilege;
    res.locals.user = user;
    res.locals.logged = logged;
    res.locals.privilege = privilege;
    res.locals.citeAs = article.citeAs;
    res.locals.browser = req.report.browser;
    res.locals.normalize = security.normalize;
    res.cookie('uid', user.uid, settings.cookie);
    res.cookie('name', user.name, settings.cookie);
    if (uid !== guest) {
      var locale = req.query.locale || user.locale || req.locale;
      req.setLocale(locale);
      res.locals.locale = locale;
    }
    session.upload(sess, function (success) {
      if (success) {
        console.log('uploaded session data to database successfully');
        req.session.uploaded = Date.now();
        req.session.requests = null;
        req.session.stats = null;
      }
      if (req.report.result !== 'accepted') {
        res.render('403', {
          message: req.report.message
        });
      } else if (user.auth.status === 'locked') {
        res.render('403', {
          message: 'User ' + uid + ' has been locked by the administrator.'
        });
      } else {
        if (Object.keys(req.body).length) {
          req.body = security.censor(req.body);
        }
        next();
      }
    });
  });
});

// GET home page
index.get('/', function (req, res) {
  var query = {};
  if (req.logged) {
    var user = req.user;
    var categories = user.subscription.categories;
    if (categories.length) {
      query['categories.0'] = {'$in': categories};
    }
    query['date-range'] = 'past-week';
    query['sort'] = {
      'analyses.feedback.bookmarks': -1,
      'analyses.feedback.views': -1
    };
    query['limit'] = 10;
    article.find(query, function (docs) {
      res.render('index', {
        eprints: docs
      });
    });
  } else {
    res.render('index');
  }
});

// Export variable
module.exports = index;
