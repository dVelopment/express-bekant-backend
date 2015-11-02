'use strict';

import DataBase from './db';
import _ from 'lodash';
import {ObjectID} from 'mongodb';
import moment from 'moment';
import ApiKey from '../model/apiKey';

const EXPIRES_SPAN = 30;

class ApiKeyManager {
    constructor(db) {
        this.db = db;

        this.getCollection().then((collection) => {
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

    createApiKey() {
        let expires = moment();
        expires.add(EXPIRES_SPAN, 'days');

        return new ApiKey({
            expires: expires.toDate()
        });
    }

    saveApiKey(apiKey) {
        console.log('[ApiKeyManager] save api key', apiKey);
        return this.getCollection().then((collection) => {
            if (!apiKey.apiKey) {
                apiKey.createApiKey();
            }

            let data = _.assign({}, apiKey);
            delete data._id;

            let promise;

            if (apiKey._id) {
                console.log('[ApiKeyManager] update api key', apiKey._id, data);
                promise = collection
                    .update({_id: apiKey._id}, {$set: data})
            } else {
                console.log('[ApiKeyManager] insert api key', data);
                promise = collection
                    .insert(data);
            }

            return promise.then((result) => {
                if (result.insertedIds && result.insertedIds.length) {
                    apiKey._id = result.insertedIds[1];
                }
                return apiKey;
            }, (err) => {
                return Promise.reject(err);
            });
        })
    }

    extendApiKey(apiKey) {
        let expires = moment();
        expires.add(EXPIRES_SPAN, 'days');

        apiKey.expires = expires.toDate();

        return this.saveApiKey(apiKey);
    }

    findForUser(userId) {
        let now = new Date();

        console.log('[ApiKeyManager] findForUser', userId);

        return this.getCollection().then((collection) => {
            return collection.findOne({
                userId: new ObjectID(userId.toString()), expires: {
                    $gt: now
                }
            }, {sort: [['expires', 'desc']]}).then((data) => {
                console.log('[ApiKeyManager] found for user', data);
                if (data) {
                    return new ApiKey(data);
                } else {
                    return null;
                }
            }, () => null);
        });
    }

    findByKey(key) {
        return this.getCollection().then((collection) => {
            return collection.findOne({
                expires: {$gt: new Date()},
                apiKey: key
            }).then((data) => {
                if (data) {
                    return new ApiKey(data);
                } else {
                    return null;
                }
            }, () => null);
        });
    }

    getCollection() {
        return this.db.ready().then(() => {
            return this.db.getCollection('apiKeys');
        });
    }
}

let manager;

export default function() {
    if (!manager) {
        manager = new ApiKeyManager(DataBase());
    }

    return manager;
}
