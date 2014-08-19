/**
 * Glossary extraction.
 */

var db = require('./db');
var regexp = require('./regexp').strip;
var settings = require('../settings').eprint;

// Push phrase frequency to database
exports.push = function (query, modifier, callback) {
  db.phrases.findAndModify({
    'query': query,
    'update': modifier,
    'new': true,
    'upsert': true
  }, function (err, doc) {
    if (err) {
      console.error(err);
      console.log('failed to push phrase "' + phrase + '" to database');
    }
    return (typeof callback === 'function') ? callback(doc) : null;
  });
};

// Extract keywords
exports.extract = function (eprint) {
  var texts = [
    eprint.title,
    eprint.abstract
  ];
  var weights = [
    settings.weight.title,
    settings.weight.abstact
  ];
  var stats = exports.stats(texts, weights);
  var maxRanking = settings.phrase.maxRanking || 25;
  var maxOutputs = settings.keyword.maxOutputs || 5;
  var maxLength = Math.min(maxOutputs, Math.ceil(stats.length / maxOutputs));
  var keywords = stats.slice(0, maxRanking).map(function (phrase) {
    return phrase.term;
  });
  var sequence = keywords.join('|');
  return keywords.filter(function (keyword) {
    return (keyword.indexOf(' ') !== -1 || keyword.length > 9) && 
      sequence.match(new RegExp(keyword, 'gi')).length === 1;
  }).slice(0, maxLength);
};

// Phrase stats
exports.stats = function (texts, weights) {
  var maxWordsNumber = settings.phrase.maxWordsNumber || 5;
  var map = {};
  texts.forEach(function (text, index) {
    var weight = weights[index] || 1;
    var words = exports.strip(text).split(' ');
    var length = words.length;
    for (var i = 0; i < length; i++) {
      var segments = [];
      for (var j = 0; j < maxWordsNumber && j < length - i; j++) {
        var nominee = exports.nominate(words[i+j]);
        if (nominee) {
          segments.push(nominee);
        } else {
          i += j;
          break;
        }
      }
      exports.combine(segments).forEach(function (candidate) {
        var phrase = candidate.term.toLowerCase();
        var value = candidate.value;
        if (map.hasOwnProperty(phrase)) {
          map[phrase] += value * weight;
        } else {
          map[phrase] = value * weight;
        }
      });
    }
  });

  for (var phrase in map) {
    if (map.hasOwnProperty(phrase)) {
      exports.conflate(phrase).forEach(function (synonym) {
        if (synonym && map.hasOwnProperty(synonym)) {
          map[synonym] += map[phrase];
          delete map[phrase];
        }
      });
    }
  }

  var list = [];
  for (var phrase in map) {
    if (map.hasOwnProperty(phrase)) {
      var score = map[phrase] - exports.disrate(phrase);
      if (score > 0) {
        list.push({
          'term': phrase,
          'value': score
        });
      }
    }
  }
  return list.sort(function (a, b) {
    return b.value - a.value;
  });
};

// Combine segments into phrase candidates
exports.combine = function (segments) {
  var candidates = [];
  var length = segments.length;
  for (var i = 0; i < length; i++) {
    for (var j = i; j < length; j++) {
      var phrase = segments.slice(i, j + 1).join(' ');
      candidates.push({
        'term': phrase,
        'value': j - i + 1
      });
      exports.push({'term': phrase}, {'$inc': {'frequency': 1}});
    }
  }
  return candidates;
};

// Nominate a word candidate
exports.nominate = function (word) {
  var qualified = word.match(/^\w.*\w$/);
  var nontrivial = exports.stopWords.indexOf(word.toLowerCase()) === -1;
  return qualified && nontrivial ? word : null;
};

// Disrate a phrase that contains adjectives
exports.disrate = function (phrase) {
  var words = phrase.split(' ');
  var last = words.length - 1;
  var demotion = 0;
  words.forEach(function (word, index) {
    if (word.match(exports.nonterminalSuffixes)) {
      demotion += (index !== last) ? 1 : 2;
    }
  })
  return demotion;
};

// Strip punctuation, special characters, stop words
exports.strip = function (text) {
  for (var key in regexp) {
    if (regexp.hasOwnProperty(key)) {
      var delimiter = (key === 'apostrophe') ? '' : ' / ';
      text = text.replace(regexp[key], delimiter);
    }
  }
  return text.replace(/\s+/g, ' ').replace(/\-+/g, '-');
};

// Stemming and conflation
exports.conflate = function (phrase) {
  var synonyms = [];

  // Plurals
  if (phrase.match(/s$/)) {
    synonyms.push(phrase.replace(/s$/, ''));
    if (phrase.match(/ies$/)) {
      synonyms.push(phrase.replace(/es$/, ''));
      if (phrase.match(/ies$/)) {
        synonyms.push(phrase.replace(/ies$/, 'y'));
      } else if (phrases.match(/[^i]ves$/)) {
        synonyms.push(phrase.replace(/ves$/, 'f'));
      } else if (phrases.match(/ives$/)) {
        synonyms.push(phrase.replace(/ves$/, 'fe'));
      } else if (phrases.match(/[aei]([rsx]|st)es$/)) {
        synonyms.push(phrase.replace(/es$/, 'is'));
      } else if (phrases.match(/ices$/)) {
        synonyms.push(phrase.replace(/ices$/, 'ix'));
        if (phrases.match(/[dt]ices$/)) {
          synonyms.push(phrase.replace(/ices$/, 'ex'));
        }
      }
    }
  }
  if (phrase.match(/a$/)) {
    synonyms.push(phrase.replace(/a$/, 'um'));
    if (phrase.match(/[inrt]a$/)) {
      synonyms.push(phrase.replace(/a$/, 'on'));
    }
  }
  if (phrase.match(/i$/)) {
    synonyms.push(phrase.replace(/i$/, 'us'));
  }
  if (phrase.match(/ae$/)) {
    synonyms.push(phrase.replace(/e$/, ''));
  }

  // Participles
  if (phrase.match(/ed$/)) {
    synonyms.push(phrase.replace(/ed$/, ''));
    if (phrase.match(/ied$/)) {
      synonyms.push(phrase.replace(/ied$/, 'y'));
    } else if (phrase.match(/[^aeiou]ed$/)) {
      synonyms.push(phrase.replace(/d$/, ''));
      if (phrase.match(/[^aeiou]{2}ed$/)) {
        synonyms.push(phrase.replace(/.ed$/, ''));
      }
    }
  }
  if (phrase.match(/ing$/)) {
    synonyms.push(phrase.replace(/ing$/, ''));
    if (phrase.match(/ying$/)) {
      synonyms.push(phrase.replace(/ying$/, 'ie'));
    } else if (phrase.match(/[^aeiou]ing$/)) {
      synonyms.push(phrase.replace(/.ing$/, 'e'));
      if (phrase.match(/[^aeiou]{2}ing$/)) {
        synonyms.push(phrase.replace(/.ing$/, ''));
      }
    }
  }
  return synonyms;
};

exports.nonterminalSuffixes = new RegExp('(' + [
  'ble',
  'ed',
  'eel',
  'ern',
  'ful',
  'ical',
  'ify',
  'ile',
  'ing',
  'ish',
  'ive',
  'ize',
  'less',
  'like',
  'ly',
  'ous',
  'some',
  'teen',
  'ward',
  'wards',
  'ways',
  'wise'
].join('|') + ')$', 'i');

exports.stopWords = [
  '-',
  '/',
  'a',
  'abj',
  'able',
  'about',
  'above',
  'according',
  'accordingly',
  'across',
  'actually',
  'adv',
  'after',
  'afterwards',
  'again',
  'against',
  'ago',
  'al',
  'all',
  'allow',
  'allowed',
  'allowing',
  'allows',
  'almost',
  'alone',
  'along',
  'already',
  'also',
  'although',
  'always',
  'am',
  'among',
  'amongst',
  'amoungst',
  'amount',
  'an',
  'and',
  'and/or',
  'another',
  'any',
  'anyhow',
  'anyone',
  'anything',
  'anyway',
  'anywhere',
  'apparently',
  'are',
  'arent',
  'around',
  'arxiv',
  'as',
  'at',
  'available',
  'back',
  'based',
  'be',
  'became',
  'because',
  'become',
  'becomes',
  'becoming',
  'been',
  'before',
  'beforehand',
  'behind',
  'being',
  'below',
  'beside',
  'besides',
  'between',
  'beyond',
  'both',
  'bottom',
  'but',
  'by',
  'calculate',
  'call',
  'called',
  'can',
  'cannot',
  'cant',
  'careful',
  'carefully',
  'cause',
  'caused',
  'causes',
  'certain',
  'certainly',
  'cf',
  'co',
  'com',
  'combine',
  'combined',
  'combines',
  'completely',
  'compute',
  'computed',
  'computes',
  'con',
  'consider',
  'considered',
  'considers',
  'could',
  'couldnt',
  'crucially',
  'de',
  'def',
  'des',
  'describe',
  'described',
  'describes',
  'detail',
  'details',
  'develop',
  'develops',
  'did',
  'different',
  'difficult',
  'discover',
  'discovered',
  'discovers',
  'discuss',
  'discussed',
  'do',
  'doc',
  'docs',
  'does',
  'doesnt',
  'doing',
  'done',
  'down',
  'du',
  'due',
  'during',
  'each',
  'easy',
  'easily',
  'edu',
  'eg',
  'eight',
  'either',
  'eleven',
  'else',
  'elsewhere',
  'en',
  'enough',
  'entirely',
  'es',
  'especially',
  'est',
  'et',
  'etc',
  'eu',
  'ex',
  'even',
  'ever',
  'every',
  'everyone',
  'everything',
  'everywhere',
  'examine',
  'examined',
  'except',
  'exhibit',
  'exhibited',
  'exhibits',
  'exist',
  'existed',
  'exists',
  'explore',
  'explored',
  'explores',
  'few',
  'fifteen',
  'fifty',
  'fig',
  'fill',
  'finally',
  'find',
  'fire',
  'five',
  'follow',
  'followed',
  'follows',
  'following',
  'for',
  'former',
  'formerly',
  'forty',
  'found',
  'four',
  'from',
  'further',
  'furthermore',
  'future',
  'generally',
  'get',
  'gets',
  'give',
  'given',
  'gives',
  'go',
  'goes',
  'going',
  'gone',
  'got',
  'good',
  'had',
  'has',
  'hasnt',
  'have',
  'having',
  'he',
  'hence',
  'her',
  'here',
  'hereafter',
  'hereby',
  'herein',
  'hereupon',
  'hers',
  'herself',
  'hes',
  'him',
  'his',
  'hismself',
  'how',
  'however',
  'http',
  'https',
  'hundred',
  'i',
  'ib',
  'ibid',
  'ie',
  'if',
  'iff',
  'ii',
  'iii',
  'il',
  'ils',
  'improve',
  'improved',
  'improves',
  'in',
  'inc',
  'include',
  'included',
  'includes',
  'including',
  'indeed',
  'indicate',
  'indicated',
  'indicates',
  'into',
  'introduce',
  'introduced',
  'introduces',
  'investigate',
  'investigated',
  'investigates',
  'involve',
  'involved',
  'involves',
  'involving',
  'is',
  'it',
  'its',
  'itself',
  'iv',
  'just',
  'key',
  'keep',
  'know',
  'known',
  'la',
  'last',
  'later',
  'latter',
  'latterly',
  'le',
  'lead',
  'leads',
  'least',
  'les',
  'less',
  'let',
  'like',
  'likely',
  'ltd',
  'made',
  'mainly',
  'make',
  'makes',
  'many',
  'may',
  'maybe',
  'me',
  'meanwhile',
  'mid',
  'might',
  'mine',
  'more',
  'moreover',
  'most',
  'mostly',
  'much',
  'must',
  'my',
  'myself',
  'name',
  'namely',
  'naturally',
  'near',
  'nearly',
  'neither',
  'never',
  'nevertheless',
  'new',
  'next',
  'nine',
  'no',
  'nobody',
  'none',
  'noone',
  'nor',
  'not',
  'nothing',
  'now',
  'nowhere',
  'observe',
  'observed',
  'observes',
  'obtain',
  'obtained',
  'obtains',
  'of',
  'off',
  'often',
  'on',
  'once',
  'one',
  'ones',
  'only',
  'onto',
  'or',
  'other',
  'others',
  'otherwise',
  'ought',
  'our',
  'ours',
  'ourselves',
  'out',
  'over',
  'own',
  'particular',
  'per',
  'perhaps',
  'please',
  'possible',
  'present',
  'presented',
  'presents',
  'previous',
  'previously',
  'propose',
  'proposed',
  'proposes',
  'prove',
  'proved',
  'proves',
  'provide',
  'provided',
  'provides',
  'providing',
  'put',
  'puts',
  'que',
  'rather',
  're',
  'release',
  'released',
  'releases',
  'recent',
  'recently',
  'recover',
  'recovered',
  'recovers',
  'require',
  'required',
  'requires',
  'rev',
  'reveals',
  'remarkable',
  'said',
  'same',
  'say',
  'sec',
  'see',
  'seem',
  'seemed',
  'seems',
  'seen',
  'serious',
  'several',
  'shall',
  'she',
  'should',
  'show',
  'shown',
  'shows',
  'sic',
  'since',
  'six',
  'sixty',
  'so',
  'so-called',
  'solve',
  'solved',
  'solves',
  'some',
  'somehow',
  'someone',
  'something',
  'sometime',
  'sometimes',
  'somewhere',
  'still',
  'studied',
  'such',
  'suggest',
  'suggested',
  'suggests',
  'take',
  'takes',
  'taking',
  'ten',
  'tenth',
  'than',
  'that',
  'the',
  'their',
  'theirs',
  'them',
  'themselves',
  'then',
  'thence',
  'there',
  'thereafter',
  'thereby',
  'therefore',
  'therein',
  'thereupon',
  'these',
  'they',
  'this',
  'those',
  'though',
  'three',
  'through',
  'through',
  'thus',
  'to',
  'together',
  'too',
  'top',
  'toward',
  'towards',
  'try',
  'twelve',
  'twenty',
  'two',
  'un',
  'under',
  'une',
  'unkown',
  'until',
  'up',
  'upon',
  'us',
  'use',
  'used',
  'uses',
  'using',
  'various',
  'versus',
  'very',
  'via',
  'vide',
  'vise',
  'viz',
  'vol',
  'vs',
  'was',
  'we',
  'well',
  'were',
  'what',
  'whatever',
  'when',
  'whence',
  'whenever',
  'where',
  'whereafter',
  'whereas',
  'whereby',
  'wherein',
  'whereupon',
  'wherever',
  'whether',
  'which',
  'while',
  'whither',
  'who',
  'whoever',
  'whole',
  'whom',
  'whose',
  'why',
  'widely',
  'will',
  'with',
  'within',
  'without',
  'would',
  'year',
  'years',
  'yet',
  'you',
  'your',
  'yours',
  'yourself',
  'yourselves'
];
