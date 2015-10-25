'use strict';

import sensor from './sensor';
import gpio from 'r-pi-gpio';
import settings from './settings';
import async from 'async';
import cleanup from './cleanup';

let config = settings.get('desk');

class Control {
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

let control = new Control(sensor, config);

export default control;
