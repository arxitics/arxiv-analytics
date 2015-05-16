/*!
 * Search snippets
 */

(function ($) {
  'use strict';

  $(document).ready(function () {
    var location = schema.parseURL(window.location.href);
    var query = location.query;
    $('main input').not('[value=custom]').on('change', function () {
      var $_this = $(this);
      var name = $_this.attr('name');
      var value = $_this.val();
      var checked = $_this.is(':checked');
      var validated = true;
      if ($_this.is('[name=date-from]')) {
        var dateTo = $('[name=date-to]').val();
        if (!dateTo || value > dateTo) {
          validated = false;
        } else {
          query['date-range'] = 'custom';
          query['date-to'] = dateTo;
        }
      } else if ($_this.is('[name=date-to]')) {
        var dateFrom = $('[name=date-from]').val();
        if (!dateFrom || value < dateFrom) {
          validated = false;
        } else {
          query['date-range'] = 'custom';
          query['date-from'] = dateFrom;
        }
      }
      if ($_this.is(':radio, :checkbox') && !checked) {
        delete query[name];
      } else if (validated && value) {
        query[name] = value;
      } else {
        return false;
      }
      if (query['date-range'] !== 'custom') {
        delete query['date-from'];
        delete query['date-to'];
      }
      var queryString = decodeURIComponent($.param(query));
      window.location = location.pathname + '?' + queryString.replace(/\[\]\=/g, '=');
    });
    $('[value=custom]').on('change', function () {
      $('[name=date-from], [name=date-to]').prop('disabled', !this.checked).eq(0).focus();
    });
  });

})(jQuery);
