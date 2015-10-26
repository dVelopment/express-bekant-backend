'use strict';

import express from 'express';
import PreferencesManager from '../../lib/preferencesManager';
import _ from 'lodash';

let router = express.Router();
let manager = PreferencesManager();

router.get('/', (req, res) => {
    manager.findByUser(req.user).then((result) => {
        res.json(result);
    }, () => {
        res.sendStatus(500);
    });
});

router.post('/', (req, res) => {
    let preference = manager.createPreference(req.body.label, req.body.position, req.user);

    manager.savePreference(preference).then((p) => {
        res.json(p);
    });
});

router.get('/:id', (req, res) => {
    manager.findById(req.params.id, req.user).then((pref) => {
        res.json(pref);
    }, () => {
        res.sendStatus(404);
    });
});

router.delete('/:id', (req, res) => {
    manager.findById(req.params.id, req.user).then((pref) => {
        manager.removePreference(pref).then(() => {
            res.sendStatus(204);
        });
    }, () => {
        res.sendStatus(404);
    });
});

router.put('/:id', (req, res) => {
    manager.findById(req.params.id, req.user).then((pref) => {
        // do not allow overriding user id
        let data = _.extend({}, req.body);
        delete data.userId;

        _.forEach(_.keys(data), (key) => {
            if (/^\$/.test(key)) {
                delete data[key];
            }
        });

        pref = _.extend(pref, data);
        manager.savePreference(pref).then((p) => {
            res.json(p);
        }, (err) => {
            res.status(400).json(err);
        });
    }, () => {
        res.sendStatus(404);
    });
});

export default router;
