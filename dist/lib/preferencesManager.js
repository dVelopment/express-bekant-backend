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

var _modelPreference = require('../model/preference');

var _modelPreference2 = _interopRequireDefault(_modelPreference);

var manager = undefined;

var PreferencesManager = (function () {
    function PreferencesManager(db) {
        _classCallCheck(this, PreferencesManager);

        this.db = db;

        this.getCollection().then(function (collection) {
            collection.createIndex({
                userId: 1
            });
        });
    }

    _createClass(PreferencesManager, [{
        key: 'createPreference',
        value: function createPreference(label, height, user) {
            var pref = new _modelPreference2['default']({
                label: label,
                height: height
            });
            pref.setUser(user);

            return pref;
        }
    }, {
        key: 'savePreference',
        value: function savePreference(preference) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                var data = _lodash2['default'].assign({}, preference);

                delete data._id;

                function onSuccess(result) {
                    if (result.insertedIds && result.insertedIds.length) {
                        preference._id = result.insertedIds[1];
                    }

                    resolve(preference);
                }

                function onError(err) {
                    reject(err);
                }

                _this.getCollection().then(function (collection) {
                    var promise = undefined;
                    if (preference._id) {
                        promise = collection.udate({ _id: preference._id }, { $set: data });
                    } else {
                        promise = collection.insert(data);
                    }

                    return promise.then(onSuccess, onError);
                });
            });
        }
    }, {
        key: 'findById',
        value: function findById(id, user) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                _this2.getCollection().then(function (collection) {
                    collection.findOne({ _id: new _mongodb.ObjectID(id), userId: user._id }).then(function (data) {
                        if (data) {
                            resolve(new _modelPreference2['default'](data));
                        } else {
                            reject('invalid preference id');
                        }
                    }, function (err) {
                        reject(err);
                    });
                });
            });
        }
    }, {
        key: 'findByUser',
        value: function findByUser(user) {
            var _this3 = this;

            console.log('[PreferencesManager] find by user', user);
            return new Promise(function (resolve, reject) {
                _this3.getCollection().then(function (collection) {
                    console.log('[PreferencesManager] collection loaded');
                    var result = [];
                    collection.find({ userId: user._id }).each(function (err, doc) {
                        if (err) {
                            reject(err);
                        } else if (doc != null) {
                            console.log('[PreferencesManager] data loaded', doc);
                            result.push(new _modelPreference2['default'](doc));
                        } else {
                            resolve(result);
                        }
                    });
                });
            });
        }
    }, {
        key: 'getCollection',
        value: function getCollection() {
            var _this4 = this;

            return this.db.ready().then(function () {
                console.log('[PreferencesManager] db ready');
                return _this4.db.getCollection('preferences');
            });
        }
    }]);

    return PreferencesManager;
})();

exports['default'] = function () {
    if (!manager) {
        manager = new PreferencesManager((0, _db2['default'])());
    }

    return manager;
};

module.exports = exports['default'];