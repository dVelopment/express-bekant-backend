'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _libPreferencesManager = require('../../lib/preferencesManager');

var _libPreferencesManager2 = _interopRequireDefault(_libPreferencesManager);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var router = _express2['default'].Router();
var manager = (0, _libPreferencesManager2['default'])();

router.get('/', function (req, res) {
    manager.findByUser(req.user).then(function (result) {
        res.json(result);
    }, function () {
        res.sendStatus(500);
    });
});

router.post('/', function (req, res) {
    var preference = manager.createPreference(req.body.label, req.body.position, req.user);

    manager.savePreference(preference).then(function (p) {
        res.json(p);
    });
});

router.get('/:id', function (req, res) {
    manager.findById(req.params.id, req.user).then(function (pref) {
        res.json(pref);
    }, function () {
        res.sendStatus(404);
    });
});

router['delete']('/:id', function (req, res) {
    manager.findById(req.params.id, req.user).then(function (pref) {
        manager.removePreference(pref).then(function () {
            res.sendStatus(204);
        });
    }, function () {
        res.sendStatus(404);
    });
});

router.put('/:id', function (req, res) {
    manager.findById(req.params.id, req.user).then(function (pref) {
        // do not allow overriding user id
        var data = _lodash2['default'].extend({}, req.body);
        delete data.userId;

        _lodash2['default'].forEach(_lodash2['default'].keys(data), function (key) {
            if (/^\$/.test(key)) {
                delete data[key];
            }
        });

        pref = _lodash2['default'].extend(pref, data);
        manager.savePreference(pref).then(function (p) {
            res.json(p);
        }, function (err) {
            res.status(400).json(err);
        });
    }, function () {
        res.sendStatus(404);
    });
});

exports['default'] = router;
module.exports = exports['default'];