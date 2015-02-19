/**
 * Article reviews.
 */

var marked = require('marked');
var db = require('./db');
var analytics = require('./analytics');
var regexp = require('./regexp').review;

// Review template
exports.template = {
  'pid': -1,
  'eprints': [
    {
      'id': '',
      'version': 'v0'
    }
  ],
  'author': {
    'uid': -1,
    'name': ''
  },
  'published': new Date(0),
  'edited': new Date(0),
  'title': '',
  'content': '',
  'revisions': [
    {
      'editor': {
        'uid': -1,
        'name': ''
      },
      'edited': new Date(0)  
    }
  ],
  'comments': [
    {
      'pid': '',
      'user': {
        'uid': -1,
        'name': ''
      },
      'published': new Date(0),
      'content': ''
    }
  ],
  'feedback': {
    'views': 0,
    'bookmarks': 0,
    'upvotes': 0,
    'downvotes': 0
  },
  'note': {
    'wiki': false,
    'status': 'public'
  }
};

// Search options as filters
exports.filters = [
  'q',
  'search',
  'projection',
  'sort',
  'order',
  'skip',
  'limit',
  'perpage',
  'page',
  'date-range',
  'date-from',
  'date-to'
];

// Find reviews
exports.find = function (query, callback) {
  var criteria = {};
  var projection = query.projection || {};
  var sort = query.sort || {'edited': -1};
  var skip = parseInt(query.skip) || 0;
  var limit = parseInt(query.limit) || 0;
  var filters = exports.filters;
  for (var key in query) {
    if (query.hasOwnProperty(key)) {
      var value = query[key];
      if (filters.indexOf(key) === -1) {
        criteria[key] = value;
      }
    }
  }
  db.reviews.find(criteria, projection)
    .sort(sort).skip(skip).limit(limit, function (err, docs) {
    if (err) {
      console.error(err);
      console.log('failed to find the reviews.');
    }
    if (docs && docs.length && Array.isArray(docs)) {
      console.log('found ' + docs.length + ' reviews successfully');
    } else {
      console.log('no reviews returned for the query');
      docs = [];
    }
    return (typeof callback === 'function') ? callback(docs): null;
  });
};

// Lookup review
exports.lookup = function (query, callback) {
  db.reviews.findOne(query, function (err, review) {
    if (err) {
      console.error(err);
      console.log('failed to lookup the review');
    }
    if (review) {
      console.log('review ' + review.pid + ' exists');
    } else {
      console.log('the review does not exist');
    }
    return (typeof callback === 'function') ? callback(review) : null;
  });
};

// Create new review
exports.create = function (post, callback) {
  analytics.update({'name': 'reviews'}, {
    '$set': {'updated': new Date()},
    '$inc': {'count': 1}
  }, function (data) {
    if (data) {
      var pid = data.count;
      var author = post.author;
      var content = post.content;
      var timestamp = new Date();
      var review = {
        'pid': pid,
        'eprints': [post.eprint],
        'author': author,
        'published': timestamp,
        'edited': timestamp,
        'title': post.title,
        'content': content,
        'revisions': [
          {
            'editor': author,
            'additions': content.length,
            'summary': 'initial commit',
            'edited': timestamp
          }
        ],
        'comments': [],
        'feedback': exports.template.feedback,
        'note': {
          'wiki': post.wiki === 'true',
          'status': 'public'
        }
      };
      db.reviews.save(review, function (err, saved) {
        if (err) {
          console.error(err);
          console.log('failed to create review ' + pid);
        }
        if (saved) {
          console.log('review ' + pid + ' created successfully');
        } else {
          console.log('review ' + pid + ' cannot be saved');
        }
        return (typeof callback === 'function') ? callback(saved) : null;
      });
    }
  });
};

// Update review
exports.update = function (query, modifier, callback) {
  db.reviews.findAndModify({
    'query': query,
    'update': modifier,
    'new': true,
    'upsert': false
  }, function (err, review) {
    if (err) {
      console.error(err);
      console.log('failed to update the review');
    }
    if (review) {
      console.log('review ' + review.pid + ' updated successfully');
    } else {
      console.log('no reviews found for the query');
    }
    return (typeof callback === 'function') ? callback(review) : null;
  });
};

// Parse Markdown
exports.parse = function (string, callback) {
  var renderer = new marked.Renderer();
  renderer.heading = function (text, level) {
    // remove automatic generated id for the heading
    return '<h' + level + '>' + text + '</h' + level + '>';
  };
  var recovery = regexp.recovery;
  string = string.replace(/\\\$/g, '&#36;').replace(regexp.math, '`$1`');

  var html = marked(string, {
    renderer: renderer,
    gfm: true,
    tables: true,
    breaks: true,
    smartypants: true
  }).replace(/&amp;#36;/g, '\\$')
    .replace(recovery.begin, '$2').replace(recovery.end, '$1');
  return (typeof callback === 'function') ? callback(html) : html; 
};
