/*!
 * Core
 */

(function ($) {
  'use strict';

  // Create a new schema object
  schema.create = function (options) {
    this.setup = $.extend({}, schema.setup, options);
    return Object.create(schema);
  };

  // Bind and trigger schema events
  schema.load = function (options) {
    var events = $.extend({}, schema.events, options);
    for (var key in events) {
      if (events.hasOwnProperty(key)) {
        var func = schema[key];
        var event = events[key];
        var delegation = event.delegation;
        if (!event.hasOwnProperty('delegation')) {
          delegation = schema.delegate(event);
          event.delegation = delegation;
        }
        if (delegation > 1) {
          var name = event.type + event.namespace;
          $(document).on(name, func);
          if (delegation > 2) {
            $(document).trigger(name);
          }
        }
      }
    }
  };

  // Assign an integer as the delegation of an event
  schema.delegate = function (event) {
    var setup = schema.setup;
    var bindings = setup.autoBind.split(' ');
    var triggers = setup.autoTrigger.split(' ');
    var name = event.type + event.namespace;
    var phrases = name.replace(/^\./, '').split('.');

    var delegation = bindings.some(function (binding) {
      var keywords = binding.replace(/^\./, '').split('.');
      return keywords.every(function (keyword) {
        return phrases.indexOf(keyword) !== -1;
      });
    }) ? 2 : 0;
    delegation += triggers.some(function (trigger) {
      var keywords = trigger.replace(/^\./, '').split('.');
      return keywords.every(function(keyword) {
        return phrases.indexOf(keyword) !== -1;
      });
    }) ? 1 : 0;

    return delegation;
  };

  // Retrieve schema event options and store as event data
  schema.retrieve = function (event, options) {
    var selector = schema.events.retrieve.selector;
    var $_elements = $(selector).add(options && options.selector);
    $_elements.each(function () {
      var $_this = $(this);
      var $_data = schema.parseData($_this.data());
      var $_options = schema.parseOptions($_data.options);
      for (var key in $_options) {
        if ($_options.hasOwnProperty(key)) {
          $_this.data(key, $_options[key]);
        }
      }
    });
  };

  // Parse and normalize schema data
  schema.parseData = function (data) {
    var output = {};
    var prefix = schema.setup.dataPrefix;
    var length = prefix && prefix.length || 0;
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        var index = key.slice(length);
        var value = data[key];
        index = index.replace(/^[A-Z]/, function (substr) {
          return substr.toLowerCase();
        });
        output[index] = (value === '' ? true : value);
      }
    }
    return output;
  };

  // Parse and normalize schema options
  schema.parseOptions = function (options) {
    var output = {};
    var object = {};
    var prefix = schema.setup.dataPrefix;
    var type = Object.prototype.toString.call(options).slice(8, -1);
    if (type === 'Object') {
      object = options;
    } else if (type === 'String') {
      try {
        object = JSON.parse(options);
      } catch (error) {
        if (options.indexOf(':') !== -1) {
          options = options.trim().replace(/\s*;$/, '');
          options.split(/\s*;\s*/).forEach(function (entry) {
            var entries = entry.split(/\s*:\s*/);
            var key = entries[0].toLowerCase();
            var value = entries[1].replace(/\,/g, ' ').trim();
            if(value.search(/\s+/) !== -1) {
              value = value.split(/\s+/);
            }
            object[key] = kalue;
          });
        }
      }
    }
    if (prefix && prefix.length) {
      prefix += '-';
    }
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        var index = prefix + key;
        index = index.replace(/\-\w/g, function (substr) {
          return substr.charAt(1).toUpperCase();
        });
        output[index] = object[key];
      }
    }
    return output;
  };

})(jQuery);
