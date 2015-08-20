/**
 * Security utilities.
 */

var crypto = require('crypto');
var querystring = require('querystring');
var regexp = require('./regexp');
var settings = require('../settings').session;

// Generate request report
exports.generate = function (req) {
  var ip = req.ip || req._remoteAddress;
  var requests = req.session.stats.requests;
  var userAgent = req.get('User-Agent');
  var pattern = regexp.browser;
  var device = 'desktop';
  if (pattern.tablet.test(userAgent)) {
    device = 'tablet';
  } else if (pattern.mobile.test(userAgent)) {
    device = 'phone';
  }

  var report = {
    result: 'accepted',
    browser: {
      device: device,
      isBot: pattern.bot.test(userAgent),
      isDesktop: device === 'desktop',
      isMobile: device !== 'desktop',
      isTablet: device === 'tablet',
      isPhone: device === 'phone'
    }
  };
  report.isHuman = !(report.browser.isBot || requests > settings.threshold);
  if (exports.blockIP(ip)) {
    report.result = 'refused';
    report.reason = 'IP blocked';
    report.message = 'Your IP address has been blocked by the administrator.';
    console.error('detected a request from blocked IP ' + ip);
  } else if (requests > settings.maxRequests) {
    report.result = 'refused';
    report.reason = 'DDoS attack';
    report.message = 'You have sent too many requests in a short period.';
    console.error('detected a potential DDoS attack');
  }
  return report;
};

// Blacklist certain IP addresses
exports.blockIP = function (ip) {
  if (/^\:\:f{4}\:/.test(ip)) {
    ip = ip.replace('::ffff:', '');
  }
  return [
    '183.136.190.36',
    '183.136.190.41',
    '183.136.190.43',
    '183.136.190.48',
    '183.136.190.49',
    '183.136.190.51',
    '183.136.190.55',
    '183.136.190.57',
    '183.136.190.58'
  ].indexOf(ip) !== -1;
};

// Generate md5 hash encoded by hex
exports.md5Hash = function (data) {
  return crypto.createHash('md5').update(data).digest('hex');
};

// Generate random digits
exports.randomDigits = function (length) {
  var base = Math.pow(10, length - 1);
  return Math.floor(Math.random() * base * 9 + base);
};

// Sanitize a string to be safe filename
exports.sanitize = function (filename) {
  return filename.trim().replace(regexp.filename.unsafe, '-');
};

// Censor the data posted by users
exports.censor = function (body) {
  var object = {};
  var ascii = regexp.ascii;
  var xss = regexp.xss;
  for (var key in body) {
    if (body.hasOwnProperty(key)) {
      var value = body[key];
      var type = Object.prototype.toString.call(value).slice(8, -1);
      if (type === 'String') {
        object[key] = ascii.test(value) ? value.replace(xss, '&lt;') : '';
      } else if (type === 'Array') {
        object[key] = value.filter(function (item) {
          return ascii.test(item);
        });
      } else if (type === 'Object') {
        for (var subkey in value) {
          if (value.hasOwnProperty(subkey)) {
            object[key][subkey] = exports.censor(value[subkey]);
          }
        }
      } else {
        object[key] = value;
      }
    }
  }
  return object;
};

// Serialize an object to a query string
exports.serialize = function (query, options) {
  var object = {};
  var paramsCombined = options && options.paramsCombined;
  for (var key in query) {
    if (query.hasOwnProperty(key)) {
      var value = query[key];
      var test = String(value).trim();
      if (test !== '' && test !== 'null') {
        if (paramsCombined && Array.isArray(value)) {
          value = value.join(',');
        }
        object[key] = value;
      }
    }
  }
  var serialization = querystring.stringify(object);
  return decodeURIComponent(serialization.replace(/%20/g, '+'));
};

// Normalize url
exports.normalize = function (url) {
  var pattern = regexp.url;
  var repeat = pattern.repeat;
  url = url.replace(pattern.empty, '').replace(/\+/g, ' ');
  while (repeat.test(url)) {
    url = url.replace(repeat, '$1$2$3');
  }
  url = url.replace(/\?\&+/, '?').replace(/[?&]+$/, '');
  return url.replace(pattern.unsafe, function (x) {
    return {
      ' ': '+',
      '<': '%3C',
      '>': '%3E',
      '[': '%5B',
      '\\': '%5C',
      ']': '%5D',
      '^': '%5E',
      '`': '%60',
      '{': '%7B',
      '|': '%7C',
      '}': '%7D'
    }[x];
  });
};

// Remove diacritics for latin characters
exports.latinize = function (text) {
  var diacriticsMap = {};
  var diacritics = exports.diacritics;
  diacritics.forEach(function (diacritic) {
    var base = diacritic.base;
    var letters = diacritic.letters;
    letters.forEach(function (letter) {
      diacriticsMap[letter] = base;
    });
  });
  return text.replace(/[^\u0000-\u007F]/g, function (character) { 
    return diacriticsMap[character] || character; 
  });
};

// Diacritics
exports.diacritics = [
  {
    base: 'A',
    letters: [
      '\u00C0',
      '\u00C1',
      '\u00C2',
      '\u00C3',
      '\u00C4',
      '\u00C5',
      '\u0100',
      '\u0102',
      '\u0104',
      '\u01CD',
      '\u01DE',
      '\u01E0',
      '\u01FA',
      '\u0200',
      '\u0202',
      '\u0226',
      '\u023A'
    ]
  },
  {
    base: 'AE',
    letters: [
      '\u00C6',
      '\u01E2',
      '\u01FC'
    ]
  },
  {
    base: 'B',
    letters: [
      '\u0181',
      '\u0182',
      '\u0243'
    ]
  },
  {
    base: 'C',
    letters: [
      '\u00C7',
      '\u0106',
      '\u0108',
      '\u010A',
      '\u010C',
      '\u0187',
      '\u023B'
    ]
  },
  {
    base: 'D',
    letters: [
      '\u010E',
      '\u0110',
      '\u0189',
      '\u018A',
      '\u018B'
    ]
  },
  {
    base: 'E',
    letters: [
      '\u00C8',
      '\u00C9',
      '\u00CA',
      '\u00CB',
      '\u0112',
      '\u0114',
      '\u0116',
      '\u0118',
      '\u011A',
      '\u018E',
      '\u0190',
      '\u0204',
      '\u0206',
      '\u0228',
      '\u0246'
    ]
  },
  {
    base: 'F',
    letters: [
      '\u0191'
    ]
  },
  {
    base: 'G',
    letters: [
      '\u011C',
      '\u011E',
      '\u0120',
      '\u0122',
      '\u0193',
      '\u01E4',
      '\u01E6',
      '\u01F4'
    ]
  },
  {
    base: 'H',
    letters: [
      '\u0124',
      '\u0126',
      '\u021E'
    ]
  },
  {
    base: 'I',
    letters: [
      '\u00CC',
      '\u00CD',
      '\u00CE',
      '\u00CF',
      '\u0128',
      '\u012A',
      '\u012C',
      '\u012E',
      '\u0130',
      '\u0197',
      '\u01CF',
      '\u0208',
      '\u020A'
    ]
  },
  {
    base: 'J',
    letters: [
      '\u0134',
      '\u0248'
    ]
  },
  {
    base: 'K',
    letters: [
      '\u0136',
      '\u0198',
      '\u01E8'
    ]
  },
  {
    base: 'L',
    letters: [
      '\u0139',
      '\u013B',
      '\u013D',
      '\u013F',
      '\u0141',
      '\u023D'
    ]
  },
  {
    base: 'N',
    letters: [
      '\u00D1',
      '\u0143',
      '\u0145',
      '\u0147',
      '\u019D',
      '\u01F8',
      '\u0220'
    ]
  },
  {
    base: 'O',
    letters: [
      '\u00D2',
      '\u00D3',
      '\u00D4',
      '\u00D5',
      '\u00D6',
      '\u00D8',
      '\u014C',
      '\u014E',
      '\u0150',
      '\u0186',
      '\u019F',
      '\u01A0',
      '\u01D1',
      '\u01EA',
      '\u01EC',
      '\u01FE',
      '\u020C',
      '\u020E',
      '\u022A',
      '\u022C',
      '\u022E',
      '\u0230'
    ]
  },
  {
    base: 'OE',
    letters: [
      '\u0152'
    ]
  },
  {
    base: 'OI',
    letters: [
      '\u01A2'
    ]
  },
  {
    base: 'P',
    letters: [
      '\u01A4'
    ]
  },
  {
    base: 'Q',
    letters: [
      '\u024A'
    ]
  },
  {
    base: 'R',
    letters: [
      '\u0154',
      '\u0156',
      '\u0158',
      '\u0210',
      '\u0212',
      '\u024C'
    ]
  },
  {
    base: 'S',
    letters: [
      '\u015A',
      '\u015C',
      '\u015E',
      '\u0160',
      '\u0218'
    ]
  },
  {
    base: 'T',
    letters: [
      '\u0162',
      '\u0164',
      '\u0166',
      '\u01AC',
      '\u01AE',
      '\u021A',
      '\u023E'
    ]
  },
  {
    base: 'U',
    letters: [
      '\u00D9',
      '\u00DA',
      '\u00DB',
      '\u00DC',
      '\u0168',
      '\u016A',
      '\u016C',
      '\u016E',
      '\u0170',
      '\u0172',
      '\u01AF',
      '\u01D3',
      '\u01D5',
      '\u01D7',
      '\u01D9',
      '\u01DB',
      '\u0214',
      '\u0216',
      '\u0244'
    ]
  },
  {
    base: 'V',
    letters: [
      '\u01B2'
    ]
  },
  {
    base: 'W',
    letters: [
      '\u0174'
    ]
  },
  {
    base: 'Y',
    letters: [
      '\u00DD',
      '\u0176',
      '\u0178',
      '\u01B3',
      '\u0232',
      '\u024E'
    ]
  },
  {
    base: 'Z',
    letters: [
      '\u0179',
      '\u017B',
      '\u017D',
      '\u01B5',
      '\u0224'
    ]
  },
  {
    base: 'a',
    letters: [
      '\u00E0',
      '\u00E1',
      '\u00E2',
      '\u00E3',
      '\u00E4',
      '\u00E5',
      '\u0101',
      '\u0103',
      '\u0105',
      '\u01CE',
      '\u01DF',
      '\u01E1',
      '\u01FB',
      '\u0201',
      '\u0203',
      '\u0227'
    ]
  },
  {
    base: 'ae',
    letters: [
      '\u00E6',
      '\u01E3',
      '\u01FD'
    ]
  },
  {
    base: 'b',
    letters: [
      '\u0180',
      '\u0183'
    ]
  },
  {
    base: 'c',
    letters: [
      '\u00E7',
      '\u0107',
      '\u0109',
      '\u010B',
      '\u010D',
      '\u0188',
      '\u023C'
    ]
  },
  {
    base: 'd',
    letters: [
      '\u010F',
      '\u0111',
      '\u018C',
      '\u0221'
    ]
  },
  {
    base: 'e',
    letters: [
      '\u00E8',
      '\u00E9',
      '\u00EA',
      '\u00EB',
      '\u0113',
      '\u0115',
      '\u0117',
      '\u0119',
      '\u011B',
      '\u0205',
      '\u0207',
      '\u0229',
      '\u0247'
    ]
  },
  {
    base: 'f',
    letters: [
      '\u0192'
    ]
  },
  {
    base: 'g',
    letters: [
      '\u011D',
      '\u011F',
      '\u0121',
      '\u0123',
      '\u01E5',
      '\u01E7',
      '\u01F5'
    ]
  },
  {
    base: 'h',
    letters: [
      '\u0125',
      '\u0127',
      '\u021F'
    ]
  },
  {
    base: 'hv',
    letters: [
      '\u0195'
    ]
  },
  {
    base: 'i',
    letters: [
      '\u00EC',
      '\u00ED',
      '\u00EE',
      '\u00EF',
      '\u0129',
      '\u012B',
      '\u012D',
      '\u012F',
      '\u0131',
      '\u01D0',
      '\u0209',
      '\u020B'
    ]
  },
  {
    base: 'j',
    letters: [
      '\u0135',
      '\u0237',
      '\u0249'
    ]
  },
  {
    base: 'k',
    letters: [
      '\u0137',
      '\u0138',
      '\u0199',
      '\u01E9'
    ]
  },
  {
    base: 'l',
    letters: [
      '\u013A',
      '\u013C',
      '\u013E',
      '\u0140',
      '\u0142',
      '\u019A',
      '\u0234'
    ]
  },
  {
    base: 'n',
    letters: [
      '\u00F1',
      '\u0144',
      '\u0146',
      '\u0148',
      '\u0149',
      '\u019E',
      '\u01F9',
      '\u0235'
    ]
  },
  {
    base: 'o',
    letters: [
      '\u00F2',
      '\u00F3',
      '\u00F4',
      '\u00F5',
      '\u00F6',
      '\u00F8',
      '\u014D',
      '\u014F',
      '\u0151',
      '\u01A1',
      '\u01D2',
      '\u01EB',
      '\u01ED',
      '\u01FF',
      '\u020D',
      '\u020F',
      '\u022B',
      '\u022D',
      '\u022F',
      '\u0231'
    ]
  },
  {
    base: 'oe',
    letters: [
      '\u0153'
    ]
  },
  {
    base: 'oi',
    letters: [
      '\u01A3'
    ]
  },
  {
    base: 'p',
    letters: [
      '\u01A5'
    ]
  },
  {
    base: 'q',
    letters: [
      '\u024B'
    ]
  },
  {
    base: 'r',
    letters: [
      '\u0155',
      '\u0157',
      '\u0159',
      '\u0211',
      '\u0213',
      '\u024D'
    ]
  },
  {
    base: 's',
    letters: [
      '\u00DF',
      '\u015B',
      '\u015D',
      '\u015F',
      '\u0161',
      '\u017F',
      '\u0219',
      '\u023F'
    ]
  },
  {
    base: 't',
    letters: [
      '\u0163',
      '\u0165',
      '\u0167',
      '\u01AB',
      '\u01AD',
      '\u021B',
      '\u0236'
    ]
  },
  {
    base: 'u',
    letters: [
      '\u00F9',
      '\u00FA',
      '\u00FB',
      '\u00FC',
      '\u0169',
      '\u016B',
      '\u016D',
      '\u016F',
      '\u0171',
      '\u0173',
      '\u01B0',
      '\u01D4',
      '\u01D6',
      '\u01D8',
      '\u01DA',
      '\u01DC',
      '\u0215',
      '\u0217'
    ]
  },
  {
    base: 'w',
    letters: [
      '\u0175'
    ]
  },
  {
    base: 'y',
    letters: [
      '\u00FD',
      '\u00FF',
      '\u0177',
      '\u01B4',
      '\u0233',
      '\u024F'
    ]
  },
  {
    base: 'z',
    letters: [
      '\u017A',
      '\u017C',
      '\u017E',
      '\u01B6',
      '\u0225',
      '\u0240'
    ]
  }
];
