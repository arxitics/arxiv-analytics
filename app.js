/**
 * Module dependencies.
 */

var settings = require('./settings');

// Create an express application
var express = require('express');
var app = express();
var server = require('http').Server(app);

// Set environment mode
var environment = settings.environment;
app.set('env', process.env.NODE_ENV || environment);

// Set server port
app.set('port', process.env.PORT || settings[environment].port);

// Setup compression middleware
app.use(require('compression')());

// Setup body parser middleware
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// Setup file uploading middleware
app.use(require('./models/oss').upload());

// Setup method override middleware
app.use(require('method-override')());

// Setup cookie parsing middleware
var cookieParser = require('cookie-parser');
var secret = settings.cookie.secret;
app.use(cookieParser(secret));

// Setup simple cookie-based session middleware
app.use(require('cookie-session')(settings.cookie));

// Setup CSRF protection middleware
app.use(require('csurf')());

// Setup i18n simple translation middleware
var i18n = require('i18n');
i18n.configure(settings.locale);
app.use(i18n.init);

// Add expires headers for static resources
app.use(function (req, res, next) {
  if (req.url.match(/\/(images|javascripts|stylesheets)\//)) {
    var cache = settings.cache;
    res.setHeader('Cache-Control', 'public, max-age=' + cache.maxAge);
    res.setHeader('Expires', new Date(cache.expires).toUTCString());
  }
  next();
});

// Setup favicon serving middleware
var path = require('path');
var faviconPath = path.join(__dirname, 'public/images/favicon.ico');
app.use(require('serve-favicon')(faviconPath));

// Set public directory
var publicDirectory = path.join(__dirname, 'public');
app.use(express.static(publicDirectory));

// Set view directory path
var viewDirectory = path.join(__dirname, 'views');
app.set('views', viewDirectory);

// Set default template engine
app.set('view engine', 'jade');

// Register template engine based on the file extensions
app.engine('jade', function (path, options, callback) {
  options.pretty = true;
  return require('jade').__express(path, options, callback);
});

// Enable view template compilation caching
if (environment === 'production') {
  app.enable('view cache');
}

// Enable reverse proxy support
app.enable('trust proxy');

// Setup logging middleware
app.use(require('morgan')('[:date] :remote-addr [:user-agent] :referrer :method :url :status :response-time ms'));

// Set application local variables provided to all templates
app.locals.appVersion = settings.version;
app.locals.appTitle = settings.title;
app.locals.appKeywords = settings.keywords.join(', ');
app.locals.appDescription = settings.description;
app.locals.appStorage = settings[environment].storage;

// Set router instances
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/chat', require('./routes/chat'));
app.use('/users', require('./routes/users'));
app.use('/search', require('./routes/search'));
app.use('/browse', require('./routes/browse'));
app.use('/explore', require('./routes/explore'));
app.use('/terminal', require('./routes/terminal'));
app.use('/articles', require('./routes/articles'));
app.use('/reviews', require('./routes/reviews'));
app.use('/visual', require('./routes/visual'));
app.use('/tools', require('./routes/tools'));
app.use('/admin', require('./routes/admin'));
app.use('/site', require('./routes/site'));
app.use('/help', require('./routes/help'));
app.use('/', require('./routes/errors'));

// Handle application error
app.use(function (err, req, res, next) {
  console.error(new Date());
  console.error(err);
  res.render('500');
});

// Integrate websokect server
require('./models/socket')(server, secret);

// Launch a cluster of Node processes
var cluster = require('cluster');
if (cluster.isMaster) {
  var numCPUs = require('os').cpus().length;
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', function (worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
  });

  // Run job scheduler
  require('./models/schedule')(function () {
    console.log('scheduled jobs will execution at specific dates');
  });
} else {
  var port = app.get('port');
  server.listen(port, function () {
    console.log('Express server listening on port ' + port +
      ' in ' + app.get('env') + ' mode');
  });
}
