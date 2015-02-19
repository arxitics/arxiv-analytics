/**
 * Search router instance.
 */


var util = require('util');
var express = require('express');
var article = require('../models/article');
var statistics = require('../models/statistics');
var interpreter = require('../models/interpreter');
var security = require('../models/security');
var regexp = require('../models/regexp').arxiv;
var settings = require('../settings').search;

var search = express.Router();

// GET default page
search.get('/', function (req, res) {
  var query = req.query || {};
  var q = query.q;
  var redirected = false;
  if (q && Object.keys(query).length === 1) {
    var sequence = q.trim().replace(/\s+/g, ' ');

    var command = sequence.split(/\s+/)[0];
    if (interpreter.commands.indexOf(command) !== -1) {
      sequence = security.serialize(interpreter.parse(sequence));
      res.redirect(security.normalize('/terminal?' + sequence));
      redirected = true;
    } else {
      sequence = sequence.replace(/arXiv\:\s*/i, '');
      if (sequence.match(regexp.identifier)) {
        res.redirect('/articles/' + sequence);
        redirected = true;
      } else {
        if (sequence.match(/^\{.+\}$/)) {
          try {
            sequence = security.serialize(JSON.parse(sequence));
            res.redirect(security.normalize('/search?' + sequence));
            redirected = true;
          } catch (error) {
            console.log(error);
          }
        }
        if (!redirected) {
          sequence = sequence.replace(/\s*\:\s*/g, '=');
          if (sequence.indexOf('=') !== -1) {
            if (sequence.match(/^[^=]+\s/)) {
              sequence = 'q=' + sequence;
            }
            sequence = sequence.replace(/\s([^\s]+)=/g, '&$1=');
            res.redirect(security.normalize('/search?' + sequence));
            redirected = true;
          } else {
            query = {'q': sequence};
          }
        }
      }
    }
  }
  if (!redirected) {
    var keys = Object.keys(query);
    if (keys.length && query[keys[0]] !== '') {
      var query = article.preprocess(query);
      article.find(query, function (docs) {
        var length = docs.length;
        if (length === 1) {
          res.redirect('/articles/' + docs[0].id);
        } else {
          var pagination = article.paginate(query, docs);
          var local = {
            stats: statistics.summarize(docs, ['categories', 'authors']),
            searched: true,
            eprints: pagination.docs,
            location: req.originalUrl
          };
          res.render('search', util._extend(local, pagination));
        }
      });
    } else {
      res.render('search', {
        searched: false
      });
    }
  }
});

// Export variable
module.exports = search;
