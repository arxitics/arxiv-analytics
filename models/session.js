/**
 * Session management.
 */

var account = require('./account');
var settings = require('../settings').session;

// Track the user's view history
exports.track = function (sess, req) {
  var views = sess.views || [];
  var maxViews = settings.maxViews;
  var path = req.path;
  if (path.match(/^\/(articles|reviews|users)\/([\w\.\/]*\d+)\/?$/)) {
    var visited = views.some(function (view) {
      if (view[0] === path) {
        view[1] += 1;
        return true;
      }
      return false;
    });
    if (!visited) {
      views.unshift([path, 1]);
    }
  }
  return views.slice(0, maxViews);
};

// Sampling requests data
exports.sampling = function (sess) {
  var timestamp = Date.now() - (sess.uploaded || 0);
  var requests = sess.requests || [[timestamp]];
  var requestInterval = settings.intervals.request;
  var last = requests.length - 1;
  if (timestamp - requests[last][0] < requestInterval) {
    requests[last][1] = timestamp;
  } else {
    requests.push([timestamp]);
  }
  return requests;
};

// Collect stats data
exports.collect = function (sess) {
  var stats = sess.stats || {};
  stats.requests = (stats.requests || 0) + 1;
  stats.reputation = (stats.reputation || 0);
  return stats;
};

// Upload session data
exports.upload = function (sess, callback) {
  callback = (typeof callback === 'function') ? callback : function () {};
  var requests = sess.requests || [];
  var requestInterval = settings.intervals.request;
  var submitInterval = settings.intervals.submit;
  if (!requests.length || Date.now() - sess.uploaded < submitInterval) {
    return callback(false);
  } else {
    var stats = sess.stats;
    var elapsed = requests.reduce(function (sum, element) {
      var value = (element.length === 2) ? element[1] - element[0] : 0;
      return sum + Math.round(value / 1000);
    }, 0);
    var data = {
      'stats.requests': stats.requests,
      'stats.uptime': elapsed,
      'stats.reputation': stats.reputation + Math.round(elapsed / 3600)
    };
    var uid = sess.uid;
    account.update({'uid': uid}, {'$inc': data}, function (user) {
      var success = false;
      if (user) {
        console.log('updated stats for user ' + uid + ' successfully');
        success = true;
      }
      return (typeof callback === 'function') ? callback(success) : null;
    });
  }
};
