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
        this.socket.on('status', this.status.bind(this));
        this.socket.on('prime', this.prime.bind(this));
        this.socket.on('position', this.readDistance.bind(this));
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
        return this.control.ready().then(() => {
            return this.control.stop().then((pos) => {
                this.socket.emit('stopped', pos);
                this.socket.broadcast.emit('stopped', pos);
            });
        });
    }

    goTo(id) {
        manager.findById(id, this.socket.request.user)
            .then((preference) => {
                if (preference) {
                    // get the current position
                    this.control.readDistance().then((position) => {
                        let delta = preference.position - position;

                        let direction = delta > 0 ? 'down' : 'up';
                        this.socket.emit('moving', direction);
                        this.socket.broadcast.emit('moving', direction);
                        this.control.goTo(preference.position)
                            .then((pos) => {
                                this.socket.emit('stopped', pos);
                                this.socket.broadcast.emit('stopped', pos);
                            });
                    });
                }
            }, (err) => {
                console.log('[Socket] preference not found', err);
            });
    }

    status() {
        console.log('[Socket] status requested');
        this.control.ready().then(() => {
            this.control.status().then((status) => {
                console.log('[Socket] is primed', status);
                this.socket.emit('status', status);
            });
        });
    }

    prime() {
        console.log('[Socket] prime');
        this.control.ready().then(() => {
            this.socket.emit('priming');
            this.control.prime().then((pos) => {
                this.socket.emit('primed', pos);
                this.socket.emit('distance', pos);
                this.socket.broadcast.emit('distance', pos);
            }, () => {
                this.socket.emit('primed')
            });
        });
    }

    readDistance() {
        this.control.ready().then(() => {
            this.control.readDistance().then((distance) => {
                console.log('[Socket] current position', distance);
                this.socket.emit('distance', distance);
            });
        });
    }
}
