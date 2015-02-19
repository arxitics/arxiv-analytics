/*!
 * Tooltip
 */

(function ($) {
  'use strict';

  var Tooltip = {
    type: 'tooltip'
  };

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="ui-tooltip-target" role="tooltip"><div class="ui-tooltip-arrow"></div><div class="ui-tooltip-content"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false
  };

  Tooltip.init = function (element, options) {
    var $_element = element;
    $_element.each(function () {
      var $_this = $(this);
      var $_data = $_this.data();
      var trigger = $_data.schemaTooltip;
      var title = $_this.attr('title');
      if (title) {
        $_this.removeAttr('title').after(Tooltip.DEFAULTS.template)
          .next().find('.ui-tooltip-content').html(title);
        var $_next = $_this.next();
        if (trigger === 'toggle') {
          $_this.on('click', function () {
            $_next.toggle();
            return false;
          });
        } else {
          $_this.on({
            'mouseenter': function() {
              $_next.show();
            },
            'mouseleave': function() {
              $_next.hide();
            }
          });
        }
      }
    });
  };

  $(function () {
    Tooltip.init($('[data-schema-tooltip]'), Tooltip.DEFAULTS);
  });

})(jQuery);
