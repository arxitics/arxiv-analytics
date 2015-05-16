/**
 * Tools router instance.
 */

var express = require('express');
var math = require('mathjs');

var tools = express.Router();

// GET default page
tools.get('/', function (req, res) {
  res.render('tools');
});

// GET `editor` page
tools.get('/editor', function (req, res) {
  res.render('tools/editor');
});

// GET `parser` page
tools.get('/parser', function (req, res) {
  res.render('tools/parser');
});

// POST method for `parser` page
tools.post('/parser', function (req, res) {
  var body = req.body;
  var expr = String(body.expr).replace(/\;?\s*\r?\n\s*/g, '; ').trim();
  var data = {expr: expr};
  try {
    var node = math.parse(expr);
    var tex = node.toTex();
    if (tex !== node.toString() && /\\\w/.test(tex)) {
      data.tex = /\\(frac|begin)/.test(tex) ? '$$' + tex + '$$' : '$' + tex + '$';
    }
    data.result = math.eval(expr);
  } catch (error) {
    data.error = error.message;
  }
  res.json(data);
});

// Export variable
module.exports = tools;
