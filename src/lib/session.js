'use strict';

import session from 'express-session';
import connectRedis from 'connect-redis';
import settings from './settings';

let RedisStore = connectRedis(session);
let config = settings.get('redis');

let store = new RedisStore({
    host: config.host,
    port: config.port
});

export default {
    session: session({
        store: store,
        secret: settings.get('session').secret,
        resave: false,
        saveUninitialized: false
    }),
    store: store
};
