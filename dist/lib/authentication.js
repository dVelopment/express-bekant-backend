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

var router = _express2['default'].Router();

var config = _settings2['default'].get('authentication');
var initialized = false;
var manager = undefined;

function setupLocalAuthentication() {

    var LocalStrategy = require('passport-local').Strategy;

    _passport2['default'].use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, function (username, password, done) {
        manager.findByUsername(username).then(function (user) {
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }

            if (!user.validatePassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, user);
        }, function (err) {
            return done(err);
        });
    }));

    // setup routes
    router.post('/login', _passport2['default'].authenticate('local'), function (req, res) {
        res.send(req.user);
    });
    router.post('/signup', function (req, res) {
        function success(user) {
            var tmp = _lodash2['default'].extend({}, user);
            delete tmp.password;

            res.json(tmp);
        }

        function saveUser() {
            var user = manager.createUser(req.body.username, req.body.password);

            user.provider = 'local';

            manager.saveUser(user).then(function (user) {
                if (!req.isAuthenticated()) {
                    req.login(user, function (err) {
                        if (err) {
                            console.log('err', err);
                            res.sendStatus(500);
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

        if (!req.isAuthenticated()) {
            // only allow registration if no user exists
            manager.hasUsers().then(function (hasUsers) {
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

    router.get('/loggedin', function (req, res) {
        res.json(req.isAuthenticated() ? req.user : null);
    });

    router.post('/logout', function (req, res) {
        req.logOut();
        res.sendStatus(200);
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
        manager = (0, _userManager2['default'])();
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
            manager.findById(id).then(function (user) {
                done(null, user);
            }, function (err) {
                done(err);
            });
        });
    }
}

exports['default'] = {
    init: init,
    auth: auth,
    router: router
};
module.exports = exports['default'];