/*!
 * Forms
 */

(function ($) {
  'use strict';

  // Validate user input
  schema.validate = function (event, options) {
    var selector = schema.events.validate.selector;
    var $_elements = $(selector).add(options && options.selector);
    $_elements.each(function () {
      var $_this = $(this);
      var $_data = schema.parseData($_this.data());
      var validate = $_data.validate;
      $_this.find(':input').one('change', function () {
        $_this.data('changed', true);
      });
      $_this.on('submit', function (event) {
        var $_form = $(this);
        var validated = (validate === 'changed') ? $_form.data('changed') : true;
        if (validated) {
          $_form.find('input, textarea').each(function () {
            var $_input = $(this);
            var value = $_input.val().toString().trim();
            if (value === '') {
              $_input.prop('disabled', true).data('disabled', true);
            }
          });
          if (validate === 'once') {
            $_this.find(':submit').prop('disabled', true);
          }
          $_form.submit();
        } else if (validated === undefined) {
          history.back();
        }
        event.preventDefault();
      });
      $_this.on('reset', function (event) {
        var $_form = $(this);
        $_form.find('input, textarea').each(function () {
          var $_input = $(this);
          if ($_input.data('disabled')) {
            $_input.prop('disabled', false).data('disabled', false);
          }
        });
        return true;
      });
    });
  };

})(jQuery);
