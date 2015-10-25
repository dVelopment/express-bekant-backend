'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _sensor = require('./sensor');

var _sensor2 = _interopRequireDefault(_sensor);

var Control = function Control(sensor) {
    _classCallCheck(this, Control);

    this.sensor = sensor;
};

var control = new Control(_sensor2['default']);

exports['default'] = control;
module.exports = exports['default'];