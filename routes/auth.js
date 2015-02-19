/**
 * Authentication and authorization.
 */

var express = require('express');
var email = require('../models/email');
var account = require('../models/account');
var regexp = require('../models/regexp');

var auth = express.Router();

// Redirect to login
auth.get('/', function (req, res) {
  res.redirect('login');
});

// Login
auth.get('/login', function (req, res) {
  var uid = req.user.uid;
  if (uid !== account.reservations.guest.uid) {
    console.log('user ' + uid + ' have already logged in');
    res.redirect('/users/' + uid);
  } else {
    res.render('login', {
      authorized: false,
      pattern: regexp.output(regexp.account)
    });
  }
});

// Logout
auth.get('/logout', function (req, res) {
  var guest = account.reservations.guest.uid;
  var uid = req.session.uid;
  if (uid !== guest) {
    account.status(uid, 'inactive', function () {
      req.session.uid = guest;
      req.session.oid = null;
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
});

// Parse signature hash from GET
auth.get('/:hash', function (req, res) {
  var hash = req.params.hash;
  account.check(hash, function (success, user) {
    if (success) {
      var uid = user.uid;
      req.session.uid = uid;
      req.session.oid = user._id;
      account.status(uid, 'online', function () {
        res.redirect('/users/' + uid);
      });
    } else {
      res.render('403', {
        message: 'Your signature hash is not valid.'
      });
    }
  });
});

// Request authorization
auth.post('/', function (req, res) {
  var uid = req.user.uid;
  if (uid !== account.reservations.guest.uid) {
    console.log('user ' + uid + ' have already logged in');
    res.redirect('/users/' + uid);
  } else {
    var body = req.body;
    var receiver = String(body.email).trim().toLowerCase();
    var key = String(body.key).trim();
    if (key.match(regexp.account.auth.key)) {
      account.lookup({
        'email': receiver,
        'auth.key': key
      }, function (user) {
        if (user) {
          uid = user.uid;
          req.session.uid = uid;
          req.session.oid = user._id;
          account.status(uid, 'online', function () {
            res.redirect('/users/' + uid);
          });
        } else {
          res.render('403', {
            message: 'Your private key is not valid.'
          });
        }
      });
    } else if (email.validate(receiver)) {
      account.authorize(receiver, function (user) {
        var auth = user.auth;
        uid = user.uid;
        email.confirm(receiver, auth, function (success) {
          if (success) {
            account.update({'uid': uid}, {
              '$inc': {'auth.requests': 1}
            }, function () {
              var requests = auth.requests + 1;
              console.log('user ' + uid + ' has ' + requests + ' auth requests');
            });
            res.render('login', {
              authorized: true,
              email: receiver,
              pattern: regexp.output(regexp.account)
            });
          } else {
            res.redirect('/auth/login');
          }
        });
      });
    } else {
      console.log(receiver + ' is not a valid email.');
      res.render('403', {
        message: 'Your email' + receiver + ' is not valid.'
      });
    }
  }
});

// Parse security code from POST
auth.post('/login', function (req, res) {
  var body = req.body;
  var email = String(body.email).trim().toLowerCase();
  var code = parseInt(body.code);
  account.verify(email, code, function (success, user) {
    if (success) {
      var uid = user.uid;
      req.session.uid = uid;
      req.session.oid = user._id;
      account.status(uid, 'online', function() {
        res.redirect('/users/' + uid);
      });
    } else {
      res.render('403', {
        message: 'Your security code is not valid.'
      });
    }
  });
});

// Export variable
module.exports = auth;
