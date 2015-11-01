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
        this.socket.on('disconnect', this.clearReadingInterval.bind(this));

        this.readingInterval = setInterval(this.readDistance.bind(this), 500);
    }

    _createClass(Socket, [{
        key: 'clearReadingInterval',
        value: function clearReadingInterval() {
            clearInterval(this.readingInterval);
        }
    }, {
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

            this.clearInterval();
            return this.control.ready().then(function () {
                return _this2.control.stop().then(function () {
                    _this2.socket.emit('stopped');
                    _this2.socket.broadcast.emit('stopped');
                });
            });
        }
    }, {
        key: 'clearInterval',
        value: (function (_clearInterval) {
            function clearInterval() {
                return _clearInterval.apply(this, arguments);
            }

            clearInterval.toString = function () {
                return _clearInterval.toString();
            };

            return clearInterval;
        })(function () {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        })
    }, {
        key: 'goTo',
        value: function goTo(id) {
            var _this3 = this;

            this.clearInterval();
            manager.findById(id, this.socket.request.user).then(function (preference) {
                if (preference) {
                    (function () {
                        var started = false;
                        var direction = undefined;
                        var reading = 0;
                        var sum = 0.0;

                        var process = function process(distance) {
                            var delta = preference.height - distance;

                            console.log('delta', delta, preference.height, distance);

                            if (Math.abs(delta) < 1) {
                                _this3.stop();
                            } else if (!started) {
                                started = true;
                                if (delta > 0) {
                                    direction = 'up';
                                } else {
                                    direction = 'down';
                                }
                                _this3.move(direction);
                            } else {
                                // gone too far?
                                if (direction === 'up') {
                                    if (delta < 1) {
                                        _this3.stop();
                                    }
                                } else if (delta > 1) {
                                    _this3.stop();
                                }
                            }
                        };

                        _this3.interval = setInterval(function () {
                            _this3.control.readDistance().then(process);
                        }, 500);
                    })();
                }
            }, function (err) {
                console.log('[Socket] preference not found', err);
            });
        }
    }, {
        key: 'readDistance',
        value: function readDistance() {
            var _this4 = this;

            this.control.readDistance().then(function (distance) {
                _this4.socket.emit('distance', distance);
            });
        }
    }]);

    return Socket;
})();

exports['default'] = Socket;
module.exports = exports['default'];