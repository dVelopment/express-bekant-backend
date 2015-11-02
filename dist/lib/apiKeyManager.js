'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _mongodb = require('mongodb');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _modelApiKey = require('../model/apiKey');

var _modelApiKey2 = _interopRequireDefault(_modelApiKey);

var EXPIRES_SPAN = 30;

var ApiKeyManager = (function () {
    function ApiKeyManager(db) {
        _classCallCheck(this, ApiKeyManager);

        this.db = db;

        this.getCollection().then(function (collection) {
            collection.createIndex({
                expires: -1,
                apiKey: 1
            });
            collection.createIndex({
                userId: 1,
                expires: -1
            });
        });
    }

    _createClass(ApiKeyManager, [{
        key: 'createApiKey',
        value: function createApiKey() {
            var expires = (0, _moment2['default'])();
            expires.add(EXPIRES_SPAN, 'days');

            return new _modelApiKey2['default']({
                expires: expires.toDate()
            });
        }
    }, {
        key: 'saveApiKey',
        value: function saveApiKey(apiKey) {
            console.log('[ApiKeyManager] save api key', apiKey);
            return this.getCollection().then(function (collection) {
                if (!apiKey.apiKey) {
                    apiKey.createApiKey();
                }

                var data = _lodash2['default'].assign({}, apiKey);
                delete data._id;

                var promise = undefined;

                if (apiKey._id) {
                    console.log('[ApiKeyManager] update api key', apiKey._id, data);
                    promise = collection.update({ _id: apiKey._id }, { $set: data });
                } else {
                    console.log('[ApiKeyManager] insert api key', data);
                    promise = collection.insert(data);
                }

                return promise.then(function (result) {
                    if (result.insertedIds && result.insertedIds.length) {
                        apiKey._id = result.insertedIds[1];
                    }
                    return apiKey;
                }, function (err) {
                    return Promise.reject(err);
                });
            });
        }
    }, {
        key: 'extendApiKey',
        value: function extendApiKey(apiKey) {
            var expires = (0, _moment2['default'])();
            expires.add(EXPIRES_SPAN, 'days');

            apiKey.expires = expires.toDate();

            return this.saveApiKey(apiKey);
        }
    }, {
        key: 'findForUser',
        value: function findForUser(userId) {
            var now = new Date();

            console.log('[ApiKeyManager] findForUser', userId);

            return this.getCollection().then(function (collection) {
                return collection.findOne({
                    userId: new _mongodb.ObjectID(userId.toString()), expires: {
                        $gt: now
                    }
                }, { sort: [['expires', 'desc']] }).then(function (data) {
                    console.log('[ApiKeyManager] found for user', data);
                    if (data) {
                        return new _modelApiKey2['default'](data);
                    } else {
                        return null;
                    }
                }, function () {
                    return null;
                });
            });
        }
    }, {
        key: 'findByKey',
        value: function findByKey(key) {
            return this.getCollection().then(function (collection) {
                return collection.findOne({
                    expires: { $gt: new Date() },
                    apiKey: key
                }).then(function (data) {
                    if (data) {
                        return new _modelApiKey2['default'](data);
                    } else {
                        return null;
                    }
                }, function () {
                    return null;
                });
            });
        }
    }, {
        key: 'getCollection',
        value: function getCollection() {
            var _this = this;

            return this.db.ready().then(function () {
                return _this.db.getCollection('apiKeys');
            });
        }
    }]);

    return ApiKeyManager;
})();

var manager = undefined;

exports['default'] = function () {
    if (!manager) {
        manager = new ApiKeyManager((0, _db2['default'])());
    }

    return manager;
};

module.exports = exports['default'];