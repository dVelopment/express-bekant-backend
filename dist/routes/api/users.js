'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _libUserManager = require('../../lib/userManager');

var _libUserManager2 = _interopRequireDefault(_libUserManager);

var router = _express2['default'].Router();
var manager = new _libUserManager2['default']();

exports['default'] = router;
module.exports = exports['default'];