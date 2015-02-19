/**
 * Command-line interpreter.
 */

var arxiv = require('../models/arxiv');
var article = require('../models/article');
var scheme = require('../models/scheme');
var regexp = require('../models/regexp');
var account = require('../models/account');

// List commands
exports.commands = [
  'help',
  'view-pdf',
  'view-user'
];

// Parse command sequence
exports.parse = function (sequence) {
  var query = {};
  var arguments = [];
  var options = {};
  var terminal = regexp.terminal;
  sequence = sequence.trim().replace(terminal.separator, '$1');

  var parameters = sequence.match(terminal.segment);
  var length = parameters.length;
  for (var i = 1; i < length; i++) {
    var parameter = parameters[i];
    var optionSyntax = terminal.option;
    if (parameter.match(optionSyntax)) {
      var argument = (i < length - 1) ? parameters[i + 1] : null;
      var option = parameter.replace(/^\-{1,2}/, '');
      var index = option.indexOf('=');
      if (index !== -1) {
        var flag = option.slice(0, index);
        options[flag] = option.slice(index + 1);
      } else {
        if (argument && argument.match(/^[^\-]/)) {
          if (argument.indexOf(',') !== -1)  {
            options[option] = argument.split(',');
          } else {
            options[option] = argument;
          }
          i++;
        } else {
          options[option] = true;
        }
      }
    } else if (parameter.match(/^\-[a-z]{2,}$/i)) {
      var flags = parameter.slice(1).split('');
      flags.forEach(function (flag) {
        options[flag] = true;
      });
    } else if (parameter.match(/^\-{2}$/)) {
      break;
    } else {
      if (parameter.indexOf(',') !== -1)  {
        arguments.push(parameter.split(','));
      } else {
        arguments.push(parameter);
      }
    }
  }
  if (!arguments[0]) {
    arguments.push(true);
  }

  query[parameters[0]] = (arguments.length > 1) ? arguments : arguments[0];
  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      query[key] = options[key];
    }
  }
  return query;
};

// Execute command
exports.execute = function (query, callback) {
  callback = (typeof callback === 'function') ? callback : function () {};
  var tasks = exports.references.filter(function (reference) {
    return Object.keys(query).indexOf(reference.command) !== -1;
  });
  if (tasks.length) {
    tasks.forEach(function (task) {
      task.evaluate(query, function (result) {
        return callback(result);
      });
    });
  } else {
    return callback({
      status: 403,
      reason: 'The command is not supported.'
    });
  }
};

// Command references
exports.references = [
  {
    command: 'help',
    description: 'a shortcut for the redirection of help pages',
    evaluate: function (query, callback) {
      if (query.hasOwnProperty('help')) {
        var section = '';
        if (query.hasOwnProperty('g')) {
          section = '/general';
        } else if (query.hasOwnProperty('u')) {
          section = '/accounts';
        } else if (query.hasOwnProperty('s')) {
          section = '/search';
        } else if (query.hasOwnProperty('v')) {
          section = '/reviews';
        } else if (query.hasOwnProperty('r')) {
          section = '/references';
        }
        return callback({
          status: 200,
          url: '/help' + section
        });
      }
      return callback({
        status: 404
      });
    },
    usage: 'help [options]',
    options: [
      {
        option: '-g',
        description: 'Redirect to <code>/help/general</code>'
      },
      {
        option: '-u',
        description: 'Redirect to <code>/help/accounts</code>'
      },
      {
        option: '-s',
        description: 'Redirect to <code>/help/search</code>'
      },
      {
        option: '-v',
        description: 'Redirect to <code>/help/reviews</code>'
      },
      {
        option: '-r',
        description: 'Redirect to <code>/help/references</code>'
      }
    ]
  },
  {
    command: 'view-pdf',
    description: 'a shortcut for viewing articles in PDF',
    evaluate: function (query, callback) {
      var id = query['id'] || query['view-pdf'] || 'N/A';
      if (String(id).match(regexp.arxiv.identifier)) {
        var result = {
          status: 200,
          url: arxiv.services.pdf.replace('${identifier}', id)
        };
        if (query.hasOwnProperty('j')) {
          article.lookup({'id': id.replace(/v\d+$/, '')}, function (eprint) {
            if (eprint) {
              var publication = article.parsePublication(eprint);
              if (publication.hasOwnProperty('pdf')) {
                result['url'] = publication['pdf'];
              }
              return callback(result);
            } else {
              return callback({
                status: 404,
                reason: 'The eprint ' + id + ' does not exist.'
              });
            }
          });
        } else {
          return callback(result);
        }
      } else {
        return callback({
          status: 403,
          reason: 'The eprint id ' + id + ' is not valid.'
        });
      }
    },
    usage: 'view-pdf [--id] article [options]',
    options: [
      {
        option: '-j',
        description: 'View the journal version of PDF when it exists'
      }
    ]
  },
  {
    command: 'view-user',
    description: 'a shortcut for the redirection of user account pages',
    evaluate: function (query, callback) {
      var uid = query['uid'] || query['view-user'] || 'N/A';
      if (String(uid).match(regexp.account.uid)) {
        var page = '';
        if (query.hasOwnProperty('c')) {
          page = '/preferences';
        } else if (query.hasOwnProperty('b')) {
          page = '/bookmarks';
        } else if (query.hasOwnProperty('p')) {
          page = '/publications';
        } else if (query.hasOwnProperty('m')) {
          page = '/messages';
        }
        return callback({
          status: 200,
          url: '/users/' + uid + page
        });
      }
      return callback({
        status: 403,
        reason: 'The UID ' + uid + ' is not valid.'
      });
    },
    usage: 'view-user [--uid] user [options]',
    options: [
      {
        option: '-c',
        description: 'View the user\'s preferences if you are authorized'
      },
      {
        option: '-b',
        description: 'View the user\'s bookmarks'
      },
      {
        option: '-p',
        description: 'View the user\'s publications'
      },
      {
        option: '-m',
        description: 'View the user\'s messages if you are authorized'
      }
    ]
  }
];
