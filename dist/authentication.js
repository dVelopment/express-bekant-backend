'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

var config = _settings2['default'].get('authentication');
var initialized = false;

function setupLocalAuthentication() {}

function setupStrategies() {
    _lodash2['default'].forEach(config.providers, function (conf, provider) {
        switch (provider) {
            default:
                throw new Error('unknown authentication provider: ' + provider);
                break;
            case 'local':
                setupLocalAuthentication();
                break;
        }
    });
}

/**
 * authentication middleware
 *
 * @param req
 * @param res
 * @param next
 */
function auth(req, res, next) {
    if (!req.isAuthenticated()) {
        res.send(401);
    } else {
        next();
    }
}

function init(app) {
    if (initialized === false) {
        setupStrategies();

        app.use(_passport2['default'].initialize());
        app.use(_passport2['default'].session());
        initialized = true;
    }
}

exports['default'] = {
    init: init,
    auth: auth
};
module.exports = exports['default'];