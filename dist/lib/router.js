'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _routes = require('./../routes');

var _routes2 = _interopRequireDefault(_routes);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function setupRoutes(app) {
    app.use(_routes2['default']);
}

exports['default'] = setupRoutes;
module.exports = exports['default'];