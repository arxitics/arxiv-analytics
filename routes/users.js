/**
 * User router instance.
 */

var express = require('express');
var oss = require('../models/oss');
var email = require('../models/email');
var account = require('../models/account');
var article = require('../models/article');
var review = require('../models/review');
var analysis = require('../models/analysis');
var review = require('../models/review');
var scheme = require('../models/scheme');
var regexp = require('../models/regexp');
var security = require('../models/security');
var settings = require('../settings');

var users = express.Router();

// GET statistics page
users.get('/', function (req, res) {
  var query = req.query;
  var tab = query.sort || 'reputation';
  res.render('users/stats', {
    type: tab
  });
});

// Map logic to route parameters
users.param('uid', function(req, res, next, uid) {
  var uid = parseInt(uid);
  var privilege = req.privilege;
  var guest = account.reservations.guest.uid;
  var authorized = (req.user.uid === uid);
  if (uid >= account.range || uid !== guest && authorized) {
    account.lookup({'uid': uid}, function (user) {
      if (user) {
        res.uid = uid;
        res.user = user;
        res.locals.uid = user.uid;
        res.locals.profile = user;
        res.locals.parse = review.parse;
        res.locals.authorized = authorized;
        if (req.method === 'POST' && !authorized) {
          res.render('403', {
            message: 'You are not authorized to post these changes.'
          });
        } else {
          next();
        }
      } else {
        res.render('404', {
          message: 'User ' + uid + ' does not exist.'
        });
      }
    });
  } else {
    res.render('403', {
      message: 'You are not authorized to view this user profile.'
    });
  }
});

// GET profile
users.get('/:uid', function (req, res) {
  var uid = res.uid;
  var user = res.user;
  var status = user.auth.status;
  if (req.logged && !res.locals.authorized) {
    var modifier = {};
    var path = req.originalUrl;
    var isFirstVisit = req.session.views.some(function (view) {
      return view[0] === path && view[1] === 1;
    });
    if (isFirstVisit) {
      modifier['$inc'] = {'stats.views': 1};
    }
    if (user.auth.status === 'online') {
      if (Date.now() - user.auth.seen > settings.session.intervals.request) {
        modifier['$set'] = {'auth.status': 'offline'};
        status = 'offline';
      }
    }
    if (Object.keys(modifier).length) {
      account.update({'uid': uid}, modifier, function (profile) {
        if (profile) {
          var count = profile.stats.views;
          console.log('user ' + uid + ' has been viewed ' + count + ' times');
        }
      });
    }
  }
  res.render('users/profile', {
    status: status
  });
});

// GET user preferences
users.get('/:uid/preferences', function (req, res) {
  if (res.locals.authorized || req.privilege.isModerator) {
    var user = res.user;
    res.render('users/preferences', {
      pattern: regexp.output(regexp.account),
      output: scheme.output
    });
  } else {
    res.render('403', {
      message: 'You are not authorized to access this page.'
    });
  }
});

// POST user preferences
users.post('/:uid/preferences', function (req, res) {
  var user = req.user;
  var uid = user.uid;
  var body = req.body;
  var changes = {};
  var entries = Object.keys(account.template.resume);
  ['name', 'locale'].forEach(function (key) {
    if (body.hasOwnProperty(key)) {
      var value = String(body[key]).trim();
      if (regexp.account[key].test(value)) {
        changes[key] = value;
      }
    }
  });
  entries.forEach(function (entry) {
    entry = 'resume.' + entry;
    if (body.hasOwnProperty(entry) && body[entry]) {
      changes[entry] = String(body[entry]).trim();
    }
  });
  if (body.hasOwnProperty('note.mirror')) {
    var mirror = body['note.mirror'];
    if (regexp.arxiv.mirror.test(mirror)) {
      changes['note.mirror'] = mirror;
    }
  }
  account.subscriptions.forEach(function (key) {
    key = 'subscription.' + key;
    if (body.hasOwnProperty(key)) {
      var values = String(body[key]).trim().split(/\s*[,;]\s*/);
      if (values.length > 1) {
        values = values.filter(function (value, index, array) {
          return array.indexOf(value) === index;
        });
      }
      if (key === 'subscription.categories') {
        values = values.filter(function (value) {
          return scheme.categories.indexOf(value) !== -1;
        });
      } else if (key === 'subscription.subjects') {
        values = values.filter(function (value) {
          return ['pacs', 'msc', 'ccs', 'jel'].some(function (code) {
            return regexp.arxiv[code].test(value);
          });
        });
      } else if (key === 'subscription.themes') {
        var length = values.length;
        for (var i = 1; i < length; i++) {
          var value = values[i];
          if (value.search(':') === -1) {
            var category = values[i - 1].split(':')[0];
            values[i] = category + ': ' + value;
          }
        }
        values = scheme.parse(values.filter(function (value) {
          return regexp.account.theme.test(value);
        }));
      } else if (key === 'subscription.tags') {
        var tags = scheme.tags;
        values = values.filter(function (value) {
          return tags.some(function (object) {
            return object.tag === value;
          });
        });
      } else if (key === 'subscription.authors') {
        values = values.filter(function (value) {
          return regexp.account.author.test(value);
        });
      }
      changes[key] = values;
    } else {
      changes[key] = [];
    }
  });
  if (body.hasOwnProperty('auth.key')) {
    var key = body['auth.key'];
    if (key === user.auth.key) {
      if (body.hasOwnProperty('email')) {
        var receiver = body.email.trim();
        if (receiver !== user.email && email.validate(receiver)) {
          account.lookup({'email': receiver}, function (doc) {
            if (doc) {
              console.error('email ' + receiver + ' has been used by someone');
            } else {
              var hash = security.md5Hash(receiver + key);
              changes['note.email'] = receiver;
              changes['note.hash'] = hash;
              email.reset(receiver, {
                uid: uid,
                hash: hash
              }, function () {
                console.log('user ' + uid + ' would like to reset the email');
              });
            }
          });
        }
      }
    } else {
      console.error('user ' + uid + ' used an invalid key ' + key);
    }
  }
  account.update({'uid': uid}, {'$set': changes}, function () {
    res.redirect('/users/' + uid);
  });
});

// GET user bookmarks
users.get('/:uid/bookmarks', function (req, res) {
  var user = res.user;
  var query = req.query;
  var type = query.type || 'articles';
  var bookmarks = user.activity[type] || user.activity.articles;
  var reviewTypes = [
    'reviews',
    'votes'
  ];
  var eprintTypes = [
    'articles',
    'readings',
    'ratings',
    'edits'
  ];
  var list = [];
  res.locals.type = type;
  if (reviewTypes.indexOf(type) !== -1) {
    list = list.concat(bookmarks.map(function (bookmark) {
      return bookmark.pid;
    }));
    review.find({'pid': {'$in': list}}, function (docs) {
      bookmarks.forEach(function (bookmark) {
        var pid = bookmark.pid;
        docs.some(function (post) {
          if (post.pid === pid) {
            bookmark.post = post;
            return true;
          }
          return false;
        });
      });
      var pagination = article.paginate(query, bookmarks);
      user.activity[type] = pagination.docs;
      res.render('users/bookmarks', pagination);
    });
  } else if (eprintTypes.indexOf(type) !== -1) {
    var status = {
      'articles': 'unread',
      'readings': 'read',
      'ratings': 'rated'
    }[type];
    bookmarks = bookmarks.filter(function (bookmark) {
      return bookmark.status === status;
    });
    list = list.concat(bookmarks.map(function (bookmark) {
      return bookmark.id;
    }));
    article.find({'id': {'$in': list}}, function (docs) {
      bookmarks.forEach(function (bookmark) {
        var id = bookmark.id;
        docs.some(function (eprint) {
          if (eprint.id === id) {
            bookmark.eprint = eprint;
            return true;
          }
          return false;
        });
      });
      var pagination = article.paginate(query, bookmarks);
      user.activity[type] = pagination.docs;
      res.render('users/bookmarks', pagination);
    });
  } else {
    res.render('404');
  }
});

// POST article bookmark
users.post('/:uid/articles/bookmark', function (req, res) {
  var user = req.user;
  var uid = user.uid;
  var id = req.body.id;
  var bookmarked = user.activity.articles.some(function (article) {
    return article.id === id;
  });
  if (bookmarked) {
    res.render('403', {
      message: 'You have already bookmarked eprint ' + id + '.'
    });
  } else if (regexp.arxiv.identifier.test(id)) {
    var modifier = {
      '$push': {
        'activity.articles': {
          '$each': [
            {
              'id': id,
              'status': 'unread',
              'bookmarked': new Date()
            }
          ],
          '$position': 0
        }
      }
    };
    account.update({'uid': uid}, modifier, function () {
      console.log('user ' + uid + ' bookmarked ' + ' eprint ' + id);
      analysis.update({'id': id}, {
        '$inc': {'feedback.bookmarks': 1}
      }, function (eprint) {
        if (eprint) {
          var count = eprint.analyses.feedback.bookmarks;
          console.log('eprint ' + id + ' has been bookmarked ' + count + ' times');
        }
      });
      res.redirect('/users/' + uid + '/bookmarks');
    });
  } else {
    res.render('403', {
      message: 'The eprint ID is not valid.'
    });
  }
});

// Delete a bookmarked article
users.post('/:uid/articles/delete', function (req, res) {
  var user = req.user;
  var uid = user.uid;
  var id = req.body.id;
  var unread = user.activity.articles.some(function (article) {
    return article.id === id && article.status === 'unread';
  });
  if (unread) {
    account.update({
      'uid': uid
    }, {
      '$pull': {
        'activity.articles': {'id': id, 'status': 'unread'}
      }
    }, function () {
      console.log('user ' + uid + ' deleted the bookmark for eprint ' + id);
      analysis.update({'id': id}, {
        '$inc': {'feedback.bookmarks': -1}
      }, function (eprint) {
        if (eprint) {
          var count = eprint.analyses.feedback.bookmarks;
          console.log('eprint ' + id + ' has been bookmarked ' + count + ' times');
        }
      });
      res.redirect('/users/' + uid + '/bookmarks');
    });
  } else {
    res.render('403', {
      message: 'You can not delete this bookmark for eprint ' + id + '.'
    });
  }
});

// Mark an article as read
users.post('/:uid/articles/read', function (req, res) {
  var user = req.user;
  var uid = user.uid;
  var id = req.body.id;
  var config = settings.user.activity;
  var articles = user.activity.articles;
  var readings = articles.filter(function (article) {
    return article.status !== 'unread';
  });
  var read = readings.some(function (reading) {
    return reading.id === id;
  });
  var yesterday = Date.now() - config.intervals.read;
  readings = readings.filter(function (reading) {
    return reading.status === 'read' && reading.read.getTime() > yesterday;
  });
  if (read) {
    res.render('403', {
      message: 'You have already marked eprint ' + id + ' as read.'
    });
  } else if (readings.length < config.maxReadings) {
    articles = articles.filter(function (article) {
      return article.id === id;
    });
    if (articles.length) {
      var interval = Date.now() - articles[0].bookmarked.getTime();
      if (interval > config.intervals.bookmark) {
        account.update({
          'uid': uid,
          'activity.articles.id': id
        }, {
          '$set': {
            'activity.articles.$.status': 'read',
            'activity.articles.$.read': new Date()
          },
          '$inc': {
            'stats.reputation': settings.user.reputation.article.read
          }
        }, function () {
          console.log('user ' + uid + ' marked ' + ' eprint ' + id + ' as read');
          analysis.update({'id': id}, {
            '$inc': {'feedback.readers': 1}
          }, function (eprint) {
            if (eprint) {
              var count = eprint.analyses.feedback.readers;
              console.log('eprint ' + id + ' has ' + count + ' readers');
            }
          });
          res.redirect('/users/' + uid + '/bookmarks?type=readings');
        });
      } else {
        res.render('403', {
          message: 'You should read eprint ' + id + ' carefully.'
        });
      }
    } else {
      res.render('403', {
        message: 'You should bookmark eprint ' + id + ' and read it carefully.'
      });
    }
  } else {
    res.render('403', {
      message: 'You marked too many articles as read today.'
    });
  }
});

// Rate an article
users.post('/:uid/articles/rating', function (req, res) {
  var user = req.user;
  var uid = user.uid;
  var id = req.body.id;
  var score = parseInt(req.body.score) || -1;
  var readings = user.activity.articles.filter(function (article) {
    return article.status !== 'unread';
  });
  var ratings = readings.filter(function (reading) {
    return reading.status === 'rated';
  });
  var rated = ratings.some(function (rating) {
    return rating.id === id;
  });
  if (rated) {
    var rating = ratings.filter(function (rating) {
      return rating.id === id;
    })[0];
    if (score >= 1 && score <= 5 && score !== rating.score) {
      account.update({
        'uid': uid,
        'activity.articles.id': id
      }, {
        '$set': {
          'activity.articles.$.rated': new Date(),
          'activity.articles.$.score': score
        }
      }, function () {
        article.lookup({'id': id}, function (eprint) {
          if (eprint) {
            var feedback = eprint.analyses.feedback;
            var count = feedback.ratings;
            var average = feedback.score + (score - rating.score) / count;
            console.log('user ' + uid + ' rated ' + ' eprint ' + id);
            analysis.update({'id': id}, {
              '$set': {'feedback.score': average}
            }, function (doc) {
              if (doc) {
                console.log('eprint ' + id + ' has ' + count + ' ratings');
              }
            });
          }
          res.redirect('/users/' + uid + '/bookmarks?type=ratings');
        });
      });
    } else {
      res.render('403', {
        message: 'Your rating score for eprint ' + id + ' is not changed.'
      });
    }
  } else {
    var read = readings.some(function (reading) {
      return reading.id === id;
    });
    if (read) {
      if (score >= 1 && score <= 5) {
        account.update({
          'uid': uid,
          'activity.articles.id': id
        }, {
          '$set': {
            'activity.articles.$.status': 'rated',
            'activity.articles.$.rated': new Date(),
            'activity.articles.$.score': score
          },
          '$inc': {
            'stats.reputation': settings.user.reputation.article.rate
          }
        }, function () {
          article.lookup({'id': id}, function (eprint) {
            if (eprint) {
              var feedback = eprint.analyses.feedback;
              var count = feedback.ratings + 1;
              var average = (feedback.score * (count - 1) + score) / count;
              console.log('user ' + uid + ' rated ' + ' eprint ' + id);
              analysis.update({'id': id}, {
                '$inc': {'feedback.ratings': 1},
                '$set': {'feedback.score': average}
              }, function (doc) {
                if (doc) {
                  console.log('eprint ' + id + ' has ' + count + ' ratings');
                }
              });
            }
            res.redirect('/users/' + uid + '/bookmarks?type=ratings');
          });
        });
      } else {
        res.render('403', {
          message: 'Your rating score ' + score + ' is not valid.'
        });
      }
    } else {
      res.render('403', {
        message: 'You should finish reading eprint ' + id + ' before rating it.'
      });
    }
  }
});

// POST review bookmark
users.post('/:uid/reviews/bookmark', function (req, res) {
  var user = req.user;
  var uid = user.uid;
  var pid = parseInt(req.body.pid);
  var bookmarked = user.activity.reviews.some(function (review) {
    return review.pid === pid;
  });
  if (bookmarked) {
    res.render('403', {
      message: 'You have already bookmarked review ' + pid + '.'
    });
  } else if (pid > 0) {
    var modifier = {
      '$push': {
        'activity.reviews': {
          '$each': [
            {
              'pid': pid,
              'bookmarked': new Date()
            }
          ],
          '$position': 0
        }
      }
    };
    account.update({'uid': uid}, modifier, function () {
      console.log('user ' + uid + ' bookmarked review ' + pid);
      review.update({'pid': parseInt(pid)}, {
        '$inc': {'feedback.bookmarks': 1}
      }, function (post) {
        if (post) {
          var author = post.author.uid;
          var count = post.feedback.bookmarks;
          var gain = settings.user.reputation.review.bookmarked;
          console.log('review ' + pid + ' has ' + count + ' bookmarks');
          account.update({'uid': author}, {
            '$inc': {
              'stats.reputation': gain
            }
          }, function () {
            console.log('User ' + author + ' gainded reputation ' + gain);
          });
        }
      });
      res.redirect('/users/' + uid + '/bookmarks?type=reviews');
    });
  } else {
    res.render('403', {
      message: 'The review PID is not valid.'
    });
  }
});

// Vote a review
users.post('/:uid/reviews/voting', function (req, res) {
  var user = req.user;
  var uid = user.uid;
  var body = req.body;
  var pid = parseInt(body.pid);
  var voted = user.activity.votes.some(function (vote) {
    return vote.pid === pid;
  });
  if (voted) {
    res.render('403', {
      message: 'You have already voted review ' + pid + '.'
    });
  } else {
    var voting = body.voting;
    var modifier = {
      '$push': {
        'activity.votes': {
          '$each': [
            {
              'pid': pid,
              'voted': new Date(),
              'voting': (voting === 'upvote') ? 1 : -1
            }
          ],
          '$position': 0
        }
      },
      '$inc': {
        'stats.reputation': settings.user.reputation.review.vote
      }
    };
    account.update({'uid': uid}, modifier, function () {
      var increment = {};
      var field = (voting === 'upvote') ? 'upvotes' : 'downvotes';
      increment['feedback.' + field] = 1;
      console.log('user ' + uid + ' voted review ' + pid);
      review.update({'pid': parseInt(pid)}, {
        '$inc': increment
      }, function (post) {
        if (post) {
          var author = post.author.uid;
          var feedback = post.feedback;
          var count = feedback.upvotes + feedback.downvotes;
          var voted = (voting === 'upvote') ? 'upvoted' : 'downvoted';
          var gain = settings.user.reputation.review[voted];
          console.log('review ' + pid + ' has ' + count + ' votes');
          account.update({'uid': author}, {
            '$inc': {'stats.reputation': gain}
          }, function () {
            console.log('User ' + author + ' gainded reputation ' + gain);
          });
        }
      });
      res.redirect('/reviews/' + pid);
    });
  }
});

// GET user publications
users.get('/:uid/publications', function (req, res) {
  var user = res.user;
  var publications = user.publications;
  var list = [].concat(publications.map(function (publication) {
    return publication.id;
  }));
  article.find({'id': {'$in': list}}, function (docs) {
    publications.forEach(function (publication) {
      var id = publication.id;
      docs.some(function (eprint) {
        if (eprint.id === id) {
          publication.eprint = eprint;
          return true;
        }
        return false;
      });
    });
    publications.sort(function (a, b) {
      return b.eprint.published - a.eprint.published;
    });
    var pagination = article.paginate(req.query, publications);
    user.publications = pagination.docs;
    res.render('users/publications/list', pagination);
  });
});

// GET method for adding new publications
users.get('/:uid/publications/add', function (req, res) {
  if (res.locals.authorized) {
    res.render('users/publications/add');
  } else {
    res.render('403', {
      message: 'You are not authorized to access this page.'
    });
  }
});

// POST method for adding new publications
users.post('/:uid/publications/submit', function (req, res) {
  var user = req.user;
  var uid = user.uid;
  var body = req.body;
  var certified = body.certified;
  if (certified === 'true') {
    var preprints = [];
    var publications = req.user.publications;
    var pattern = regexp.arxiv.identifier;
    var identifiers = String(body.identifiers).trim().split(/\s*[,;]\s*/);
    identifiers.filter(function (identifier) {
      identifier = identifier.replace(/v\d+$/, '');
      var published = publications.every(function (publication) {
        return publication.id !== identifier;
      });
      return pattern.test(identifier) && published;
    }).forEach(function (identifier) {
      preprints.push({
        'id': identifier.replace(/v\d+$/, ''),
        'added': new Date()
      });
    });
    var length = preprints.length;
    if (length) {
      account.update({'uid': uid}, {
        '$push': {
          'publications': {
            '$each': preprints,
            '$position': 0
          }
        },
        '$inc': {
          'stats.reputation': settings.user.reputation.publication.add * length
        }
      }, function (user) {
        if (user) {
          console.log('user ' + uid + ' added new publications');
        }
        res.redirect('/users/' + uid + '/publications');
      });
    } else {
      res.render('403', {
        message: 'You should submit valid publications.'
      });
    }
  } else {
    res.render('403', {
      message: 'You should certify that you are an author of these articles.'
    });
  }
});

// GET user documents
users.get('/:uid/documents', function (req, res) {
  var user = res.user;
  var documents = user.documents;
  documents.forEach(function (doc) {
    var extension = (doc.href.match(/\.[a-z\d]+$/) || ['.txt'])[0];
    doc.standalone = true;
    if (['.tex', '.latex', '.zip'].indexOf(extension) !== -1) {
      var href = doc.href;
      var pattern = new RegExp('\\\/tex\\\/(.+)\\' + extension + '$');
      var link = href.replace(pattern, '/pdf/$1.pdf');
      if (link !== href) {
        documents.some(function (entry) {
          if (entry.href === link) {
            doc.standalone = false;
            entry.tex = href;
            return true;
          }
          return false;
        });
      }
    }
  });
  documents = documents.filter(function (doc) {
    return doc.standalone === true && doc.status === 'public';
  });
  var pagination = article.paginate(req.query, documents);
  user.documents = pagination.docs;
  res.render('users/documents/list', pagination);
});

// GET method for uploading new documents
users.get('/:uid/documents/upload', function (req, res) {
  if (res.locals.authorized) {
    res.render('users/documents/upload', {
      pattern: regexp.output(regexp.account.doc)
    });
  } else {
    res.render('403', {
      message: 'You are not authorized to access this page.'
    });
  }
});

// POST method for uploading new documents
users.post('/:uid/documents/submit', function (req, res) {
  var user = req.user;
  var uid = user.uid;
  var body = req.body;
  if (body.certified === 'true') {
    var file = req.files && req.files.file;
    var documents = user.documents;
    var href = String(body.href).trim().toLowerCase();
    var uploaded = documents.some(function (doc) {
      return doc.href === href;
    });
    if (uploaded) {
      res.render('403', {
        message: 'This document has already been uploaded.'
      });
    } else if (file && file.path) {
      if (regexp.account.doc.href.test(href)) {
        var doc = {
          'type': String(body.type).trim() || 'general',
          'source': 'Arxitics OSS',
          'language': String(body.language).trim() || 'en',
          'title': String(body.title).trim(),
          'href': href,
          'uploaded': new Date(),
          'status': 'public'
        };
        account.update({'uid': uid}, {
          '$push': {
            'documents': {
              '$each': [doc],
              '$position': 0
            }
          },
          '$inc': {
            'stats.reputation': settings.user.reputation.doc.upload
          }
        }, function (user) {
          if (user) {
            console.log('user ' + uid + ' uploaded new documents');
          }
          oss.putObject({
            resource: href.replace(/^https?\:\/\/[^\/]+/, ''),
            origin: file.path
          }, function (success) {
            if (success) {
              res.redirect('/users/' + uid + '/documents');
            } else {
              res.render('500', {
                message: 'The server failed to upload your document to Arxitics OSS.'
              });
            }
          });
        });
      } else {
        res.render('403', {
          message: 'You should provide a valid hyperlink reference to your document.'
        });
      }
    } else {
      res.render('500', {
        message: 'You should submit a valid document.'
      });
    }
  } else {
    res.render('403', {
      message: 'You should certify that you are an author of this document.'
    });
  }
});

// GET user messages
users.get('/:uid/messages', function (req, res) {
  var user = res.user;
  var uid = user.uid;
  if (res.locals.authorized || req.privilege.isModerator) {
    account.find({'messages.sender.uid': uid}, function (docs) {
      var messages = user.messages.filter(function (message) {
        return message.status !== 'deleted';
      });
      var mails = [].concat(messages);
      docs.forEach(function (doc) {
        doc.messages.forEach(function (message) {
          if (message.sender.uid === uid) {
            mails.push({
              'outbox': message.inbox,
              'receiver': {
                'uid': doc.uid,
                'name': doc.name
              },
              'content': message.content,
              'sent': message.received,
              'status': message.status
            });
          }
        });
      });
      mails.sort(function (a, b) {
        return (b.received || b.sent) - (a.received || a.sent);
      });
      var pagination = article.paginate(req.query, mails);
      user.messages = pagination.docs;
      res.render('users/messages/list', pagination);
    });
  } else {
    res.render('403', {
      message: 'You are not authorized to access this page.'
    });
  }
});

// GET method for composing new message
users.get('/:uid/messages/compose', function (req, res) {
  if (res.locals.authorized) {
    res.render('users/messages/compose', {
      pattern: regexp.output(regexp.message)
    });
  } else {
    res.render('403', {
      message: 'You are not authorized to access this page.'
    });
  }
});

// POST method for sending new messages
users.post('/:uid/messages/submit', function (req, res) {
  var user = req.user;
  var uid = user.uid;
  var body = req.body;
  var pattern = regexp.message;
  var receiver = String(body.receiver).trim();
  var content = String(body.content).trim();
  var matches = receiver.match(pattern.receiver);
  if (matches && pattern.content.test(content)) {
    var recipient = parseInt(matches[1]);
    account.lookup({'uid': recipient}, function (profile) {
      if (profile && profile.name === matches[2].trim()) {
        var message = {
          'inbox': recipient + '.' + (profile.messages.length + 1),
          'sender': {
            'uid': uid,
            'name': user.name
          },
          'content': content,
          'received': new Date(),
          'status': 'unread'
        };
        account.update({
          'uid': recipient
        }, {
          '$push': {
            'messages': {
              '$each': [message],
              '$position': 0
            }
          },
        }, function (updated) {
          if (updated) {
            console.log('user ' + uid + ' sent a message to user ' + recipient);
            res.redirect('/users/' + uid + '/messages');
          } else {
            console.log('user ' + uid + ' failed to send a message to user ' + recipient);
            res.render('500', {
              message: 'The server failed to send your message to user ' + recipient + '.'
            });
          }
        });
      } else {
        console.log('user ' + uid + ' failed to send a message to user ' + recipient);
        res.render('404', {
          message: 'User ' + receiver + ' does not exists.'
        });
      }
    });
  } else {
    res.render('403', {
      message: 'We only accept constructive messages written in English.'
    });
  }
});

// Reply a message
users.post('/:uid/messages/reply', function (req, res) {
  var body = req.body;
  res.render('users/messages/preview', {
    preview: {
      receiver: String(body.receiver).trim(),
      content: String(body.content).trim()
    },
    pattern: regexp.output(regexp.message)
  });
});

// Mark a message as read
users.post('/:uid/messages/read', function (req, res) {
  var user = req.user;
  var uid = user.uid;
  var body = req.body;
  var inbox = String(body.inbox).trim();
  account.update({
    'uid': uid,
    'messages.inbox': inbox
  }, {
    '$set': {'messages.$.status': 'read'}
  }, function (profile) {
    if (profile) {
      console.log('user ' + uid + ' marked the message ' + inbox + 'as read');
      res.redirect('/users/' + uid + '/messages');
    } else {
      console.log('user ' + uid + ' failed to mark the message ' + inbox + 'as read');
      res.render('500', {
        message: 'The server failed to mark the message ' + inbox + ' as read.'
      });
    }
  });
});

// Delete a message
users.post('/:uid/messages/delete', function (req, res) {
  var user = req.user;
  var uid = user.uid;
  var body = req.body;
  var inbox = String(body.inbox).trim();
  account.update({
    'uid': uid,
    'messages.inbox': inbox
  }, {
    '$set': {'messages.$.status': 'deleted'}
  }, function (profile) {
    if (profile) {
      console.log('user ' + uid + ' deleted the message ' + inbox);
      res.redirect('/users/' + uid + '/messages');
    } else {
      console.log('user ' + uid + ' failed to delete the message ' + inbox);
      res.render('500', {
        message: 'The server failed to delete the message ' + inbox + '.'
      });
    }
  });
});

// Preview message
users.post('/:uid/messages/preview', function (req, res) {
  var body = req.body;
  var receiver = String(body.receiver).trim();
  var content = String(body.content).trim();
  var pattern = regexp.message;
  if (pattern.receiver.test(receiver) && pattern.content.test(content)) {
    res.render('users/messages/preview', {
      preview: {
        receiver: receiver,
        content: content
      },
      pattern: regexp.output(regexp.message)
    });
  } else {
    res.render('403', {
      message: 'We only accept constructive messages written in English.'
    });
  }
});

// Reset email
users.get('/:uid/reset/email/:hash', function (req, res) {
  var uid = res.uid;
  var user = res.user;
  var hash = req.params.hash;
  account.update({'uid': uid, 'note.hash': hash}, {
    '$set': {'email': user.note.email, 'auth.requests': 0},
    '$unset': {'note.email': '', 'note.hash': ''}
  }, function (profile) {
    if (profile) {
      res.redirect('/users/' + uid);
    } else {
      res.render('403', {
        message: 'Your signature hash is not valid.'
      });
    }
  });
});

// Export variable
module.exports = users;
