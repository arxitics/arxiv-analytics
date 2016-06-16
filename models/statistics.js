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

// arXiv monthly submission rates (2015-04-17)
exports.submissions = [
  {
    month: '1991-08',
    count: 27
  },
  {
    month: '1991-09',
    count: 58
  },
  {
    month: '1991-10',
    count: 76
  },
  {
    month: '1991-11',
    count: 64
  },
  {
    month: '1991-12',
    count: 78
  },
  {
    month: '1992-01',
    count: 88
  },
  {
    month: '1992-02',
    count: 124
  },
  {
    month: '1992-03',
    count: 117
  },
  {
    month: '1992-04',
    count: 184
  },
  {
    month: '1992-05',
    count: 226
  },
  {
    month: '1992-06',
    count: 232
  },
  {
    month: '1992-07',
    count: 274
  },
  {
    month: '1992-08',
    count: 223
  },
  {
    month: '1992-09',
    count: 315
  },
  {
    month: '1992-10',
    count: 372
  },
  {
    month: '1992-11',
    count: 437
  },
  {
    month: '1992-12',
    count: 394
  },
  {
    month: '1993-01',
    count: 364
  },
  {
    month: '1993-02',
    count: 412
  },
  {
    month: '1993-03',
    count: 495
  },
  {
    month: '1993-04',
    count: 488
  },
  {
    month: '1993-05',
    count: 531
  },
  {
    month: '1993-06',
    count: 520
  },
  {
    month: '1993-07',
    count: 608
  },
  {
    month: '1993-08',
    count: 516
  },
  {
    month: '1993-09',
    count: 502
  },
  {
    month: '1993-10',
    count: 642
  },
  {
    month: '1993-11',
    count: 698
  },
  {
    month: '1993-12',
    count: 723
  },
  {
    month: '1994-01',
    count: 582
  },
  {
    month: '1994-02',
    count: 634
  },
  {
    month: '1994-03',
    count: 729
  },
  {
    month: '1994-04',
    count: 699
  },
  {
    month: '1994-05',
    count: 823
  },
  {
    month: '1994-06',
    count: 856
  },
  {
    month: '1994-07',
    count: 840
  },
  {
    month: '1994-08',
    count: 746
  },
  {
    month: '1994-09',
    count: 851
  },
  {
    month: '1994-10',
    count: 909
  },
  {
    month: '1994-11',
    count: 1075
  },
  {
    month: '1994-12',
    count: 1022
  },
  {
    month: '1995-01',
    count: 897
  },
  {
    month: '1995-02',
    count: 941
  },
  {
    month: '1995-03',
    count: 1131
  },
  {
    month: '1995-04',
    count: 882
  },
  {
    month: '1995-05',
    count: 1088
  },
  {
    month: '1995-06',
    count: 1168
  },
  {
    month: '1995-07',
    count: 992
  },
  {
    month: '1995-08',
    count: 1008
  },
  {
    month: '1995-09',
    count: 1104
  },
  {
    month: '1995-10',
    count: 1206
  },
  {
    month: '1995-11',
    count: 1134
  },
  {
    month: '1995-12',
    count: 1110
  },
  {
    month: '1996-01',
    count: 1029
  },
  {
    month: '1996-02',
    count: 1053
  },
  {
    month: '1996-03',
    count: 1146
  },
  {
    month: '1996-04',
    count: 1171
  },
  {
    month: '1996-05',
    count: 1316
  },
  {
    month: '1996-06',
    count: 1277
  },
  {
    month: '1996-07',
    count: 1392
  },
  {
    month: '1996-08',
    count: 1375
  },
  {
    month: '1996-09',
    count: 1453
  },
  {
    month: '1996-10',
    count: 1490
  },
  {
    month: '1996-11',
    count: 1375
  },
  {
    month: '1996-12',
    count: 1434
  },
  {
    month: '1997-01',
    count: 1277
  },
  {
    month: '1997-02',
    count: 1328
  },
  {
    month: '1997-03',
    count: 1387
  },
  {
    month: '1997-04',
    count: 1434
  },
  {
    month: '1997-05',
    count: 1549
  },
  {
    month: '1997-06',
    count: 1678
  },
  {
    month: '1997-07',
    count: 1763
  },
  {
    month: '1997-08',
    count: 1411
  },
  {
    month: '1997-09',
    count: 1845
  },
  {
    month: '1997-10',
    count: 1981
  },
  {
    month: '1997-11',
    count: 1685
  },
  {
    month: '1997-12',
    count: 1918
  },
  {
    month: '1998-01',
    count: 1712
  },
  {
    month: '1998-02',
    count: 1668
  },
  {
    month: '1998-03',
    count: 1908
  },
  {
    month: '1998-04',
    count: 1735
  },
  {
    month: '1998-05',
    count: 1916
  },
  {
    month: '1998-06',
    count: 2083
  },
  {
    month: '1998-07',
    count: 2089
  },
  {
    month: '1998-08',
    count: 1820
  },
  {
    month: '1998-09',
    count: 2405
  },
  {
    month: '1998-10',
    count: 2297
  },
  {
    month: '1998-11',
    count: 2228
  },
  {
    month: '1998-12',
    count: 2196
  },
  {
    month: '1999-01',
    count: 1827
  },
  {
    month: '1999-02',
    count: 1916
  },
  {
    month: '1999-03',
    count: 2379
  },
  {
    month: '1999-04',
    count: 2147
  },
  {
    month: '1999-05',
    count: 2204
  },
  {
    month: '1999-06',
    count: 2422
  },
  {
    month: '1999-07',
    count: 2391
  },
  {
    month: '1999-08',
    count: 2138
  },
  {
    month: '1999-09',
    count: 2490
  },
  {
    month: '1999-10',
    count: 2565
  },
  {
    month: '1999-11',
    count: 2489
  },
  {
    month: '1999-12',
    count: 2587
  },
  {
    month: '2000-01',
    count: 2359
  },
  {
    month: '2000-02',
    count: 2366
  },
  {
    month: '2000-03',
    count: 2591
  },
  {
    month: '2000-04',
    count: 2068
  },
  {
    month: '2000-05',
    count: 2718
  },
  {
    month: '2000-06',
    count: 2436
  },
  {
    month: '2000-07',
    count: 2445
  },
  {
    month: '2000-08',
    count: 2612
  },
  {
    month: '2000-09',
    count: 2515
  },
  {
    month: '2000-10',
    count: 2910
  },
  {
    month: '2000-11',
    count: 2853
  },
  {
    month: '2000-12',
    count: 2653
  },
  {
    month: '2001-01',
    count: 2577
  },
  {
    month: '2001-02',
    count: 2426
  },
  {
    month: '2001-03',
    count: 2705
  },
  {
    month: '2001-04',
    count: 2600
  },
  {
    month: '2001-05',
    count: 2908
  },
  {
    month: '2001-06',
    count: 2866
  },
  {
    month: '2001-07',
    count: 2757
  },
  {
    month: '2001-08',
    count: 2422
  },
  {
    month: '2001-09',
    count: 2545
  },
  {
    month: '2001-10',
    count: 3400
  },
  {
    month: '2001-11',
    count: 3239
  },
  {
    month: '2001-12',
    count: 2699
  },
  {
    month: '2002-01',
    count: 2712
  },
  {
    month: '2002-02',
    count: 2565
  },
  {
    month: '2002-03',
    count: 2663
  },
  {
    month: '2002-04',
    count: 2849
  },
  {
    month: '2002-05',
    count: 3087
  },
  {
    month: '2002-06',
    count: 2695
  },
  {
    month: '2002-07',
    count: 3263
  },
  {
    month: '2002-08',
    count: 2725
  },
  {
    month: '2002-09',
    count: 3312
  },
  {
    month: '2002-10',
    count: 3531
  },
  {
    month: '2002-11',
    count: 3437
  },
  {
    month: '2002-12',
    count: 3221
  },
  {
    month: '2003-01',
    count: 2926
  },
  {
    month: '2003-02',
    count: 2881
  },
  {
    month: '2003-03',
    count: 3018
  },
  {
    month: '2003-04',
    count: 3102
  },
  {
    month: '2003-05',
    count: 3267
  },
  {
    month: '2003-06',
    count: 3463
  },
  {
    month: '2003-07',
    count: 3418
  },
  {
    month: '2003-08',
    count: 2741
  },
  {
    month: '2003-09',
    count: 3735
  },
  {
    month: '2003-10',
    count: 3841
  },
  {
    month: '2003-11',
    count: 3349
  },
  {
    month: '2003-12',
    count: 3661
  },
  {
    month: '2004-01',
    count: 3071
  },
  {
    month: '2004-02',
    count: 3276
  },
  {
    month: '2004-03',
    count: 3603
  },
  {
    month: '2004-04',
    count: 3368
  },
  {
    month: '2004-05',
    count: 3553
  },
  {
    month: '2004-06',
    count: 3710
  },
  {
    month: '2004-07',
    count: 3679
  },
  {
    month: '2004-08',
    count: 3294
  },
  {
    month: '2004-09',
    count: 3939
  },
  {
    month: '2004-10',
    count: 4086
  },
  {
    month: '2004-11',
    count: 4152
  },
  {
    month: '2004-12',
    count: 3994
  },
  {
    month: '2005-01',
    count: 3493
  },
  {
    month: '2005-02',
    count: 3250
  },
  {
    month: '2005-03',
    count: 3881
  },
  {
    month: '2005-04',
    count: 3693
  },
  {
    month: '2005-05',
    count: 3779
  },
  {
    month: '2005-06',
    count: 3984
  },
  {
    month: '2005-07',
    count: 3839
  },
  {
    month: '2005-08',
    count: 3775
  },
  {
    month: '2005-09',
    count: 4329
  },
  {
    month: '2005-10',
    count: 4439
  },
  {
    month: '2005-11',
    count: 4292
  },
  {
    month: '2005-12',
    count: 4083
  },
  {
    month: '2006-01',
    count: 3858
  },
  {
    month: '2006-02',
    count: 3520
  },
  {
    month: '2006-03',
    count: 4213
  },
  {
    month: '2006-04',
    count: 3474
  },
  {
    month: '2006-05',
    count: 4204
  },
  {
    month: '2006-06',
    count: 4139
  },
  {
    month: '2006-07',
    count: 4197
  },
  {
    month: '2006-08',
    count: 4064
  },
  {
    month: '2006-09',
    count: 4275
  },
  {
    month: '2006-10',
    count: 5133
  },
  {
    month: '2006-11',
    count: 4854
  },
  {
    month: '2006-12',
    count: 4296
  },
  {
    month: '2007-01',
    count: 4653
  },
  {
    month: '2007-02',
    count: 4164
  },
  {
    month: '2007-03',
    count: 4493
  },
  {
    month: '2007-04',
    count: 4003
  },
  {
    month: '2007-05',
    count: 4684
  },
  {
    month: '2007-06',
    count: 4484
  },
  {
    month: '2007-07',
    count: 4681
  },
  {
    month: '2007-08',
    count: 4414
  },
  {
    month: '2007-09',
    count: 4682
  },
  {
    month: '2007-10',
    count: 5945
  },
  {
    month: '2007-11',
    count: 5029
  },
  {
    month: '2007-12',
    count: 4406
  },
  {
    month: '2008-01',
    count: 4970
  },
  {
    month: '2008-02',
    count: 4463
  },
  {
    month: '2008-03',
    count: 4519
  },
  {
    month: '2008-04',
    count: 4898
  },
  {
    month: '2008-05',
    count: 4836
  },
  {
    month: '2008-06',
    count: 4980
  },
  {
    month: '2008-07',
    count: 5139
  },
  {
    month: '2008-08',
    count: 4160
  },
  {
    month: '2008-09',
    count: 5287
  },
  {
    month: '2008-10',
    count: 5773
  },
  {
    month: '2008-11',
    count: 4774
  },
  {
    month: '2008-12',
    count: 5116
  },
  {
    month: '2009-01',
    count: 4975
  },
  {
    month: '2009-02',
    count: 4903
  },
  {
    month: '2009-03',
    count: 5547
  },
  {
    month: '2009-04',
    count: 4930
  },
  {
    month: '2009-05',
    count: 4955
  },
  {
    month: '2009-06',
    count: 5614
  },
  {
    month: '2009-07',
    count: 5606
  },
  {
    month: '2009-08',
    count: 4597
  },
  {
    month: '2009-09',
    count: 5696
  },
  {
    month: '2009-10',
    count: 5957
  },
  {
    month: '2009-11',
    count: 5730
  },
  {
    month: '2009-12',
    count: 5537
  },
  {
    month: '2010-01',
    count: 5471
  },
  {
    month: '2010-02',
    count: 5048
  },
  {
    month: '2010-03',
    count: 6133
  },
  {
    month: '2010-04',
    count: 5602
  },
  {
    month: '2010-05',
    count: 5737
  },
  {
    month: '2010-06',
    count: 5963
  },
  {
    month: '2010-07',
    count: 5521
  },
  {
    month: '2010-08',
    count: 5399
  },
  {
    month: '2010-09',
    count: 6232
  },
  {
    month: '2010-10',
    count: 6304
  },
  {
    month: '2010-11',
    count: 6676
  },
  {
    month: '2010-12',
    count: 6045
  },
  {
    month: '2011-01',
    count: 6081
  },
  {
    month: '2011-02',
    count: 5774
  },
  {
    month: '2011-03',
    count: 6286
  },
  {
    month: '2011-04',
    count: 5711
  },
  {
    month: '2011-05',
    count: 6374
  },
  {
    month: '2011-06',
    count: 6357
  },
  {
    month: '2011-07',
    count: 6046
  },
  {
    month: '2011-08',
    count: 6331
  },
  {
    month: '2011-09',
    count: 6937
  },
  {
    month: '2011-10',
    count: 6930
  },
  {
    month: '2011-11',
    count: 7319
  },
  {
    month: '2011-12',
    count: 6432
  },
  {
    month: '2012-01',
    count: 6687
  },
  {
    month: '2012-02',
    count: 6685
  },
  {
    month: '2012-03',
    count: 6903
  },
  {
    month: '2012-04',
    count: 6739
  },
  {
    month: '2012-05',
    count: 7092
  },
  {
    month: '2012-06',
    count: 7121
  },
  {
    month: '2012-07',
    count: 7358
  },
  {
    month: '2012-08',
    count: 6592
  },
  {
    month: '2012-09',
    count: 6630
  },
  {
    month: '2012-10',
    count: 8452
  },
  {
    month: '2012-11',
    count: 7370
  },
  {
    month: '2012-12',
    count: 6974
  },
  {
    month: '2013-01',
    count: 7750
  },
  {
    month: '2013-02',
    count: 7317
  },
  {
    month: '2013-03',
    count: 7476
  },
  {
    month: '2013-04',
    count: 8135
  },
  {
    month: '2013-05',
    count: 7516
  },
  {
    month: '2013-06',
    count: 6944
  },
  {
    month: '2013-07',
    count: 8447
  },
  {
    month: '2013-08',
    count: 6833
  },
  {
    month: '2013-09',
    count: 7995
  },
  {
    month: '2013-10',
    count: 8658
  },
  {
    month: '2013-11',
    count: 7692
  },
  {
    month: '2013-12',
    count: 7878
  },
  {
    month: '2014-01',
    count: 8294
  },
  {
    month: '2014-02',
    count: 7374
  },
  {
    month: '2014-03',
    count: 8154
  },
  {
    month: '2014-04',
    count: 7855
  },
  {
    month: '2014-05',
    count: 7975
  },
  {
    month: '2014-06',
    count: 7874
  },
  {
    month: '2014-07',
    count: 8549
  },
  {
    month: '2014-08',
    count: 7119
  },
  {
    month: '2014-09',
    count: 8676
  },
  {
    month: '2014-10',
    count: 8871
  },
  {
    month: '2014-11',
    count: 8006
  },
  {
    month: '2014-12',
    count: 8770
  },
  {
    month: '2015-01',
    count: 7912
  },
  {
    month: '2015-02',
    count: 8054
  },
  {
    month: '2015-03',
    count: 9191
  },
  {
    month: '2015-04',
    count: 8367
  },
  {
    month: '2015-05',
    count: 8172
  },
  {
    month: '2015-06',
    count: 9217
  },
  {
    month: '2015-07',
    count: 8995
  },
  {
    month: '2015-08',
    count: 7983
  },
  {
    month: '2015-09',
    count: 9318
  },
  {
    month: '2015-10',
    count: 9223
  },
  {
    month: '2015-11',
    count: 9472
  },
  {
    month: '2015-12',
    count: 9376
  },
  {
    month: '2016-01',
    count: 8251
  },
  {
    month: '2016-02',
    count: 9142
  },
  {
    month: '2016-03',
    count: 9746
  },
  {
    month: '2016-04',
    count: 8948
  },
  {
    month: '2016-05',
    count: 8436
  }
];
