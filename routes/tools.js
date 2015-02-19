/**
 * Tools router instance.
 */

var express = require('express');
var tools = express.Router();

// GET default page
tools.get('/', function (req, res) {
  res.render('tools');
});

// Export variable
module.exports = tools;
