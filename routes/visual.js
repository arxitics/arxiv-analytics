/**
 * Data visualization instance.
 */

var express = require('express');
var visual = express.Router();

// GET default page
visual.get('/', function (req, res) {
  var query = req.query;
  var tab = query.type || 'categories';
  res.render('visual', {
    type: tab
  });
});

// Export variable
module.exports = visual;
