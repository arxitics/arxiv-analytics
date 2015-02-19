/**
 * Explore router instance.
 */

var express = require('express');
var explore = express.Router();

// GET default page
explore.get('/', function (req, res) {
  var query = req.query;
  var tab = query.type || 'articles';
  res.render('explore', {
    type: tab
  });
});

// Export variable
module.exports = explore;
