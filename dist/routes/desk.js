/**
 * Created by daniel on 03.11.15.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _libSettings = require('../lib/settings');

var _libSettings2 = _interopRequireDefault(_libSettings);

var _libIo = require('../lib/io');

var _libIo2 = _interopRequireDefault(_libIo);

var _libControl = require('../lib/control');

var _libControl2 = _interopRequireDefault(_libControl);

var _libPreferencesManager = require('../lib/preferencesManager');

var _libPreferencesManager2 = _interopRequireDefault(_libPreferencesManager);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var manager = (0, _libPreferencesManager2['default'])();

var router = _express2['default'].Router();

var secret = _libSettings2['default'].get('desk').config.secret;

function authenticate(req, res, next) {
    if (req.headers.authorization !== secret) {
        res.sendStatus(403);
    } else {
        next();
    }
}

router.use(authenticate);

router.post('/moving/:direction(up|down)', function (req, res) {
    console.log('[Desk] moving', req.params.direction);
    _libIo2['default'].io().then(function (io) {
        io.sockets.emit('moving', req.params.direction);
    });
    res.sendStatus(200);
});

router.post('/stopped', function (req, res) {
    console.log('[Desk] stopped');
    _libIo2['default'].io().then(function (io) {
        io.sockets.emit('stopped');
    });
    res.sendStatus(200);
});

router.post('/preferences/:direction(up|down)', function (req, res) {
    console.log('[Desk] preferences', req.params.direction);
    res.sendStatus(200);
    var promises = [];

    // load all preferences
    promises.push(manager.findAll(req.params.direction === 'up'));

    promises.push(_libControl2['default'].ready().then(function () {
        return _libControl2['default'].readDistance();
    }));

    Promise.all(promises).then(function (results) {
        var _results = _slicedToArray(results, 2);

        var preferences = _results[0];
        var position = _results[1];

        console.log('preferences', _lodash2['default'].map(preferences, function (p) {
            return p.position;
        }));
        console.log('position', position);

        if (preferences.length < 2) {
            return;
        }

        // get a copy, sorted by distance to current position
        var sorted = _lodash2['default'].sortBy(preferences, function (p) {
            return Math.abs(p.position - position);
        });

        // nearest position is on first index now
        var currentPos = sorted[0];

        var idx = _lodash2['default'].findIndex(preferences, function (p) {
            return p._id === currentPos._id;
        });

        var nextIdx = (idx + 1) % preferences.length;
        var targetPos = preferences[nextIdx];

        // we know the target now. let's determine the actual direction
        var delta = targetPos.position - position;
        var direction = delta > 0 ? 'down' : 'up';
        _libIo2['default'].io().then(function (io) {
            io.sockets.emit('moving', direction);
        });

        console.log('target', targetPos.position);

        // start moving
        _libControl2['default'].goTo(targetPos.position).then(function (pos) {
            io.sockets.emit('stopped', pos);
        });
    }, function (err) {
        console.log('err', err);
    });
});

exports['default'] = router;
module.exports = exports['default'];