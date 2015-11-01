'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _libPreferencesManager = require('../../lib/preferencesManager');

var _libPreferencesManager2 = _interopRequireDefault(_libPreferencesManager);

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
    var preference = manager.createPreference(req.body.label, req.body.height, req.user);

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

router.put('/:id', function (req, res) {
    manager.findById(req.params.id, req.user).then(function (pref) {
        pref = _.extend(pref, req.body);
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