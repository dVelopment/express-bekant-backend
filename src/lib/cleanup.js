'use strict';

import _ from 'lodash';

class CleanupHandler {
    constructor() {
        this.listeners = [];

        process.on('exit', this.onExit.bind(this, { cleanup: true }));
        process.on('SIGINT', this.onExit.bind(this, { exit: true }));
        process.on('uncaughtException', this.onExit.bind(this, { exit: true }));
    }

    addListener(listener) {
        if ('function' === typeof listener) {
            this.listeners.push(listener);
        }
    }

    onExit(options, err) {
        if (options.cleanup) {
            _.forEach(this.listeners, (listener) => {
                try {
                    listener();
                } catch (err) {
                    console.log('error cleaning up', err);
                }
            });
        }

        if (err) {
            console.log(err.stack);
        }

        if (options.exit) {
            process.exit();
        }
    }
}

let handler = new CleanupHandler();

export default handler;
