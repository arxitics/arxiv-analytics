/**
 * Eprint classification scheme.
 */

// Parse arXiv themes
exports.parse = function (themes) {
  var results = [];
  var object = {};
  var categories = exports.categories;
  if (Array.isArray(themes)) {
    themes.forEach(function (theme) {
      var parts = theme.split(/\s*\:\s*/);
      var category = parts[0];
      var topic = parts[1];
      if (categories.indexOf(category) !== -1) {
        if (object.hasOwnProperty(category)) {
          object[category].push(topic);
        } else {
          object[category] = [topic];
        }
      }
    });
  }
  for (var key in object) {
    if (object.hasOwnProperty(key)) {
      results.push({
        'category': key,
        'topics': object[key]
      });
    }
  }
  return results;
};

// Output arXiv themes
exports.output = function (themes) {
  var results = [];
  if (Array.isArray(themes)) {
    themes.forEach(function (theme) {
      results.push(theme.category + ': ' + theme.topics.join(', '));
    });
  }
  return results.join('; ');
};

// arXiv eprint categories
exports.categories = [
  'astro-ph.GA',
  'astro-ph.CO',
  'astro-ph.EP',
  'astro-ph.HE',
  'astro-ph.IM',
  'astro-ph.SR',
  'cond-mat.dis-nn',
  'cond-mat.mtrl-sci',
  'cond-mat.mes-hall',
  'cond-mat.other',
  'cond-mat.quant-gas',
  'cond-mat.soft',
  'cond-mat.stat-mech',
  'cond-mat.str-el',
  'cond-mat.supr-con',
  'gr-qc',
  'hep-ex',
  'hep-lat',
  'hep-ph',
  'hep-th',
  'math-ph',
  'nlin.AO',
  'nlin.CG',
  'nlin.CD',
  'nlin.SI',
  'nlin.PS',
  'nucl-ex',
  'nucl-th',
  'physics.acc-ph',
  'physics.ao-ph',
  'physics.atom-ph',
  'physics.atm-clus',
  'physics.bio-ph',
  'physics.chem-ph',
  'physics.class-ph',
  'physics.comp-ph',
  'physics.data-an',
  'physics.flu-dyn',
  'physics.gen-ph',
  'physics.geo-ph',
  'physics.hist-ph',
  'physics.ins-det',
  'physics.med-ph',
  'physics.optics',
  'physics.ed-ph',
  'physics.soc-ph',
  'physics.plasm-ph',
  'physics.pop-ph',
  'physics.space-ph',
  'quant-ph',
  'math.AG',
  'math.AT',
  'math.AP',
  'math.CT',
  'math.CA',
  'math.CO',
  'math.AC',
  'math.CV',
  'math.DG',
  'math.DS',
  'math.FA',
  'math.GM',
  'math.GN',
  'math.GT',
  'math.GR',
  'math.HO',
  'math.IT',
  'math.KT',
  'math.LO',
  'math.MP',
  'math.MG',
  'math.NT',
  'math.NA',
  'math.OA',
  'math.OC',
  'math.PR',
  'math.QA',
  'math.RT',
  'math.RA',
  'math.SP',
  'math.ST',
  'math.SG',
  'cs.AI',
  'cs.CL',
  'cs.CC',
  'cs.CE',
  'cs.CG',
  'cs.GT',
  'cs.CV',
  'cs.CY',
  'cs.CR',
  'cs.DS',
  'cs.DB',
  'cs.DL',
  'cs.DM',
  'cs.DC',
  'cs.ET',
  'cs.FL',
  'cs.GL',
  'cs.GR',
  'cs.AR',
  'cs.HC',
  'cs.IR',
  'cs.IT',
  'cs.LG',
  'cs.LO',
  'cs.MS',
  'cs.MA',
  'cs.MM',
  'cs.NI',
  'cs.NE',
  'cs.NA',
  'cs.OS',
  'cs.OH',
  'cs.PF',
  'cs.PL',
  'cs.RO',
  'cs.SI',
  'cs.SE',
  'cs.SD',
  'cs.SC',
  'cs.SY',
  'q-bio.BM',
  'q-bio.CB',
  'q-bio.GN',
  'q-bio.MN',
  'q-bio.NC',
  'q-bio.OT',
  'q-bio.PE',
  'q-bio.QM',
  'q-bio.SC',
  'q-bio.TO',
  'q-fin.CP',
  'q-fin.EC',
  'q-fin.GN',
  'q-fin.MF',
  'q-fin.PM',
  'q-fin.PR',
  'q-fin.RM',
  'q-fin.ST',
  'q-fin.TR',
  'stat.AP',
  'stat.CO',
  'stat.ML',
  'stat.ME',
  'stat.OT',
  'stat.TH'
];

// arXiv eprint archives
exports.archives = [
  'astro-ph',
  'cond-mat',
  'gr-qc',
  'hep-ex',
  'hep-lat',
  'hep-ph',
  'hep-th',
  'math-ph',
  'nlin',
  'nucl-ex',
  'nucl-th',
  'physics',
  'quant-ph',
  'math',
  'cs',
  'q-bio',
  'q-fin',
  'stat'
];

// arXiv eprint tags
exports.tags = [
  {
    tag: 'journal article',
    description: 'An article published in a journal.'
  },
  {
    tag: 'review article',
    description: 'An article that summarizes the work of a particular sub-field rather than reports on new results.'
  },
  {
    tag: 'expository article',
    description: 'A survery on a well specified topic written at a level accessible to non-experts.'
  },
  {
    tag: 'conference paper',
    description: 'A paper published in the context of an academic conference.'
  },
  {
    tag: 'commentary',
    description: 'An article expressing the authors\' view about a particular issue.'
  },
  {
    tag: 'book review',
    description: 'A form of literary criticism in which a book is analyzed based on content, style, and merit.'
  },
  {
    tag: 'book chapter',
    description: 'A individual chapter in an edited book or collection.'
  },
  {
    tag: 'monograph',
    description: 'A specialist work of writing on a single subject or an aspect of a subject.'
  },
  {
    tag: 'textbook',
    description: 'A manual of instruction in a branch of study.'
  },
  {
    tag: 'dissertation',
    description: 'A document submitted in support of candidature for an academic degree, also known as a thesis.'
  },
  {
    tag: 'research tool',
    description: 'A software package or module that helps conducting research.'
  },
  {
    tag: 'manual',
    description: 'A technical document intended to give assistance to people using a particular system, also known as a user guide.'
  },
  {
    tag: 'lecture note',
    description: 'A record of the lecture content in an accessible way.'
  },
  {
    tag: 'problem book',
    description: 'A textbook in which the material is organized as a series of problems, each with a complete solution given.'
  },
  {
    tag: 'popular level',
    description: 'An article accessible to the mass public without specialized knowledge.'
  },
  {
    tag: 'undergraduate level',
    description: 'An article accessible to undergraduate students.'
  },
  {
    tag: 'graduate level',
    description: 'An article accessible to graduate students and nonspecialist researchers.'
  },
  {
    tag: 'renowned paper',
    description: 'A paper whose number of citations is among the top 0.2% in the field.'
  },
  {
    tag: 'famous paper',
    description: 'A paper whose number of citations is among the top 0.4% in the field.'
  },
  {
    tag: 'well-known paper',
    description: 'A paper whose number of citations is among the top 1% in the field.'
  },
  {
    tag: 'featured article',
    description: 'An article with at least 100 ratings and an average rating score greater than or equal to 4.'
  },
  {
    tag: 'highlighted article',
    description: 'An article with at least 100 ratings and an average rating score greater than or equal to 3.'
  },
  {
    tag: 'kaleidoscope',
    description: 'An article containing aesthetically attractive images like the journal cover arts.'
  }
];

// arXiv eprint groups
exports.groups = [
  {
    group: 'Physics',
    archives: [
      {
        category: 'astro-ph',
        description: 'Astrophysics',
        initiated: '1992-04',
        themes: [
          {
            category: 'astro-ph.GA',
            description: 'Astrophysics of Galaxies',
            topics: [
              'active galactic nuclei',
              'cosmic dust',
              'galactic bulge',
              'galactic disk',
              'galactic dynamics',
              'galactic formation',
              'galactic halo',
              'galactic nebulae',
              'galactic nuclei',
              'galactic structure',
              'galaxy',
              'gravitational lens',
              'interstellar cloud',
              'interstellar medium',
              'Milky Way',
              'quasar',
              'star cluster',
              'supermassive black hole'
            ]
          },
          {
            category: 'astro-ph.CO',
            description: 'Cosmology and Nongalactic Astrophysics',
            topics: [
              'baryogenesis',
              'cosmic microwave background',
              'cosmic string',
              'cosmic void',
              'cosmological gravitational radiation',
              'cosmological parameter',
              'dark energy',
              'dark matter',
              'early universe',
              'extragalactic distance scale',
              'galaxy cluster',
              'galaxy group',
              'inflationary model',
              'intergalactic medium',
              'large-scale structure of the cosmos',
              'leptogenesis',
              'magnetic monopole',
              'particle astrophysics',
              'primordial black hole',
              'primordial element abundance',
              'supercluster',
              'weakly interacting massive particle'
            ]
          },
          {
            category: 'astro-ph.EP',
            description: 'Earth and Planetary Astrophysics',
            topics: [
              'asteroid',
              'comet',
              'extrasolar planet',
              'interplanetary medium',
              'meteorite',
              'planetary astrobiology',
              'planetary physics',
              'solar system'
            ]
          },
          {
            category: 'astro-ph.HE',
            description: 'High Energy Astrophysical Phenomena',
            topics: [
              'astrophysical jet',
              'black hole',
              'cosmic ray',
              'gamma-ray astronomy',
              'gamma-ray burst',
              'microquasar',
              'neutron star',
              'pulsar',
              'stellar remnant',
              'supernovae',
              'X-ray'
            ]
          },
          {
            category: 'astro-ph.IM',
            description: 'Instrumentation and Methods for Astrophysics',
            topics: [
              'data analysis',
              'database design',
              'detector design',
              'experiment proposal',
              'laboratory astrophysics',
              'software',
              'statistical method',
              'telescope design'
            ]
          },
          {
            category: 'astro-ph.SR',
            description: 'Solar and Stellar Astrophysics',
            topics: [
              'binary system',
              'brown dwarf',
              'cataclysmic variable',
              'corona',
              'gravitational wave',
              'helioseismology',
              'multiple system',
              'nebula',
              'planetary nebula',
              'protostar',
              'solar neutrino',
              'star formation',
              'stellar astrobiology',
              'stellar evolution',
              'stellar population',
              'stellar structure',
              'white dwarf'
            ]
          }
        ]
      },
      {
        category: 'cond-mat',
        description: 'Condensed Matter',
        initiated: '1992-04',
        themes: [
          {
            category: 'cond-mat.dis-nn',
            description: 'Disordered Systems and Neural Networks',
            topics: [
              'neural network',
              'random field',
              'random matrix',
              'spin glass'
            ]
          },
          {
            category: 'cond-mat.mtrl-sci',
            description: 'Materials Science',
            subsumption: {
              category: 'mtrl-th',
              description: 'Materials Theory'
            },
            topics: [
              'adsorption',
              'crystallographic defect',
              'electrical property',
              'magnetic property',
              'materials structure',
              'materials synthesis',
              'mechanical property',
              'optical property',
              'phonon',
              'structural phase transition',
              'surface physics',
              'thermal property',
              'transport property'
            ]
          },
          {
            category: 'cond-mat.mes-hall',
            description: 'Mesoscale and Nanoscale Physics',
            topics: [
              '2d electron gas',
              'graphene',
              'low-dimensional system',
              'nanotube',
              'plasmonic nanostructure',
              'quantum dot',
              'quantum Hall effect',
              'quantum well',
              'quantum wire',
              'semiconducting nanostructure',
              'single electronics',
              'spintronics',
              'topological insulator'
            ]
          },
          {
            category: 'cond-mat.other',
            description: 'Other Condensed Matter',
            topics: [
              'interdisciplinarity'
            ]
          },
          {
            category: 'cond-mat.quant-gas',
            description: 'Quantum Gases',
            topics: [
              'Bose-Einstein condensation',
              'Feshbach resonance',
              'macroscopic interference phenomenon',
              'optical lattice',
              'quantum simulation',
              'spinor condensate',
              'ultracold atom'
            ]
          },
          {
            category: 'cond-mat.soft',
            description: 'Soft Condensed Matter',
            topics: [
              'biomaterial',
              'glass transition',
              'granular material',
              'jamming transition',
              'liquid crystal',
              'membrane',
              'polymer'
            ]
          },
          {
            category: 'cond-mat.stat-mech',
            description: 'Statistical Mechanics',
            topics: [
              'field theory',
              'integrable model',
              'non-equilibrium phenomena',
              'phase transition',
              'renormalization group',
              'thermodynamics',
              'turbulence'
            ]
          },
          {
            category: 'cond-mat.str-el',
            description: 'Strongly Correlated Electrons',
            topics: [
              'charge density wave',
              'metal-insulator transition',
              'non-Fermi liquid',
              'quantum criticality',
              'quantum magnetism',
              'spin liquid',
              'topological order'
            ]
          },
          {
            category: 'cond-mat.supr-con',
            description: 'Superconductivity',
            subsumption: {
              category: 'supr-con'
            },
            topics: [
              'BCS theory',
              'heavy-fermion superconductor',
              'high-temperature superconductivity',
              'iron-based superconductor',
              'phenomenological theory',
              'superconducting property',
              'superfluidity',
              'topological superconductor'
            ]
          }
        ]
      },
      {
        category: 'gr-qc',
        description: 'General Relativity and Quantum Cosmology',
        initiated: '1992-07',
        topics: [
          'black hole thermodynamics',
          'black hole',
          'brane cosmology',
          'Gauss-Bonnet gravity',
          'general relativity',
          'Horava-Lifshitz gravity',
          'loop quantum cosmology',
          'loop quantum gravity',
          'massive gravity',
          'numerical relativity',
          'quantum cosmology',
          'quantum gravity',
          'quantum spacetime',
          'semi-classical quantum gravity',
          'supergravity'
        ]
      },
      {
        category: 'hep-ex',
        description: 'High Energy Physics - Experiment',
        initiated: '1994-04',
        topics: [
          'Large Hadron Collider',
          'Relativistic Heavy Ion Collider'
        ]
      },
      {
        category: 'hep-lat',
        description: 'High Energy Physics - Lattice',
        initiated: '1992-02',
        topics: [
          'lattice gauge theory',
          'lattice QCD',
          'Monte Carlo method',
          'numerical sign problem'
        ]
      },
      {
        category: 'hep-ph',
        description: 'High Energy Physics - Phenomenology',
        initiated: '1992-03',
        topics: [
          'CP violation',
          'effective field theory',
          'electroweak interaction',
          'extra dimension',
          'heavy-flavor quark',
          'Higgs boson',
          'Minimal Supersymmetric Standard Model',
          'neutrino oscillation',
          'non-perturbative QCD',
          'perturbative calculation',
          'phenomenological quark model',
          'QCD factorization',
          'QCD matter',
          'QCD sum rule',
          'quantum chromodynamics',
          'quantum electrodynamics',
          'quark–gluon plasma',
          'Standard Model',
          'strong interaction',
          'supersymmetry'
        ]
      },
      {
        category: 'hep-th',
        description: 'High Energy Physics - Theory',
        initiated: '1991-08',
        topics: [
          'AdS/CFT correspondence',
          'conformal field theory',
          'D-brane',
          'gauge theory',
          'grand unified theory',
          'holographic superconductor',
          'Liouville field theory',
          'M-theory',
          'maximally helicity violating amplitude',
          'noncommutative field theory',
          'quantum field theory',
          'renormalization',
          'string duality',
          'string field theory',
          'string phenomenology',
          'string theory',
          'supersymmetric gauge theory',
          'topological field theory',
          'topological string theory',
          'twistor string theory',
          'Yang-Mills theory'
        ]
      },
      {
        category: 'math-ph',
        description: 'Mathematical Physics',
        initiated: '1996-09',
        topics: [

        ]
      },
      {
        category: 'nlin',
        description: 'Nonlinear Sciences',
        initiated: '1993-06',
        themes: [
          {
            category: 'nlin.AO',
            description: 'Adaptation and Self-Organizing Systems',
            subsumption: {
              category: 'adap-org'
            },
            topics: [
              'adaptation',
              'fluctuating system',
              'interacting particle system',
              'machine learning',
              'self-organizing system',
              'statistical physics',
              'stochastic process'
            ]
          },
          {
            category: 'nlin.CG',
            description: 'Cellular Automata and Lattice Gases',
            subsumption: {
              category: 'comp-gas'
            },
            topics: [
              'cellular automaton',
              'computational method',
              'lattice gas',
              'signal processing',
              'time series analysis',
              'wavelet'
            ]
          },
          {
            category: 'nlin.CD',
            description: 'Chaotic Dynamics',
            subsumption: {
              category: 'chao-dyn'
            },
            topics: [
              'chaos thoery',
              'cycle expansion',
              'dynamical system',
              'quantum chaos',
              'topological dynamics',
              'turbulence'
            ]
          },
          {
            category: 'nlin.SI',
            description: 'Exactly Solvable and Integrable Systems',
            subsumption: {
              category: 'solv-int'
            },
            topics: [
              'exactly solvable system',
              'integrable discrete map',
              'integrable ODE',
              'integrable PDE',
              'integrable quantum system',
              'Painleve analysis',
              'solvable lattice model'
            ]
          },
          {
            category: 'nlin.PS',
            description: 'Pattern Formation and Solitons',
            subsumption: {
              category: 'patt-sol'
            },
            topics: [
              'coherent structure',
              'pattern formation',
              'soliton'
            ]
          }
        ]
      },
      {
        category: 'nucl-ex',
        description: 'Nuclear Experiment',
        initiated: '1994-12',
        topics: [
          'electromagnetic transition',
          'hypernuclei',
          'mesic nuclei',
          'nucleon structure',
          'nucleosynthesis',
          'photonuclear reaction'
        ]
      },
      {
        category: 'nucl-th',
        description: 'Nuclear Theory',
        initiated: '1992-10',
        topics: [
          'cluster model',
          'collective model',
          'effective interaction',
          'few-body system',
          'generalized parton distribution',
          'Nuclear Density Functional Theory',
          'parton distribution function',
          'shell model',
          'structure function'
        ]
      },
      {
        category: 'physics',
        description: 'Physics',
        initiated: '1996-10',
        themes: [
          {
            category: 'physics.acc-ph',
            description: 'Accelerator Physics',
            topics: [

            ]
          },
          {
            category: 'physics.ao-ph',
            description: 'Atmospheric and Oceanic Physics',
            topics: [

            ]
          },
          {
            category: 'physics.atom-ph',
            description: 'Atomic Physics',
            topics: [

            ]
          },
          {
            category: 'physics.atm-clus',
            description: 'Atomic and Molecular Clusters',
            topics: [

            ]
          },
          {
            category: 'physics.bio-ph',
            description: 'Biological Physics',
            topics: [

            ]
          },
          {
            category: 'physics.chem-ph',
            description: 'Chemical Physics',
            topics: [

            ]
          },
          {
            category: 'physics.class-ph',
            description: 'Classical Physics',
            topics: [

            ]
          },
          {
            category: 'physics.comp-ph',
            description: 'Computational Physics',
            topics: [

            ]
          },
          {
            category: 'physics.data-an',
            description: 'Data Analysis, Statistics and Probability',
            topics: [

            ]
          },
          {
            category: 'physics.flu-dyn',
            description: 'Fluid Dynamics',
            topics: [

            ]
          },
          {
            category: 'physics.gen-ph',
            description: 'General Physics',
            topics: [

            ]
          },
          {
            category: 'physics.geo-ph',
            description: 'Geophysics',
            topics: [

            ]
          },
          {
            category: 'physics.hist-ph',
            description: 'History and Philosophy of Physics',
            topics: [

            ]
          },
          {
            category: 'physics.ins-det',
            description: 'Instrumentation and Detectors',
            topics: [

            ]
          },
          {
            category: 'physics.med-ph',
            description: 'Medical Physics',
            topics: [

            ]
          },
          {
            category: 'physics.optics',
            description: 'Optics',
            topics: [

            ]
          },
          {
            category: 'physics.ed-ph',
            description: 'Physics Education',
            topics: [

            ]
          },
          {
            category: 'physics.soc-ph',
            description: 'Physics and Society',
            topics: [

            ]
          },
          {
            category: 'physics.plasm-ph',
            description: 'Plasma Physics',
            topics: [

            ]
          },
          {
            category: 'physics.pop-ph',
            description: 'Popular Physics',
            topics: [

            ]
          },
          {
            category: 'physics.space-ph',
            description: 'Space Physics',
            topics: [

            ]
          }
        ]
      },
      {
        category: 'quant-ph',
        description: 'Quantum Physics',
        initiated: '1994-12',
        topics: [
          'multipartite entanglement',
          'quantum algorithm',
          'quantum communication',
          'quantum cryptography',
          'quantum decoherence',
          'quantum entanglement',
          'quantum information theory',
          'quantum mechanics',
          'quantum optics',
          'quantum Zeno effect',
          'supersymmetric quantum mechanics'
        ]
      }
    ]
  },
  {
    group: 'Mathematics',
    archives: [
      {
        category: 'math',
        description: 'Mathematics',
        initiated: '1992-02',
        themes: [
          {
            category: 'math.AG',
            description: 'Algebraic Geometry',
            subsumption: {
              category: 'alg-geom'
            },
            topics: [
              'algebraic geometry',
              'algebraic stack',
              'algebraic variety',
              'birational geometry',
              'complex geometry',
              'diophantine geometry',
              'enumerative geometry',
              'moduli space',
              'quantum cohomology',
              'scheme theory',
              'sheaf theory',
              'tropical geometry'
            ]
          },
          {
            category: 'math.AT',
            description: 'Algebraic Topology',
            topics: [
              'algebraic topology',
              'cohomology theory',
              'homological algebra',
              'homology theory',
              'homotopy group',
              'homotopy theory',
              'spectral sequence'
            ]
          },
          {
            category: 'math.AP',
            description: 'Analysis of PDEs',
            topics: [
              'boundary condition',
              'elliptic equation',
              'general first-order equation',
              'general higher-order equation',
              'hyperbolic equation',
              'integrable PDEs',
              'parabolic equation',
              'qualitative dynamics',
              'soliton theory'
            ]
          },
          {
            category: 'math.CT',
            description: 'Category Theory',
            topics: [
              'abelian category',
              'Enriched category',
              'homological algebra',
              'monoidal category',
              'topos'
            ]
          },
          {
            category: 'math.CA',
            description: 'Classical Analysis and ODEs',
            topics: [
              'asymptotic analysis',
              'calculus of variations',
              'harmonic analysis',
              'ordinary differential equation',
              'orthogonal polynomial',
              'series expansion',
              'special functions'
            ]
          },
          {
            category: 'math.CO',
            description: 'Combinatorics',
            topics: [
              'algebraic combinatorics',
              'combinatorial game theory',
              'combinatorial optimization',
              'enumerative combinatorics',
              'extremal combinatorics',
              'graph theory',
              'polyhedral combinatorics',
              'Ramsey theory'
            ]
          },
          {
            category: 'math.AC',
            description: 'Commutative Algebra',
            topics: [
              'algebraic combinatorics',
              'commutative ring theory',
              'computational aspects',
              'differential algebra',
              'homological algebra',
              'ideal theory',
              'integral domain',
              'invariant theory',
              'module theory'
            ]
          },
          {
            category: 'math.CV',
            description: 'Complex Variables',
            topics: [
              'analytic space',
              'automorphic form',
              'automorphic function',
              'coherent sheave',
              'complex geometry',
              'conformal map',
              'geometric function theory',
              'holomorphic function'
            ]
          },
          {
            category: 'math.DG',
            description: 'Differential Geometry',
            subsumption: {
              category: 'dg-ga'
            },
            topics: [
              'complex geometry',
              'contact geometry',
              'Finsler geometry',
              'gauge theory',
              'general relativity',
              'global analysis',
              'Riemannian geometry'
            ]
          },
          {
            category: 'math.DS',
            description: 'Dynamical Systems',
            topics: [
              'arithmetic dynamics',
              'bifurcation theory',
              'complex dynamics',
              'ergodic theory',
              'Hamiltonian system',
              'linear dynamical system',
              'symbolic dynamics',
              'topological dynamics'
            ]
          },
          {
            category: 'math.FA',
            description: 'Functional Analysis',
            subsumption: {
              category: 'funct-an'
            },
            topics: [
              'Banach space',
              'function space',
              'generalized function',
              'Hilbert space',
              'integral transform',
              'measure theory'
            ]
          },
          {
            category: 'math.GM',
            description: 'General Mathematics',
            topics: [
              'counterexample'
            ]
          },
          {
            category: 'math.GN',
            description: 'General Topology',
            topics: [
              'continuum theory',
              'dimension theory',
              'metrization theorem',
              'point-set topology',
              'pointfree topology',
              'set-theoretic topology',
              'topological algebra'
            ]
          },
          {
            category: 'math.GT',
            description: 'Geometric Topology',
            topics: [
              '2-manifold',
              '3-manifold',
              '4-manifold',
              'braid group',
              'knot theory',
              'low-dimensional topology',
              'Morse theory'
            ]
          },
          {
            category: 'math.GR',
            description: 'Group Theory',
            topics: [
              'algebraic group',
              'cohomology',
              'combinatorial group theory',
              'discrete group',
              'finite group',
              'geometric group theory',
              'representation theory',
              'topological group'
            ]
          },
          {
            category: 'math.HO',
            description: 'History and Overview',
            topics: [
              'biography',
              'communication of mathematics',
              'mathematics education',
              'philosophy of mathematics',
              'recreational mathematics'
            ]
          },
          {
            category: 'math.IT',
            description: 'Information Theory',
            topics: [
              'algorithmic information theory',
              'coding theory',
              'fuzzy set'
            ]
          },
          {
            category: 'math.KT',
            description: 'K-Theory and Homology',
            topics: [
              'algebraic K-theory',
              'operator algebra',
              'topological K-theory',
              'twisted K-theory'
            ]
          },
          {
            category: 'math.LO',
            description: 'Logic',
            topics: [
              'fuzzy logic',
              'modal logic',
              'model theory',
              'proof theory',
              'recursion theory',
              'reverse mathematics',
              'set theory'
            ]
          },
          {
            category: 'math.MP',
            description: 'Mathematical Physics',
            topics: [
              'atomic physics',
              'condensed matter physics',
              'nuclear physics',
              'quantum field theory',
              'quantum mechanics',
              'statistical mechanics'
            ]
          },
          {
            category: 'math.MG',
            description: 'Metric Geometry',
            topics: [
              'coarse geometry',
              'convex geometry',
              'discrete geometry',
              'Euclidean geometry',
              'hyperbolic geometry',
              'symmetric space'
            ]
          },
          {
            category: 'math.NT',
            description: 'Number Theory',
            topics: [
              'algebraic number theory',
              'analytic number theory',
              'arithmetic geometry',
              'computational number theory',
              'diophantine equation',
              'Galois theory',
              'Langlands program',
              'prime number'
            ]
          },
          {
            category: 'math.NA',
            description: 'Numerical Analysis',
            topics: [
              'complex analysis',
              'computational geometry',
              'error analysis',
              'Fourier analysis',
              'numerical algorithm',
              'numerical linear algebra',
              'ordinary differential equation',
              'partial differential equation',
              'scientific computation'
            ]
          },
          {
            category: 'math.OA',
            description: 'Operator Algebras',
            topics: [
              'C-star algebra',
              'noncommutative geometry',
              'von Neumann algebra'
            ]
          },
          {
            category: 'math.OC',
            description: 'Optimization and Control',
            topics: [
              'control theory',
              'game theory',
              'linear programming',
              'operations research',
              'optimal control',
              'systems theory'
            ]
          },
          {
            category: 'math.PR',
            description: 'Probability',
            topics: [
              'central limit theorem',
              'combinatorial probability',
              'geometric probability',
              'Markov process',
              'probability theory',
              'queuing theory',
              'statistical mechanics',
              'stochastic analysis',
              'stochastic differential equation',
              'stochastic geometry',
              'stochastic process'
            ]
          },
          {
            category: 'math.QA',
            description: 'Quantum Algebra',
            subsumption: {
              category: 'q-alg'
            },
            topics: [
              'diagram algebra',
              'operadic algebra',
              'quantum field theory',
              'quantum group',
              'skein theory'
            ]
          },
          {
            category: 'math.RT',
            description: 'Representation Theory',
            topics: [
              'algebra representation',
              'associative algebra',
              'group representation',
              'Lie theory',
              'multilinear algebra'
            ]
          },
          {
            category: 'math.RA',
            description: 'Rings and Algebras',
            topics: [
              'lattice theory',
              'linear algebra',
              'non-associative algebra',
              'noncommutative algebra',
              'noncommutative ring',
              'semigroup',
              'universal algebra'
            ]
          },
          {
            category: 'math.SP',
            description: 'Spectral Theory',
            topics: [
              'ordinary differential operator',
              'partial differential operator',
              'random matrix',
              'Schrodinger operator'
            ]
          },
          {
            category: 'math.ST',
            description: 'Statistics Theory',
            topics: [
              'data analysis',
              'decision theory',
              'Markov chain Monte Carlo',
              'multivariate analysis',
              'regression',
              'sampling theory',
              'statistical inference',
              'time series'
            ]
          },
          {
            category: 'math.SG',
            description: 'Symplectic Geometry',
            topics: [
              'classical integrable system',
              'Hamiltonian system'
            ]
          }
        ]
      }
    ]
  },
  {
    group: 'Computer Science',
    archives: [
      {
        category: 'cs',
        description: 'Computer Science',
        initiated: '1993-01',
        themes: [
          {
            category: 'cs.AI',
            description: 'Artificial Intelligence',
            topics: [
              'cognitive simulation',
              'distributed artificial intelligence',
              'expert systems',
              'knowledge representation',
              'philosophical foundations',
              'planning and scheduling',
              'search methodologies',
              'theorem proving'
            ]
          },
          {
            category: 'cs.CL',
            description: 'Computation and Language',
            subsumption: {
              category: 'cmp-lg'
            },
            topics: [
              'computational linguistics',
              'discourse',
              'lexical semantics',
              'machine translation',
              'natural language generation',
              'speech recognition',
              'text analysis'
            ]
          },
          {
            category: 'cs.CC',
            description: 'Computational Complexity',
            topics: [
              'complexity class',
              'complexity tradeoff',
              'formal language',
              'models of computation',
              'quantum complexity theory',
              'structural complexity'
            ]
          },
          {
            category: 'cs.CE',
            description: 'Computational Engineering, Finance, and Science',
            topics: [
              'archaeology',
              'astronomy',
              'biology and genetics',
              'chemistry',
              'economics',
              'engineering',
              'medical information system',
              'physics',
              'psychology',
              'sociology'
            ]
          },
          {
            category: 'cs.CG',
            description: 'Computational Geometry',
            topics: [
              'boundary representation',
              'constructive solid geometry',
              'geometric algorithm',
              'geometric transformation',
              'modeling package',
              'object representation',
              'physically based modeling',
              'spline'
            ]
          },
          {
            category: 'cs.GT',
            description: 'Computer Science and Game Theory',
            topics: [
              'agent modeling in games',
              'computational advertising theory',
              'computational pricing',
              'learning in games',
              'mechanism design',
              'network games',
              'representations of games'
            ]
          },
          {
            category: 'cs.CV',
            description: 'Computer Vision and Pattern Recognition',
            topics: [
              'computer vision',
              'image processing',
              'pattern recognition',
              'scene understanding'
            ]
          },
          {
            category: 'cs.CY',
            description: 'Computers and Society',
            topics: [
              'computer ethics',
              'computers and education',
              'electronic commerce',
              'history of computing',
              'legal aspects of computing'
            ]
          },
          {
            category: 'cs.CR',
            description: 'Cryptography and Security',
            topics: [
              'authentication', 
              'code breaking',
              'data encryption standard',
              'invasive software',
              'proof-carrying code',
              'public key cryptosytems'
            ]
          },
          {
            category: 'cs.DS',
            description: 'Data Structures and Algorithms',
            topics: [
              'computation of transforms',
              'computations in finite fields',
              'computations on matrices',
              'computations on polynomials',
              'distributed data structures',
              'graphs and networks',
              'number-theoretic computations',
              'sorting and searching'
            ]
          },
          {
            category: 'cs.DB',
            description: 'Databases',
            topics: [
              'database query processing',
              'database transaction processing',
              'entity relationship model',
              'graph-based database model',
              'information integration',
              'physical data model',
              'query languages',
              'relational database model'
            ]
          },
          {
            category: 'cs.DL',
            description: 'Digital Libraries',
            topics: [
              'document dapture',
              'document editing',
              'document preparation',
              'electronic publishing',
              'index generation',
              'large text archives',
              'systems issues',
              'user issues'
            ]
          },
          {
            category: 'cs.DM',
            description: 'Discrete Mathematics',
            topics: [
              'applications of probability',
              'combinatorics',
              'graph theory'
            ]
          },
          {
            category: 'cs.DC',
            description: 'Distributed, Parallel, and Cluster Computing',
            topics: [
              'cluster computing',
              'cloud computing',
              'distributed algorithm',
              'fault-tolerance',
              'parallel computing'
            ]
          },
          {
            category: 'cs.ET',
            description: 'Emerging Technologies',
            topics: [
              'bio-embedded electronics',
              'circuit substrates',
              'electromechanical systems',
              'emerging devices',
              'emerging interfaces',
              'emerging methodologies',
              'neural systems',
              'quantum technology',
              'single electron device',
              'spintronics',
              'superconducting circuit'
            ]
          },
          {
            category: 'cs.FL',
            description: 'Formal Languages and Automata Theory',
            topics: [
              'algebraic language theory',
              'automata theory',
              'combinatorics on words',
              'context-free language',
              'decision problem',
              'formal language theory'
            ]
          },
          {
            category: 'cs.GL',
            description: 'General Literature',
            topics: [
              'biographies',
              'future trends',
              'general literary works',
              'introductory material',
              'references',
              'survey material'
            ]
          },
          {
            category: 'cs.GR',
            description: 'Graphics',
            topics: [
              '3d graphics',
              'graphics systems',
              'graphics utilities',
              'hardware architecture',
              'image generation'
            ]
          },
          {
            category: 'cs.AR',
            description: 'Hardware Architecture',
            topics: [
              'hardware interfaces',
              'instruction set design',
              'microcomputers',
              'parallel architecture',
              'processor architecture',
              'supercomputers',
              'system architecture'
            ]
          },
          {
            category: 'cs.HC',
            description: 'Human-Computer Interaction',
            topics: [
              'collaborative computing',
              'graphical user interfaces',
              'human factors',
              'human information processing',
              'software psychology',
              'user interface management systems',
              'user interfaces'
            ]
          },
          {
            category: 'cs.IR',
            description: 'Information Retrieval',
            topics: [
              'content analysis',
              'content indexing',
              'information search',
              'information storage',
              'performance evaluation',
              'question-answering systems',
              'record classification',
              'relevance feedback'
            ]
          },
          {
            category: 'cs.IT',
            description: 'Information Theory',
            topics: [
              'algorithmic information theory',
              'channel coding',
              'data compression',
              'error control codes',
              'formal models of communication',
              'information-theoretic security',
              'Kolmogorov complexity', 
              'measures of information',
              'nonsecret encoding scheme',
              'source coding'
            ]
          },
          {
            category: 'cs.LG',
            description: 'Learning',
            topics: [
              'artificial neural network',
              'association rule learning',
              'Bayesian network',
              'cluster analysis',
              'computaional learning',
              'data mining',
              'decision tree learning',
              'inductive logic programming',
              'knowledge acquisition',
              'language acquisition',
              'machine learning',
              'parameter learning',
              'reinforcement learning',
              'representation learning',
              'similarity learning',
              'supervised learning',
              'support vector machine',
              'unsupervised learning'
            ]
          },
          {
            category: 'cs.LO',
            description: 'Logic in Computer Science',
            topics: [
              'computability theory',
              'finite model theory',
              'lambda calculus',
              'logics of programs',
              'mechanical theorem proving',
              'modal logic',
              'program verification',
              'recursive function theory',
              'temporal logic'
            ]
          },
          {
            category: 'cs.MS',
            description: 'Mathematical Software',
            topics: [
              'algorithm design',
              'documentation',
              'portability'
            ]
          },
          {
            category: 'cs.MA',
            description: 'Multiagent Systems',
            topics: [
              'multiagent systems',
              'distributed artificial intelligence',
              'intelligent agents',
              'coordinated interactions'
            ]
          },
          {
            category: 'cs.MM',
            description: 'Multimedia',
            topics: [
              'animations',
              'audio',
              'hypertext navigation',
              'video',
              'virtual reality'
            ]
          },
          {
            category: 'cs.NI',
            description: 'Networking and Internet Architecture',
            topics: [
              'internetwork standards',
              'internetworking',
              'network architecture',
              'network operations',
              'network protocols',
              'real-time systems',
              'web caching',
              'wireless communication'
            ]
          },
          {
            category: 'cs.NE',
            description: 'Neural and Evolutionary Computing',
            topics: [
              'adaptive behavior',
              'artificial life',
              'connectionism',
              'genetic algorithms',
              'neural networks'
            ]
          },
          {
            category: 'cs.NA',
            description: 'Numerical Analysis',
            topics: [
              'approximation',
              'error analysis',
              'integral equations',
              'interpolation',
              'interval arithmetic',
              'multiple precision arithmetic',
              'numerical algorithms',
              'numerical differentiation',
              'numerical linear algebra',
              'optimization',
              'ordinary differential equations',
              'parallel algorithms',
              'partial differential equations',
              'quadrature',
              'roots of nonlinear equations'
            ]
          },
          {
            category: 'cs.OS',
            description: 'Operating Systems',
            topics: [
              'communications',
              'file systems',
              'process management',
              'reliability',
              'storage management',
              'systems programs'
            ]
          },
          {
            category: 'cs.OH',
            description: 'Other Computer Science',
            topics: []
          },
          {
            category: 'cs.PF',
            description: 'Performance',
            topics: [
              'benchmarks',
              'operational analysis',
              'queueing theory',
              'resource allocation',
              'simulation',
              'stochastic analysis'
            ]
          },
          {
            category: 'cs.PL',
            description: 'Programming Languages',
            topics: [
              'data-driven programming',
              'event-driven programming',
              'functional programming',
              'logic programming',
              'metaprogramming',
              'object-oriented programming',
              'semantic-oriented programming',
              'visual programming'
            ]
          },
          {
            category: 'cs.RO',
            description: 'Robotics',
            topics: [
              'autonomous vehicles',
              'commercial robots',
              'kinematics and dynamics',
              'manipulators',
              'operator interfaces',
              'propelling mechanisms',
              'sensors',
              'workcell organization'
            ]
          },
          {
            category: 'cs.SI',
            description: 'Social and Information Networks',
            topics: [
              'collaboration graph',
              'link analysis',
              'organizational patterns',
              'percolation theory',
              'scale-free network',
              'small-world network',
              'social behavior',
              'social relations',
              'social structure'
            ]
          },
          {
            category: 'cs.SE',
            description: 'Software Engineering',
            topics: [
              'design tools',
              'programming environment',
              'software debugging',
              'software metrics',
              'software testing'
            ]
          },
          {
            category: 'cs.SD',
            description: 'Sound',
            topics: [
              'analysis and synthesis',
              'audio user interfaces',
              'computer music',
              'models of sound',
              'sonification of data',
              'sound signal processing'
            ]
          },
          {
            category: 'cs.SC',
            description: 'Symbolic Computation',
            topics: [
              'arbitrary-precision arithmetic',
              'computer algebra systems',
              'representation of expressions',
              'simplification of expressions',
              'symbolic manipulations'
            ]
          },
          {
            category: 'cs.SY',
            description: 'Systems and Control',
            topics: [
              'adaptive control',
              'cooperative control',
              'discrete event systems',
              'distributed control',
              'hybrid event systems',
              'sensor networks',
              'stochastic control'
            ]
          }
        ]
      }
    ]
  },
  {
    group: 'Quantitative Biology',
    archives: [
      {
        category: 'q-bio',
        description: 'Quantitative Biology',
        initiated: '2003-09',
        themes: [
          {
            category: 'q-bio.BM',
            description: 'Biomolecules',
            topics: [
              'folding kinetics',
              'molecular structure',
              'nucleotides',
              'single-molecule manipulation',
              'small molecules'
            ]
          },
          {
            category: 'q-bio.GN',
            description: 'Genomics',
            topics: [
              'DNA sequencing',
              'genomic process',
              'genomic structure',
              'motif bioinformatics',
              'mutational process',
              'RNA editing'
            ]
          },
          {
            category: 'q-bio.MN',
            description: 'Molecular Networks',
            topics: [
              'enzymatic networks',
              'gene networks',
              'gene regulation',
              'metabolomics',
              'proteomics',
              'signal transduction'
            ]
          },
          {
            category: 'q-bio.SC',
            description: 'Subcellular Processes',
            topics: [
              'meiosis',
              'mitosis',
              'molecular motor',
              'subcellular localization',
              'subcellular structure'
            ]
          },
          {
            category: 'q-bio.CB',
            description: 'Cell Behavior',
            topics: [
              'apoptosis',
              'bacterial conjugation',
              'cell-cell signaling',
              'immunology',
              'morphogenesis',
              'viral-host interaction'
            ]
          },
          {
            category: 'q-bio.NC',
            description: 'Neurons and Cognition',
            topics: [
              'cortex',
              'neural network',
              'neuronal dynamics',
              'sensorimotor control',
              'synapse'
            ]
          },
          {
            category: 'q-bio.TO',
            description: 'Tissues and Organs',
            topics: [
              'biomechanics of bones',
              'blood flow in vessels',
              'electrical waves',
              'endocrine system',
              'tumor growth'
            ]
          },
          {
            category: 'q-bio.PE',
            description: 'Populations and Evolution',
            topics: [
              'aging',
              'biodiversity',
              'co-evolution',
              'directed evolution',
              'dynamic speciation',
              'epidemiological models',
              'foodwebs',
              'molecular evolution',
              'origin of life',
              'phylogeny',
              'population dynamics',
              'spatio-temporal models'
            ]
          },
          {
            category: 'q-bio.QM',
            description: 'Quantitative Methods',
            topics: [
              'experiments',
              'mathematical aspects',
              'numerical methods',
              'statistical methods'
            ]
          },
          {
            category: 'q-bio.OT',
            description: 'Other',
            topics: []
          }
        ]
      }
    ]
  },
  {
    group: 'Quantitative Finance',
    archives: [
      {
        category: 'q-fin',
        description: 'Quantitative Finance',
        initiated: '2008-12',
        themes: [
          {
            category: 'q-fin.PR',
            description: 'Pricing of Securities',
            topics: [
              'bond valuation',
              'debt security',
              'derivative security',
              'equity security'
            ]
          },
          {
            category: 'q-fin.RM',
            description: 'Risk Management',
            topics: [
              'corporate finance',
              'credit risk',
              'market risk',
              'operational risk',
              'risk assessment'
            ]
          },
          {
            category: 'q-fin.PM',
            description: 'Portfolio Management',
            topics: [
              'capital allocation',
              'investment strategy',
              'performance measurement',
              'security optimization',
              'security selection'
            ]
          },
          {
            category: 'q-fin.TR',
            description: 'Trading and Microstructure',
            topics: [
              'agent-based modeling',
              'auction design',
              'automated trading',
              'market exchange',
              'market liquidity',
              'market microstructure',
              'market-making'
            ]
          },
          {
            category: 'q-fin.MF',
            description: 'Mathematical Finance',
            topics: [
              'algebraic methods',
              'functional analysis',
              'geometric methods',
              'probabilistic analysis',
              'stochastic analysis'
            ]
          },
          {
            category: 'q-fin.CP',
            description: 'Computational Finance',
            topics: [
              'algorithmic trading',
              'financial modeling',
              'high-frequency trading',
              'quantitative investing'
            ]
          },
          {
            category: 'q-fin.ST',
            description: 'Statistical Finance',
            topics: [
              'econometric analysis',
              'economic data',
              'econophysics',
              'financial market',
              'statistical analysis'
            ]
          },
          {
            category: 'q-fin.GN',
            description: 'General Finance',
            topics: []
          },
          {
            category: 'q-fin.EC',
            description: 'Economics',
            topics: [
              'international economics',
              'labor economics',
              'macro economics',
              'micro economics',
              'theory of the firm'
            ]
          }
        ]
      }
    ]
  },
  {
    group: 'Statistics',
    archives: [
      {
        category: 'stat',
        description: 'Statistics',
        initiated: '2007-04',
        themes: [
          {
            category: 'stat.AP',
            description: 'Applications',
            topics: [
              'biology',
              'education',
              'engineering',
              'environmental science',
              'epidemiology',
              'medical science',
              'physical science',
              'quality control',
              'social science'
            ]
          },
          {
            category: 'stat.CO',
            description: 'Computation',
            topics: [
              'algorithms',
              'simulation',
              'visualization'
            ]
          },
          {
            category: 'stat.ML',
            description: 'Machine Learning',
            topics: [
              'classification',
              'graphical models',
              'high dimensional inference'
            ]
          },
          {
            category: 'stat.ME',
            description: 'Methodology',
            topics: [
              'image processing',
              'model selection',
              'multiple testing',
              'multivariate methods',
              'nonparametric methods',
              'semiparametric methods',
              'signal processing',
              'spatial statistics',
              'study design',
              'survival analysis',
              'time series'
            ]
          },
          {
            category: 'stat.OT',
            description: 'Other Statistics',
            topics: []
          },
          {
            category: 'stat.TH',
            description: 'Theory',
            topics: [
              'asymptotics',
              'bayesian inference',
              'decision theory',
              'estimation Theory',
              'foundations of statistics',
              'hypothesis testing',
              'regression analysis',
              'statistical inference'
            ]
          }
        ]
      }
    ]
  }
];
