'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libSettings = require('./lib/settings');

var _libSettings2 = _interopRequireDefault(_libSettings);

var _libSession = require('./lib/session');

var _libSession2 = _interopRequireDefault(_libSession);

var _libAuthentication = require('./lib/authentication');

var _libAuthentication2 = _interopRequireDefault(_libAuthentication);

var _libRouter = require('./lib/router');

var _libRouter2 = _interopRequireDefault(_libRouter);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

app.use(_libSession2['default'].session);
app.use((0, _cors2['default'])());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express['static'](path.join(__dirname, 'public')));

// configure authentication
_libAuthentication2['default'].init(app);
app.use('/auth', _libAuthentication2['default'].router);

// setup routes
(0, _libRouter2['default'])(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;