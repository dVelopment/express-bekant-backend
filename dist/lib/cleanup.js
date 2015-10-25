'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var CleanupHandler = (function () {
    function CleanupHandler() {
        _classCallCheck(this, CleanupHandler);

        this.listeners = [];

        process.on('exit', this.onExit.bind(this, { cleanup: true }));
        process.on('SIGINT', this.onExit.bind(this, { exit: true }));
        process.on('uncaughtException', this.onExit.bind(this, { exit: true }));
    }

    _createClass(CleanupHandler, [{
        key: 'addListener',
        value: function addListener(listener) {
            if ('function' === typeof listener) {
                this.listeners.push(listener);
            }
        }
    }, {
        key: 'onExit',
        value: function onExit(options, err) {
            if (options.cleanup) {
                _lodash2['default'].forEach(this.listeners, function (listener) {
                    try {
                        listener();
                    } catch (err) {
                        console.log('error cleaning up', err);
                    }
                });
            }

            if (err) {
                console.log(err.stack);
            }

            if (options.exit) {
                process.exit();
            }
        }
    }]);

    return CleanupHandler;
})();

var handler = new CleanupHandler();

exports['default'] = handler;
module.exports = exports['default'];