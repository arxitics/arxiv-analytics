/**
 * Terminal router instance.
 */

var express = require('express');
var interpreter = require('../models/interpreter');

var terminal = express.Router();

// GET default page
terminal.get('/', function (req, res) {
  var query = req.query;
  if (query && Object.keys(query).length) {
    interpreter.execute(query, function (result) {
      var status = result.status;
      var url = result.url;
      if (status === 200) {
        if (url) {
          res.redirect(url);
        } else {
          res.render('terminal');
        }
      } else if ([403, 404, 500].indexOf(status) !== -1) {
        res.render(status.toString(), {
          message: result.reason
        });
      }
    });
  } else {
    res.render('tools/terminal');
  }
});

// Export variable
module.exports = terminal;
