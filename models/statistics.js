/**
 * Eprints statistics.
 */

// Summarize eprints by fields
exports.summarize = function (eprints, options) {
  var stats = {
    years: [],
    months: [],
    authors: [],
    categories: [],
    keywords: []
  };
  var map = {
    years: 'year',
    authors: 'author',
    categories: 'category',
    keywords: 'keyword'
  };
  var isArray = Array.isArray(options);
  eprints.forEach(function (eprint, index) {
    var published = eprint.published;
    stats.years.push(published.getFullYear());
    stats.authors = stats.authors.concat(eprint.authors);
    stats.categories = stats.categories.concat(eprint.categories);
    stats.keywords = stats.keywords.concat(eprint.analyses.keywords);
  });
  for (var key in stats) {
    if (stats.hasOwnProperty(key)) {
      if (!(isArray && options.indexOf(key) === -1)) {
        var array = [];
        var field = map[key];
        var list = stats[key].sort();
        var length = list.length;
        for (var i = 0; i < length; i++) {
          var object = {};
          var item = list[i];
          var lastIndex = list.lastIndexOf(item);
          object[field] = item;
          object['count'] = lastIndex - i + 1;
          array.push(object);
          i = lastIndex;
        }
        array.sort(function (a, b) {
          return b.count - a.count;
        });
        stats[key] = array;
      }
    }
  }
  return stats;
};

// Number of eprints by categories (2014-08-19)
exports.categories = [
  {
    category: 'astro-ph',
    count: 105380
  },
  {
    category: 'astro-ph.GA',
    count: 13989
  },
  {
    category: 'astro-ph.CO',
    count: 30638
  },
  {
    category: 'astro-ph.EP',
    count: 6975
  },
  {
    category: 'astro-ph.HE',
    count: 15952
  },
  {
    category: 'astro-ph.IM',
    count: 7082
  },
  {
    category: 'astro-ph.SR',
    count: 19833
  },
  {
    category: 'cond-mat',
    count: 14215
  },
  {
    category: 'cond-mat.dis-nn',
    count: 13411
  },
  {
    category: 'mtrl-th',
    count: 262
  },
  {
    category: 'cond-mat.mtrl-sci',
    count: 36017
  },
  {
    category: 'cond-mat.mes-hall',
    count: 37896
  },
  {
    category: 'cond-mat.other',
    count: 10700
  },
  {
    category: 'cond-mat.quant-gas',
    count: 6958
  },
  {
    category: 'cond-mat.soft',
    count: 18311
  },
  {
    category: 'cond-mat.stat-mech',
    count: 41063
  },
  {
    category: 'cond-mat.str-el',
    count: 36608
  },
  {
    category: 'supr-con',
    count: 175
  },
  {
    category: 'cond-mat.supr-con',
    count: 25611
  },
  {
    category: 'gr-qc',
    count: 54189
  },
  {
    category: 'hep-ex',
    count: 26453
  },
  {
    category: 'hep-lat',
    count: 17599
  },
  {
    category: 'hep-ph',
    count: 110789
  },
  {
    category: 'hep-th',
    count: 99745
  },
  {
    category: 'math-ph',
    count: 38949
  },
  {
    category: 'adap-org',
    count: 584
  },
  {
    category: 'nlin.AO',
    count: 3209
  },
  {
    category: 'comp-gas',
    count: 221
  },
  {
    category: 'nlin.CG',
    count: 865
  },
  {
    category: 'chao-dyn',
    count: 2398
  },
  {
    category: 'nlin.CD',
    count: 9887
  },
  {
    category: 'solv-int',
    count: 1413
  },
  {
    category: 'nlin.SI',
    count: 7093
  },
  {
    category: 'patt-sol',
    count: 650
  },
  {
    category: 'nlin.PS',
    count: 4793
  },
  {
    category: 'nucl-ex',
    count: 12793
  },
  {
    category: 'nucl-th',
    count: 33292
  },
  {
    category: 'acc-phys',
    count: 50
  },
  {
    category: 'physics.acc-ph',
    count: 3177
  },
  {
    category: 'ao-sci',
    count: 17
  },
  {
    category: 'physics.ao-ph',
    count: 1948
  },
  {
    category: 'atom-ph',
    count: 123
  },
  {
    category: 'physics.atom-ph',
    count: 9045
  },
  {
    category: 'physics.atm-clus',
    count: 1379
  },
  {
    category: 'physics.bio-ph',
    count: 5694
  },
  {
    category: 'chem-ph',
    count: 251
  },
  {
    category: 'physics.chem-ph',
    count: 6398
  },
  {
    category: 'physics.class-ph',
    count: 4064
  },
  {
    category: 'physics.comp-ph',
    count: 5915
  },
  {
    category: 'bayes-an',
    count: 16
  },
  {
    category: 'physics.data-an',
    count: 4386
  },
  {
    category: 'physics.flu-dyn',
    count: 7310
  },
  {
    category: 'physics.gen-ph',
    count: 6895
  },
  {
    category: 'physics.geo-ph',
    count: 2283
  },
  {
    category: 'physics.hist-ph',
    count: 1809
  },
  {
    category: 'physics.ins-det',
    count: 5787
  },
  {
    category: 'physics.med-ph',
    count: 1325
  },
  {
    category: 'physics.optics',
    count: 12869
  },
  {
    category: 'physics.ed-ph',
    count: 1437
  },
  {
    category: 'physics.soc-ph',
    count: 7790
  },
  {
    category: 'plasm-ph',
    count: 38
  },
  {
    category: 'physics.plasm-ph',
    count: 5468
  },
  {
    category: 'physics.pop-ph',
    count: 1062
  },
  {
    category: 'physics.space-ph',
    count: 1844
  },
  {
    category: 'quant-ph',
    count: 61765
  },
  {
    category: 'alg-geom',
    count: 1423
  },
  {
    category: 'math.AG',
    count: 24487
  },
  {
    category: 'math.AT',
    count: 6246
  },
  {
    category: 'math.AP',
    count: 17837
  },
  {
    category: 'math.CT',
    count: 2890
  },
  {
    category: 'math.CA',
    count: 8539
  },
  {
    category: 'math.CO',
    count: 21857
  },
  {
    category: 'math.AC',
    count: 5567
  },
  {
    category: 'math.CV',
    count: 6884
  },
  {
    category: 'dg-ga',
    count: 732
  },
  {
    category: 'math.DG',
    count: 19162
  },
  {
    category: 'math.DS',
    count: 12340
  },
  {
    category: 'funct-an',
    count: 427
  },
  {
    category: 'math.FA',
    count: 11293
  },
  {
    category: 'math.GM',
    count: 1717
  },
  {
    category: 'math.GN',
    count: 1958
  },
  {
    category: 'math.GT',
    count: 10542
  },
  {
    category: 'math.GR',
    count: 8924
  },
  {
    category: 'math.HO',
    count: 1259
  },
  {
    category: 'math.IT',
    count: 13191
  },
  {
    category: 'math.KT',
    count: 2810
  },
  {
    category: 'math.LO',
    count: 4626
  },
  {
    category: 'math.MP',
    count: 38949
  },
  {
    category: 'math.MG',
    count: 3931
  },
  {
    category: 'math.NT',
    count: 14926
  },
  {
    category: 'math.NA',
    count: 6745
  },
  {
    category: 'math.OA',
    count: 6142
  },
  {
    category: 'math.OC',
    count: 7505
  },
  {
    category: 'math.PR',
    count: 20281
  },
  {
    category: 'q-alg',
    count: 1578
  },
  {
    category: 'math.QA',
    count: 11600
  },
  {
    category: 'math.RT',
    count: 10671
  },
  {
    category: 'math.RA',
    count: 7073
  },
  {
    category: 'math.SP',
    count: 3928
  },
  {
    category: 'math.ST',
    count: 7105
  },
  {
    category: 'math.SG',
    count: 4529
  },
  {
    category: 'cs.AI',
    count: 6763
  },
  {
    category: 'cmp-lg',
    count: 894
  },
  {
    category: 'cs.CL',
    count: 2762
  },
  {
    category: 'cs.CC',
    count: 3759
  },
  {
    category: 'cs.CE',
    count: 1530
  },
  {
    category: 'cs.CG',
    count: 1840
  },
  {
    category: 'cs.GT',
    count: 2459
  },
  {
    category: 'cs.CV',
    count: 3294
  },
  {
    category: 'cs.CY',
    count: 1638
  },
  {
    category: 'cs.CR',
    count: 3914
  },
  {
    category: 'cs.DS',
    count: 5830
  },
  {
    category: 'cs.DB',
    count: 2045
  },
  {
    category: 'cs.DL',
    count: 1351
  },
  {
    category: 'cs.DM',
    count: 4250
  },
  {
    category: 'cs.DC',
    count: 3540
  },
  {
    category: 'cs.ET',
    count: 372
  },
  {
    category: 'cs.FL',
    count: 1227
  },
  {
    category: 'cs.GL',
    count: 111
  },
  {
    category: 'cs.GR',
    count: 427
  },
  {
    category: 'cs.AR',
    count: 536
  },
  {
    category: 'cs.HC',
    count: 1140
  },
  {
    category: 'cs.IR',
    count: 2031
  },
  {
    category: 'cs.IT',
    count: 13191
  },
  {
    category: 'cs.LG',
    count: 5340
  },
  {
    category: 'cs.LO',
    count: 4656
  },
  {
    category: 'cs.MS',
    count: 613
  },
  {
    category: 'cs.MA',
    count: 958
  },
  {
    category: 'cs.MM',
    count: 715
  },
  {
    category: 'cs.NI',
    count: 5529
  },
  {
    category: 'cs.NE',
    count: 1741
  },
  {
    category: 'cs.NA',
    count: 1174
  },
  {
    category: 'cs.OS',
    count: 240
  },
  {
    category: 'cs.OH',
    count: 1237
  },
  {
    category: 'cs.PF',
    count: 793
  },
  {
    category: 'cs.PL',
    count: 1851
  },
  {
    category: 'cs.RO',
    count: 1041
  },
  {
    category: 'cs.SI',
    count: 3474
  },
  {
    category: 'cs.SE',
    count: 2356
  },
  {
    category: 'cs.SD',
    count: 249
  },
  {
    category: 'cs.SC',
    count: 861
  },
  {
    category: 'cs.SY',
    count: 2239
  },
  {
    category: 'q-bio',
    count: 1356
  },
  {
    category: 'q-bio.BM',
    count: 2380
  },
  {
    category: 'q-bio.CB',
    count: 857
  },
  {
    category: 'q-bio.GN',
    count: 1337
  },
  {
    category: 'q-bio.MN',
    count: 1695
  },
  {
    category: 'q-bio.NC',
    count: 2110
  },
  {
    category: 'q-bio.OT',
    count: 536
  },
  {
    category: 'q-bio.PE',
    count: 3995
  },
  {
    category: 'q-bio.QM',
    count: 2959
  },
  {
    category: 'q-bio.SC',
    count: 789
  },
  {
    category: 'q-bio.TO',
    count: 570
  },
  {
    category: 'q-fin.CP',
    count: 673
  },
  {
    category: 'q-fin.EC',
    count: 27
  },
  {
    category: 'q-fin.GN',
    count: 1166
  },
  {
    category: 'q-fin.MF',
    count: 54
  },
  {
    category: 'q-fin.PM',
    count: 570
  },
  {
    category: 'q-fin.PR',
    count: 982
  },
  {
    category: 'q-fin.RM',
    count: 666
  },
  {
    category: 'q-fin.ST',
    count: 1484
  },
  {
    category: 'q-fin.TR',
    count: 591
  },
  {
    category: 'stat.AP',
    count: 3110
  },
  {
    category: 'stat.CO',
    count: 1475
  },
  {
    category: 'stat.ML',
    count: 4098
  },
  {
    category: 'stat.ME',
    count: 3879
  },
  {
    category: 'stat.OT',
    count: 189
  },
  {
    category: 'stat.TH',
    count: 7105
  }
];
