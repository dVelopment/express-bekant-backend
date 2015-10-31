'use strict';

import passport from 'passport';
import _ from 'lodash';

import express from 'express';
let router = express.Router();

import settings from './settings';
import UserManager from './userManager';
import ApiKeyManager from './apiKeyManager';
import moment from 'moment';
import User from '../model/user';

let config = settings.get('authentication');
let initialized = false;
let userManager, apiKeyManager;

let authenticate = passport.authenticate('localapikey', { session: true });

function getUserData(user) {
    return (user instanceof User) ? user.getSecureData() : user;
}

function sendApiKey(res, user) {
    apiKeyManager.findForUser(user._id.toString()).then((apiKey) => {
        let tmp = _.assign({}, apiKey);
        tmp.expires = moment(apiKey.expires).unix();

        let payload = {
            user: getUserData(user),
            apiKey: tmp
        };

        res.json(payload);
    }, (err) => {
        console.log('[authenticate] error retrieving api key', err);

        res.sendStatus(500);
    });
}

function setupApiKeyAuthentication() {
    let LocalAPIKeyStrategy = require('passport-localapikey').Strategy;

    passport.use(new LocalAPIKeyStrategy({
            apiKeyHeader: 'X-Api-Key'
        },
        (apiKey, done) => {
            console.log('[authenticate] authenticate api key', apiKey);
            userManager.findForApiKey(apiKey).then((user) => {
                if (!user) {
                    return done(null, false, {message: 'invalid api key.'});
                }

                return done(null, getUserData(user));
            }, (err) => {
                return done(err);
            });
        }
    ));

    router.post(
        '/api_key/extend',
        authenticate,
        (req, res) => {
            apiKeyManager.findForUser(req.user._id)
                .then((apiKey) => {
                    apiKeyManager.extendApiKey(apiKey)
                        .then((apiKey) => {
                            res.json(apiKey);
                        });
                });
        }
    );
}

function setupLocalAuthentication() {

    let LocalStrategy = require('passport-local').Strategy;

    passport.use(new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password'
        }, (username, password, done) => {
            userManager.findByUsername(username).then((user) => {
                if (!user) {
                    return done(null, false, {message: 'Incorrect username.'});
                }

                if (!user.validatePassword(password)) {
                    return done(null, false, {message: 'Incorrect password.'});
                }

                return done(null, getUserData(user));
            }, (err) => {
                return done(err);
            });
        }
    ));

    // setup routes
    router.post('/local/login', passport.authenticate('local'), (req, res) => {
        sendApiKey(res, req.user);
    });
    router.post('/local/signup', (req, res) => {
        function success(user) {
            sendApiKey(res, user);
        }

        function saveUser() {
            let user = userManager.createUser(req.body.username, req.body.password);

            user.provider = 'local';

            userManager.saveUser(user).then((user) => {
                if (!req.isAuthenticated()) {
                    req.login(user, (err) => {
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
            }, (err) => {
                console.log('error saving user', err);
                res.send(400);
            });
        }

        console.log('POST /auth/local/signup', req.isAuthenticated());

        if (!req.isAuthenticated()) {
            // only allow registration if no user exists
            userManager.hasUsers().then((hasUsers) => {
                console.log('hasUser', hasUsers);
                if (hasUsers) {
                    res.sendStatus(403);
                } else {
                    saveUser();
                }
            })
        } else {
            // allow creation of new users
            saveUser();
        }
    });
}

function setupStrategies() {
    setupApiKeyAuthentication();
    _.forEach(config.providers, (conf, provider) => {
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
        userManager = UserManager();
        apiKeyManager = ApiKeyManager();
        setupStrategies();

        app.use(passport.initialize());
        app.use(passport.session());
        initialized = true;

        passport.serializeUser((user, done) => {
            console.log('serialize user', user);
            done(null, user._id);
        });

        passport.deserializeUser((id, done) => {
            console.log('deserialize user', id);
            userManager.findById(id).then((user) => {
                done(null, user);
            }, (err) => {
                console.log('error deserializing user', err);
                done(null, null);
            });
        });
    }
}

export default {
    init: init,
    auth: authenticate,
    router: router
};
