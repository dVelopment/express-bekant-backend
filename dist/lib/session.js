'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _connectRedis = require('connect-redis');

var _connectRedis2 = _interopRequireDefault(_connectRedis);

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

var RedisStore = (0, _connectRedis2['default'])(_expressSession2['default']);
var config = _settings2['default'].get('redis');

var store = new RedisStore({
    host: config.host,
    port: config.port
});

exports['default'] = {
    session: (0, _expressSession2['default'])({
        store: store,
        secret: _settings2['default'].get('session').secret,
        resave: false,
        saveUninitialized: false
    }),
    store: store
};
module.exports = exports['default'];