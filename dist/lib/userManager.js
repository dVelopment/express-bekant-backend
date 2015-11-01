'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

var _modelUser = require('../model/user');

var _modelUser2 = _interopRequireDefault(_modelUser);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _mongodb = require('mongodb');

var UserManager = (function () {
    function UserManager(db) {
        _classCallCheck(this, UserManager);

        this.db = db;

        this.getCollection().then(function (collection) {
            collection.createIndex({
                username: 1
            }, {
                unique: true,
                sparse: true
            });
        });
    }

    _createClass(UserManager, [{
        key: 'findByUsername',
        value: function findByUsername(username) {
            var _this = this;

            return this.db.ready().then(function () {
                return _this.db.findOne('users', { username: username }).then(function (data) {
                    if (data) {
                        return new _modelUser2['default'](data);
                    } else {
                        return null;
                    }
                });
            });
        }
    }, {
        key: 'createUser',
        value: function createUser(username, password) {
            var user = new _modelUser2['default']({
                username: username
            });

            user.setPassword(password);

            return user;
        }
    }, {
        key: 'saveUser',
        value: function saveUser(user) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                if (!user.apiKey) {
                    user.apiKey = user.createApiKey();
                }

                var data = _lodash2['default'].assign({}, user);

                delete data._id;

                function onSuccess(result) {
                    if (result.insertedIds && result.insertedIds.length) {
                        user._id = result.insertedIds[1];
                    }

                    resolve(user);
                }

                function onError(err) {
                    reject(err);
                }

                _this2.getCollection().then(function (collection) {
                    var promise = undefined;
                    if (user._id) {
                        promise = collection.update({ _id: user._id }, { $set: data });
                    } else {
                        promise = collection.insert(data);
                    }

                    promise.then(onSuccess, onError);
                });
            });
        }
    }, {
        key: 'findById',
        value: function findById(id) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                _this3.getCollection().then(function (collection) {
                    collection.findOne({ _id: new _mongodb.ObjectID(id) }).then(function (data) {
                        if (data) {
                            resolve(new _modelUser2['default'](data));
                        } else {
                            reject('invalid user id');
                        }
                    }, function (err) {
                        reject(err);
                    });
                });
            });
        }
    }, {
        key: 'hasUsers',
        value: function hasUsers() {
            return this.getCollection().then(function (collection) {
                return collection.find().count().then(function (count) {
                    return count > 0;
                });
            });
        }
    }, {
        key: 'getCollection',
        value: function getCollection() {
            var _this4 = this;

            return this.db.ready().then(function () {
                return _this4.db.getCollection('users');
            });
        }
    }]);

    return UserManager;
})();

var userManager = undefined;

exports['default'] = function () {
    if (!userManager) {
        userManager = new UserManager((0, _db2['default'])());
    }

    return userManager;
};

module.exports = exports['default'];