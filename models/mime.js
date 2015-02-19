/**
 * MIME types.
 */

exports.types = {
  // `application` type
  'js': 'application/javascript',
  'json': 'application/json',
  'latex': 'application/x-latex',
  'pdf': 'application/pdf',
  'tex': 'application/x-tex',
  'zip': 'application/zip',

  // `image` type
  'ico': 'image/x-icon',
  'png': 'image/png',
  'svg': 'image/svg+xml',

  // `text` type
  'css': 'text/css',
  'csv': 'text/csv',
  'html': 'text/html',
  'txt': 'text/plain',
  'xml': 'text/xml'
};

exports.lookup = function (ext) {
  return exports.types[ext.replace(/^\./, '')] || 'application/octet-stream';
};
