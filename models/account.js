/**
 * Account management.
 */

var db = require('./db');
var analytics = require('./analytics');
var security = require('./security');
var settings = require('../settings').user;

// Reserved range of accounts
exports.range = settings.reserved.range;

// Reserved accounts
exports.reservations = settings.reserved.accounts;

// Account template
exports.template = {
  'uid': -1,
  'name': '',
  'email': '',
  'locale': '',
  'role': 'user',
  'resume': {
    'career': '',
    'affiliation': '',
    'location': '',
    'research': '',
    'website': ''
  },
  'auth': {
    'created': new Date(0),
    'seen': new Date(0),
    'key': '',
    'code': -1,
    'hash': '',
    'expires': new Date(0),
    'status': 'offline',
    'requests': 0,
    'count': 0
  },
  'subscription': {
    'categories': [],
    'subjects': [],
    'themes': [],
    'keywords': [],
    'tags': [],
    'authors': []
  },
  'activity': {
    'articles': [],
    'edits': [],
    'reviews': [],
    'votes': []
  },
  'publications': [],
  'documents': [],
  'messages': [],
  'stats': {
    'views': 0,
    'reviews': 0,
    'comments': 0,
    'requests': 0,
    'uptime': 0,
    'bonus': 0,
    'penalty': 0,
    'reputation': 0
  },
  'note': {}
};

// Subscription keys
exports.subscriptions = [
  'authors',
  'categories',
  'subjects',
  'themes',
  'keywords',
  'tags'
];

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

// Test whether a given account is reserved
exports.test = function (email) {
  var reservations = exports.reservations;
  for (var profile in reservations) {
    if (reservations.hasOwnProperty(profile)) {
      if (reservations[profile].email === email) {
        return reservations[profile];
      }
    }
  }
};

// Administrator account
exports.admin = function (callback) {
  callback = (typeof callback === 'function') ? callback : function () {};
  var superuser = exports.reservations.admin;
  exports.lookup({'uid': superuser.uid}, function (user) {
    if (user) {
      console.log('administrator account exists');
      return callback(user);
    } else {
      console.log('failed to find the administrator account');
      exports.create(superuser.email, callback);
    }
  });
};

// Guest account
exports.guest = function (callback) {
  callback = (typeof callback === 'function') ? callback : function () {};
  var visitor = exports.reservations.guest;
  exports.lookup({'uid': visitor.uid}, function (user) {
    if (user) {
      console.log('guest account exists');
      return callback(user);
    } else {
      console.log('failed to find the guest account');
      console.log('checking administrator account ...');
      exports.admin(function () {
        exports.create(visitor.email, callback);
      });
    }
  });
};

// Access account
exports.access = function (uid, oid, callback) {
  var criteria = {'uid': uid};
  if (typeof oid === 'function') {
    callback = oid;
  } else if (oid) {
    criteria['_id'] = require('mongojs').ObjectId(oid);
  }
  callback = (typeof callback === 'function') ? callback : function () {};
  exports.update(criteria, {
    '$set': {
      'auth.seen': new Date(),
      'auth.status': 'online'
    }
  }, function (user) {
    if (user) {
      callback(user);
    } else {
      exports.guest(callback);
    }
  });
};

// Find users
exports.find = function (query, callback) {
  var criteria = {};
  var projection = query.projection || {};
  var sort = query.sort || {'stats.reputation': -1};
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
  db.users.find(criteria, projection)
    .sort(sort).skip(skip).limit(limit, function (err, docs) {
    if (err) {
      console.error(err);
      console.log('failed to find the users.');
    }
    if (docs && docs.length && Array.isArray(docs)) {
      console.log('found ' + docs.length + ' users successfully');
    } else {
      console.log('no users returned for the query');
      docs = [];
    }
    return (typeof callback === 'function') ? callback(docs): null;
  });
};

// Lookup account
exports.lookup = function (query, callback) {
  db.users.findOne(query, function (err, user) {
    if (err) {
      console.error(err);
      console.log('failed to lookup the user');
    }
    if (user) {
      console.log('user ' + user.uid + ' exists');
    } else {
      console.log('the user does not exists');
    }
    return (typeof callback === 'function') ? callback(user) : null;
  });
};

// Create new account
exports.create = function (email, callback) {
  callback = (typeof callback === 'function') ? callback : function () {};
  var timestamp = new Date();
  var randomNumber = security.randomDigits(12);
  var template = exports.template;
  var user = {};
  // Avoid the problem of passing object by reference
  for (var key in template) {
    if (template.hasOwnProperty(key)) {
      user[key] = template[key];
    }
  }
  user.email = email;
  user.name = email.split('@')[0];
  user.auth.created = timestamp;
  user.auth.seen = timestamp;
  user.auth.key = security.md5Hash(email + timestamp + randomNumber);
  db.users.save(user, function (err, saved) {
    if (err) {
      console.error(err);
      console.log('failed to create account for ' + email);
    }
    if (saved) {
      var reservation = exports.test(email);
      console.log('account for ' + email + ' created successfully');
      if (reservation) {
        exports.update({'email': reservation.email}, {
          '$set': {
            'uid': reservation.uid,
            'name': reservation.name,
            'role': reservation.role
          }
        }, callback);
      } else {
        analytics.update({'name': 'users'}, {
          '$set': {'updated': new Date()},
          '$inc': {'count': 1}
        }, function (data) {
          if (data) {
            console.log('updated account id for ' + email);
            exports.update({'email': email}, {
              '$set': {'uid': exports.range + data.count}
            }, callback);
          }
        });
      }
    } else {
      console.log('account for ' + email + ' cannot be saved');
    }
  });
};

// Update account and create it when it does not exist
exports.upsert = function (email, modifier, callback) {
  callback = (typeof callback === 'function') ? callback : function() {};
  db.users.findAndModify({
    'query': {'email': email},
    'update': modifier,
    'new': true,
    'upsert': false
  }, function (err, user) {
    if (err) {
      console.error(err);
      console.log('failed to update account for ' + email);
    }
    if (user) {
      console.log('account for ' + email + ' updated successfully');
      return callback(user);
    } else {
      exports.create(email, function () {
        exports.update({'email': email}, modifier, callback);
      });
    }
  });
};

// Update account
exports.update = function (query, modifier, callback) {
  db.users.findAndModify({
    'query': query,
    'update': modifier,
    'new': true,
    'upsert': false
  }, function (err, user) {
    if (err) {
      console.error(err);
      console.log('failed to update the account');
    }
    if (user) {
      console.log('user ' + user.uid + ' updated successfully');
    } else {
      console.log('no accounts found for the query');
    }
    return (typeof callback === 'function') ? callback(user) : null;
  });
};

// Generate authorization
exports.authorize = function (email, callback) {
  callback = (typeof callback === 'function') ? callback : function () {};
  try {
    var strength = Math.max(settings.auth.strength || 6, 6);
    var maxAge = Math.min(settings.auth.maxAge || 3600000, 3600000);
    var expiry = Date.now() + maxAge;
    var code = security.randomDigits(strength);
    var hash = security.md5Hash(email + expiry + code);
    var authorization = {
      'auth.code': code,
      'auth.hash': hash,
      'auth.expires': new Date(expiry)
    };
    console.log('authorization for ' + email + ' generated successfully');
    exports.upsert(email, {
      '$set': authorization,
      '$inc': {'auth.count': 1}
    }, callback);
  } catch (err) {
    console.error(err);
    console.log('failed to generate authorization for ' + email);
  }
};

// Verify authorization
exports.verify = function (email, code, callback) {
  db.users.findOne({'email': email, 'auth.code': code}, function (err, user) {
    var success = false;
    if (err) {
      console.error(err);
      console.log('failed to find this security code ' + code);
    }
    if (user) {
      console.log('user ' + email + ' has this security code ' + code);
      if (Date.now() < user.auth.expires.getTime()) {
        success = true;
        console.log('authorization verified successfully');
      } else {
        console.log('this security code has expired');
      }
    } else {
      console.log('no account has this security code ' + code);
    }
    return (typeof callback === 'function') ? callback(success, user) : null;
  });
};

// Check signature hash
exports.check = function (hash, callback) {
  db.users.findOne({'auth.hash': hash}, function (err, user) {
    var success = false;
    if (err) {
      console.error(err);
      console.log('failed to find this signature hash ' + hash);
    }
    if (user) {
      var expiry = user.auth.expires.getTime();
      console.log('user ' + user.email + ' has this signature hash ' + hash);
      if (Date.now() < expiry) {
        var code = user.auth.code;
        if (hash === security.md5Hash(user.email + expiry + code)) {
          success = true;
          console.log('authorization verified successfully');
        } else {
          console.log('this hash is not signed by ' + user.email);
        }
      } else {
        console.log('this signature hash has expired');
      }
    } else {
      console.log('no account has this signature hash ' + hash);
    }
    return (typeof callback === 'function') ? callback(success, user) : null;
  });
};

// Set account status
exports.status = function (uid, status, callback) {
  db.users.update({'uid': uid}, {
    '$set': {'auth.status': status}
  }, function (err) {
    var success = true;
    if(err) {
      console.error(err);
      console.log('failed to set the status of user ' + uid);
      success = false;
    } else {
      console.log('set the status of user ' + uid + ' as: ' + status);
    }
    return (typeof callback === 'function') ? callback(success) : null;
  });
};

// Grant privileges
exports.grant = function (user) {
  var article = settings.privilege.article;
  var reputation = user.stats.reputation;
  var role = user.role;
  var uid = user.uid;
  return {
    isPublic: uid >= exports.range,
    isModerator: role.match(/^(moderator|administrator)$/) !== null,
    articlePost: reputation >= article.post,
    editMetadata: reputation >= article.edit
  };
};
