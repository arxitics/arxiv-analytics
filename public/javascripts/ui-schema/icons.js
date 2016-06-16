/*!
 * Icons
 */

(function ($) {
  'use strict';

  // Create SVG icons
  schema.sprite = function (event, options) {
    var icons = schema.icons;
    var selector = schema.events.sprite.selector;
    var $_elements = $(selector).add(options && options.selector);
    $_elements.each(function () {
      var $_this = $(this);
      var $_data = schema.parseData($_this.data());
      var name = $_data.icon || 'unknown';
      var icon = icons[name] || icons.unknown;
      if (typeof icon === 'string') {
        icon = icons[icon];
      }

      var width = $_data.width || icon[0];
      var height = $_data.height || icon[1];
      var path = $_data.path || icon[2];
      var color = $_data.color || icon[3];
      var colorEnabled = $_data.colorEnabled;
      if (colorEnabled === undefined && color) {
        colorEnabled = true;
      }

      // Create <svg> element
      var namespace = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(namespace, 'svg');
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);
      svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);

      // Create <path> element
      if (Array.isArray(path)) {
        path.forEach(function (segment, index) {
          var element = document.createElementNS(namespace, 'path');
          if(colorEnabled && color) {
            element.setAttribute('fill', Array.isArray(color) ? color[index] : color);
          }
          element.setAttribute('d', segment);
          svg.appendChild(element);
        });
      } else {
        var element = document.createElementNS(namespace, 'path');
        if (colorEnabled && color) {
          element.setAttribute('fill', color);
        }
        element.setAttribute('d', path);
        svg.appendChild(element);
      }

      $_this.empty().append(svg).css({
        'width': $_this.hasClass('ui-fixed-width') ||
          $_this.hasClass('ui-icon-circle') ?
            $_this.css('height') :
            $_this.css('height').slice(0, -2) * width / height
      });
    });
  };

  schema.icons = {
    'unknown': [32, 32, 'M1 1h31v31h-31zM3 3v27h27v-27z']
  };

})(jQuery);
