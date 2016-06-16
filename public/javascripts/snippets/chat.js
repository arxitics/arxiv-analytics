/*!
 * Chat snippets
 */

(function ($) {
  'use strict';

  var chat = {};
  if (localStorage.chat) {
    chat = JSON.parse(localStorage.chat);
  } else {
    var today = new Date().toISOString();
    chat = {
      created: today,
      updated: today,
      messages: []
    };
  }

  // Initialize chat room
  chat.load = function (start, end) {
    var contents = [];
    chat.messages.slice(start || 0, end).forEach(function (message, index) {
      contents.push(chat.parse(message, index + 1));
    });
    $('#chat-room').html(contents.join('')).scrollTop($('#chat-room').height());
    $(document).trigger('create.dom');
    if (window.MathJax) {
      MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'chat-room']);
    }
  };

  // Parse message
  chat.parse = function (message, index) {
    var sender = message.sender;
    var data = {
      id: index,
      uid: sender.uid,
      name: sender.name,
      markup: message.markup,
      date: message.sent.slice(0, 19).replace('T', ' ')
    };
    return schema.format('<li><div class="ui-color-success"><span>${date}</span> &ensp;|&ensp; <span>${uid} &lt;${name}&gt;</span></div><div id="message-${id}" class="ui-offset-large">${markup}</div></li>', data);
  };

  // Save chat data
  chat.save = function (message) {
    this.updated = new Date().toISOString();
    this.messages.push(message);
    localStorage.chat = JSON.stringify(this);
  };

  // Export chat data
  chat.export = function () {
    var json = JSON.stringify(this, null, 2);
    window.open('data:application/json;charset=utf-8,' + encodeURIComponent(json));
  };

  // UTF8 to Base64
  chat.encode = function (data) {
    var prefix = Math.random().toString(36).slice(-2);
    return  prefix + window.btoa(unescape(encodeURIComponent(data)));
  };

  // Base64 to UTF8
  chat.decode = function (data) {
    return decodeURIComponent(escape(window.atob(data.slice(2))));
  };

  // Notifications
  chat.notify = function (title, options) {
    if (window.Notification) {
      if (Notification.permission === 'granted') {
        var notification = new Notification(title, options);
        notification.onshow = function () {
          setTimeout(notification.close.bind(notification), 4000);
        }
      }
    }
  };

  // Display new message
  chat.display = function (message) {
    var index = $('#chat-room > li').size() + 1;
    $('#chat-room').append(chat.parse(message, index)).scrollTop($('#chat-room').height());
    $(document).trigger('create.dom');
    if (window.MathJax) {
      MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'message-' + index]);
    }
  };

  // List online users
  chat.list = function (users) {
    var list = '';
    var receivers = [];
    $('#user-list input:checked').each(function () {
      var matches = $(this).next().text().match(/(\d+)\s+<(.+)>/) || [];
      receivers.push(matches[1]);
    });
    var open = (receivers.length === 0);
    users.forEach(function (user) {
      var data = {
        uid: user.uid,
        name: user.name,
        checked: (open || receivers.indexOf(uid) !== -1) ? 'checked ' : ''
      };
      list += schema.format('<li><input type="checkbox" name="user-${uid}" value="true" title="Checked to allow this user receive your messages" ${checked}/> <a href="/users/${uid}" target="_blank"><span>${uid} &lt;${name}&gt;</span></a></li>', data);
    });
    $('#user-list').html(list);
    $('#user-list input').change();
  };

  // WebSocket connection
  chat.connect = function () {
    var hostname = document.location.hostname;
    var port = document.location.port || '3000';
    var socket = new WebSocket('ws://' + hostname + ':' + port);
    socket.onopen = function (event) {
      $('#chat-safe').prop('checked', false);
      socket.send(chat.encode(JSON.stringify({
        'state': 'open',
        'joined': new Date().toISOString()
      })));
      chat.load(-10);
      if (window.Notification && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    };
    socket.onmessage = function (event) {
      var message = JSON.parse(chat.decode(event.data));
      var state = message.state || 'connected';
      if (state === 'connected') {
        if (document.hidden) {
          chat.notify('You have a new chat message from arxitics!');
        }
        chat.display(message);
        chat.save(message);
      } else {
        chat.list(message.users);
      }
    };
    socket.onerror = function (event) {
      setTimeout(function () {
        location.reload();
      }, 500);
    };

    $('#chat-close').on('click', function () {
      socket.close();
      $('#user-list').empty();
    });

    $('#user-list').on('change', 'input', function () {
      var receivers = [];
      $('#user-list input:checked').each(function () {
        var matches = $(this).next().text().match(/(\d+)\s+<(.+)>/) || [];
        receivers.push({
          'uid': matches[1],
          'name': matches[2]
        });
      });
      socket.send(chat.encode(JSON.stringify({
        'state': 'updated',
        'receivers': receivers
      })));
    });

    $('#chat-safe').on('change', function () {
      socket.send(chat.encode(JSON.stringify({
        'state': 'updated',
        'safe': $(this).prop('checked')
      })));
    });

    $('#chat-form').on('submit', function() {
      var $_this = $(this);
      var $_textarea = $_this.find('textarea');
      var content = $_textarea.val();
      if (content !== '') {
        socket.send(chat.encode(JSON.stringify({
          'sent': new Date().toISOString(),
          'content': content
        })));
        $_textarea.val('');
      }
      return false;
    });
  };

  $(document).ready(function () {
    chat.connect();

    $('#chat-view').on('click', function () {
      chat.load();
    });
    $('#chat-clear').on('click', function () {
      $('#chat-room').empty();
    });
    $('#chat-export').on('click', function () {
      chat.export();
    });
    $('#chat-delete').on('click', function () {
      localStorage.clear('chat');
      $('#chat-room').empty();
    });
    $('#chat-refresh').on('click', function () {
      location.reload();
    });
  });

})(jQuery);
