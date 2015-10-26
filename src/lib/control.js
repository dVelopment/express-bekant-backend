'use strict';

import sensor from './sensor';
import gpio from 'r-pi-gpio';
import settings from './settings';
import async from 'async';
import cleanup from './cleanup';
import request from 'request';

let config = settings.get('desk');

class DirectControl {
    constructor(sensor, config) {
        this.sensor = sensor;
        this.config = config;
        this.promise = new Promise((resolve, reject) => {
            gpio.init((err) => {
                if (err) {
                    return reject(err);
                }

                this.upPin = gpio.createOutput(config.up);
                this.downPin = gpio.createOutput(config.down);
                resolve();
            });
        });
    }

    ready() {
        return this.promise;
    }

    readDistance() {
        if (this.reading) {
            return this.reading;
        }

        this.reading = new Promise((resolve) => {
            this.sensor.getDistance().then((distance) => {
                resolve(distance);
                this.reading = null;
            }, () => {
                this.reading = null;
            });
        });

        return this.reading;
    }

    stop() {
        return new Promise((resolve) => {
            console.log('[Control] stop');
            this.upPin(false);
            this.downPin(false);
            resolve();
        });
    }

    up() {
        return this.stop().then(() => {
            console.log('[Control] up', this.config.up)
            this.upPin(true);
        });
    }

    down() {
        return this.stop().then(() => {
            console.log('[Control] down', this.config.down);
            this.downPin(true);
        });
    }

    goTo(height) {
        let delta = 0;
    }
}

class HttpControl {
    constructor(config) {
        this.config = config;
        this.url = `http://${config.host || '127.0.0.1'}:${config.port || 8080}/${(config.path || '').replace(/^\//, '')}`;

        this.promise = new Promise((resolve) => {
            resolve();
        });
    }

    ready() {
        return this.promise;
    }

    readDistance() {
        if (this.reading) {
            return this.reading;
        }

        this.reading = this.request('position')
            .then((data) => data.Position);

        return this.reading;
    }

    stop() {
        return this.request('stop', 'POST')
            .then((data) => data.Position);
    }

    move(direction) {
        return this.request('move/' + direction, 'POST');
    }

    up() {
        return this.move('up');
    }

    down() {
        return this.move('down');
    }

    request(path, method = 'GET') {
        return new Promise((resolve, reject) => {
            request({
                url: this.url + path,
                method: method
            }, (err, response, body) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(JSON.parse(body));
                }
            });
        });
    }

    goTo(position) {
        return this.request('go/' + position, 'POST')
            .then((data) => data.Position);
    }

    prime() {
        return this.request('prime', 'POST')
            .then((data) => data.Position);
    }

    status() {
        return this.request('status')
            .then((data) => data.IsPrimed);
    }
}

let control;

switch(config.type) {
    default:
        throw new Error(`unknown control type: "${config.type}"`)
    break;
    case 'direct':
        control = new DirectControl(sensor, config);
    break;
    case 'http':
        control = new HttpControl(config.config);
    break;
}



export default control;
