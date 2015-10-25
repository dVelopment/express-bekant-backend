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

    createPreference(label, height, user) {
        let pref = new Preference({
            label: label,
            height: height
        });
        pref.setUser(user);

        return pref;
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
                    promise = collection.udate({_id: preference._id}, {$set: data});
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
                    collection.findOne({_id: new ObjectID(id), userId: user._id})
                        .then((data) => {
                            if (data) {
                                resolve(new Preference(data));
                            } else {
                                reject('invalid preference id');
                            }
                        }, (err) => {
                            reject(err);
                        });
                });
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
        return this.db.ready().then(() => {
            console.log('[PreferencesManager] db ready');
            return this.db.getCollection('preferences');
        });
    }
}

export default function() {
    if (!manager) {
        manager = new PreferencesManager(DataBase());
    }

    return manager;
}
