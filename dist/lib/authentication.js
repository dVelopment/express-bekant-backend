'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

var _userManager = require('./userManager');

var _userManager2 = _interopRequireDefault(_userManager);

var _apiKeyManager = require('./apiKeyManager');

var _apiKeyManager2 = _interopRequireDefault(_apiKeyManager);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _modelUser = require('../model/user');

var _modelUser2 = _interopRequireDefault(_modelUser);

var router = _express2['default'].Router();

var config = _settings2['default'].get('authentication');
var initialized = false;
var userManager = undefined,
    apiKeyManager = undefined;

var authenticate = _passport2['default'].authenticate('localapikey', { session: true });

function getUserData(user) {
    return user instanceof _modelUser2['default'] ? user.getSecureData() : user;
}

function sendApiKey(res, user) {
    apiKeyManager.findForUser(user._id.toString()).then(function (apiKey) {
        var tmp = _lodash2['default'].assign({}, apiKey);
        tmp.expires = (0, _moment2['default'])(apiKey.expires).unix();

        var payload = {
            user: getUserData(user),
            apiKey: tmp
        };

        res.json(payload);
    }, function (err) {
        console.log('[authenticate] error retrieving api key', err);

        res.sendStatus(500);
    });
}

function setupApiKeyAuthentication() {
    var LocalAPIKeyStrategy = require('passport-localapikey').Strategy;

    _passport2['default'].use(new LocalAPIKeyStrategy({
        apiKeyHeader: 'x-api-key'
    }, function (apiKey, done) {
        console.log('[authenticate] authenticate api key', apiKey);
        userManager.findForApiKey(apiKey).then(function (user) {
            if (!user) {
                return done(null, false, { message: 'invalid api key.' });
            }

            return done(null, getUserData(user));
        }, function (err) {
            return done(err);
        });
    }));

    router.post('/api_key/extend', authenticate, function (req, res) {
        apiKeyManager.findForUser(req.user._id).then(function (apiKey) {
            apiKeyManager.extendApiKey(apiKey).then(function (apiKey) {
                res.json(apiKey);
            });
        });
    });
}

function setupLocalAuthentication() {

    var LocalStrategy = require('passport-local').Strategy;

    _passport2['default'].use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, function (username, password, done) {
        userManager.findByUsername(username).then(function (user) {
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }

            if (!user.validatePassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, getUserData(user));
        }, function (err) {
            return done(err);
        });
    }));

    // setup routes
    router.post('/local/login', _passport2['default'].authenticate('local'), function (req, res) {
        sendApiKey(res, req.user);
    });
    router.post('/local/signup', function (req, res) {
        function success(user) {
            sendApiKey(res, user);
        }

        function saveUser() {
            var user = userManager.createUser(req.body.username, req.body.password);

            user.provider = 'local';

            userManager.saveUser(user).then(function (user) {
                console.log('[signup]user saved', user);
                if (!req.isAuthenticated()) {
                    req.login(user, function (err) {
                        if (err) {
                            console.log('error signing up', err, err.stack);
                            res.sendStatus(500);
                            throw err;
                        } else {
                            success(user);
                        }
                    });
                } else {
                    success(user);
                }
            }, function (err) {
                console.log('error saving user', err);
                res.send(400);
            });
        }

        console.log('POST /auth/local/signup', req.isAuthenticated());

        if (!req.isAuthenticated()) {
            // only allow registration if no user exists
            userManager.hasUsers().then(function (hasUsers) {
                console.log('hasUser', hasUsers);
                if (hasUsers) {
                    res.sendStatus(403);
                } else {
                    saveUser();
                }
            });
        } else {
            // allow creation of new users
            saveUser();
        }
    });
}

function setupStrategies() {
    setupApiKeyAuthentication();
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
        res.sendStatus(401);
    } else {
        next();
    }
}

function init(app) {
    if (initialized === false) {
        userManager = (0, _userManager2['default'])();
        apiKeyManager = (0, _apiKeyManager2['default'])();
        setupStrategies();

        app.use(_passport2['default'].initialize());
        app.use(_passport2['default'].session());
        initialized = true;

        _passport2['default'].serializeUser(function (user, done) {
            console.log('serialize user', user);
            done(null, user._id);
        });

        _passport2['default'].deserializeUser(function (id, done) {
            console.log('deserialize user', id);
            userManager.findById(id).then(function (user) {
                done(null, user);
            }, function (err) {
                console.log('error deserializing user', err);
                done(null, null);
            });
        });
    }
}

exports['default'] = {
    init: init,
    auth: authenticate,
    router: router
};
module.exports = exports['default'];