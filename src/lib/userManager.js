'use strict';

import DataBase from './db';
import User from '../model/user';
import _ from 'lodash';
import {ObjectID} from 'mongodb';

class UserManager {
    constructor(db) {
        this.db = db;

        this.getCollection().then((collection) => {
            collection._ensureIndex({
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
                return new User(data);
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

            function onSuccess(result) {
                if (result.insertedIds && result.insertedIds.length) {
                    user._id = result.insertedIds[1];
                }

                resolve(user);
            }

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
                })
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
