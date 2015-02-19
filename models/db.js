/**
 * Datebase connections.
 */

var mongojs = require('mongojs');
var settings = require('../settings');

// Export module
module.exports = mongojs(settings.db, settings.collections);
