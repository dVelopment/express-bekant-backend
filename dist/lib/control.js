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

var config = _settings2['default'].get('desk');

var Control = (function () {
    function Control(sensor, config) {
        var _this = this;

        _classCallCheck(this, Control);

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

    _createClass(Control, [{
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

    return Control;
})();

var control = new Control(_sensor2['default'], config);

exports['default'] = control;
module.exports = exports['default'];