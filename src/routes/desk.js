/**
 * Created by daniel on 03.11.15.
 */
'use strict';

import express from 'express';
import settings from '../lib/settings';
import Io from '../lib/io';
import control from '../lib/control';
import PreferencesManager from '../lib/preferencesManager';
import _ from 'lodash';
import talk from '../lib/talk';

let manager = PreferencesManager();

let router = express.Router();

let secret = settings.get('desk').config.secret;

function authenticate(req, res, next) {
    if (req.headers.authorization !== secret) {
        res.sendStatus(403);
    } else {
        next();
    }
}

router.use(authenticate);

router.post('/moving/:direction(up|down)', (req, res) => {
    console.log('[Desk] moving', req.params.direction);
    Io.io().then((io) => {
        io.sockets.emit('moving', req.params.direction);
    });
    res.sendStatus(200);
});

router.post('/stopped', (req, res) => {
    console.log('[Desk] stopped');
    Io.io().then((io) => {
        io.sockets.emit('stopped');
    });
    res.sendStatus(200);
});

let movingTarget;

router.post('/preferences/:direction(up|down)', (req, res) => {
    console.log('[Desk] preferences', req.params.direction);
    res.sendStatus(200);
    let promises = [];

    // load all preferences
    let goUp = req.params.direction === 'up';
    promises.push(manager.findAll(goUp));

    if (movingTarget) {
        promises.push(new Promise((resolve) => resolve(movingTarget)));
    } else {
        promises.push(control.ready().then(() => control.readDistance()));
    }


    Promise.all(promises).then((results) => {
        let [preferences, position] = results;
        console.log('position', position);
        movingTarget = null;

        if (preferences.length < 2) {
            return;
        }

        let filter;

        console.log('positions', _.map(preferences, (p) => p.position));

        // filter out positions that are in the wrong direction
        if (goUp) {
            filter = (p) => p.position > position + 1;
        } else {
            filter = (p) => p.position < position - 1;
        }

        let filtered = _.filter(preferences, filter);
        console.log('filtered', _.map(filtered, (p) => p.position));

        // first matching position (if any)
        // is now on first index
        if (preferences.length < 1) {
            return;
        }

        let targetPos = filtered[0];

        let direction = goUp ? 'up' : 'down';
        Io.io().then((io) => {
            io.sockets.emit('moving', direction);
        });

        // remember that we're moving
        movingTarget = targetPos.position;

        console.log('target', targetPos.position);

        // announce target
        talk(targetPos);

        // start moving
        control.goTo(targetPos.position)
            .then((pos) => {
                io.sockets.emit('stopped', pos);
                movingTarget = null;
            });

        // clean up after 20seconds
        setTimeout(() => movingTarget = null, 20000);
    }, (err) => {
        console.log('err', err);
    });
});

export default router;
