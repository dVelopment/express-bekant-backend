'use strict';

import passport from 'passport';
import _ from 'lodash';

import express from 'express';
let router = express.Router();

import settings from './settings';
import UserManager from './userManager';

let config = settings.get('authentication');
let initialized = false;
let manager;

function getUserData(user) {
    return user.getSecureData();
}

function setupLocalAuthentication() {

    let LocalStrategy = require('passport-local').Strategy;

    passport.use(new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password'
        }, (username, password, done) => {
            manager.findByUsername(username).then((user) => {
                if (!user) {
                    return done(null, false, {message: 'Incorrect username.'});
                }

                if (!user.validatePassword(password)) {
                    return done(null, false, {message: 'Incorrect password.'});
                }

                return done(null, user);
            }, (err) => {
                return done(err);
            });
        }
    ));

    // setup routes
    router.post('/login', passport.authenticate('local'), (req, res) => {
        res.send(req.user);
    });
    router.post('/signup', (req, res) => {
        function success(user) {
            res.json(getUserData(user));
        }

        function saveUser() {
            let user = manager.createUser(req.body.username, req.body.password);

            user.provider = 'local';

            manager.saveUser(user).then((user) => {
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

        if (!req.isAuthenticated()) {
            // only allow registration if no user exists
            manager.hasUsers().then((hasUsers) => {
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

    router.get('/loggedin', (req, res) => {
        res.json(req.isAuthenticated() ? getUserData(req.user) : null);
    });

    router.post('/logout', (req, res) => {
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
        manager = UserManager();
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
            manager.findById(id).then((user) => {
                done(null, user);
            }, (err) => {
                done(err);
            });
        });
    }
}

export default {
    init: init,
    auth: auth,
    router: router
};
