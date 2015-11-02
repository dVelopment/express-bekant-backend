'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _sensor = require('./sensor');

var _sensor2 = _interopRequireDefault(_sensor);

var _rPiGpio = require('r-pi-gpio');

var _rPiGpio2 = _interopRequireDefault(_rPiGpio);

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _cleanup = require('./cleanup');

var _cleanup2 = _interopRequireDefault(_cleanup);

var _request2 = require('request');

var _request3 = _interopRequireDefault(_request2);

var config = _settings2['default'].get('desk');

var DirectControl = (function () {
    function DirectControl(sensor, config) {
        var _this = this;

        _classCallCheck(this, DirectControl);

        this.sensor = sensor;
        this.config = config;
        this.promise = new Promise(function (resolve, reject) {
            _rPiGpio2['default'].init(function (err) {
                if (err) {
                    return reject(err);
                }

                _this.upPin = _rPiGpio2['default'].createOutput(config.up);
                _this.downPin = _rPiGpio2['default'].createOutput(config.down);
                resolve();
            });
        });
    }

    _createClass(DirectControl, [{
        key: 'ready',
        value: function ready() {
            return this.promise;
        }
    }, {
        key: 'readDistance',
        value: function readDistance() {
            var _this2 = this;

            if (this.reading) {
                return this.reading;
            }

            this.reading = new Promise(function (resolve) {
                _this2.sensor.getDistance().then(function (distance) {
                    resolve(distance);
                    _this2.reading = null;
                }, function () {
                    _this2.reading = null;
                });
            });

            return this.reading;
        }
    }, {
        key: 'stop',
        value: function stop() {
            var _this3 = this;

            return new Promise(function (resolve) {
                console.log('[Control] stop');
                _this3.upPin(false);
                _this3.downPin(false);
                resolve();
            });
        }
    }, {
        key: 'up',
        value: function up() {
            var _this4 = this;

            return this.stop().then(function () {
                console.log('[Control] up', _this4.config.up);
                _this4.upPin(true);
            });
        }
    }, {
        key: 'down',
        value: function down() {
            var _this5 = this;

            return this.stop().then(function () {
                console.log('[Control] down', _this5.config.down);
                _this5.downPin(true);
            });
        }
    }, {
        key: 'goTo',
        value: function goTo(height) {
            var delta = 0;
        }
    }]);

    return DirectControl;
})();

var HttpControl = (function () {
    function HttpControl(config) {
        _classCallCheck(this, HttpControl);

        this.config = config;
        this.url = 'http://' + (config.host || '127.0.0.1') + ':' + (config.port || 8080) + '/' + (config.path || '').replace(/^\//, '');

        this.promise = new Promise(function (resolve) {
            resolve();
        });
    }

    _createClass(HttpControl, [{
        key: 'ready',
        value: function ready() {
            return this.promise;
        }
    }, {
        key: 'readDistance',
        value: function readDistance() {
            if (this.reading) {
                return this.reading;
            }

            this.reading = this.request('position').then(function (data) {
                return data.Position;
            });

            return this.reading;
        }
    }, {
        key: 'stop',
        value: function stop() {
            return this.request('stop', 'POST').then(function (data) {
                return data.Position;
            });
        }
    }, {
        key: 'move',
        value: function move(direction) {
            return this.request('move/' + direction, 'POST');
        }
    }, {
        key: 'up',
        value: function up() {
            return this.move('up');
        }
    }, {
        key: 'down',
        value: function down() {
            return this.move('down');
        }
    }, {
        key: 'request',
        value: function request(path) {
            var _this6 = this;

            var method = arguments.length <= 1 || arguments[1] === undefined ? 'GET' : arguments[1];

            return new Promise(function (resolve, reject) {
                (0, _request3['default'])({
                    url: _this6.url + path,
                    method: method
                }, function (err, response, body) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(JSON.parse(body));
                    }
                });
            });
        }
    }, {
        key: 'goTo',
        value: function goTo(position) {
            return this.request('go/' + position, 'POST').then(function (data) {
                return data.Position;
            });
        }
    }, {
        key: 'prime',
        value: function prime() {
            return this.request('prime', 'POST').then(function (data) {
                return data.Position;
            });
        }
    }, {
        key: 'status',
        value: function status() {
            return this.request('status').then(function (data) {
                return data.IsPrimed;
            });
        }
    }]);

    return HttpControl;
})();

var control = undefined;

switch (config.type) {
    default:
        throw new Error('unknown control type: "' + config.type + '"');
        break;
    case 'direct':
        control = new DirectControl(_sensor2['default'], config);
        break;
    case 'http':
        control = new HttpControl(config.config);
        break;
}

exports['default'] = control;
module.exports = exports['default'];