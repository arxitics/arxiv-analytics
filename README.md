## arXiv Analytics

ArXiv Analytics is a web portal that offers more features and a better user interface for reading and discussing arXiv eprints.

### Features

* [Advanced search interface to find articles][search]
* [Analysis, visualization, and recommendations][explore]
* [Subscribe to specific categories, keywords, and authors][subscription]
* [Collect interesting articles and reviews][bookmarks]
* [Post your reviews and make comments][reviews]
* [Revise and extend metadata fields][metadata]
* [Share your unpublished documents][documents]
* [Real-time and collaborative chat for the community][chat]

### Development

The project is built with `Node.js` and `MongoDB`:

```
$ npm install
$ sudo mongod --config mongodb.conf
$ sudo node app.js --harmony
```

[search]: http://arxitics.com/search
[explore]: http://arxitics.com/explore
[subscription]: http://arxitics.com/help/subscription
[bookmarks]: http://arxitics.com/help/bookmarks
[reviews]: http://arxitics.com/help/reviews
[metadata]: http://arxitics.com/help/metadata
[documents]: http://arxitics.com/help/documents
[chat]: http://arxitics.com/chat
