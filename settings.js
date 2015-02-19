/**
 * Application settings.
 */

module.exports = {
  version: '0.2.5',
  title: 'arXiv Analytics',
  keywords: [
    'arXiv',
    'eprints',
    'metadata',
    'analytics',
    'open access'
  ],
  description: 'Specified web portal dedicated to reading and discussing arXiv eprints',
  environment: 'production',
  development: {
    host: 'localhost:3000',
    hostname: 'localhost',
    port: 3000,
    storage: ''
  },
  production: {
    host: 'arxitics.com',
    hostname: 'arxitics.com',
    port: 80,
    storage: 'http://oss.arxitics.com'
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
          email: 'panzan89@gmail.com',
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
          email: 'help@arxitics.com',
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
      maxRanking: 25
    },
    keyword: {
      maxOutputs: 5
    }
  },
  search: {
    limit: 1000,
    perpage: 20
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
  admin: {
    eprints: {
      fetch: false,
      parse: true,
      limit: 1000,
      interval: 60 * 1000
    }
  },
  oss: {
    host: 'oss.arxitics.com',
    port: 80,
    bucket: 'arxitics',
    id: 'access-id',
    key: 'access-key',
    uploads: './data/uploads',
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
