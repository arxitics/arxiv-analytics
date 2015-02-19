/**
 * Site router instance.
 */

var express = require('express');

var site = express.Router();

var pages = [
  'about',
  'terms',
  'privacy',
  'disclaimer',
  'contribute',
  'donate'
];

// Redirect to `site/about` page
site.get('/', function (req, res) {
  res.redirect('/site/about');
});

// GET static page
site.get('/:page', function (req, res) {
  var page = req.params.page.trim().toLowerCase();
  if (pages.indexOf(page) !== -1) {
    res.render('site/' + page);
  } else {
    res.render('404');
  }
});

// Export variable
module.exports = site;
