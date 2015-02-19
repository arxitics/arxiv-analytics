/*!
 * UI Schema v0.2.4 (https://github.com/arxitics/ui-schema)
 * Copyright 2014 Arxitics <help@arxitics.com>
 * Licensed under MIT (https://github.com/arxitics/ui-schema/blob/master/LICENSE.txt)
 */

if (typeof jQuery === 'undefined') {
  throw new Error('jQuery has not been loaded yet for context');
}

var schema = {};

(function ($) {
  'use strict';

  schema.setup = {
    classPrefix: 'ui',
    dataPrefix: 'schema',
    autoLoad: true,
    autoBind: '.schema',
    autoTrigger: '.schema'
  };

  schema.events = {
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
    validate: {
      type: 'validate',
      namespace: '.form-validate.form.data-api.schema',
      selector: 'form[data-schema-validate]'
    },
    sprite: {
      type: 'generate',
      namespace: '.icons.svg.data-api.schema',
      selector: '[data-schema-icon]'
    }
  };

  $(function () {
    if (schema.setup.autoLoad && schema.load) {
      schema.load();
    }
  });

})(jQuery);
