'use strict';

import routes from './../routes';
import _ from 'lodash';

function setupRoutes(app) {
    app.use(routes);
}

export default setupRoutes;
