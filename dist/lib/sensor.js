'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

var _cleanup = require('./cleanup');

var _cleanup2 = _interopRequireDefault(_cleanup);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _rpiGpio = require('rpi-gpio');

var _rpiGpio2 = _interopRequireDefault(_rpiGpio);

var config = _settings2['default'].get('sensor');

var sensor = undefined;

var UltraSonicSensor = (function () {
    function UltraSonicSensor(config) {
        var _this = this;

        _classCallCheck(this, UltraSonicSensor);

        this.promise = new Promise(function (resolve) {
            var usonic = require('r-pi-usonic');

            _async2['default'].parallel([function (cb) {
                _rpiGpio2['default'].setup(config.echoPin, _rpiGpio2['default'].DIR_IN, cb);
            }, function (cb) {
                _rpiGpio2['default'].setup(config.triggerPin, _rpiGpio2['default'].DIR_OUT, cb);
            }], function (err) {
                if (err) {
                    throw err;
                }

                _this.sensor = usonic.createSensor(config.echoPin, config.triggerPin);
                resolve();
            });
            _cleanup2['default'].addListener(function () {
                return _rpiGpio2['default'].destroy();
            });
        });
    }

    _createClass(UltraSonicSensor, [{
        key: 'getDistance',
        value: function getDistance() {
            var _this2 = this;

            return this.promise.then(function () {
                return _this2.sensor();
            });
        }
    }]);

    return UltraSonicSensor;
})();

switch (config.type) {
    default:
        throw new Error('invalid sensor type: "' + config.type + '"');
        break;
    case 'ultrasonic':
        sensor = new UltraSonicSensor(config.config);
        break;
}

exports['default'] = sensor;
module.exports = exports['default'];