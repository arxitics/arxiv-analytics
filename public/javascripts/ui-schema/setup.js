/*!
 * UI Schema v0.3.0 (https://github.com/arxitics/ui-schema)
 * Copyright 2015 Arxitics <help@arxitics.com>
 * Licensed under MIT (https://github.com/arxitics/ui-schema/blob/master/LICENSE.txt)
 */

if (typeof jQuery === 'undefined') {
  throw new Error('jQuery has not been loaded yet for context');
}

var schema = jQuery.isPlainObject(schema) ? schema : {};

(function ($) {
  'use strict';

  schema = $.extend(true, {
    // Default setup options
    setup: {
      classPrefix: 'ui',
      dataPrefix: 'schema',
      autoLoad: true,
      autoBind: '.schema',
      autoTrigger: '.schema'
    },
    // Register schema events
    events: {
      retrieve: {
        type: 'retrieve',
        namespace: '.options.data-api.schema',
        selector: '[data-schema-options]'
      },
      trim: {
        type: 'remove',
        namespace: '.white-space.text-node.schema',
        selector: '.ui-space-collapse'
      },
      extract: {
        type: 'create',
        namespace: '.dom.data-api.schema',
        selector: '[data-schema-extract]'
      },
      validate: {
        type: 'validate',
        namespace: '.form-validate.form.data-api.schema',
        selector: 'form[data-schema-validate]'
      },
      sprite: {
        type: 'create',
        namespace: '.icons.svg.data-api.schema',
        selector: 'i[data-schema-icon]'
      }
    }
  }, schema);

  $(function () {
    if (schema.setup.autoLoad && schema.load) {
      schema.load();
    }
  });

})(jQuery);
