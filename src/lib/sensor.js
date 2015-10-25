'use strict';

import settings from './settings';
import cleanup from './cleanup';
import async from 'async';
import usonic from 'r-pi-usonic';

let config = settings.get('sensor');

let sensor;

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
}

export default sensor;
