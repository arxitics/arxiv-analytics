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
    bot: /bot|googlebot|crawler|spider|robot|crawling/i,
    desktop: /Windows|Macintosh|X11.+Linux/i,
    mobile: /Android|iPhone|iPad|mobile|phone|tablet/i
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
    group: /^(math|cs|q-bio|q-fin|stat)$/,
    archive: /^([a-z\-\.]+[a-zA-Z])|(\d{2}(0[1-9]|1[0-2]))/,
    identifier: /^((\d{2})(0[1-9]|1[0-2])\.(\d{4,5})|[a-zA-Z\-\.]+\/(9[1-9]|0[0-7])(0[1-9]|1[0-2])(\d{3}))(v[1-9][0-9]*)?$/,
    version: /v[1-9][0-9]*$/,
    date: /^((19\d{2}|2\d{3})-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1]))(T([0-1]\d|2[0-3]):([0-4]\d|5[0-9]):([0-4]\d|5[0-9])Z)?$/,
    category: /^([a-z]+\-?([a-z]{2,})?)\.?([a-z]+\-?([a-z]{2,})?|[A-Z]{2})?$/,
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
      pattern: /\blecture.+(notes?|courses?|school)\b/i
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
  ],
  journals: [
    // APS
    {
      label: 'Rev. Mod. Phys.',
      title: 'Reviews of Modern Physics',
      publisher: 'APS',
      pattern: /\b(RMP|Rev(iews)?\W*(of)?\W*Mod(ern)?\W*Phys(ics)?)\b/i,
      doi: /10\.1103\/RevModPhys\.(\d+)\.(\d+)/i,
      pdf: 'http://journals.aps.org/rmp/pdf/10.1103/RevModPhys.$1.$2',
      group: 'Physics'
    },
    {
      label: 'Phys. Rev. Lett.',
      title: 'Physical Review Letters',
      publisher: 'APS',
      pattern: /\b(PRL|Phys(ical)?\W*Rev(iew)?\W*Lett(ers)?)\b/i,
      doi: /10\.1103\/PhysRevLett\.(\d+)\.(\d+)/i,
      pdf: 'http://journals.aps.org/prl/pdf/10.1103/PhysRevLett.$1.$2',
      group: 'Physics'
    },
    {
      label: 'Phys. Rev. A',
      title: 'Physical Review A: Atomic, Molecular and Optical Physics',
      publisher: 'APS',
      pattern: /\b(PRA|Phys(ical)?\W*Rev(iew)?\W*A)\b/i,
      doi: /10\.1103\/PhysRevA\.(\d+)\.(\d+)/i,
      pdf: 'http://journals.aps.org/pra/pdf/10.1103/PhysRevA.$1.$2',
      group: 'Physics'
    },
    {
      label: 'Phys. Rev. B',
      title: 'Physical Review B: Condensed Matter and Materials Physics',
      publisher: 'APS',
      pattern: /\b(PRB|Phys(ical)?\W*Rev(iew)?\W*B)\b/i,
      doi: /10\.1103\/PhysRevB\.(\d+)\.(\d+)/i,
      pdf: 'http://journals.aps.org/prb/pdf/10.1103/PhysRevB.$1.$2',
      group: 'Physics'
    },
    {
      label: 'Phys. Rev. C',
      title: 'Physical Review C: Nuclear Physics',
      publisher: 'APS',
      pattern: /\b(PRC|Phys(ical)?\W*Rev(iew)?\W*C)\b/i,
      doi: /10\.1103\/PhysRevC\.(\d+)\.(\d+)/i,
      pdf: 'http://journals.aps.org/prc/pdf/10.1103/PhysRevC.$1.$2',
      group: 'Physics'
    },
    {
      label: 'Phys. Rev. D',
      title: 'Physical Review D: Particles, Fields, Gravitation, and Cosmology',
      publisher: 'APS',
      pattern: /\b(PRD|Phys(ical)?\W*Rev(iew)?\W*D)\b/i,
      doi: /10\.1103\/PhysRevD\.(\d+)\.(\d+)/i,
      pdf: 'http://journals.aps.org/prd/pdf/10.1103/PhysRevD.$1.$2',
      group: 'Physics'
    },
    {
      label: 'Phys. Rev. E',
      title: 'Physical Review E: Statistical, Nonlinear, and Soft Matter Physics',
      publisher: 'APS',
      pattern: /\b(PRE|Phys(ical)?\W*Rev(iew)?\W*E)\b/i,
      doi: /10\.1103\/PhysRevE\.(\d+)\.(\d+)/i,
      pdf: 'http://journals.aps.org/pre/pdf/10.1103/PhysRevE.$1.$2',
      group: 'Physics'
    },
    {
      label: 'Phys. Rev. X',
      title: 'Physical Review X',
      publisher: 'APS',
      pattern: /\b(PRX|Phys(ical)?\W*Rev(iew)?\W*X)\b/i,
      doi: /10\.1103\/PhysRevX\.(\d+)\.(\d+)/i,
      pdf: 'http://journals.aps.org/prx/pdf/10.1103/PhysRevX.$1.$2',
      group: 'Physics'
    },
    {
      label: 'Phys. Rev. Appl.',
      title: 'Physical Review Applied',
      publisher: 'APS',
      pattern: /\bPhys(ical)?\W*Rev(iew)?\W*Appl(ied)?\b/i,
      doi: /10\.1103\/PhysRevApplied\.(\d+)\.(\d+)/i,
      pdf: 'http://journals.aps.org/prapplied/pdf/10.1103/PhysRevApplied.$1.$2',
      group: 'Physics'
    },
    {
      label: 'Phys. Rev. ST Accel. Beams',
      title: 'Physical Review Special Topics: Accelerators and Beams',
      publisher: 'APS',
      pattern: /\bPhys(ical)?\W*Rev(iew)?\W*S(pecial)?\W*T(opics)?\W*Accel(erators)?\W*(and|&)?\W*Beams\b/i,
      doi: /10\.1103\/PhysRevSTAB\.(\d+)\.(\d+)/i,
      pdf: 'http://journals.aps.org/prstab/pdf/10.1103/PhysRevSTAB.$1.$2',
      group: 'Physics'
    },
    {
      label: 'Phys. Rev. ST Phys. Educ. Res.',
      title: 'Physical Review Special Topics: Physics Education Research',
      publisher: 'APS',
      pattern: /\bPhys(ical)?\W*Rev(iew)?\W*S(pecial)?\W*T(opics)?\W*Phys(ics)?\W*Ed(uc|ucation)?\W*Res(earch)?\b/i,
      doi: /10\.1103\/PhysRevSTPER\.(\d+)\.(\d+)/i,
      pdf: 'http://journals.aps.org/prstper/pdf/10.1103/PhysRevSTPER.$1.$2',
      group: 'Physics'
    },
    {
      label: 'Physics',
      title: 'Physics',
      publisher: 'APS',
      pattern: /^Physics\W*(\d+)\W+(\d+)\W*\(\d+\)$/i,
      doi: /10\.1103\/Physics\.(\d+)\.(\d+)/i,
      pdf: 'http://physics.aps.org/articles/pdf/10.1103/Physics.$1.$2',
      group: 'Physics'
    },

    // Springer
    {
      label: 'Commun. Math. Phys.',
      title: 'Communications in Mathematical Physics',
      publisher: 'Springer',
      pattern: /\bComm(un|unications)?\W*(in)?\W*Math(ematical)?\W*Phys(ics)?\b/i,
      doi: /10\.1007\/((BF|s00220)(\d+|\-\d+\-\d+\-\w))/i,
      pdf: 'http://link.springer.com/content/pdf/10.1007/$1.pdf',
      group: 'Physics'
    },
    {
      label: 'J. High Energ. Phys.',
      title: 'Journal of High Energy Physics',
      publisher: 'Springer',
      pattern: /\b(JHEP|J(ournal)?\W*(of)?\W*High\W*Energ(y)?\W*Phys(ics)?)\b/i,
      doi: /10\.1007\/JHEP(\d+\((\d+)\)(\d+))/i,
      pdf: 'http://link.springer.com/content/pdf/10.1007/JHEP$1.pdf',
      group: 'Physics'
    },

    // IOP
    {
      label: 'Rep. Prog. Phys.',
      title: 'Reports on Progress in Physics',
      publisher: 'IOP',
      pattern: /\bRep(orts|t)?\W*(on)?\W*Prog(ress)?\W*(in)?\W*Phys(ics)?\b/i,
      doi: /10\.1088\/0034\-4885\/(\d+)\/(\d+)\/(\d+)/,
      pdf: 'http://iopscience.iop.org/0034-4885/$1/$2/$3/pdf/0034-4885_$1_$2_$3.pdf',
      group: 'Physics'
    },
    {
      label: 'J. High Energ. Phys.',
      title: 'Journal of High Energy Physics',
      publisher: 'IOP',
      pattern: /\b(JHEP|J(ournal)?\W*(of)?\W*High\W*Energ(y)?\W*Phys(ics)?)\b/i,
      doi: /10\.1088\/1126\-6708\/(\d+)\/(\d+)\/(\d+)/,
      pdf: 'http://iopscience.iop.org/1126-6708/$1/$2/$3/pdf/1126-6708_$1_$2_$3.pdf',
      group: 'Physics'
    },
    {
      label: 'Class. Quantum Grav.',
      title: 'Classical and Quantum Gravity',
      publisher: 'IOP',
      pattern: /\bClass(ical)?\W*(and|&)?\W*Quant(um)?\W*Grav(ity)?\b/i,
      doi: /10\.1088\/0264\-9381\/(\d+)\/(\d+)\/(\d+)/,
      pdf: 'http://iopscience.iop.org/0264-9381/$1/$2/$3/pdf/0264-9381_$1_$2_$3.pdf',
      group: 'Physics'
    },
    {
      label: 'J. Cosmol. Astropart. Phys.',
      title: 'Journal of Cosmology and Astroparticle Physics',
      publisher: 'IOP',
      pattern: /\b(JCAP|J(ournal)?\W*(of)?\W*Cosmol(ogy)?\W*(and|&)?\W*Astropart(icle)?\W*Phys(ics)?)\b/i,
      doi: /10\.1088\/1475\-7516\/(\d+)\/(\d+)\/(\d+)/,
      pdf: 'http://iopscience.iop.org/1475-7516/$1/$2/$3/pdf/1475-7516_$1_$2_$3.pdf',
      group: 'Physics'
    },
    {
      label: 'J. Opt.',
      title: 'Journal of Optics',
      publisher: 'IOP',
      pattern: /\bJ(ournal)?\W*(of)?\W*Opt(ics)?\b/i,
      doi: /10\.1088\/1464\-4258\/(\d+)\/(\d+)\/(\d+)/,
      pdf: 'http://iopscience.iop.org/1464-4258/$1/$2/$3/pdf/1464-4258_$1_$2_$3.pdf',
      group: 'Physics'
    },

    // Hindawi
    {
      label: 'Adv. High Energ. Phys.',
      title: 'Advances in High Energy Physics',
      publisher: 'Hindawi',
      pattern: /\bAdv(ances)?\W*(in)?\W*High\s?Energ(y)?\W*Phys(ics)?\b/i,
      doi: /10\.1155\/(\d+)\/(\d+)/i,
      pdf: 'http://downloads.hindawi.com/journals/ahep/$1/$2.pdf',
      group: 'Physics'
    },

    // Taylor & Francis
    {
      label: 'Adv. Phys.',
      title: 'Advances in Physics',
      publisher: 'Taylor-Francis',
      pattern: /\bAdv(ances)?\W*(in)?\W*Phys(ics)?\b/i,
      doi: /10\.1080\/(00018732\.(\d+)\.(\d+)|0001873(\d+))/i,
      pdf: 'http://www.tandfonline.com/doi/pdf/10.1080/$1',
      group: 'Physics'
    },

    // Elsevier
    {
      label: 'Phys. Rep.',
      title: 'Physics Reports',
      publisher: 'Elsevier',
      pattern: /\bPhys(ics)?\W*Rep(orts|t)?\b/i,
      doi: /10\.1016\/(j\.physrep\.(\d+)\.(\d+)\.(\d+)|S?0370\-1573\((\d+)\)(\d+)\-\w)/i,
      group: 'Physics'
    },
    {
      label: 'Nucl. Phys. A',
      title: 'Nuclear Physics A',
      publisher: 'Elsevier',
      pattern: /\bNucl(ear)\W*Phys(ics)?\W*A\b/i,
      doi: /10\.1016\/(j\.nuclphysa\.(\d+)\.(\d+)\.(\d+)|S?0375\-9474\((\d+)\)(\d+)\-\w)/i,
      group: 'Physics'
    },
    {
      label: 'Nucl. Phys. B',
      title: 'Nuclear Physics B',
      publisher: 'Elsevier',
      pattern: /\bNucl(ear)\W*Phys(ics)?\W*B\b/i,
      doi: /10\.1016\/(j\.nuclphysb\.(\d+)\.(\d+)\.(\d+)|S?0550\-3213\((\d+)\)(\d+)\-\w)/i,
      group: 'Physics'
    },
    {
      label: 'Comput. Phys. Commun.',
      title: 'Computer Physics Communications',
      publisher: 'Elsevier',
      pattern: /\b(CPC|Comp(ut|uter)?\W*Phys(ics)?\W*Comm(un|unications)?)\b/i,
      doi: /10\.1016\/(j\.cpc\.(\d+)\.(\d+)\.(\d+)|S?0010\-4655\((\d+)\)(\d+)\-\w)/i,
      group: 'Physics'
    },
    {
      label: 'J. Comput. Phys.',
      title: 'Journal of Computational Physics',
      publisher: 'Elsevier',
      pattern: /\b(JCP|J(ournal)?\W*(of)?\W*Comp(ut|utational)?\W*Phys(ics)?)\b/i,
      doi: /10\.(1016\/(j\.jcp\.(\d+)\.(\d+)\.(\d+)|0021\-9991\((\d+)\)(\d+)\-\w))|(1006\/jcph\.(\d+)\.(\d+))/i,
      group: 'Physics'
    },
    {
      label: 'Adv. Math.',
      title: 'Advances in Mathematics',
      publisher: 'Elsevier',
      pattern: /\bAdv(ances)?\W*(in)?\W*Math(ematics)?\b/i,
      doi: /10\.(1016\/j\.aim\.(\d+)\.(\d+)\.(\d+)|1006\/aima\.(\d+)\.(\d+))/i,
      group: 'Mathematics'
    },
    {
      label: 'J. Financial Economics',
      title: 'Journal of Financial Economics',
      publisher: 'Elsevier',
      pattern: /\b(JFE|J(ournal)?\W*(of)?\W*Financial Econ(omics)?)\b/i,
      doi: /10\.1016\/(j\.jfineco\.(\d+)\.(\d+)\.(\d+)|S0304\-405X\((\d+)\)(\d+)\-\w)/i,
      group: 'Quantitative Finance'
    },

    // AIP
    {
      label: 'AIP Adv.',
      title: 'AIP Advances',
      publisher: 'AIP',
      pattern: /\bAIP\W*Adv(ances)?\b/i,
      group: 'Physics'
    },
    {
      label: 'AIP Conf. Proc.',
      title: 'AIP Conference Proceedings',
      publisher: 'AIP',
      pattern: /\bAIP\W*Conf(erence)?\W*Proc(eedings)?\b/i,
      group: 'Physics'
    },
    {
      label: 'Appl. Phys. Lett.',
      title: 'Applied Physics Letters',
      publisher: 'AIP',
      pattern: /\b(APL|Appl(ied)?\W*Phys(ics)\W*Lett(ers)?)\b/i,
      group: 'Physics'
    },
    {
      label: 'APL Mat.',
      title: 'APL Materials',
      publisher: 'AIP',
      pattern: /\bAPL\W*Mat(erials)?\b/i,
      group: 'Physics'
    },
    {
      label: 'Appl. Phys. Rev.',
      title: 'Applied Physics Reviews',
      publisher: 'AIP',
      pattern: /\b(APR|Appl(ied)?\W*Phys(ics)?\W*Rev(iews)?)\b/i,
      group: 'Physics'
    },
    {
      label: 'Biomicrofluidics',
      title: 'Biomicrofluidics',
      publisher: 'AIP',
      pattern: /\bBiomicrofluidics\b/i,
      group: 'Physics'
    },
    {
      label: 'Chaos',
      title: 'Chaos: An Interdisciplinary Journal of Nonlinear Science',
      publisher: 'AIP',
      pattern: /\bChaos\W*(\d+)\W*(\d+)\W*\(\d+\)$/i,
      group: 'Physics'
    },
    {
      label: 'Comput. Phys.',
      title: 'Computers in Physics',
      publisher: 'AIP',
      pattern: /\bComp(ut|uter)?\W*(in)?\W*Phys(ics)?\b/i,
      group: 'Physics'
    },
    {
      label: 'Comput. Sci. Eng.',
      title: 'Computing in Science & Engineering',
      publisher: 'AIP',
      pattern: /\bComp(ut|uter)?\W*(in)?\W*Sci(ence)?\W*(&|and)?\W*Eng(ineering)?\b/i,
      doi: /10\.1109\/(MCI?SE\.(\d+)|\d+)\.(\d+)/i,
      group: 'Physics'
    },
    {
      label: 'J. Appl. Phys.',
      title: 'Journal of Applied Physics',
      publisher: 'AIP',
      pattern: /\b(JAP|J(ournal)?\W*(of)?\W*Appl(ied)?\W*Phys(ics)?)\b/i,
      group: 'Physics'
    },
    {
      label: 'J. Chem. Phys.',
      title: 'The Journal of Chemical Physics',
      publisher: 'AIP',
      pattern: /\b(JCP|(The)?\W*J(ournal)?\W*(of)?\W*Chem(ical)?\W*Phys(ics)?)\b/i,
      group: 'Physics'
    },
    {
      label: 'J. Math. Phys.',
      title: 'Journal of Mathematical Physics',
      publisher: 'AIP',
      pattern: /\b(JMP|J(ournal)?\W*(of)?\W*Math(ematical)?\W*Phys(ics)?)\b/i,
      group: 'Physics'
    },
    {
      label: 'J. Phys. Chem. Ref. Data',
      title: 'Journal of Physical and Chemical Reference Data',
      publisher: 'AIP',
      pattern: /\bJ(ournal)?\W*(of)?\W*Phys(ical)?\W*(and|&)?\W*Chem(ical)?\W*Ref(erence)?\W*Data\b/i,
      group: 'Physics'
    },
    {
      label: 'J. Renewable Sustainable Energy',
      title: 'Journal of Renewable and Sustainable Energy',
      publisher: 'AIP',
      pattern: /\b(JRESR|J(ournal)?\W*(of)?\W*Renewable\W*(and)?\W*Sustainable\W*Energy)\b/i,
      group: 'Physics'
    },
    {
      label: 'Low Temp. Phys.',
      title: 'Low Temperature Physics',
      publisher: 'AIP',
      pattern: /\bLow\W*Temp(erature)?\W*Phys(ics)?\b/i,
      group: 'Physics'
    },
    {
      label: 'Phys. Fluids',
      title: 'Physics of Fluids',
      publisher: 'AIP',
      pattern: /\bPhys(ics)?\W*(of)?\W*Fluids\b/i,
      group: 'Physics'
    },
    {
      label: 'Phys. Plasmas',
      title: 'Physics of Plasmas',
      publisher: 'AIP',
      pattern: /\bPhys(ics)?\W*(of)?\W*Plasmas\b/i,
      group: 'Physics'
    },
    {
      label: 'Rev. Sci. Instrum.',
      title: 'Review of Scientific Instruments',
      publisher: 'AIP',
      pattern: /\bRev(iew)?\W*(of)?\W*Sci(entific)?\W*Instrum(ents)?\b/i,
      group: 'Physics'
    },

    // AMS
    {
      label: 'Mem. Amer. Math. Soc.',
      title: 'Memoirs of the American Mathematical Society',
      publisher: 'AMS',
      pattern: /\bMem(o|oirs)?\W*(of)?\W*(the)?\W*(AMS|Am(er|erican)?\W*Math(ematical)?\W*Soc(iety)?)\b/i,
      doi: /10\.1090\/(memo\/(\d+)|S0065\-9266\-(\d+)\-(\d+)\-\w)/i,
      pdf: 'http://www.ams.org/books/memo/${number}/memo${number}.pdf',
      group: 'Mathematics'
    },
    {
      label: 'Notices Amer. Math. Soc.',
      title: 'Notices of the American Mathematical Society',
      publisher: 'AMS',
      pattern: /\bNotices\W*(of)?\W*(the)?\W*(AMS|Am(er|erican)?\W*Math(ematical)?\W*Soc(iety)?)\b/i,
      doi: /10\.1090\/noti(\d+)/i,
      pdf: 'http://www.ams.org/notices/${year}${number}/rnoti-p${page}.pdf',
      group: 'Mathematics'
    },
    {
      label: 'Bull. Amer. Math. Soc.',
      title: 'Bulletin of the American Mathematical Society',
      publisher: 'AMS',
      pattern: /\bBull(etin)?\W*(of)?\W*(the)?\W*(AMS|Am(er|erican)?\W*Math(ematical)?\W*Soc(iety)?)\b/i,
      doi: /10\.1090\/S0273\-0979\-((\d+)\-(\d+)\-\w)/i,
      pdf: 'http://www.ams.org/journals/bull/${year}-${volume}-${number}/S0273-0979-$1/S0273-0979-$1.pdf',
      group: 'Mathematics'
    },
    {
      label: 'J. Amer. Math. Soc.',
      title: 'Journal of the American Mathematical Society',
      publisher: 'AMS',
      pattern: /\bJ(ournal)?\W*(of)?\W*(the)?\W*(AMS|Am(er|erican)?\W*Math(ematical)?\W*Soc(iety)?)\b/i,
      doi: /10\.1090\/S0894\-0347\-((\d+)\-(\d+)\-\w)/i,
      pdf: 'http://www.ams.org/journals/jams/${year}-${volume}-${number}/S0894-0347-$1/S0894-0347-$1.pdf',
      group: 'Mathematics'
    },
    {
      label: 'Proc. Amer. Math. Soc. Ser. B',
      title: 'Proceedings of the American Mathematical Society, Series B',
      publisher: 'AMS',
      pattern: /\bProc(eedings)?\W*(of)?\W*(the)?\W*(AMS|Am(er|erican)?\W*Math(ematical)?\W*Soc(iety)?)\W*Ser(ies)?\W*B\b/i,
      doi: /10\.1090\/S2330\-1511\-((\d+)\-(\d+)\-\w)/i,
      pdf: 'http://www.ams.org/journals/bproc/${year}-${volume}-${number}/S2330-1511-$1/S2330-1511-$1.pdf',
      group: 'Mathematics'
    },
    {
      label: 'Proc. Amer. Math. Soc.',
      title: 'Proceedings of the American Mathematical Society',
      publisher: 'AMS',
      pattern: /\bProc(eedings)?\W*(of)?\W*(the)?\W*(AMS|Am(er|erican)?\W*Math(ematical)?\W*Soc(iety)?)\b/i,
      doi: /10\.1090\/S0002\-9939\-((\d+)\-(\d+)\-\w)/i,
      pdf: 'http://www.ams.org/journals/proc/${year}-${volume}-${number}/S0002-9939-$1/S0002-9939-$1.pdf',
      group: 'Mathematics'
    },
    {
      label: 'Trans. Amer. Math. Soc. Ser. B',
      title: 'Transactions of the American Mathematical Society, Series B',
      publisher: 'AMS',
      pattern: /\bTrans(actions)?\W*(of)?\W*(the)?\W*(AMS|Am(er|erican)?\W*Math(ematical)?\W*Soc(iety)?)\W*Ser(ies)?\W*B\b/i,
      doi: /10\.1090\/S2330\-0000\-((\d+)\-(\d+)\-\w)/i,
      pdf: 'http://www.ams.org/journals/btran/${year}-${volume}-${number}/S2330-0000-$1/S2330-0000-$1.pdf',
      group: 'Mathematics'
    },
    {
      label: 'Trans. Amer. Math. Soc.',
      title: 'Transactions of the American Mathematical Society',
      publisher: 'AMS',
      pattern: /\bTrans(actions)?\W*(of)?\W*(the)?\W*(AMS|Am(er|erican)?\W*Math(ematical)?\W*Soc(iety)?)\b/i,
      doi: /10\.1090\/S0002\-9947\-((\d+)\-(\d+)\-\w)/i,
      pdf: 'http://www.ams.org/journals/tran/${year}-${volume}-${number}/S0002-9947-$1/S0002-9947-$1.pdf',
      group: 'Mathematics'
    },
    {
      label: 'Conform. Geom. Dyn.',
      title: 'Conformal Geometry and Dynamics',
      publisher: 'AMS',
      pattern: /\bConform(al)?\W*Geom(etry)?\W*(and|&)?\W*Dyn(amics)?\b/i,
      doi: /10\.1090\/S1088\-4173\-((\d+)\-(\d+)\-\w)/i,
      pdf: 'http://www.ams.org/journals/ecgd/${year}-${volume}-${number}/S1088-4173-$1/S1088-4173-$1.pdf',
      group: 'Mathematics'
    },
    {
      label: 'Math. Comp.',
      title: 'Mathematics of Computation',
      publisher: 'AMS',
      pattern: /\bMath(ematics)?\W*(of)?\W*Comp(ut|utation)?\b/i,
      doi: /10\.1090\/S0025\-5718\-((\d+)\-(\d+)\-\w)/i,
      pdf: 'http://www.ams.org/journals/mcom/${year}-${volume}-${number}/S0025-5718-$1/S0025-5718-$1.pdf',
      group: 'Mathematics'
    },
    {
      label: 'Represent. Theory',
      title: 'Representation Theory',
      publisher: 'AMS',
      pattern: /\bRepresent(ation)?\W*Theory\b/i,
      doi: /10\.1090\/S1088\-4165\-((\d+)\-(\d+)\-\w)/i,
      pdf: 'http://www.ams.org/journals/ert/${year}-${volume}-${number}/S1088-4165-$1/S1088-4165-$1.pdf',
      group: 'Mathematics'
    },
    {
      label: 'Electron. Res. Announc. Amer. Math. Soc.',
      title: 'Electronic Research Announcements of the American Mathematical Society',
      publisher: 'AMS',
      pattern: /\bElectron(ic)?\W*Res(earch)?\W*Announc(ements)?\W*(of)?\W*(the)?\W*(AMS|Am(er|erican)?\W*Math(ematical)?\W*Soc(iety)?)\b/i,
      doi: /10\.1090\/S1079\-6762\-((\d+)\-(\d+)\-\w)/i,
      pdf: 'http://www.ams.org/journals/era/${year}-${volume}-${number}/S1079-6762-$1/S1079-6762-$1.pdf',
      group: 'Mathematics'
    },

    // IAS
    {
      label: 'Ann. Math.',
      title: 'Annals of Mathematics',
      publisher: 'Princeton University and the Institute for Advanced Study',
      pattern: /\bAnn(als)?\W*(of)?\W*Math(ematics)?\b/,
      doi: /10\.4007\/annals\.(\d+)\.(\d+)(\.(\d+))?\.(\d+)/,
      group: 'Mathematics'
    },

    // ACM
    {
      label: 'Commun. ACM',
      title: 'Communications of the ACM',
      publisher: 'ACM',
      pattern: /\b(CACM|Comm(un|unications)?\W*(of)?\W*(the)?\W*ACM)\b/i,
      doi: /10\.1145\/(?:\d+\.)?(\d+)/i,
      pdf: 'http://dl.acm.org/ft_gateway.cfm?id=$1',
      group: 'Computer Science'
    },
    {
      label: 'J. ACM',
      title: 'Journal of the ACM',
      publisher: 'ACM',
      pattern: /\b(JACM|J(ournal)?\W*(of)?\W*(the)?\W*ACM)\b/i,
      doi: /10\.1145\/(?:\d+\.)?(\d+)/i,
      pdf: 'http://dl.acm.org/ft_gateway.cfm?id=$1',
      group: 'Computer Science'
    },
    {
      label: 'ACM Trans. Graphics',
      title: 'ACM Transactions on Graphics',
      publisher: 'ACM',
      pattern: /\b(TOG|ACM\W*Trans(actions)?\W*(on)?\W*Graphics)\b/i,
      doi: /10\.1145\/(?:\d+\.)?(\d+)/i,
      pdf: 'http://dl.acm.org/ft_gateway.cfm?id=$1',
      group: 'Computer Science'
    },
    {
      label: 'ACM Trans. Web',
      title: 'ACM Transactions on the Web',
      publisher: 'ACM',
      pattern: /\b(TWEB|ACM\W*Trans(actions)?\W*(on)?\W*(the)?\W*Web)\b/i,
      doi: /10\.1145\/(?:\d+\.)?(\d+)/i,
      pdf: 'http://dl.acm.org/ft_gateway.cfm?id=$1',
      group: 'Computer Science'
    },
    {
      label: 'ACM Trans. Softw. Eng. Meth.',
      title: 'ACM Transactions on Software Engineering and Methodology',
      publisher: 'ACM',
      pattern: /\b(TOSEM|ACM\W*Trans(actions)?\W*(on)?\W*Softw(are)?\W*Eng(ineering)?\W*(and|&)?\W* Meth(odology)?)\b/i,
      doi: /10\.1145\/(?:\d+\.)?(\d+)/i,
      pdf: 'http://dl.acm.org/ft_gateway.cfm?id=$1',
      group: 'Computer Science'
    },
    {
      label: 'ACM Trans. Math. Softw.',
      title: 'ACM Transactions on Mathematical Software',
      publisher: 'ACM',
      pattern: /\b(TOMS|ACM\W*Trans(actions)?\W*(on)?\W*Math(ematical)?\W*Softw(are)?)\b/i,
      doi: /10\.1145\/(?:\d+\.)?(\d+)/i,
      pdf: 'http://dl.acm.org/ft_gateway.cfm?id=$1',
      group: 'Computer Science'
    },
    {
      label: 'ACM Trans. Comput. Syst.',
      title: 'ACM Transactions on Computer Systems',
      publisher: 'ACM',
      pattern: /\b(TOCS|ACM\W*Trans(actions)?\W*(on)?\W*Comp(ut|uter)?\W*Sys(t|tems)?)\b/i,
      doi: /10\.1145\/(?:\d+\.)?(\d+)/i,
      pdf: 'http://dl.acm.org/ft_gateway.cfm?id=$1',
      group: 'Computer Science'
    },

    // IEEE
    {
      label: 'Proc. IEEE',
      title: 'Proceedings of the IEEE',
      publisher: 'IEEE',
      pattern: /\bProc(eedings)?\W*(of)?\W*(the)?\W*IEEE\b/i,
      doi: /10\.1109\/(JPROC\.(\d+)\.(\d+)|5\.(\d+))/i,
      group: 'Computer Science'
    },

    // OUP
    {
      label: 'Bioinformatics',
      title: 'Bioinformatics',
      publisher: 'Oxford University Press',
      pattern: /\bBioinformatics\b/i,
      doi: /10\.1093\/bioinformatics\/(bt[a-z](\d+)|(\d+)\.(\d+)\.(\d+))/i,
      pdf: 'http://bioinformatics.oxfordjournals.org/content/${volume}/${number}/${page}.full.pdf',
      group: 'Quantitative Biology'
    },

    // Wiley-Blackwell
    {
      label: 'J. Finance',
      title: 'The Journal of Finance',
      publisher: 'Wiley-Blackwell',
      pattern: /\b(The)?\W*J(ournal)?\W*(of)?\W*Finance\b/i,
      doi: /10\.1111\/(jofi\.(\d+)|j\.1540\-6261\.(\d+)\.(\d+)\.x|)/i,
      pdf: 'http://onlinelibrary.wiley.com/doi/10.1111/$1/pdf',
      group: 'Quantitative Finance'
    },

    // IMS
    {
      label: 'Ann. Stat.',
      title: 'Annals of Statistics',
      publisher: 'Institute of Mathematical Statistics',
      pattern: /\bAnn(als)?\W*(of)?\W*Stat(ist|istics)?\b/i,
      doi: /10\.1214\/((\d+)\-AOS(\d+)|0090536(\d+)|aos\/(\d+))/i,
      group: 'Statistics'
    }
  ]
};
