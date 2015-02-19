/**
 * Websocket.
 */

var review = require('./review');
var settings = require('../settings');

module.exports = function (server, secret) {
  var webSocketServer = require('ws').Server;
  var socketServer = new webSocketServer({
    server: server,
    verifyClient: function (client) {
      var environment = settings.environment;
      var host = settings[environment].host;
      // We should always verify the connection's origin 
      // and decide whether or not to accept it.
      if (client.origin === 'http://' + host) {
        return true;
      }
    }
  });
  // Server sending broadcast data
  socketServer.broadcast = function (sender, receivers, message) {
    for (var i in this.clients) {
      var socket = this.clients[i];
      var authorized = true;
      // The 'open', 'updated' and 'closesd' states will be sent to all users.
      // It requires authorization when sending chat content.
      if (message.state === undefined) {
        var uid = socket.uid;
        authorized = receivers.some(function (receiver) {
          return receiver.uid === uid;
        });
        // The safe mode requires a bidirectional authorization.
        if (authorized && socket.safe) {
          uid = sender.uid;
          authorized = socket.receivers.some(function (receiver) {
            return receiver.uid === uid;
          });
        }
      }
      if (authorized) {
        var json = JSON.stringify(message);
        // Use the random 2-character prefix for obfuscation
        var prefix = Math.random().toString(36).slice(-2);
        socket.send(prefix + new Buffer(json, 'utf8').toString('base64'));
      }
    }
  };

  var cookieParser = require('cookie-parser')(secret);
  socketServer.users = [];
  socketServer.on('connection', function (socket) {
    var req = socket.upgradeReq;
    cookieParser(req, null, function () {
      // Retrieve user identity information from cookies
      var sender = req.signedCookies;
      socket.uid = sender.uid;
      socket.safe = false;
      socket.receivers = socketServer.users;
      socket.on('message', function (data) {
        var json = new Buffer(data.slice(2), 'base64').toString('utf8');
        var message = JSON.parse(json);
        var state = message.state || 'connected';
        if (state === 'updated') {
          if (message.hasOwnProperty('safe')) {
            socket.safe = message.safe;
          }
          if (message.hasOwnProperty('receivers')) {
            socket.receivers = message.receivers;
          }
        } else {
          var receivers = socket.receivers;
          if (state === 'open') {
            socketServer.users.push(sender);
            message.users = socketServer.users;
          } else if (state === 'connected') {
            if (message.hasOwnProperty('content')) {
              // Parse markdown
              message.markup = review.parse(message.content).trim();
            }
          }
          message.sender = sender;
          message.receivers = receivers;
          socketServer.broadcast(sender, receivers, message);
        }
      });
      socket.on('close', function () {
        var users = socketServer.users.filter(function (user) {
          return user.uid !== sender.uid;
        });
        socketServer.users = users;
        socketServer.broadcast(sender, users, {
          'state': 'closed',
          'users': users
        });
      });
    });
  });
  socketServer.on('error', function (err) {
    console.error(err);
  });
};
