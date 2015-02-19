/**
 * Resources.
 */

var article = require('./article');

// Resource types
exports.types = [
  {
    type: 'general',
    description: 'General online resources. Only used when other types may not apply.'
  },
  {
    type: 'articles',
    description: 'Preprints, research papers, or technical web pages.'  
  },
  {
    type: 'reports',
    description: 'Reading reports or literature surveys on particular topics.'  
  },
  {
    type: 'lectures',
    description: 'Lectures given on conferences, workshops, seminars, and so forth.'
  },
  {
    type: 'notes',
    description: 'Notes taken by participants for courses, summer/winter shools, and so forth.'
  },
  {
    type: 'posts',
    description: 'Blog posts or periodically updated columns.'
  },
  {
    type: 'questions',
    description: 'Original questions on research-level Q&A websites.'
  },
  {
    type: 'answers',
    description: 'Constructive answers to the questions on research-level Q&A websites.'
  },
  {
    type: 'problems',
    description: 'Original problems for a course or textbook.'
  },
  {
    type: 'solutions',
    description: 'Complete solutions to the problems for a course or textbook.'
  },
  {
    type: 'images',
    description: 'We only accept images in SVG and PNG formats.'
  }
];
