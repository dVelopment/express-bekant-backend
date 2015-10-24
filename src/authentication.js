'use strict';

import passport from 'passport';
import _ from 'lodash';

import settings from './settings';

let config = settings.get('authentication');

function setupLocalAuthentication() {
}

function setupStrategies() {
    _.forEach(config.providers, (conf, provider) => {
        switch (provider) {
            default:
                throw new Error('unknown authentication provider: ' + provider);
            break;
            case 'local':
                setupLocalAuthentication();
            break;
        }
    });
}

function init(app) {
    setupStrategies();

    app.use(passport.initialize());
    app.use(passport.session());
}

export default init;
