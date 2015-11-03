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

router.post('/preferences/:direction(up|down)', (req, res) => {
    console.log('[Desk] preferences', req.params.direction);
    res.sendStatus(200);
    let promises = [];

    // load all preferences
    promises.push(manager.findAll(req.params.direction === 'up'));

    promises.push(control.ready().then(() => control.readDistance()));

    Promise.all(promises).then((results) => {
        let [preferences, position] = results;
        console.log('position', position);

        if (preferences.length < 2) {
            return;
        }

        // get a copy, sorted by distance to current position
        let sorted = _.sortBy(preferences, (p) => Math.abs(p.position - position));

        // nearest position is on first index now
        let currentPos = sorted[0];

        let idx = _.findIndex(preferences, (p) => p._id === currentPos._id);

        let nextIdx = (idx + 1) % preferences.length;
        let targetPos = preferences[nextIdx];

        // we know the target now. let's determine the actual direction
        let delta = targetPos.position - position;
        let direction = delta > 0 ? 'down' : 'up';
        Io.io().then((io) => {
            io.sockets.emit('moving', direction);
        });

        console.log('target', targetPos.position);

        // announce target
        talk(targetPos, () => {
            // start moving
            control.goTo(targetPos.position)
                .then((pos) => {
                    io.sockets.emit('stopped', pos);
                });
        });
    }, (err) => {
        console.log('err', err);
    });
});

export default router;
