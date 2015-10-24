'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

var _mongodb = require('mongodb');

var config = _settings2['default'].get('mongodb');

var CONNECTION = Symbol();
var PROMISE = Symbol();

var DataBase = (function () {
    function DataBase(config) {
        var _this = this;

        _classCallCheck(this, DataBase);

        this[PROMISE] = new Promise(function (resolve) {
            _mongodb.MongoClient.connect('mongodb://' + config.host + ':{$config.port}/' + config.db, function (err, conn) {
                if (err) {
                    throw err;
                }
                _this[CONNECTION] = conn;

                resolve();
            });
        });
    }

    _createClass(DataBase, [{
        key: 'ready',
        value: function ready() {
            return this[PROMISE];
        }
    }, {
        key: 'find',
        value: function find(collection, params) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                _this2.getCollection(collection).find(params, function (err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        }
    }, {
        key: 'getCollection',
        value: function getCollection(collection) {
            return this.connection.collection(collection);
        }
    }, {
        key: 'findOne',
        value: function findOne(collection, params) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                _this3.getCollection(collection).findOne(params, function (err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        }
    }, {
        key: 'connection',
        get: function get() {
            if (!this[CONNECTION]) {
                throw new Error('database hasn\'t been initialized yet');
            }

            return this[CONNECTION];
        }
    }]);

    return DataBase;
})();

var db = undefined;

function init() {
    if (!db) {
        db = new DataBase(config);
    }

    return db;
}

exports['default'] = init;
module.exports = exports['default'];