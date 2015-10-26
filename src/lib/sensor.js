'use strict';

import settings from './settings';
import cleanup from './cleanup';
import async from 'async';
import usonic from 'r-pi-usonic';
import request from 'request';

let config = settings.get('sensor');

let sensor;

class HttpSensor {
    constructor(config) {
        this.url = `http://${config.host || '127.0.0.1'}:${config.port || 8080}/`;
        this.config = config;

        this.promise = new Promise((resolve) => {
            resolve();
        });
    }

    ready() {
        return this.promise;
    }

    getDistance() {
        return new Promise((resolve, reject) => {
            this.ready().then(() => {
                request({
                    url: this.url + (this.config.path ? this.config.path.replace(/^\//, '') : '')
                }, (err, response, body) => {
                    if (err) {
                        reject(err);
                    } else {
                        let data = JSON.parse(body);

                        resolve(data.Distance);
                    }
                });
            });
        });
    }
}

class UltraSonicSensor {
    constructor(config) {
        this.promise = new Promise((resolve) => {
            usonic.init((err) => {
                if (err) {
                    throw err;
                }

                this.sensor = usonic.createSensor(config.echoPin, config.triggerPin);
                resolve();
            });
        });
    }

    ready() {
        return this.promise;
    }

    getDistance() {
        return this.promise.then(() => {
            let sum = 0.0;

            for (let i = 0; i < 20; i++) {
                sum += this.sensor();
            }

            return sum / 20;
        });
    }
}

switch (config.type) {
    default:
        throw new Error(`invalid sensor type: "${config.type}"`);
    break;
    case 'ultrasonic':
        sensor = new UltraSonicSensor(config.config);
    break;
    case 'http':
        sensor = new HttpSensor(config.config);
    break;
}

export default sensor;
