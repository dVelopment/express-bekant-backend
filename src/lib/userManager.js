'use strict';

import DataBase from './db';
import User from '../model/user';
import _ from 'lodash';
import {ObjectID} from 'mongodb';
import ApiKeyManager from './apiKeyManager';

class UserManager {
    constructor(db) {
        this.db = db;
        this.apiKeyManager = ApiKeyManager();

        this.getCollection().then((collection) => {
            collection.createIndex({
                username: 1
            }, {
                unique: true,
                sparse: true
            });
        });
    }

    findByUsername(username) {
        return this.db.ready().then(() => {
            return this.db.findOne('users', {username: username}).then((data) => {
                if (data) {
                    return new User(data);
                } else {
                    return null;
                }
            });
        });
    }

    createUser(username, password) {
        let user = new User({
            username: username
        });

        user.setPassword(password);

        return user;
    }

    saveUser(user) {
        return new Promise((resolve, reject) => {
            let data = _.assign({}, user);

            delete data._id;

            let onSuccess = (result) => {
                console.log('[UserManager] user saved successfully', result);
                if (result.insertedIds && result.insertedIds.length) {
                    user._id = result.insertedIds[1];

                    let apiKey = this.apiKeyManager.createApiKey();
                    apiKey.setUser(user);

                    this.apiKeyManager.saveApiKey(apiKey).then((apiKey) => {
                        console.log('[UserManager] api key created', apiKey);
                        resolve(user);
                    });
                } else {
                    resolve(user);
                }
            };

            function onError(err) {
                reject(err);
            }

            this.getCollection().then((collection) => {
                let promise;
                if (user._id) {
                    promise = collection
                        .update({_id: user._id}, {$set: data});
                } else {
                    promise = collection
                        .insert(data);
                }

                promise.then(onSuccess, onError);
            });
        });
    }

    findById(id) {
        return new Promise((resolve, reject) => {
            this.getCollection()
                .then((collection) => {
                    collection.findOne({_id: new ObjectID(id)})
                        .then((data) => {
                            if (data) {
                                resolve(new User(data));
                            } else {
                                reject('invalid user id');
                            }
                        }, (err) => {
                            reject(err);
                        });
                });
        });
    }

    findForApiKey(key) {
        return this.apiKeyManager.findByKey(key).then((apiKey) => {
            if (apiKey) {
                return this.findById(apiKey.userId);
            } else {
                return Promise.reject();
            }
        });
    }

    hasUsers() {
        return this.getCollection().then((collection) => {
            return collection.find().count().then((count) => {
                return count > 0;
            });
        });
    }

    getCollection() {
        return this.db.ready().then(() => {
            return this.db.getCollection('users');
        });
    }
}

let userManager;

export default function() {
    if (!userManager) {
        userManager = new UserManager(DataBase());
    }

    return userManager;
}
