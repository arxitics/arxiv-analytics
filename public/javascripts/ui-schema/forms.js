/*!
 * Forms
 */

(function ($) {
  'use strict';

  schema.validate = function (event, options) {
    var eventSelector = schema.events.validate.selector;
    var optionalSelector = options && options.selector;
    var $_elements = $(eventSelector).add(optionalSelector);
    $_elements.each(function () {
      var $_this = $(this);
      var $_data = schema.parseData($_this.data());
      var requireChanged = ($_data.schemaValidate === 'changed');
      $_this.find(':input').one('change', function () {
        $_this.data('changed', true);
      });
      $_this.on('submit', function (event) {
        var $_form = $(this);
        var validated = (requireChanged) ? $_form.data('changed') : true;
        if (validated) {
          $_form.find('input, textarea').each(function () {
            var $_input = $(this);
            var value = $_input.val().toString().trim();
            if (value === '') {
              $_input.prop('disabled', true).data('disabled', true);
            }
          });
          if ($_data.schemaValidate === 'once') {
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
