/*!
 * Core
 */

(function ($) {
  'use strict';

  schema.create = function (options) {
    this.setup = $.extend({}, schema.setup, options);
    return Object.create(schema);
  };

  schema.load = function (setup, events) {
    var schemaSetup = $.extend({}, schema.setup, setup);
    var schemaEvents = $.extend({}, schema.events, events);

    var schemaDataPrefix = schemaSetup.dataPrefix;
    var dataPrefix = schemaDataPrefix ? schemaDataPrefix + '-' : '';

    for (var key in schemaEvents) {
      if (schemaEvents.hasOwnProperty(key)) {
        var schemaFunction = schema[key];
        var eventObject = schemaEvents[key];
        var eventDelegation = eventObject.delegation;
        if (!eventObject.hasOwnProperty('delegation')) {
          eventDelegation = schema.delegate(eventObject);
          eventObject.delegation = eventDelegation;
        }
        if (eventDelegation > 1) {
          var eventName = eventObject.type + eventObject.namespace;
          $(document).on(eventName, schemaFunction);
          if (eventDelegation > 2) {
            $(document).trigger(eventName);
          }
        }
      }
    }
  };

  schema.delegate = function (event) {
    var schemaSetup = schema.setup;
    var eventsBind = schemaSetup.autoBind.split(' ');
    var eventsTrigger = schemaSetup.autoTrigger.split(' ');
    var eventName = event.type + event.namespace;
    var eventArray = eventName.replace(/^\./, '').split('.');

    var eventDelegation = eventsBind.some(function (bindEvent) {
      var bindArray = bindEvent.replace(/^\./, '').split('.');
      return bindArray.every(function (eventKeyword) {
        return eventArray.indexOf(eventKeyword) !== -1;
      });
    }) ? 2 : 0;
    eventDelegation += eventsTrigger.some(function (triggerEvent) {
      var triggerArray = triggerEvent.replace(/^\./, '').split('.');
      return triggerArray.every(function(eventKeyword) {
        return eventArray.indexOf(eventKeyword) !== -1;
      });
    }) ? 1 : 0;

    return eventDelegation;
  };

  schema.retrieve = function (event, options) {
    var eventSelector = schema.events.retrieve.selector;
    var optionalSelector = options && options.selector;
    var $_elements = $(eventSelector).add(optionalSelector);
    $_elements.each(function () {
      var $_this = $(this);
      var $_data = schema.parseData($_this.data());
      var schemaOptions = schema.parseOptions($_data.schemaOptions);
      for (var key in schemaOptions) {
        if (schemaOptions.hasOwnProperty(key)) {
          $_this.data(key, schemaOptions[key]);
        }
      }
    });
  };

  schema.parseData = function (data) {
    var dataObject = {};
    var schemaDataPrefix = schema.setup.dataPrefix;
    var dataPrefixLength = schemaDataPrefix && schemaDataPrefix.length;
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        var dataKey = 'schema-' + key.slice(dataPrefixLength);
        var dataValue = data[key].trim();
        dataKey = dataKey.replace(/\-\w/g, function (matchedSubstr) {
          return matchedSubstr.charAt(1).toUpperCase();
        });
        dataObject[dataKey] = (dataValue === '' ? true : dataValue);
      }
    }
    return dataObject;
  };

  schema.parseOptions = function (options) {
    var optionsObject = {};
    var parsedOptionsObject = {};
    var schemaDataPrefix = schema.setup.dataPrefix;
    var optionsPrefix = schemaDataPrefix ? schemaDataPrefix + '-' : '';
    var optionsType = Object.prototype.toString.call(options).slice(8, -1);
    if (optionsType === 'Object') {
      optionsObject = options;
    }
    if (optionsType === 'String') {
      try {
        optionsObject = JSON.parse(options);
      } catch (parseError) {
        if (options.indexOf(':') !== -1) {
          options = options.trim().replace(/\s*;$/, '');
          options.split(/\s*;\s*/).forEach(function (keyValuePair) {
            var keyValueArray = keyValuePair.split(/\s*:\s*/);
            var optionKey = keyValueArray[0].toLowerCase();
            var optionValue = keyValueArray[1].replace(/\,/g, ' ').trim();
            if(optionValue.search(/\s+/) !== -1) {
              optionValue = optionValue.split(/\s+/);
            }
            optionsObject[optionKey] = optionValue;
          });
        }
      }
    }
    for (var key in optionsObject) {
      if (optionsObject.hasOwnProperty(key)) {
        var optionKey = optionsPrefix + key;
        optionKey = optionKey.replace(/\-\w/g, function (matchedSubstr) {
          return matchedSubstr.charAt(1).toUpperCase();
        });
        parsedOptionsObject[optionKey] = optionsObject[key];
      }
    }
    return parsedOptionsObject;
  };

})(jQuery);
