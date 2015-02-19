/**
 * Chat router instance.
 */

var express = require('express');

var chat = express.Router();

// Authentication
chat.use(function (req, res, next) {
  if (req.logged) {
    next();
  } else {
    res.render('403', {
      message: 'You need login to join the chat room.'
    });
  }
})

// GET default page
chat.get('/', function (req, res) {
  res.render('chat');
});

// POST chat message
chat.post('/', function (req, res) {
  res.render('404', {
    message: 'Chat data are saved as local storage.'
  });
});

// Export variable
module.exports = chat;
