'use strict';

import DataBase from './db';
import _ from 'lodash';
import {ObjectID} from 'mongodb';
import Preference from '../model/preference';

let manager;

class PreferencesManager {
    constructor(db) {
        this.db = db;

        this.getCollection().then((collection) => {
            collection.createIndex({
                userId: 1
            });
        });
    }

    createPreference(label, position, user) {
        let pref = new Preference({
            label: label,
            position: position
        });
        pref.setUser(user);

        return pref;
    }

    removePreference(preference) {
        return new Promise((resolve, reject) => {
            this.getCollection().then((collection) => {
                collection.remove({_id: preference._id})
                    .then(resolve, reject);
            });
        });
    }

    savePreference(preference) {
        return new Promise((resolve, reject) => {
            let data = _.assign({}, preference);

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

            this.getCollection().then((collection) => {
                let promise;
                if (preference._id) {
                    promise = collection.update({_id: preference._id}, {$set: data});
                } else {
                    promise = collection.insert(data);
                }

                return promise.then(onSuccess, onError);
            });
        });
    }

    findById(id, user) {
        return new Promise((resolve, reject) => {
            this.getCollection()
                .then((collection) => {
                    console.log('[PreferencesManager] collection loaded');
                    let params = {_id: new ObjectID(id), userId: user._id};

                    console.log('[PreferencesManager] findById params', params);
                    collection.findOne(params)
                        .then((data) => {
                            console.log('[PreferencesManager] preference loaded', data);
                            if (data) {
                                resolve(new Preference(data));
                            } else {
                                reject('invalid preference id');
                            }
                        }, (err) => {
                            console.log('[PreferencesManager] error loading preference', err);
                            reject(err);
                        });
                }, reject);
        });
    }

    findByUser(user) {
        console.log('[PreferencesManager] find by user', user);
        return new Promise((resolve, reject) => {
            this.getCollection()
                .then((collection) => {
                    console.log('[PreferencesManager] collection loaded');
                    let result = [];
                    collection.find({userId: user._id}).each((err, doc) => {
                        if (err) {
                            reject(err);
                        } else if (doc != null) {
                            console.log('[PreferencesManager] data loaded', doc);
                            result.push(new Preference(doc));
                        } else {
                            resolve(result);
                        }
                    });
                });
        });
    }

    getCollection() {
        return new Promise((resolve, reject) => {
            this.db.ready().then(() => {
                console.log('[PreferencesManager] db ready');
                resolve(this.db.getCollection('preferences'));
            }, (err) => {
                console.log('[PreferencesManager] error waiting on db', err);
                reject(err);
            });
        });
    }
}

export default function() {
    if (!manager) {
        manager = new PreferencesManager(DataBase());
    }

    return manager;
}
