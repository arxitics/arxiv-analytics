/**
 * User router instance.
 */

var express = require('express');
var account = require('../models/account');
var article = require('../models/article');
var analysis = require('../models/analysis');
var review = require('../models/review');
var regexp = require('../models/regexp');
var settings = require('../settings').user;

var reviews = express.Router();

// GET statistics page
reviews.get('/', function (req, res) {
  var query = req.query;
  var tab = query.sort || 'newest';
  res.render('reviews/stats', {
    type: tab
  });
});

// Map logic to route parameters
reviews.param('pid', function(req, res, next, pid) {
  var pid = parseInt(pid);
  if (pid > 0) {
    review.lookup({'pid': pid}, function (post) {
      if (post && post.note.status !== 'deleted') {
        var uid = req.user.uid;
        var privilege = req.privilege;
        var authorized = (post.author.uid === uid) || privilege.isModerator;
        var acquiesced = (post.note.wiki === true) && req.logged;
        req.pid = pid;
        req.review = post;
        res.locals.pid = pid;
        res.locals.review = post;
        res.locals.parse = review.parse;
        res.locals.pattern = regexp.output(regexp.review);
        res.locals.authorized = authorized;
        res.locals.editable = (authorized || acquiesced) && privilege.isPublic;
        if (req.method === 'GET' || privilege.isPublic) {
          article.lookup({'id': post.eprints[0].id}, function (eprint) {
            if (eprint) {
              req.eprint = eprint;
              res.locals.id = eprint.id;
              res.locals.eprint = eprint;
              next();
            } else {
              res.render('404', {
                message: 'Review ' + pid + ' does not relate to any eprints.'
              });
            }
          });
        } else {
          res.render('403', {
            message: 'You are not authorized to post reviews.'
          });
        }
      } else {
        res.render('404', {
          message: 'Review ' + pid + ' does not exist.'
        });
      }
    });
  } else {
    res.render('403', {
      message: 'The PID should be a positive integer.'
    });
  }
});

// GET review
reviews.get('/:pid', function (req, res) {
  var pid = req.pid;
  var user = req.user;
  var activity = user.activity;
  if (req.logged && req.privilege.isPublic) {
    var path = req.originalUrl;
    var isFirstVisit = req.session.views.some(function (view) {
      return view[0] === path && view[1] === 1;
    });
    if (isFirstVisit) {
      review.update({'pid': pid}, {
        '$inc': {'feedback.views': 1}
      }, function (doc) {
        if (doc) {
          var count = doc.feedback.views;
          console.log('review ' + pid + ' has been viewed ' + count + ' times');
        }
      });
    }
  }
  res.render('articles/reviews/view', {
    bookmarked: activity.reviews.some(function (review) {
      return review.pid === pid;
    }),
    voted: activity.votes.some(function (vote) {
      return vote.pid === pid;
    })
  });
});

// Edit review
reviews.get('/:pid/edit', function (req, res) {
  var pid = req.pid;
  if (res.locals.editable) {
    res.render('articles/reviews/edit');
  } else {
    res.render('403', {
      message: 'You are not authorized to edit review ' + pid + '.'
    });
  }
});

// Submit updated reviews
reviews.post('/:pid/submit', function (req, res) {
  var body = req.body;
  var title = String(body.title).trim();
  var content = String(body.content).trim();
  var summary = String(body.summary).trim();
  var pattern = regexp.review;
  if (title.match(pattern.title) && content.match(pattern.content)) {
    var user = req.user;
    var uid = user.uid;
    var pid = req.pid;
    var post = req.review;
    if (res.locals.editable) {
      var revision = {
        'editor': {
          'uid': uid,
          'name': user.name
        },
        'additions': content.length - post.content.length,
        'summary': summary.match(pattern.summary) ? summary : 'added new content',
        'edited': new Date()
      };
      var modifier = {
        '$set': {
          'edited': new Date(),
          'title': title,
          'content': content
        },
        '$push': {
          'revisions': {
            '$each': [revision],
            '$position': 0
          }
        }
      };
      if (res.locals.authorized) {
        modifier['$set']['note.wiki'] = (body.wiki === 'true');
      }
      review.update({'pid': pid}, modifier, function (doc) {
        res.redirect('/reviews/' + pid);
      });
    } else {
      res.render('403', {
        message: 'You are not authorized to edit review ' + pid + '.'
      });
    }
  } else {
    res.render('403', {
      message: 'We only accept constructive reviews written in English.'
    });
  }
});

// Preview review
reviews.post('/:pid/preview', function (req, res) {
  var body = req.body;
  var title = String(body.title).trim();
  var content = String(body.content).trim();
  var summary = String(body.summary).trim();
  var pattern = regexp.review;
  if (title.match(pattern.title) && content.match(pattern.content)) {
    res.render('articles/reviews/preview', {
      preview: {
        title: title,
        content: content,
        summary: summary,
        isWiki: body.wiki === 'true'
      }
    });
  } else {
    res.render('403', {
      message: 'We only accept constructive reviews written in English.'
    });
  }
});

// Post comments
reviews.post('/:pid/comments/submit', function (req, res) {
  var content = req.body.content;
  if (content.match(regexp.review.comment)) {
    var pid = req.pid;
    var post = req.review;
    var user = req.user;
    var uid = user.uid;
    var comment = {
      'pid': pid + '.' + (post.comments.length + 1),
      'user': {
        'uid': uid,
        'name': user.name
      },
      'published': new Date(),
      'content': content
    };
    review.update({'pid': pid}, {
      '$push': {'comments': {'$each': [comment], '$position': 0}}
    }, function (post) {
      if (post) {
        var id = req.eprint.id;
        console.log('user ' + uid + ' made a comment on eprint ' + id);
        analysis.update({'id': id}, {
          '$inc': {'feedback.comments': 1}
        }, function (eprint) {
          if (eprint) {
            var count = eprint.analyses.feedback.comments;
            console.log('eprint ' + id + ' has ' + count + ' comments');
          }
        });
        account.update({'uid': uid}, {
          '$inc': {
            'stats.comments': 1,
            'stats.reputation': settings.reputation.comment.publish
          }
        }, function (profile) {
          if (profile) {
            var count = profile.stats.comments; 
            console.log('user ' + uid + ' has ' + count + ' comments');
          }
        });
        res.redirect('/reviews/' + pid);
      } else {
        res.render('404', {
          message: 'The server fails to save your comments on review ' + pid + '.'
        });
      }
    });
  } else {
    res.render('403', {
      message: 'We only accept constructive comments written in English.'
    });
  }
});

// Preview comments
reviews.post('/:pid/comments/preview', function (req, res) {
  var content = String(req.body.content).trim();
  if (content.match(regexp.review.comment)) {
    var pid = req.pid;
    res.render('articles/comments/preview', {
      preview: {
        content: content
      }
    });
  } else {
    res.render('403', {
      message: 'We only accept constructive comments written in English.'
    });
  }
});

// Export variable
module.exports = reviews;
