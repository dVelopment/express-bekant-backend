'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var Model = (function () {
    function Model() {
        var _this = this;

        var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, Model);

        var keys = this.allowedKeys;

        _lodash2['default'].forEach(data, function (val, key) {
            if (_lodash2['default'].find(keys, function (k) {
                return k === key;
            })) {
                _this[key] = val;
            }
        });
    }

    _createClass(Model, [{
        key: 'allowedKeys',
        get: function get() {
            return ['_id'];
        }
    }]);

    return Model;
})();

exports['default'] = Model;
;
module.exports = exports['default'];