'use strict';

import PreferencesManager from './preferencesManager';

let manager = PreferencesManager();

export default class Socket {
    constructor(socket) {
        this.socket = socket;

        this.control = require('./control');
        this.socket.on('move', this.move.bind(this));
        this.socket.on('stop', this.stop.bind(this));
        this.socket.on('go', this.goTo.bind(this));
        this.socket.on('disconnect', this.clearReadingInterval.bind(this));

        this.readingInterval = setInterval(this.readDistance.bind(this), 500);
    }

    clearReadingInterval() {
        clearInterval(this.readingInterval);
    }

    move(direction) {
        console.log('[Socket] move', direction);
        return this.control.ready().then(() => {
            if (direction === 'up') {
                return this.control.up().then(() => {
                    this.socket.emit('moving', direction);
                    this.socket.broadcast.emit('moving', direction);
                })
            } else if (direction === 'down') {
                return this.control.down().then(() => {
                    this.socket.emit('moving', direction);
                    this.socket.broadcast.emit('moving', direction);
                });
            }
        });
    }

    stop() {
        this.clearInterval();
        return this.control.ready().then(() => {
            return this.control.stop().then(() => {
                this.socket.emit('stopped');
                this.socket.broadcast.emit('stopped');
            });
        });
    }

    clearInterval() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    goTo(id) {
        this.clearInterval();
        manager.findById(id, this.socket.request.user)
            .then((preference) => {
                if (preference) {
                    let started = false;
                    let direction;
                    let reading = 0;
                    let sum = 0.0;

                    let process = (distance) => {
                        let delta = preference.height - distance;

                        console.log('delta', delta, preference.height, distance);

                        if (Math.abs(delta) < 1) {
                            this.stop();
                        } else if (!started) {
                            started = true;
                            if (delta > 0) {
                                direction = 'up';
                            } else {
                                direction = 'down';
                            }
                            this.move(direction);
                        } else {
                            // gone too far?
                            if (direction === 'up') {
                                if (delta < 1) {
                                    this.stop();
                                }
                            } else if (delta > 1) {
                                this.stop();
                            }
                        }
                    };

                    this.interval = setInterval(() => {
                        this.control.readDistance().then(process);
                    }, 500);
                }
            }, (err) => {
                console.log('[Socket] preference not found', err);
            });
    }

    readDistance() {
        this.control.readDistance().then((distance) => {
            this.socket.emit('distance', distance);
        });
    }
}
