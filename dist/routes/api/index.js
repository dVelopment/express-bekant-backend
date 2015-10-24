'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

'use strict';

var router = _express2['default'].Router();

router.get('/keywords', function (req, res, next) {
    res.json({ foo: 'bar' });
});

exports['default'] = router;
module.exports = exports['default'];