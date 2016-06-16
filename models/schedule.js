/**
 * Job scheduler.
 */

var schedule = require('node-schedule');
var scheme = require('./scheme');
var arxiv = require('./arxiv');
var article = require('./article');
var analytics = require('./analytics');
var settings = require('../settings').schedule;

// Export module
module.exports = function (callback) {
  var archives = scheme.archives;
  var interval = settings.interval;
  // Syndicate arXiv RSS feed
  schedule.scheduleJob(settings.feed, function () {
    console.log(new Date());
    console.log('running eprint syndication on schedule ...');
    archives.forEach(function (archive, index) {
      setTimeout(function () {
        arxiv.feed({'archive': archive}, function (success) {
          if (success) {
            console.log('fetched RSS feed for ' + archive + ' successfully');
          }
        });
      }, interval * index);
    });
  });

  // Check arXiv eprint updates
  schedule.scheduleJob(settings.check, function () {
    console.log(new Date());
    console.log('running eprint check on schedule ...');
    archives.forEach(function (archive, index) {
      setTimeout(function () {
        arxiv.check({'archive': archive}, function (success) {
          if (success) {
            console.log('completed check for ' + archive + ' successfully');
          }
        });
      }, interval * index);
    });
  });

  // Run aggregation job
  schedule.scheduleJob(settings.aggregation, function () {
    console.log(new Date());
    console.log('running aggregation job on schedule ...');
    article.aggregate([
      {'$project': {'_id': 0, 'id': 1, 'categories': 1}},
      {'$unwind': '$categories'},
      {'$group': {'_id': '$id', 'category': {'$first': '$categories'}}},
      {'$group': {'_id': '$category', 'count': {'$sum': 1}}}
    ], function (docs) {
      if (docs.length) {
        docs = docs.map(function (doc) {
          return {'category': doc._id, 'count': doc.count}
        });
        analytics.update({'name': 'primaryCategories'}, {
          '$set': {'updated': new Date(), 'stats': docs}
        }, function (doc) {
          console.log("completed aggregation job successfully");
        });
      } else {
        console.log("failed to run the aggregation job");
      }
    });
  });

  return (typeof callback === 'function') ? callback() : null;
};
