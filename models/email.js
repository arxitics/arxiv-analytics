/**
 * Email service.
 */

var emailjs = require('emailjs');
var regexp = require('./regexp').account;
var settings = require('../settings');

var server = emailjs.server.connect(settings.email.server);
var sender = settings.email.sender;
var website = settings.title;

// Send email
exports.send = function (receiver, content, callback) {
  var email = {
    from: sender,
    to: receiver,
    attachment: [
      {
        data: 'Welcome to ' + website + '!',
        alternative: true
      }
    ]
  };
  if (content) {
    email.subject = content.subject || 'Email from ' + website;
    if (content.hasOwnProperty('text')) {
      email.text = content.text;
    }
    if (content.hasOwnProperty('html')) {
      email.attachment[0].data = content.html;
    }
    if (content.hasOwnProperty('attachments')) {
      email.attachment.push(content.attachments);
    }
  }
  console.log('sending email to ' + receiver + ' ...');
  server.send(email, function (err, message) {
    var success = false;
    if (err || !message) {
      if (err) {
        console.error(err);
      }
      console.log('failed to send email to ' + receiver);
    } else {
      success = true;
      console.log('email has been sent to ' + receiver);
    }
    return (typeof callback === 'function') ? callback(success, message) : null;
  });
};

// Send confirmation email
exports.confirm = function (receiver, data, callback) {
  var environment = settings.environment;
  var signature = 'http://' + settings[environment].host + '/auth/' + data.hash;
  var minutes = Math.round((Date.parse(data.expires) - Date.now()) / 60000);
  var markup = '<p>Welcome to ' + website + '! ' +
    'You can login with the security code</p> ' +
    '<p><strong>' + data.code + '</strong></p>' + 
    '<p>or by clicking the signature link</p> ' +
    '<p><a href="' + signature + '">' + signature + '</a></p>' + 
    '<p>Please note that this is only valid for ' + minutes + ' minutes.</p>';
  if (data.requests < settings.user.auth.keyRequests) {
    markup += '<hr/><p>Your permanent private key is</p> ' +
    '<p><strong>' + data.key + '</strong></p>' +
    '<p>It can be used to confirm any authentication or authorization. ' +
    'You should keep it confidential and never share with others.</p>';
  }
  exports.send(receiver, {
    subject: 'Login ' + website,
    html: markup
  }, callback);
};

// Reset email
exports.reset = function (receiver, data, callback) {
  var uid = data.uid;
  var environment = settings.environment;
  var user = 'http://' + settings[environment].host + '/users/' + uid;
  var signature = user + '/reset/email/' + data.hash;
  var markup = '<p><a href="' + user + '">User ' + uid + '</a> ' +
    'of arXiv Analytics would like to reset the email to ' +
    '<strong>' + receiver + '</strong>.</p>' +
    '<p>If this is indeed your request, please click the signature link</p>' +
    '<p><a href="' + signature + '">' + signature + '</a></p>' +
    '<p>to complete the authorization; otherwise, please discard this email.</p>';
  exports.send(receiver, {
    subject: 'Reset email for user ' + uid,
    html: markup
  }, callback);
};

// Check receiver valid or not
exports.validate = function (receiver) {
  return regexp.email.test(receiver);
};
