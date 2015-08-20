/**
 * Regular expressions.
 */

module.exports = {
  output: function (regexp) {
    // Avoid the problem of passing object by reference
    var object = {};
    var delimiter = /(^\/)|(\/[gi]*$)/g;
    var type = Object.prototype.toString.call(regexp).slice(8, -1);
    if (type === 'Object') {
      for (var key in regexp) {
        if (regexp.hasOwnProperty(key)) {
          object[key] = this.output(regexp[key]);
        }
      }
    } else {
      return regexp.toString().replace(delimiter, '');
    }
    return object;
  },
  syntax: /^\/(.*)\/([gim]*)$/,
  ascii: /^[\x00-\x7F]+$/,
  xss: /<(?=\/?(script|style|iframe|object|embed|audio|video|base|meta))/gi,
  url: {
    empty: /[^\?&\=]+\=(&|$)/g,
    repeat: /(^|&)([^&]+\=[^&]+)(&.*)?&\2/gi,
    unsafe: /[ <>\[\\\]\^`\{|\}]/g
  },
  filename: {
    unsafe: /["\-\:\*\?|<>\/\\\s]+/g
  },
  browser: {
    bot: /bot|crawler|curl|spider|spyder|robot|crawling/i,
    tablet: /iPad|kindle|Silk|tablet/i,
    mobile: /Android|iPad|iPhone|mobile|phone|tablet/i,
    desktop: /Windows|Macintosh|PowerPC|X11.+Linux/i
  },
  terminal: {
    separator: /\s*([\=,])\s*/g,
    segment: /"(?:\\"|\\\\|[^"])*"|\S+/g,
    option: /^(\-[a-z]$|\-{2}[a-z])/i
  },
  account: {
    uid: /^(0|[1-9]\d*)$/,
    name: /^[a-zA-Z][a-zA-Z\-\. ]*[a-zA-Z]$/,
    email: /^([\w\-\+\.]+)@([\w\-\+\.]+\.[a-zA-Z]{2,4})$/,
    locale: /^[a-z]{2}$/,
    website: /^https?\:\/\/[a-zA-Z\d\-\.]+/,
    orcid: /^0000\-000[1-3]\-\d{4}\-\d{3}[\dX]$/,
    author: /^[a-zA-Z][a-zA-Z\-\. ]*[a-zA-Z\d]$/,
    theme: /^([a-zA-Z\-\.]+[a-zA-Z])\s*\:\s*([a-zA-Z\d\- ]+[a-zA-Z\d])$/,
    auth: {
      key: /^[a-f0-9]{32}$/,
      code: /^[1-9][0-9]{5}/
    },
    doc: {
      type: /^[a-z]{4,}$/,
      source: /^[a-zA-Z\- ]+$/,
      language: /^[a-z]{2}$/,
      title: /^[\x00-\x7F]{10,}$/,
      href: /^http:\/\/oss\.arxitics\.com\/users\/\d+\/((pdf\/[a-z\d\-\.]{4,}\.pdf)|(tex\/[a-z\d\-\.]{4,}\.(tex|latex|zip))|(images\/[a-z\d\-\.]{4,}\.(svg|png)))$/
    }
  },
  message: {
    receiver: /^(0|[1-9]\d*)\s*<([\w\-\+\. ]+)>$/,
    content: /^[\x00-\x7F]{20,}$/
  },
  review: {
    pid: /^([1-9]\d*)$/,
    title: /^[\x00-\x7F]{20,}$/,
    content: /^[\x00-\x7F]{200,}$/,
    comment: /^[\x00-\x7F]{40,}$/,
    summary: /^[\x00-\x7F]{10,}$/,
    math: /(\$+[^\$]*\$+|\\{2}\([\s\S]*?\\{2}\)|\\{2}\[[\s\S]*?\\{2}\]|\\+begin\{(\w+)\}[\s\S]*?\\+end\{\2\})/g,
    recovery: {
      begin: /(<code>|`)(\$|\\{2}\(|\\{2}\[|\\+begin\{\w+\})/g,
      end: /(\$|\\{2}\)|\\{2}\]|\\+end\{\w+\})(`|<\/code>)/g
    }
  },
  arxiv: {
    mirror: /^(lanl|cn|fr|de|in|jp|es)?$/,
    group: /^(math|cs|q-bio|q-fin|stat)$/,
    archive: /^([a-z\-\.]+[a-zA-Z])|(\d{2}(0[1-9]|1[0-2]))/,
    identifier: /^((\d{2})(0[1-9]|1[0-2])\.(\d{4,5})|[a-zA-Z\-\.]+\/(9[1-9]|0[0-7])(0[1-9]|1[0-2])(\d{3}))(v[1-9][0-9]*)?$/,
    version: /v[1-9][0-9]*$/,
    date: /^((19\d{2}|2\d{3})-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1]))(T([0-1]\d|2[0-3]):([0-4]\d|5[0-9]):([0-4]\d|5[0-9])Z)?$/,
    category: /^([a-z]+\-?([a-z]{2,})?)\.?([a-z]+\-?([a-z]{2,})?|[A-Z]{2})?$/,
    doi: /^10\.\d+\/\S+$/,
    pacs: /^(\d{2})\.(\d{2})\.([a-zA-Z\+\-][a-z\-])$/,
    msc: /^(\d{2})([A-Z\-])(\d{2}|xx)$/,
    ccs: /^([A-K])\.(\d|m)(\.(\d|m))?$/,
    jel: /^[A-Z]\d{2}$/,
    author: {
      eastern: /^([^\-\.]+)\s([a-zA-Z]+\-[a-zA-Z]+)$/,
      surname: /\W(\'[st]|[dl]\'|des|de|van|von)[^\.]\W*/i
    },
    publication: {
      year: /^(19\d{2}|2\d{3})$/,
      month: /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/,
      volume: /^[1-9]\d*$/,
      number: /^(\d+|\d+\-\d+)$/,
      pages: /^(\d+|\d+\-\d+)$/
    },
    resource: {
      type: /^[a-z]{4,}$/,
      source: /^[a-zA-Z\- ]+$/,
      title: /^[\x00-\x7F]{10,}$/
    }
  },
  inspire: {
    record: /^\/record\/(\d+)\/?/,
    citations: /^\/record\/(\d+)\/citations\/?$/,
    doi: /^http\:\/\/dx\.doi\.org\/(.+)\/?$/,
    author: /^\/author\/profile\/(.+)/,
    search: /^\/search\?(.+)$/,
    institution: /^\/search\?cc\=Institutions\&p\=institution\:(.+)$/,
    pacs: /^(\d{2})\.(\d{2})\.([a-zA-Z\+\-][a-z\-])$/,
    eprint: /^http\:\/\/arxiv\.org\/pdf\/(.+)\.pdf$/i
  },
  adsabs: {
    bibcode: /^\d{4}[a-zA-Z]+[a-zA-Z\d\.]+\d+[A-Z]$/
  },
  strip: {
    tex: /(\${1,2})[^\$]*\1\W?/g,
    tag: /<[^>]+>/g,
    apostrophe: /('s?|\\')(?=\w)/g,
    symbol: /\S*[~@#%&_\^\$\*\+\=\|\\<>]+\S*/g,
    punctuation: /[`'".,;\:\!\?\(\)\[\]\{\}]|(^|\s)[\/\-]+/g,
    number: /\b[\d]+\b/g
  },
  pages: /\d+(?=\s?((text\s)?page|pp))/i,
  systems: [
    {
      label: 'Plain TeX',
      pattern: /\bplain\sTeX\b/i
    },
    {
      label: 'LaTeX',
      pattern: /\bLaTeX(2e|\b)/i
    },
    {
      label: 'PDFLaTeX',
      pattern: /\b(PDF\s?LaTeX\b)|(LaTeX.+(PDF|PNG|JPE?G)\sfigure)/i
    },
    {
      label: 'AMS-TeX',
      pattern: /\bAMS(\W?TeX|art|proc|book)\b/i
    },
    {
      label: 'RevTeX',
      pattern: /\bRevTex(\d|\b)/i
    },
  ],
  languages: [
    {
      label: 'de',
      pattern: /((in\s|language\W*)German)|(German\slanguage)/i
    },
    {
      label: 'es',
      pattern: /((in\s|language\W*)Spanish)|(Spanish\slanguage)/i
    },
    {
      label: 'fr',
      pattern: /((in\s|language\W*)French)|(French\slanguage)/i
    },
    {
      label: 'ja',
      pattern: /(in\s|language\W*)Japanese\s*([\-\,\;\.\(\)]|$)/i
    },
    {
      label: 'pt',
      pattern: /((in\s|language\W*)Portuguese)|(Portuguese\slanguage)/i
    },
    {
      label: 'ru',
      pattern: /((in\s|language\W*)Russian)|(Russian\slanguage)/i
    },
    {
      label: 'zh',
      pattern: /in\sChinese\s*([\-\,\;\.\(\)]|$)/i
    }
  ],
  licenses: [
    {
      label: 'arXiv',
      pattern: /\barXiv(\.org)?\W*(perpetual)?\W*non-exclusive\W*license\W*(to\sdistribute)?\b/i,
      url: 'http://arxiv.org/licenses/nonexclusive-distrib/1.0/'
    },
    {
      label: 'CC BY 4.0',
      pattern: /\b(Creative\W*Commons\W*(Attribution)?\W*(4\.0)\W*(International)?\W*License)\b/i,
      url: 'http://creativecommons.org/licenses/by/4.0/'
    },
    {
      label: 'CC BY 3.0',
      pattern: /\b(Creative\W*Commons\W*(Attribution)?\W*(3\.0)\W*(Unported)?\W*License)\b/i,
      url: 'http://creativecommons.org/licenses/by/3.0/'
    },
    {
      label: 'CC BY 2.5',
      pattern: /\b(Creative\W*Commons\W*(Attribution)?\W*(2\.5)\W*(Generic)?\W*License)\b/i,
      url: 'http://creativecommons.org/licenses/by/2.5/'
    },
    {
      label: 'CC BY-NC-SA 4.0',
      pattern: /\b(Creative\W*Commons\W*Attribution-NonCommercial-ShareAlike\W*(4\.0)\W*(International)?\W*License)\b/i,
      url: 'http://creativecommons.org/licenses/by-nc-sa/4.0/'
    },
    {
      label: 'CC BY-NC-SA 3.0',
      pattern: /\b(Creative\W*Commons\W*Attribution-NonCommercial-ShareAlike\W*(3\.0)\W*(Unported)?\W*License)\b/i,
      url: 'http://creativecommons.org/licenses/by-nc-sa/3.0/'
    },
    {
      label: 'CC BY-NC-SA 2.5',
      pattern: /\b(Creative\W*Commons\W*Attribution-NonCommercial-ShareAlike\W*(2\.5)\W*(Generic)?\W*License)\b/i,
      url: 'http://creativecommons.org/licenses/by-nc-sa/2.5/'
    },
    {
      label: 'Public Domain',
      pattern: /\bpublic\sdomain\b/i,
      url: 'http://creativecommons.org/licenses/publicdomain/'
    }
  ],
  tags: [
    {
      label: 'textbook',
      pattern: /\btextbook\b/i
    },
    {
      label: 'monograph',
      pattern: /\bmonograph\b/i,
      journals: [
        'Mem. Amer. Math. Soc.'
      ]
    },
    {
      label: 'book chapter',
      pattern: /\b((book\schapter)|(chapter.+(text)?book))\b/i
    },
    {
      label: 'book review',
      pattern: /\bbook\sreview\b/i
    },
    {
      label: 'conference paper',
      pattern: /\bconference\b/i
    },
    {
      label: 'dissertation',
      pattern: /\b(PhD|doctoral|thesis|dissertation)\b/i
    },
    {
      label: 'lecture note',
      pattern: /\b(lectures|lecture.+(notes?|courses?|school))\b/i
    },
    {
      label: 'manual',
      pattern: /\b(user('s)?|program|software)\smanual\b/i
    },
    {
      label: 'research tool',
      pattern: /\b(package|toolkit)\b/i
    },
    {
      label: 'review article',
      pattern: /\b((review\s(article|talk))|(invited\sreview))\b/i,
      journals: [
        'Adv. Phys.',
        'Phys. Rep.',
        'Rep. Prog. Phys.',
        'Rev. Mod. Phys.'
      ]
    },
    {
      label: 'expository article',
      pattern: /\bexpository\s(article|report|note|papers?|overview)\b/i,
      journals: [
        'Bull. Amer. Math. Soc.'
      ]
    }
  ]
};
