/**
 * Error router instance.
 */

var express = require('express');
var errors = express.Router();

// GET 403 page
errors.get('/403', function (req, res) {
  res.render('403');
});

// GET 404 page
errors.get('/404', function (req, res) {
  res.render('404');
});

// GET 500 page
errors.get('/500', function (req, res) {
  res.render('500');
});

// Respond with not found
errors.use(function (req, res, next) {
  res.status(404);
  if (req.accepts('html')) {
    res.render('404');
    return;
  }
  if (req.accepts('json')) {
    res.json({'error': 'Not found'});
    return;
  }
  res.type('txt').send('Not found');
});

// Export variable
module.exports = errors;
