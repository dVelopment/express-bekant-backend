'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _libAuthentication = require('../lib/authentication');

var _libAuthentication2 = _interopRequireDefault(_libAuthentication);

var router = _express2['default'].Router();

router.post('/ping', function (reg, res) {
    res.json('pong');
});

router.use('/api', _libAuthentication2['default'].auth, _api2['default']);

exports['default'] = router;
module.exports = exports['default'];