'use strict';

import settings from './settings';
import {MongoClient} from 'mongodb';

let config = settings.get('mongodb');

let CONNECTION = Symbol();
let PROMISE = Symbol();

class DataBase {
    constructor(config) {
        this[PROMISE] = new Promise((resolve) => {
            let url = `mongodb://${config.host}:${config.port}/${config.db}`;
            MongoClient.connect(
                url,
                (err, conn) => {
                    if (err) {
                        throw err;
                    }
                    this[CONNECTION] = conn;

                    resolve();
                }
            );
        });
    }

    ready() {
        return this[PROMISE];
    }

    get connection() {
        if (!this[CONNECTION]) {
            throw new Error('database hasn\'t been initialized yet');
        }

        return this[CONNECTION];
    }

    find(collection, params) {
        return new Promise((resolve, reject) => {
            this.getCollection(collection)
                .find(params, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
        });
    }

    getCollection(collection) {
        return this.connection.collection(collection);
    }

    findOne(collection, params) {
        return new Promise((resolve, reject) => {
            this.getCollection(collection)
                .findOne(params, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
        });
    }
}

let db;

function init() {
    if (!db) {
        db = new DataBase(config);
    }

    return db;
}

export default init;
