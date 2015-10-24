'use strict';

import Routes from './routes';
import _ from 'lodash';

function setupRoutes(app) {
    _.forEach(Routes, (routes, prefix) => {
        app.use(prefix, routes);
    });
}

export default setupRoutes;
