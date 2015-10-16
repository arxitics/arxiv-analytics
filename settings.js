/**
 * Application settings.
 */

module.exports = {
  version: '0.3.5',
  title: 'arXiv Analytics',
  keywords: [
    'arXiv',
    'eprints',
    'metadata',
    'analytics',
    'open access'
  ],
  description: 'Specified web portal dedicated to reading and discussing arXiv eprints',
  environment: 'development',
  development: {
    host: 'localhost:3000',
    hostname: 'localhost',
    port: 3000,
    storage: '',
    threads: 8
  },
  production: {
    host: 'arxitics.com',
    hostname: 'arxitics.com',
    port: 80,
    storage: 'http://cdn.arxitics.com',
    threads: 2
  },
  db: 'localhost:27017/arxiv',
  collections: [
    'eprints',
    'users',
    'reviews',
    'analytics'
  ],
  locale: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
    directory: './locales',
    indent: '  ',
    objectNotation: true
  },
  cache: {
    maxAge: 3 * 30 * 24 * 60 * 60,
    expires: Date.now() + 3 * 30 * 24 * 60 * 60 * 1000
  },
  cookie: {
    key: 'arxiv.analytics',
    secret: 'cookie-secret',
    maxAge: 3 * 30 * 24 * 60 * 60 * 1000,
    expires: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    signed: true,
    path: '/'
  },
  session: {
    maxViews: 10,
    maxRequests: 1000,
    threshold: 100,
    intervals: {
      request: 10 * 60 * 1000,
      submit: 12 * 60 * 60 * 1000
    }
  },
  email: {
    server: {
      host: 'smtp.gmail.com',
      user: 'username',
      password: 'password',
      port: 465,
      ssl: true,
      timeout: 10 * 60 * 1000
    },
    sender: 'arXiv Analytics <username@gmail.com>'
  },
  user: {
    reserved: {
      range: 999,
      accounts: {
        admin: {
          uid: 0,
          name: 'admin',
          email: 'admin-email',
          role: 'administrator'
        },
        guest: {
          uid: 1,
          name: 'guest',
          email: 'guest',
          role: 'guest'
        },
        robot: {
          uid: 2,
          name: 'robot',
          email: 'robot',
          role: 'robot'
        },
        service: {
          uid: 999,
          name: 'service',
          email: 'service-email',
          role: 'service'
        }
      }
    },
    auth: {
      strength: 6,
      maxAge: 30 * 60 * 1000,
      keyRequests: 3
    },
    activity: {
      intervals: {
        bookmark: 60 * 60 * 1000,
        read: 24 * 60 * 60 * 1000
      },
      maxReadings: 5
    },
    privilege: {
      article: {
        post: 10,
        edit: 100
      }
    },
    reputation: {
      article: {
        read: 1,
        rate: -1,
        edit: 2,
        attach: 5
      },
      review: {
        publish: 5,
        bookmarked: 2,
        vote: -1,
        upvoted: 5,
        downvoted: -5
      },
      comment: {
        publish: 2
      },
      doc: {
        upload: 20
      },
      publication: {
        add: 100
      }
    }
  },
  file: {
    minSize: 1000
  },
  eprint: {
    weight: {
      keywords: 32,
      tags: 16,
      subjects: 16,
      categories: 16,
      authors: 8,
      title: 4,
      journal: 2,
      comment: 2,
      abstact: 1
    },
    phrase: {
      maxWords: 5,
      maxRank: 25
    },
    keyword: {
      maxOutputs: 5
    },
    discovery: {
      limit: 100,
      maxRank: 3
    }
  },
  search: {
    limit: 1000,
    perpage: 20,
    timeout: 500,
    threshold: 200,
    cache: {
      maxItems: 20,
      maxAge: 4 * 60 * 60 * 1000
    }
  },
  schedule: {
    interval: 60 * 1000,
    feed: {
      dayOfWeek: [1, 2, 3, 4, 5],
      hour: [9, 12],
      minute: 40
    },
    check: {
      dayOfWeek: [1, 2, 3, 4, 5],
      hour: [10, 14],
      minute: 40
    },
    aggregation: {
      dayOfWeek: [1, 2, 3, 4, 5],
      hour: 10,
      minute: 10
    }
  },
  arxiv: {
    patch: true,
    fetch: true,
    parse: true,
    count: 1012588,
    limit: 1000,
    interval: 60 * 1000,
    directory: '/data/arxiv/xml'
  },
  inspire: {
    fetch: true,
    parse: true,
    count: 448624,
    limit: 250,
    interval: 60 * 1000,
    directory: '/data/arxiv/inspire'
  },
  adsabs: {
    key: 'developer-key',
    fetch: true,
    parse: true,
    count: 767366,
    limit: 200,
    interval: 60 * 1000,
    directory: '/data/arxiv/adsabs'
  },
  oss: {
    host: 'oss.arxitics.com',
    port: 80,
    bucket: 'arxitics',
    id: 'access-id',
    key: 'access-key',
    directory: '/data/arxiv/uploads',
    limits: {
      fieldNameSize: 1000,
      fieldSize: 1000,
      fields: 10,
      fileSize: 100 * 1000 * 1000,
      files: 10,
      parts: 10
    }
  }
};
