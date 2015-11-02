'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _preferencesManager = require('./preferencesManager');

var _preferencesManager2 = _interopRequireDefault(_preferencesManager);

var manager = (0, _preferencesManager2['default'])();

var Socket = (function () {
    function Socket(socket) {
        _classCallCheck(this, Socket);

        this.socket = socket;

        this.control = require('./control');
        this.socket.on('move', this.move.bind(this));
        this.socket.on('stop', this.stop.bind(this));
        this.socket.on('go', this.goTo.bind(this));
        this.socket.on('status', this.status.bind(this));
        this.socket.on('prime', this.prime.bind(this));
        this.socket.on('position', this.readDistance.bind(this));
    }

    _createClass(Socket, [{
        key: 'move',
        value: function move(direction) {
            var _this = this;

            console.log('[Socket] move', direction);
            return this.control.ready().then(function () {
                if (direction === 'up') {
                    return _this.control.up().then(function () {
                        _this.socket.emit('moving', direction);
                        _this.socket.broadcast.emit('moving', direction);
                    });
                } else if (direction === 'down') {
                    return _this.control.down().then(function () {
                        _this.socket.emit('moving', direction);
                        _this.socket.broadcast.emit('moving', direction);
                    });
                }
            });
        }
    }, {
        key: 'stop',
        value: function stop() {
            var _this2 = this;

            return this.control.ready().then(function () {
                return _this2.control.stop().then(function (pos) {
                    _this2.socket.emit('stopped', pos);
                    _this2.socket.broadcast.emit('stopped', pos);
                });
            });
        }
    }, {
        key: 'goTo',
        value: function goTo(id) {
            var _this3 = this;

            manager.findById(id, this.socket.request.user).then(function (preference) {
                if (preference) {
                    // get the current position
                    _this3.control.readDistance().then(function (position) {
                        var delta = preference.position - position;

                        var direction = delta > 0 ? 'down' : 'up';
                        _this3.socket.emit('moving', direction);
                        _this3.socket.broadcast.emit('moving', direction);
                        _this3.control.goTo(preference.position).then(function (pos) {
                            _this3.socket.emit('stopped', pos);
                            _this3.socket.broadcast.emit('stopped', pos);
                        });
                    });
                }
            }, function (err) {
                console.log('[Socket] preference not found', err);
            });
        }
    }, {
        key: 'status',
        value: function status() {
            var _this4 = this;

            console.log('[Socket] status requested');
            this.control.ready().then(function () {
                _this4.control.status().then(function (status) {
                    console.log('[Socket] is primed', status);
                    _this4.socket.emit('status', status);
                });
            });
        }
    }, {
        key: 'prime',
        value: function prime() {
            var _this5 = this;

            console.log('[Socket] prime');
            this.control.ready().then(function () {
                _this5.socket.emit('priming');
                _this5.control.prime().then(function (pos) {
                    _this5.socket.emit('primed', pos);
                    _this5.socket.emit('distance', pos);
                    _this5.socket.broadcast.emit('distance', pos);
                }, function () {
                    _this5.socket.emit('primed');
                });
            });
        }
    }, {
        key: 'readDistance',
        value: function readDistance() {
            var _this6 = this;

            this.control.ready().then(function () {
                _this6.control.readDistance().then(function (distance) {
                    console.log('[Socket] current position', distance);
                    _this6.socket.emit('distance', distance);
                });
            });
        }
    }]);

    return Socket;
})();

exports['default'] = Socket;
module.exports = exports['default'];