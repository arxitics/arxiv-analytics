/**
 * User router instance.
 */

var util = require('util');
var express = require('express');
var account = require('../models/account');
var article = require('../models/article');
var analysis = require('../models/analysis');
var analytics = require('../models/analytics');
var review = require('../models/review');
var scheme = require('../models/scheme');
var regexp = require('../models/regexp');
var security = require('../models/security');
var settings = require('../settings');

var articles = express.Router();

// GET statistics page
articles.get('/', function (req, res) {
  var query = req.query;
  var tab = query.sort || 'views';
  var filter = {};
  var search = {};
  var unfiltered = Object.keys(query).every(function (field) {
    return String(field).match(/^categor(y|ies)$/) === null;
  });
  if (req.logged && unfiltered) {
    var categories = req.user.subscription.categories;
    if (categories.length) {
      search.categories = {'$in': categories};
    }
  }
  search.sort = {};
  search.sort['analyses.feedback.' + tab] = -1;
  query.page = parseInt(query.page) || 1;
  query.perpage = Math.min(parseInt(query.perpage) || settings.search.perpage, 100);
  query.skip = query.perpage * (query.page - 1);
  search['skip'] = query.skip;
  search['limit'] = query.perpage;
  article.find(search, function (docs) {
    var queryString = security.serialize(filter, {paramsCombined: true});
    res.render('articles/stats', {
      query: query,
      type: tab,
      filter: filter,
      eprints: docs,
      count: query.skip + docs.length,
      startIndex: query.skip,
      endIndex: query.skip + query.perpage,
      currentPage: query.page,
      location: '/articles?' + queryString
    });
  });
});

// GET a random article
articles.get('/random', function (req, res) {
  var query = req.query;
  var date = new Date('1986-04-25T15:39:49Z');
  var interval = Date.now() - date.getTime() - 86400000;
  date.setTime(date.getTime() + Math.floor(Math.random() * interval));
  query['published'] = {'$gte': date};
  query['sort'] = {'published': 1};
  query['limit'] = 1;
  article.find(query, function (docs) {
    if (docs && docs.length) {
      res.redirect('/articles/' + docs[0].id);
    } else {
      res.redirect('/articles/random');
    }
  });
});

// Export categories.json
articles.get('/export/categories.json', function (req, res) {
  analytics.lookup({'name': 'primaryCategories'}, function (data) {
    if (data) {
      res.json(analytics.treemap(data.stats));
    } else {
      console.log('failed to generate categories.json');
      res.render('500', {
        message: 'The server failed to generate the required data.'
      });
    }
  });
});

// Set local variable
var route = new RegExp(String(regexp.arxiv.identifier).slice(2, -2));
articles.use(function (req, res, next) {
  var path = req.path.replace(/^\/+/, '');
  var identifier = (path.match(route) || [''])[0];
  var id = identifier.replace(/v\d+$/, '');
  var version = (identifier.match(/v\d+$/) || ['v0'])[0];
  if (identifier.match(regexp.arxiv.identifier)) {
    article.lookup({'id': id}, function (eprint) {
      if (eprint) {
        var user = req.user;
        req.id = id;
        req.eprint = eprint;
        res.locals.id = id;
        res.locals.eprint = eprint;
        if (req.method === 'POST' && !req.privilege.articlePost) {
          res.render('403', {
            message: 'You are not authorized to post these changes.'
          });
        } else {
          next();
        }
      } else {
        res.render(404, {
          message: 'The eprint ' + id + ' does not exists.'
        });
      }
    });
  } else {
    res.render('404');
  }
});

// Submit reviews
articles.post('*/reviews/submit', function (req, res) {
  var body = req.body;
  var title = String(body.title).trim();
  var content = String(body.content).trim();
  var pattern = regexp.review;
  if (req.privilege.isPublic) {
    if (title.match(pattern.title) && content.match(pattern.content)) {
      var user = req.user;
      var eprint = req.eprint;
      var id = eprint.id;
      var uid = user.uid;
      var post = {
        'eprint': {
          'id': id,
          'version': eprint.version
        },
        'author': {
          'uid': uid,
          'name': user.name
        },
        'title': title,
        'content': content,
        'wiki': body.wiki
      };
      review.create(post, function () {
        console.log('user ' + uid + ' published a review for eprint ' + id);
        analysis.update({'id': id}, {
          '$inc': {'feedback.reviews': 1}
        }, function (doc) {
          if (doc) {
            var count = doc.analyses.feedback.reviews;
            console.log('eprint ' + id + ' has ' + count + ' reviews');
          }
        });
        account.update({'uid': uid}, {
          '$inc': {
            'stats.reviews': 1,
            'stats.reputation': settings.user.reputation.review.publish
          }
        }, function (profile) {
          if (profile) {
            var count = profile.stats.reviews; 
            console.log('user ' + uid + ' has ' + count + ' reviews');
          }
        });
        res.redirect('/articles/' + id + '/reviews');
      });
    } else {
      res.render('403', {
        message: 'We only accept constructive reviews written in English.'
      });
    }
  } else {
    res.render('403', {
      message: 'You are not authorized to publish reviews.'
    });
  }
});

// Preview post
articles.post('*/reviews/preview', function (req, res) {
  var body = req.body;
  var title = String(body.title).trim();
  var content = String(body.content).trim();
  var pattern = regexp.review;
  if (title.match(pattern.title) && content.match(pattern.content)) {
    res.render('articles/reviews/preview', {
      parse: review.parse,
      preview: {
        title: title,
        content: content,
        isWiki: body.wiki === 'true'
      },
      pattern: regexp.output(pattern)
    });
  } else {
    res.render('403', {
      message: 'We only accept constructive reviews written in English.'
    });
  }
});

// Post new review
articles.get('*/reviews/post', function (req, res) {
  res.render('articles/reviews/post', {
    pattern: regexp.output(regexp.review)
  });
});

// GET `reviews` page
articles.get('*/reviews', function (req, res) {
  review.find({'eprints.id': req.id}, function (docs) {
    var reviews = docs.filter(function (doc) {
      return doc.note.status === 'public';
    });
    var pagination = article.paginate(req.query, reviews);
    var local = {
      parse: review.parse,
      reviews: pagination.docs,
      pattern: regexp.output(regexp.review)
    };
    res.render('articles/reviews/list', util._extend(local, pagination));
  });
});

// GET `references` page
articles.get('*/references', function (req, res) {
  res.render('articles/references');
});

// Export citation in BibTeX
articles.get('*/bibtex', function (req, res) {
  res.set('Content-Type', 'application/x-bibtex');
  res.send(article.exportBibtex(req.eprint));
});

// Edit auto-generated metadata
articles.get('*/edit', function (req, res) {
  res.render('articles/edit', {
    pattern: regexp.output(regexp.arxiv.publication),
    output: scheme.output
  });
});

// POST edited metadata
articles.post('*/edit', function (req, res) {
  var user = req.user;
  var uid = user.uid;
  var eprint = req.eprint;
  var status = eprint.analyses.note.status;
  if (req.privilege.editMetadata && status === 'editable') {
    var arxiv = regexp.arxiv;
    var body = req.body;
    var id = eprint.id;
    var modifier = {};
    article.classifications.forEach(function (key) {
      if (body.hasOwnProperty(key)) {
        var values = String(body[key]).trim().split(/\s*[,;]\s*/);
        if (values.length > 1) {
          values = values.filter(function (value, index, array) {
            return array.indexOf(value) === index;
          });
        }
        if (key === 'subjects') {
          values = values.filter(function (value) {
            return ['pacs', 'msc', 'ccs', 'jel'].some(function (code) {
              return value.match(arxiv[code]);
            });
          });
        } else if (key === 'themes') {
          var length = values.length;
          for (var i = 1; i < length; i++) {
            var value = values[i];
            if (value.search(':') === -1) {
              var category = values[i - 1].split(':')[0];
              values[i] = category + ': ' + value;
            }
          }
          values = scheme.parse(values.filter(function (value) {
            return value.match(regexp.account.theme);
          }));
        } else if (key === 'tags') {
          var tags = scheme.tags;
          values = values.filter(function (value) {
            return tags.some(function (object) {
              return object.tag === value;
            });
          });
        }
        if (values && values.length && values[0]) {
          modifier[key] = values;
        }
      }
    });
    article.bibEntries.forEach(function (entry) {
      if (body.hasOwnProperty('publication.' + entry)) {
        var value = String(body['publication.' + entry]).trim();
        var pattern = arxiv.publication[entry];
        if (!pattern || value.match(pattern)) {
          if (value.match(/^[1-9]\d*$/)) {
            value = parseInt(value);
          }
          if (value) {
            modifier['publication.' + entry] = value;
          }
        }
      }
    });

    var note = article.template.analyses.note;
    for (var key in note) {
      if (note.hasOwnProperty(key) && body.hasOwnProperty('note.' + key)) {
        var value = String(body['note.' + key]).trim();
        if (value.match(/^\d+$/)) {
          value = parseInt(value);
        }
        if (value) {
          modifier['note.' + key] = value;
        }
      }
    }
    analysis.update({'id': id}, {'$set': modifier}, function () {
      var edits = user.activity.edits;
      var edited = edits.some(function (edit) {
        return edit.id === id;
      });
      var query = {'uid': uid};
      var update = {};
      if (edited) {
        query['activity.edits.id'] = id;
        update = {
          '$set': {'activity.edits.$.edited': new Date()},
          '$inc': {'activity.edits.$.count': 1}
        };
      } else {
        update = {
          '$push': {
            'activity.edits': {
              '$each': [
                {
                  'id': id,
                  'edited': new Date(),
                  'count': 1
                }
              ],
              '$position': 0
            }
          },
          '$inc': {
            'stats.reputation': settings.user.reputation.article.edit
          }
        };
      }
      account.update(query, update, function () {
        console.log('user ' + uid + ' edited the metadata of eprint ' + id);
      });
      res.redirect('/users/' + uid + '/bookmarks?type=edits');
    });
  } else {
    res.render('403', {
      message: 'You are not authorized to post these changes.'
    });
  }
});

// Attach supplementary resources
articles.get('*/resources/attach', function (req, res) {
  res.render('articles/resources/attach', {
    pattern: regexp.output(regexp.arxiv.resource)
  });
});

// POST supplementary resources
articles.post('*/resources/attach', function (req, res) {
  var body = req.body;
  var user = req.user;
  var eprint = req.eprint;
  var uid = user.uid;
  var id = eprint.id;
  var href = String(body.href).trim();
  var attached = eprint.resources.some(function (resource) {
    return resource.href === href;
  });
  if (attached) {
    res.render('403', {
      message: 'This resource has already been attached.'
    });
  } else {
    var resource = {
      'type': String(body.type).trim() || 'posts',
      'source': String(body.source).trim(),
      'title': String(body.title).trim(),
      'href': href,
      'status': 'public'
    };
    article.update({'id': id}, {
      '$push': {
        'resources': {
          '$each': [resource],
          '$position': 0
        }
      }
    }, function () {
      account.update({'uid': uid}, {
        '$inc': {
          'stats.reputation': settings.user.reputation.article.attach
        }
      }, function () {
        console.log('user ' + uid + ' attached a resource for eprint ' + id);
      });
      res.redirect('/articles/' + id + '/resources');
    });
  }
});

// GET `resources` page
articles.get('*/resources', function (req, res) {
  var eprint = req.eprint;
  var resources = eprint.resources.filter(function (resource) {
    return resource.status === 'public';
  });
  var pagination = article.paginate(req.query, resources);
  var local = {
    parse: review.parse,
    resources: pagination.docs
  };
  res.render('articles/resources/list', util._extend(local, pagination));
});

// GET `abstract` page
articles.get(route, function (req, res) {
  var user = req.user;
  var articles = user.activity.articles;
  var eprint = req.eprint;
  var id = eprint.id;
  var status = eprint.analyses.note.status;
  if (req.logged && req.privilege.isPublic) {
    var path = req.originalUrl;
    var isFirstVisit = req.session.views.some(function (view) {
      return view[0] === path && view[1] === 1;
    });
    if (isFirstVisit) {
      analysis.update({'id': id}, {
        '$inc': {'feedback.views': 1}
      }, function (doc) {
        if (doc) {
          var count = doc.analyses.feedback.views;
          console.log('eprint ' + id + ' has been viewed ' + count + ' times');
        }
      });
    }
  }
  res.render('articles/abstract', {
    bookmarked: articles.some(function (article) {
      return article.id === id;
    }),
    read: articles.some(function (reading) {
      return reading.id === id && reading.status !== 'unread';
    }),
    rated: articles.some(function (rating) {
      return rating.id === id && rating.status === 'rated';
    }),
    editable: (req.privilege.editMetadata && status === 'editable')
  });
});

// Export variable
module.exports = articles;
