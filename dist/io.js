'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _socketIo = require('socket.io');

var _socketIo2 = _interopRequireDefault(_socketIo);

var _passportSocketio = require('passport.socketio');

var _passportSocketio2 = _interopRequireDefault(_passportSocketio);

var _session = require('./session');

var _session2 = _interopRequireDefault(_session);

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var io = undefined;

function onAuthorizeSuccess(data, accept) {
    console.log('successful connection to socket.io');
    accept(); //Let the user through
}

function onAuthorizeFail(data, message, error, accept) {
    if (error) accept(new Error(message));
    console.log('failed connection to socket.io:', message);
    accept(null, false);
}

function init(server) {
    if (io) {
        throw new Error('io.init already called');
    }

    io = (0, _socketIo2['default'])(server);

    io.use(_passportSocketio2['default'].authorize({
        cookieParser: _cookieParser2['default'],
        secret: _settings2['default'].get('session').secret,
        store: _session2['default'].store,
        success: onAuthorizeSuccess,
        fail: onAuthorizeFail
    }));

    io.sockets.on('connection', function (socket) {
        console.log(socket.request.user);
    });
}

exports['default'] = init;
module.exports = exports['default'];