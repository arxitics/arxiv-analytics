/*!
 * Utilities
 */

(function ($) {
  'use strict';

  schema.trim = function (event, options) {
    var eventSelector = schema.events.trim.selector;
    var optionalSelector = options && options.selector;
    var $_elements = $(eventSelector).add(optionalSelector);
    $_elements.contents().filter(function () {
      return this.nodeType === 3;
    }).remove();
  };

  schema.parseURL = function (url) {
    var anchor =  document.createElement('a');
    anchor.href = url.replace(/([^:])\/{2,}/g, '$1/').replace(/\+/g, ' ');
    return {
      href: anchor.href,
      origin: anchor.origin,
      protocol: anchor.protocol,
      username: anchor.username,
      password: anchor.password,
      host: anchor.host,
      hostname: anchor.hostname,
      port: anchor.port,
      path: anchor.pathname + anchor.search,
      pathname: anchor.pathname,
      segments: anchor.pathname.replace(/^\/+/, '').split('/'),
      search: anchor.search,
      query: (function () {
        var queryObject = {};
        var queryString = anchor.search.replace(/(^\?&?)|(&$)/g, '');
        if(queryString.indexOf('=') === -1) {
          return queryString;
        }
        queryString.split(/&+/).forEach(function (keyValuePair) {
          var keyValueArray = decodeURIComponent(keyValuePair).split('=');
          var paramKey = keyValueArray[0];
          var paramValue = keyValueArray[1];
          if (queryObject.hasOwnProperty(paramKey)) {
            paramValue = [].concat(queryObject[paramKey], paramValue);
          }
          queryObject[paramKey] = paramValue;
        });
        return queryObject;
      })(),
      hash: anchor.hash,
      fragment: anchor.hash.replace(/^#/, '')
    };
  };

})(jQuery);
