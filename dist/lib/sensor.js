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

var _rPiUsonic = require('r-pi-usonic');

var _rPiUsonic2 = _interopRequireDefault(_rPiUsonic);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var config = _settings2['default'].get('sensor');

var sensor = undefined;

var HttpSensor = (function () {
    function HttpSensor(config) {
        _classCallCheck(this, HttpSensor);

        this.url = 'http://' + (config.host || '127.0.0.1') + ':' + (config.port || 8080) + '/';
        this.config = config;

        this.promise = new Promise(function (resolve) {
            resolve();
        });
    }

    _createClass(HttpSensor, [{
        key: 'ready',
        value: function ready() {
            return this.promise;
        }
    }, {
        key: 'getDistance',
        value: function getDistance() {
            var _this = this;

            return new Promise(function (resolve, reject) {
                _this.ready().then(function () {
                    (0, _request2['default'])({
                        url: _this.url + (_this.config.path ? _this.config.path.replace(/^\//, '') : '')
                    }, function (err, response, body) {
                        if (err) {
                            reject(err);
                        } else {
                            var data = JSON.parse(body);

                            resolve(data.Distance);
                        }
                    });
                });
            });
        }
    }]);

    return HttpSensor;
})();

var UltraSonicSensor = (function () {
    function UltraSonicSensor(config) {
        var _this2 = this;

        _classCallCheck(this, UltraSonicSensor);

        this.promise = new Promise(function (resolve) {
            _rPiUsonic2['default'].init(function (err) {
                if (err) {
                    throw err;
                }

                _this2.sensor = _rPiUsonic2['default'].createSensor(config.echoPin, config.triggerPin);
                resolve();
            });
        });
    }

    _createClass(UltraSonicSensor, [{
        key: 'ready',
        value: function ready() {
            return this.promise;
        }
    }, {
        key: 'getDistance',
        value: function getDistance() {
            var _this3 = this;

            return this.promise.then(function () {
                var sum = 0.0;

                for (var i = 0; i < 20; i++) {
                    sum += _this3.sensor();
                }

                return sum / 20;
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
    case 'http':
        sensor = new HttpSensor(config.config);
        break;
}

exports['default'] = sensor;
module.exports = exports['default'];