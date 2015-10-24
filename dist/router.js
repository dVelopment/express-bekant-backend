'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function setupRoutes(app) {
    _lodash2['default'].forEach(_routes2['default'], function (routes, prefix) {
        app.use(prefix, routes);
    });
}

exports['default'] = setupRoutes;
module.exports = exports['default'];